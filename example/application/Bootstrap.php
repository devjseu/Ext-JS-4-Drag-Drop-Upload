<?php

/**
 * Main app bootstrap
 */
class Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{

    protected function _initAutoload()
    {

    }

    protected function _initRegistry()
    {
        // get config from file
        $cfg = new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini', APPLICATION_ENV, true);
        //register a global config
        Zend_Registry::set('config', $cfg);
    }

    /*
	 * Method registering a databases to the system and all settings are in application.ini
	 * If app using module architecture, config from module.ini will override the same settings from application.ini 
	 * 
	 * Example:
	 * resources.multidb.tz.dbname appeal in code by Zend_Registry::get('tz');
     */

    protected function _initMultiDb()
    {
        if (!defined('DEBUG'))
            define('DEBUG', false);
        $resource = $this->getPluginResource('multidb');
        $resource->init();
        $databases = Zend_Registry::get('config')->resources->multidb;
        //dynamic loading a databases
        foreach ($databases as $name => $adapter) {
            $db_adapter = $resource->getDb($name);
            //$db_adapter->setFetchMode(Zend_Db::FETCH_OBJ);
            Zend_Registry::set($name, $db_adapter);
        }
    }


}

function handleError($errno, $errstr, $errfile, $errline, array $errcontext)
{
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return FALSE;
    }

    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
}

