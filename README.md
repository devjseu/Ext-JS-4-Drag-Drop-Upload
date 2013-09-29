Ext-JS-4-Drag-Drop-Upload
=========================

User extension for Ext JS 4 which will allow you to drag and drop files on special component and upload them on the server. Upload progress is supported too.

## Features

  - easy to implement (via xtype)
  - configurable (file extensions, size, maximum request time, etc)
  - uses native HTML5 apis (drag&drop, xhr2, formData) 
  - allows uploading of multiple files at once
  - displays upload progress
  - provides special store (with files in queue) which can be easly integrated with other components

## Requirements

  - Sencha Ext JS 4.2
  - browser supporting used HTML5 apis

## How to install

Copy code from src/ux to your project and add the path with the prefix to `Ext.Loader`:

    Ext.Loader.setPath({
        'Ext.ux' : '/my/path/to/ux'
    });
    
## How to use
    
In the most simple case, you can just add the component with some paramters:  

    {
        xtype: 'uploadbox',
        url: 'upload.php'
    }

## Confiugration

TODO

## Example

You can find it in `example/` directory or online [here](http://demos.devjs.eu/extjs-4-dd-upload/public/)


### Requirements:

  - web server with PHP support
  - Zend Framework installed

Clone the repository and make the `public` directory accessible through your web server. 


## License

  - MIT (included in repository)
