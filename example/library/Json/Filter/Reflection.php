<?php
/**
 * Description of Plugin_Filter_Reflection
 *
 * @author sebastian
 */
class Json_Filter_Reflection extends FilterIterator
{
    public function accept()
    {
        $file = $this->getInnerIterator()->current();

        // If we somehow have something other than an SplFileInfo object, just
        // return false
        if (!$file instanceof SplFileInfo) {
            return false;
        }

        // If we have a directory, it's not a file, so return false
        if (!$file->isFile()) {
            return false;
        }

        // If not a PHP file, skip
        if ($file->getBasename('.php') == $file->getBasename()) {
            return false;
        }

        // Resource forks are no good either.
        if (substr($file->getBaseName(), 0, 2) == '._') {
            return false;
        }

        $contents = file_get_contents($file->getRealPath());
        $tokens = token_get_all($contents);
        $file->className = NULL;
        $file->classExtends = NULL;
        $file->classImplements = array();

        $last = null;
        while (count($tokens) > 0) {
            $token = array_shift($tokens);

            if (!is_array($token)) {
                continue;
            }

            list($id, $content, $line) = $token;
            switch ($id) {
                case T_ABSTRACT:
                case T_CLASS:
                case T_INTERFACE:
                    $last = 'object';
                    break;
                case T_EXTENDS:
                    $last = "extends";
                    break;
                case T_IMPLEMENTS:
                    $last = "implements";
                    break;
                case T_STRING:
                    switch ($last) {
                        case "object":
                            $file->className = $content;
                            break;
                        case "extends":
                            $file->classExtends = $content;
                            break;
                        case "implements":
                            $file->classImplements[] = $content;
                            break;
                    }
                    break;
                case T_WHITESPACE:
                    // Do nothing, whitespace should be ignored but it shouldnt reset $last.
                    break;
                default:
                    // If its not directly following a keyword specified by $last, reset last to nothing.
                    $last = null;
                    break;
            }
        }

        return true;
    }
}

