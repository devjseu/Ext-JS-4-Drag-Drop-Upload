<?php

require_once('Zend/Json/Server/Response/Http.php');

class Json_Server_Response_Http extends Zend_Json_Server_Response_Http
{
    /**
     * @return string
     */
    public function toJson()
    {
        if ($this->isError()) {
            $error = $this->getError()->toArray();
            $error['data'] = array('customCode' => $error['data']->getCode());
            $response = array(
                'error' => $error,
                'id' => $this->getId(),
            );
        } else {
            $response = array(
                'result' => $this->getResult(),
                'id' => $this->getId(),
            );
        }

        if (null !== ($version = $this->getVersion())) {
            $response['jsonrpc'] = $version;
        }

        require_once 'Zend/Json.php';
        return Zend_Json::encode($response);
    }

}
