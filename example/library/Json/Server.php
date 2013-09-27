<?php
/**
 * Final class for json server
 * @author Sebastian Widelak
 * @class Json_Server
 *
 */

require_once('Zend/Json/Server.php');
require_once('Json/Server/Request/Http.php');
require_once('Json/Server/Response/Http.php');
require_once('Server/Method/Definition.php');
require_once('Server/Method/Prototype.php');
require_once('Server/Reflection.php');
final class Json_Server extends Zend_Json_Server
{

    /**
     * Request object
     * @var Json_Server_Request_Http
     */
    protected $_request;
    /**
     * @var
     */
    protected $_json;
    /**
     * @var array|mixed
     */
    protected $_requests;
    /**
     * @var array
     */
    protected $_responses = array();

    /**
     *
     */
    public function __construct()
    {
        parent::__construct();

        $json = file_get_contents('php://input');

        if ($json) {
            $decode = json_decode($json);
            $this->_requests = is_array($decode) ? $decode : array($decode);
            $json = json_encode(current(array_splice($this->_requests, 0, 1)));
        }
        // Handle request
        $this->setJson($json);
    }

    /**
     * @param bool $argv
     */
    public function getApiMap($argv = false)
    {
        $objDir = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(APPLICATION_PATH . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR), true);
        foreach ($objDir as $objFile) {
            if (
                is_file((string)$objFile) && preg_match('/(.*)\.php/', (string)$objFile)
            ) {

                $name = explode("api" . DIRECTORY_SEPARATOR, $objFile);
                $name = explode(DIRECTORY_SEPARATOR, $name[1]);
                foreach ($name as $i => $part) {
                    if (!$part) {
                        unset($name[$i]);
                    }
                }
                $name[1] = substr(ucfirst($name[1]), strpos(".", $name[1]), -4);
                //include only once those files
                include_once (string)$objFile;
                try {
                    //$reflection = Zend_Server_Reflection::reflectClass(join("_", $name), $argv, join(".", $name));
                    $reflection = Server_Reflection::reflectClass(join("_", $name), $argv, join(".", $name));
                } catch (Exception $e) {
                    echo $e->getTraceAsString();
                }
                foreach ($reflection->getMethods() as $method) {
                    $definition = $this->_buildSignature($method, join("_", $name));
                    $this->_addMethodServiceMap($definition);
                }
            }
        }
    }


    /**
     * @param Zend_Server_Method_Definition $method
     */
    protected function _addMethodServiceMap(Zend_Server_Method_Definition $method)
    {
        $serviceInfo = array(
            'name'   => $method->getName(),
            'return' => $this->_getReturnType($method),
            'formHandler' => $method->getFormHandler()
        );
        $params = $this->_getParams($method);
        $serviceInfo['params'] = $params;
        $serviceMap = $this->getServiceMap();
        if (false !== $serviceMap->getService($serviceInfo['name'])) {
            $serviceMap->removeService($serviceInfo['name']);
        }
        $serviceMap->addService($serviceInfo);
    }

    /**
     * Retrieve list of allowed SMD methods for proxying
     *
     * @return array
     */
    protected function _getSmdMethods()
    {
        if (null === $this->_smdMethods) {
            $this->_smdMethods = array();
            require_once 'Json/Server/Smd.php';
            $methods = get_class_methods('Json_Server_Smd');
            foreach ($methods as $key => $method) {
                if (!preg_match('/^(set|get)/', $method)) {
                    continue;
                }
                if (strstr($method, 'Service')) {
                    continue;
                }
                $this->_smdMethods[] = $method;
            }
        }
        return $this->_smdMethods;
    }


    /**
     * Build a method signature
     *
     * @param  Zend_Server_Reflection_Function_Abstract $reflection
     * @param  null|string|object $class
     * @return Zend_Server_Method_Definition
     * @throws Zend_Server_Exception on duplicate entry
     */
    protected function _buildSignature(Zend_Server_Reflection_Function_Abstract $reflection, $class = null)
    {
        $ns = $reflection->getNamespace();
        $name = $reflection->getName();
        $method = empty($ns) ? $name : $ns . '.' . $name;
        $formHandler = $reflection->getFormHandler();

        if (!$this->_overwriteExistingMethods && $this->_table->hasMethod($method)) {
            require_once 'Zend/Server/Exception.php';
            throw new Zend_Server_Exception('Duplicate method registered: ' . $method);
        }

        $definition = new Server_Method_Definition();
        $definition->setName($method)
            ->setCallback($this->_buildCallback($reflection))
            ->setMethodHelp($reflection->getDescription())
            ->setInvokeArguments($reflection->getInvokeArguments())
            ->setFormHandler($formHandler);

        foreach ($reflection->getPrototypes() as $proto) {
            $prototype = new Server_Method_Prototype();
            $prototype->setReturnType($this->_fixType($proto->getReturnType()));
            foreach ($proto->getParameters() as $parameter) {
                $param = new Zend_Server_Method_Parameter(array(
                    'type' => $this->_fixType($parameter->getType()),
                    'name' => $parameter->getName(),
                    'optional' => $parameter->isOptional(),
                ));
                if ($parameter->isDefaultValueAvailable()) {
                    $param->setDefaultValue($parameter->getDefaultValue());
                }
                $prototype->addParameter($param);
            }
            $definition->addPrototype($prototype);
        }
        if (is_object($class)) {
            $definition->setObject($class);
        }
        $this->_table->addMethod($definition);
        return $definition;
    }

    /**
     * Retrieve SMD object
     *
     * @return Json_Server_Smd
     */
    public function getServiceMap()
    {
        if (null === $this->_serviceMap) {
            require_once 'Json/Server/Smd.php';
            $this->_serviceMap = new Json_Server_Smd();
        }
        return $this->_serviceMap;
    }

    /**
     * Get JSON-RPC request object
     *
     * @return Zend_Json_Server_Request
     */
    public function getRequest()
    {

        if (null === ($request = $this->_request)) {
            $this->setRequest(new Json_Server_Request_Http($this->getJson()));
        }
        return $this->_request;
    }

    /**
     * Get response object
     *
     * @return Zend_Json_Server_Response
     */
    public function getResponse()
    {
        if (null === ($response = $this->_response)) {
            require_once 'Zend/Json/Server/Response/Http.php';
            $this->setResponse(new Json_Server_Response_Http());
        }
        return $this->_response;
    }

    /**
     * @return mixed
     */
    public function getJson()
    {
        return $this->_json;
    }

    /**
     * @param $json
     * @return Json_Server
     */
    public function setJson($json)
    {
        $this->_json = $json;
        $this->_request = NULL;
        return $this;
    }

    /**
     * @param string $class
     * @param string $namespace
     * @param null $argv
     * @return $this|Zend_Json_Server
     */
    public function setClass($class, $namespace = '', $argv = null)
    {
        $argv = null;
        if (3 < func_num_args()) {
            $argv = func_get_args();
            $argv = array_slice($argv, 3);
        }

        require_once 'Server/Reflection.php';
        $reflection = Server_Reflection::reflectClass($class, $argv, $namespace);

        foreach ($reflection->getMethods() as $method) {
            $definition = $this->_buildSignature($method, $class);
            $this->_addMethodServiceMap($definition);
        }
        return $this;
    }
    /**
     * @param bool $request
     * @return null|string|Zend_Json_Server_Response
     * @throws Exception
     */
    public function handle($request = false)
    {
        if ((false !== $request) && (!$request instanceof Zend_Json_Server_Request)) {
            require_once 'Zend/Json/Server/Exception.php';
            throw new Exception('Invalid request type provided; cannot handle');
        } elseif ($request) {
            $this->setRequest($request);
        }
        while (true) {
            if ($this->getRequest()->getMethod()) {
                $include = explode(".", $this->getRequest()->getMethod());

                include_once realpath(
                    APPLICATION_PATH .
                    DIRECTORY_SEPARATOR .
                    'api' . DIRECTORY_SEPARATOR .
                    $include[0] . DIRECTORY_SEPARATOR .
                    $include[1] . '.php'
                );

                $this->setClass($include[0] . '_' . $include[1], $include[0] . '.' . $include[1]);
                $modeLoader = new Zend_Application_Module_Autoloader(array(
                    'namespace' => ucfirst($include[0]),
                    'basePath' => APPLICATION_PATH . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . $include[0]
                ));
            }
            $this->_handle();
            // Get response
            $response = $this->_getReadyResponse();
            array_push($this->_responses, $response->toJson());
            if (empty($this->_requests))
                break;
            $json = json_encode(current(array_splice($this->_requests, 0, 1)));
            // Handle request
            $this->setJson($json);
        }

        // Emit response
        if ($this->autoEmitResponse()) {
            if (count($this->_responses) > 1) {
                $response = '[' . implode(",", $this->_responses) . ']';
            }
            echo $response;
            return;
        }

        // or return it
        return $response;

    }
}
