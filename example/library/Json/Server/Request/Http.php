<?php

require_once('Zend/Json/Server/Request/Http.php');
class Json_Server_Request_Http extends Zend_Json_Server_Request_Http
{

    /**
     * Constructor
     *
     * Pull JSON request from raw POST body and use to populate request.
     * @param $json
     */
    public function __construct($json)
    {
        $this->_rawJson = $json;

        if (!empty($json)) {
            $this->loadJson($json);
        }
    }

}

?>
