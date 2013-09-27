/*
 This file is generated and updated by Sencha Cmd. You can edit this file as
 needed for your application, but these edits will have to be merged by
 Sencha Cmd when it performs code generation tasks such as generating new
 models, controllers or views and when running "sencha app upgrade".

 Ideally changes to this file would be limited and most work would be done
 in other places (such as Controllers). If Sencha Cmd cannot merge your
 changes and its generated code, it will produce a "merge conflict" that you
 will need to resolve manually.
 */

Ext.require(
    [
        'Ext.direct.*',
        'MyApp.lib.direct.ZendFrameworkProvider'
    ], function () {
        Ext.direct.Manager.addProvider(
            //Ext.app.REMOTING_API
            {
                'type': 'zf',
                'url': Ext.app.JSONRPC_API.target,
                'actions': Ext.app.JSONRPC_API.services,
                'format': 'json'
            });
    });

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': '/app/ux'
    }
});
Ext.application({
    name: 'MyApp',
    models: [
    ],

    views: [
        'Main',
        'Viewport'
    ],
    controllers: [
        'Main'
    ],
    autoCreateViewport: true,
    launch: function () {
        window.ondragenter = function (e) {
            e.dataTransfer.dropEffect = 'none';
            e.preventDefault();
            return false;
        };

        window.ondragover = function (e) {
            e.preventDefault();
            return false;
        };

        window.ondrop = function (e) {
            return false;
        };

        window.ondragleave = function (e) {
            return false;
        };
    }
});
