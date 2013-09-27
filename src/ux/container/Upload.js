Ext.define('Ext.ux.container.Upload', {
    requires: ['Ext.ux.upload.DD'],
    extend: 'Ext.container.Container',
    alias: 'widget.uploadbox',
    alternateClassName: 'Ext.UploadBox',
    layout: 'fit',
    emptyDragZoneMsg: "Upload zone",
    dragZoneOverMsg: "Add {0} file(s) to upload query",
    config: {
        /**
         * @config
         *
         * Determines that files are auto loaded after drop or not
         */
        autoUpload: false
    },
    initComponent: function () {
        var me = this;
        me.addEvents([
        /**
         * @event
         *
         * Fired when drag & drop was initialized
         *
         */
            'ddinit'
        ]);
        me.items = [
            {
                xtype: 'panel',
                frame: false,
                border: 0,
                layout: 'vbox',
                tbar: [
                    {
                        xtype: 'button',
                        text: 'Upload',
                        itemId: 'ux-upload-btn-upload',
                        handler: function () {
                            var btn = this,
                                abort = btn.next();
                            me.upload.upload();
                            btn.setVisible(false);
                            abort.setVisible(true);
                        },
                        disabled: true
                    },
                    {
                        xtype: 'button',
                        itemId: 'ux-upload-btn-abort',
                        handler: function () {
                            var abort = this,
                                btn = abort.prev();
                            me.upload.abort();
                            btn.setVisible(true);
                            abort.setVisible(false);
                        },
                        text: 'Abort',
                        hidden: true
                    },
                    {
                        xtype: 'button',
                        itemId: 'ux-upload-btn-clear',
                        text: 'Clear queue',
                        handler: function () {
                            var clear = this,
                                abort = clear.prev(),
                                btn = abort.prev();
                            me.upload.abort();
                            me.upload.getTransport().getFiles().removeAll();
                            btn.setDisabled(true);
                            btn.setVisible(true);
                            abort.setVisible(false);
                        },
                        hidden: true
                    }
                ],
                items: [
                    {
                        xtype: 'container',
                        itemId: 'uploadBox',
                        flex: 1,
                        width: '100%',
                        style: 'border-bottom: 1px solid #99bce8;',
                        layout: {
                            align: 'stretch',
                            pack: 'center',
                            type: 'vbox'
                        },
                        items: [
                            {
                                xtype: 'container',
                                html: 'Upload zone',
                                style: 'text-align: center;'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        height: 28,
                        itemId: 'uploadBoxProgress',
                        cls: 'x-toolbar-default'
                    }
                ]
            }
        ];
        Ext.apply(me.listeners, {
            afterrender: me.afterContainerRender
        });
        me.callParent(arguments);
    },
    afterContainerRender: function () {
        var me = this,
            btnUpload = me.down('#ux-upload-btn-upload'),
            btnClear = me.down('#ux-upload-btn-clear'),
            btnAbort = me.down('#ux-upload-btn-abort');
        me.upload = Ext.create('Ext.ux.upload.DD', {
            dropZone: me.down('#uploadBox'),
            id: me.id,
            url: me.url,
            directMethod: me.directMethod || '',
            acceptedTypes: me.acceptedTypes,
            listeners: {
                dragover: function (el, count) {
                    el.removeAll();
                    el.add({
                        xtype: 'container',
                        html: Ext.String.format(me.dragZoneOverMsg, count),
                        style: 'text-align: center;'
                    });
                },
                dragout: function (el) {
                    me.resetDropZone(el);
                },
                drop: function (el) {
                    var files = me.upload.getTransport().getFiles();
                    me.resetDropZone(el);
                    if (files.count() > 0) {
                        btnUpload.setDisabled(false);
                        btnClear.setVisible(true);
                    } else {
                        btnUpload.setDisabled(true);
                        btnClear.setVisible(false);
                    }
                }
            }
        });
        me.fireEvent('ddinit', me.upload);
        /**
         * additional listeners to controll buttons
         */
        me.upload.getTransport().on('uploadend', function () {
            var transport = me.upload.getTransport(),
                files = transport.getFiles(),
                toUpload = 0,
                inProgress = 0;
            files.each(function (r) {
                switch (r.get('status')) {
                    case Ext.ux.upload.transport.Abstract.STATUS["pending"]:
                        toUpload++;
                        break;
                    case Ext.ux.upload.transport.Abstract.STATUS["in progress"]:
                        inProgress++;
                        break;
                }
            });
            if (!toUpload) {
                btnUpload.setDisabled(true);
                if(!inProgress) {
                    btnUpload.setVisible(true);
                    btnAbort.setVisible(false);
                }
            }
        });
    },
    resetDropZone: function (el) {
        var me = this;
        el.removeAll();
        el.add({
            xtype: 'container',
            html: me.emptyDragZoneMsg,
            style: 'text-align: center;'
        });
    }
});