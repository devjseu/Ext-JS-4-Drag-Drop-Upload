Ext.define('MyApp.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Ext.tab.Panel',
        'Ext.layout.container.Border',
        'Ext.grid.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Number',
        'Ext.ux.container.Upload'
    ],

    alias: 'widget.layout',

    layout: {
        type: 'border'
    },
    items: [
        {
            region: 'west',
            xtype: 'panel',
            title: 'List of files',
            layout: 'fit',
            items: [// linijka 22
                {
                    xtype: 'grid',
                    border: false,
                    itemId: 'filegrid',
                    columns: [
                        {
                            dataIndex: 'name',
                            text: 'File name',
                            flex: 1
                        },
                        {
                            dataIndex: 'type',
                            flex: 1,
                            text: 'Type'
                        },
                        {
                            dataIndex: 'size',
                            flex: 1,
                            text: 'Size'
                        },
                        {
                            dataIndex: 'progress',
                            flex: 0.7,
                            text: 'Progress'
                        },
                        {
                            dataIndex: 'status',
                            flex: 0.7,
                            text: 'Status',
                            renderer: function (value) {
                                return Ext.Object.getKey(Ext.ux.upload.transport.Abstract.STATUS, value);
                            }
                        }
                    ]
                }
            ],
            width: 350
        },
        {
            region: 'center',
            xtype: 'tabpanel',
            layout: 'fit',
            items: [
                {
                    title: 'Upload',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'uploadbox',
                            url : '/api/json/1.0/jsonrpc.php',
                            directMethod : 'MyApp.File.upload',
                            acceptedTypes : {
                                'image/png': true,
                                'video/avi': true
                            },
                            autoUpload : false,
                            listeners: {
                                ddinit: function (dd) {
                                    var el = this,
                                        filesStore = dd.getTransport().getFiles(),
                                        grid = el.up('layout').down('#filegrid');
                                    grid.reconfigure(filesStore);
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ]
});
