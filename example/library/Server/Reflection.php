<?php
require_once 'Zend/Server/Reflection.php';
require_once 'Server/Reflection/Class.php';

class Server_Reflection extends Zend_Server_Reflection {
    public static function reflectClass($class, $argv = false, $namespace = '')
    {
        if (is_object($class)) {
            $reflection = new ReflectionObject($class);
        } elseif (class_exists($class)) {
            $reflection = new ReflectionClass($class);
        } else {
            require_once 'Zend/Server/Reflection/Exception.php';
            throw new Zend_Server_Reflection_Exception('Invalid class or object passed to attachClass()');
        }

        if ($argv && !is_array($argv)) {
            require_once 'Zend/Server/Reflection/Exception.php';
            throw new Zend_Server_Reflection_Exception('Invalid argv argument passed to reflectClass');
        }

        return new Server_Reflection_Class($reflection, $namespace, $argv);
    }
}