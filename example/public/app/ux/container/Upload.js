Ext.define('Ext.ux.container.Upload', {
    requires: ['Ext.ux.upload.DD'],
    extend: 'Ext.container.Container',
    alias: 'widget.uploadbox',
    alternateClassName: 'Ext.UploadBox',
    layout: 'fit',
    emptyDragZoneMsg: "Upload zone",
    dragZoneOverMsg: "Add {0} file(s) to upload query",
    progressMsg: "{0} files to upload.",
    processed : 0,
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
                            me.processed = 0;
                            me.updateInfo();
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
                        width: '100%',
                        layout: 'absolute',
                        items: [
                            {
                                xtype: 'container',
                                height: 28,
                                anchor: '0%',
                                itemId: 'upload-box-progress',
                                style: 'border-right: 1px solid #99bce8;',
                                cls: 'x-toolbar-default'
                            },
                            {
                                xtype: 'container',
                                itemId: 'upload-box-info',
                                html: '',
                                y: 7,
                                x: 5,
                                width: '100%'
                            }
                        ]
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
            btnAbort = me.down('#ux-upload-btn-abort'),
            progressBar = me.down('#upload-box-progress'),
            interval = [],
            lastReqTime = 0;
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
                        if(me.getAutoUpload()){
                            btnAbort.setVisible(true);
                            btnUpload.setVisible(false);
                            me.upload.upload();
                        }else{

                        }
                    } else {
                        btnUpload.setDisabled(true);
                        btnClear.setVisible(false);
                    }
                    me.updateInfo();
                }
            }
        });
        me.updateInfo();
        me.fireEvent('ddinit', me.upload);
        /**
         * additional listeners to controll buttons
         */
        me.upload.getTransport().on('beforeupload', function () {
            progressBar
                .getEl()
                .sequenceFx()
                .animate({
                    duration: 0,
                    to: {
                        width: 0
                    }
                });
            lastReqTime = +new Date();
        });
        me.upload.getTransport().on('progresschange', function (e, item) {
            var width = progressBar.up().getWidth() * item.get('progress') / 100,
                currReqTime = +new Date();
            interval.push(currReqTime - lastReqTime);
            lastReqTime = currReqTime;
            progressBar
                .getEl()
                .sequenceFx()
                .animate({
                    duration: me.calculateDuration(interval),
                    to: {
                        width: width
                    }
                });
        });
        me.upload.getTransport().on('afterupload', function () {
            var transport = me.upload.getTransport(),
                files = transport.getFiles(),
                toUpload = 0,
                inProgress = 0;
            me.processed++;
            /**
             * clear interval array
             */
            interval = [];
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
                if (!inProgress) {
                    btnUpload.setVisible(true);
                    btnAbort.setVisible(false);
                }
            }
            me.updateInfo();
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
    },
    calculateDuration: function (elmt) {
        var sum = 0;
        for (var i = 0; i < elmt.length; i++) {
            sum += parseInt(elmt[i]);
        }
        return sum / elmt.length;
    },
    updateInfo: function () {
        var me = this,
            progressInfo = me.down('#upload-box-info'),
            files = me.upload.getTransport().getFiles();
        progressInfo.removeAll();
        progressInfo.add({
            xtype: 'container',
            html: Ext.String.format(me.progressMsg, files.count() - this.processed)
        });
    }
});