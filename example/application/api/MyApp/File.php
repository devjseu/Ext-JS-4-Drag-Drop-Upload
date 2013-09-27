<?php

class MyApp_File
{
    /**
     * @formHandler
     * @return array
     */
    public function upload() {
        $success = true;
		echo "/*";
        print_r($_FILES);
		echo "*/";
        /**
         * @link http://php.net/manual/en/features.file-upload.errors.php
         */
        if(current($_FILES)['error'] == 1){
            $success = false;
        }
        return array('success'=>$success);
    }
}