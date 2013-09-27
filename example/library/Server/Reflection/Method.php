<?php

class Server_Reflection_Method extends Zend_Server_Reflection_Method
{
    protected $_formHandler = false;

    public function __construct(Server_Reflection_Class $class, ReflectionMethod $r, $namespace = null, $argv = array())
    {
        $this->_classReflection = $class;
        $this->_reflection = $r;

        $classNamespace = $class->getNamespace();

        // Determine namespace
        if (!empty($namespace)) {
            $this->setNamespace($namespace);
        } elseif (!empty($classNamespace)) {
            $this->setNamespace($classNamespace);
        }

        // Determine arguments
        if (is_array($argv)) {
            $this->_argv = $argv;
        }

        // If method call, need to store some info on the class
        $this->_class = $class->getName();

        // Perform some introspection
        $this->_reflect();
    }

    public function __wakeup()
    {
        $this->_classReflection = new Server_Reflection_Class(new ReflectionClass($this->_class), $this->getNamespace(), $this->getInvokeArguments());
        $this->_reflection = new ReflectionMethod($this->_classReflection->getName(), $this->getName());
    }


    protected function _reflect()
    {
        parent::_reflect();
        $function = $this->_reflection;
        $formHandler = false;
        $docBlock = $function->getDocComment();
        if (!empty($docBlock)) {
            if (preg_match_all('/@formHandler/', $docBlock, $matches)) {
                $formHandler = true;
            }
        }
        $this->_buildSignaturesCn($formHandler);
    }

    public function _buildSignaturesCn($formHandler)
    {
        $this->_formHandler = $formHandler;
    }

    public function getFormHandler() {
        return $this->_formHandler;
    }

}
