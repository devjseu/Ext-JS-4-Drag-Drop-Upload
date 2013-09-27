<?php

require_once 'Zend/Server/Reflection/Class.php';
require_once 'Server/Reflection/Method.php';

class Server_Reflection_Class extends Zend_Server_Reflection_Class
{
    public function __construct(ReflectionClass $reflection, $namespace = null, $argv = false)
    {
        $this->_reflection = $reflection;
        $this->setNamespace($namespace);

        foreach ($reflection->getMethods() as $method) {
            // Don't aggregate magic methods
            if ('__' == substr($method->getName(), 0, 2)) {
                continue;
            }

            if ($method->isPublic()) {
                // Get signatures and description
                $this->_methods[] = new Server_Reflection_Method($this, $method, $this->getNamespace(), $argv);
            }
        }
    }

}
