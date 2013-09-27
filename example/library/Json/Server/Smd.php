<?php
require_once 'Json/Server/Smd.php';
class Json_Server_Smd extends Zend_Json_Server_Smd
{

    /**
     * Add Service
     *
     */
    public function addService($service)
    {
        require_once 'Json/Server/Smd/Service.php';

        if ($service instanceof Json_Server_Smd_Service) {
            $name = $service->getName();
        } elseif (is_array($service)) {
            $service = new Json_Server_Smd_Service($service);
            $name = $service->getName();
        } else {
            require_once 'Zend/Json/Server/Exception.php';
            throw new Zend_Json_Server_Exception('Invalid service passed to addService()');
        }

        if (array_key_exists($name, $this->_services)) {
            require_once 'Zend/Json/Server/Exception.php';
            throw new Zend_Json_Server_Exception('Attempt to register a service already registered detected');
        }
        $this->_services[$name] = $service;
        return $this;
    }
}