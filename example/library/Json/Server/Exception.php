<?php

class Json_Server_Exception extends Exception
{

    protected $code;

    public function  __construct($message, $code, Exception $e = null)
    {
        parent::__construct($message, 0, $e);
        $this->code = $code;
    }

}