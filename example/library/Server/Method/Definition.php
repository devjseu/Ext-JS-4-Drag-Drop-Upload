<?php

require_once('Zend/Server/Method/Definition.php');
class Server_Method_Definition extends Zend_Server_Method_Definition
{
    protected $_formHandler = false;

    /**
     * Add prototype to method definition
     *
     * @param  array|Server_Method_Prototype $prototype
     * @return Zend_Server_Method_Definition
     */
    public function addPrototype($prototype)
    {
        if (is_array($prototype)) {
            require_once 'Zend/Server/Method/Prototype.php';
            $prototype = new Server_Method_Prototype($prototype);
        } elseif (!$prototype instanceof Zend_Server_Method_Prototype) {
            require_once 'Zend/Server/Exception.php';
            throw new Zend_Server_Exception('Invalid method prototype provided');
        }
        $this->_prototypes[] = $prototype;
        return $this;
    }

    /**
     * @param $formHandler
     * @return $this
     */
    public function setFormHandler($formHandler)
    {
        $this->_formHandler = $formHandler;
        return $this;
    }

    /**
     * @return boolean
     */
    public function getFormHandler()
    {
        return $this->_formHandler;
    }


}
