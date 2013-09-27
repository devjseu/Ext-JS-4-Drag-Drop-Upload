<?php
require_once 'Zend/Server/Reflection/Prototype.php';

class Server_Reflection_Prototype extends Zend_Server_Reflection_Prototype
{
    protected $_formHandler;
    public function __construct(Zend_Server_Reflection_ReturnValue $return, $params = null, $formHandler = false)
    {
        $this->_formHandler = $formHandler;
        parent::__construct($return, $params);
    }
    /**
     * Retrieve return type
     *
     * @return string
     */
    public function getFormHandler()
    {
        return $this->_formHandler;
    }
}
