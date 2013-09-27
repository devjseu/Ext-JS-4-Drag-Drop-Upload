<?php

//Define path to application directory
defined('APPLICATION_PATH')
|| define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../../../../application'));

// Define application environment
defined('APPLICATION_ENV')
|| define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

set_include_path(implode(PATH_SEPARATOR, array(
    realpath(APPLICATION_PATH . '/../library/'),
    get_include_path(),
)));

/** Zend_Application */
require_once 'Zend/Application.php';
require_once 'Zend/Controller/Request/Http.php';
require_once 'Json/Server.php';
// Create application, bootstrap, and run
$application = new Zend_Application(
    APPLICATION_ENV,
    APPLICATION_PATH . '/configs/application.ini'
);

$application->getBootstrap()
    ->bootstrap('autoload')
    ->bootstrap('registry');


$http = new Zend_Controller_Request_Http;
if (
    strpos($http->getHeader('Content-Type'), "x-www-form-urlencoded") > -1 ||
    strpos($http->getHeader('Content-Type'), "multipart/form-data") > -1
) {
    /**
     * for handling form submit we need a little hack
     */
    require_once 'Json/Server/Helper/Form.php';
    $server = new Json_Server_Helper_Form();
} else {
    //Create instance of server
    $server = new Json_Server();
}

//define response type
header('Content-Type:application/json;');

//if request method is get
if ('GET' == $_SERVER['REQUEST_METHOD']) {
    // Indicate the URL endpoint, and the JSON-RPC version used:
    $server->setTarget('/api/json/1.0/jsonrpc.php')
        ->setEnvelope(Zend_Json_Server_Smd::ENV_JSONRPC_2);

    //get map of api
    $server->getApiMap();

    //parse to array
    $smdArray = $server->getServiceMap()->toArray();

    // save some bytes
    unset($smdArray['methods']);

    $response = "\nExt.define('Ext.app.JSONRPC_API'," . Zend_Json::encode(array_merge($smdArray, array('singleton' => true))) . " );\n";
    $response = Zend_Json::prettyPrint($response, array("indent" => ""));
    file_put_contents('jsonrpc.js', $response);
    echo $response;
    return;
}

$server->handle();
