<?php
require_once('Zend/Server/Abstract.php');
class Json_Server_Helper_Form
{

    protected $_http;

    public function __construct()
    {
        $this->_http = new Zend_Controller_Request_Http;
    }

    public function handle()
    {

        $include = explode(".", $this->getHttp()->getParam('extAction'));
        $funcName = $this->getHttp()->getParam('extMethod');
        $args = array();
        foreach ($this->getHttp()->getParams() as $key => $param) {
            if (strpos($key, "ext") === false) {
                $args[] = $param;
            }
        }

        include_once realpath(
            APPLICATION_PATH .
            DIRECTORY_SEPARATOR .
            'api' . DIRECTORY_SEPARATOR .
            $include[0] . DIRECTORY_SEPARATOR .
            $include[1] . '.php'
        );
        $controllerName = $include[0] . '_' . $include[1];
        $controller = new $controllerName;
        $return = call_user_func_array(array($controller, $funcName), $args);
        if ($return !== false) {
            echo json_encode($return);
        } else {
            echo json_encode(array(
                'success' => false
            ));
        }
    }

    /**
     * @return \Zend_Controller_Request_Http
     */
    public function getHttp()
    {
        return $this->_http;
    }


}