<?php

class MyApp_File
{
    /**
     * @formHandler
     * @return array
     */
    public function upload()
    {
        $success = true;
        $error = null;
        echo "/*";
        print_r($_FILES);
        echo "*/";
        /**
         * @link http://php.net/manual/en/features.file-upload.errors.php
         */
        if (current($_FILES)['error'] != 0) {
            $success = false;
            $error = current($_FILES)['error'];
        }
        return array('success' => $success, 'error' => $error);
    }
}