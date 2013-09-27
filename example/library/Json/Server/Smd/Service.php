<?php
require_once 'Json/Server/Smd/Service.php';
class Json_Server_Smd_Service extends Zend_Json_Server_Smd_Service
{
    protected $_formHandler;

    /**
     * @param mixed $formHandler
     */
    public function setFormHandler($formHandler)
    {
        $this->_formHandler = $formHandler;
    }

    /**
     * @return mixed
     */
    public function getFormHandler()
    {
        return $this->_formHandler;
    }


    /**
     * Cast service description to array
     *
     * @return array
     */
    public function toArray()
    {
        $name        = $this->getName();
        $envelope    = $this->getEnvelope();
        $target      = $this->getTarget();
        $transport   = $this->getTransport();
        $parameters  = $this->getParams();
        $returns     = $this->getReturn();
        $formHandler = $this->getFormHandler();

        if (empty($target)) {
            return compact('envelope', 'transport', 'parameters', 'returns', 'formHandler');
        }

        return $paramInfo = compact('envelope', 'target', 'transport', 'parameters', 'returns', 'formHandler');
    }
}