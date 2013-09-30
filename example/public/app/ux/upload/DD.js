/**
 * @class Ext.ux.upload.DD
 * @extends Ext.ux.upload.Basic
 *
 * @author Sebastian Widelak (c) 2013
 */
Ext.define('Ext.ux.upload.DD', {
    requires: ['Ext.ux.upload.transport.Xhr'],
    extend: 'Ext.util.Observable',
    transport: null,
    config: {
        id : null,
        directMethod: null,
        url: null,
        params : {},
        acceptedTypes : {},
        dropZone : null
    },
    /**
     *
     * @param cfg
     */
    constructor: function (cfg) {
        var me = this;
        me.initConfig(cfg);
        me.callParent(arguments);
        me.addEvents({
            /**
             * @event
             *
             * Fired when dragged element is over drop zone.
             *
             */
            'dragover': true,
            /**
             * @event
             *
             * Fired when dragged element left drop zone
             *
             */
            'dragout': true,
            /**
             * @event
             *
             * Fired when element was dropped.
             *
             */
            'drop': true
        });
        /**
         * test browser compatibility
         */
        me.testCompatibility();
        if (me.tests.dnd) {
            /**
             * Headers drag&drop if browser allow on that
             */
            me.initDragDrop();
            me.transport = me.initTransport();
        }
    },
    getDropZone: function () {
        return this.config.dropZone;
    },
    /**
     * @private
     */
    initDragDrop: function () {
        var me = this,
            collection = Ext.create('Ext.util.MixedCollection'),
            dropZone = me.getDropZone();

        dropZone.getEl().dom.ondrop = function (e) {
            e.preventDefault();
            collection = Ext.create('Ext.util.MixedCollection');
            if (Ext.Array.contains(e.dataTransfer.types, "Files")) {
                me.transport.addFiles(e.dataTransfer.files);
            }
            me.fireEvent('drop', dropZone);
            return false;
        };
        dropZone.getEl().dom.ondragenter = function (e) {
            if (collection.getCount() === 0) {
                me.fireEvent('dragover', dropZone, e.dataTransfer.items.length, e.dataTransfer);
            }
            collection.add(e.target);
        };
        dropZone.getEl().dom.ondragleave = function (e) {
            setTimeout(function () {
                collection.remove(e.target);
                if (collection.getCount() === 0) {
                    me.fireEvent('dragout', dropZone);
                }
            }, 1);
        }
    },
    /**
     *
     * @returns {Ext.ux.upload.transport.Abstract}
     */
    initTransport: function () {
        var me = this,
            transport,
            _class;
        if (this.transport instanceof Ext.ux.upload.transport.Abstract) {
            transport = this.transport;
        } else {
            if (me.tests['progress'] && me.tests['formdata']) {
                _class = 'Ext.ux.upload.transport.Xhr';
            } else {
                console.warn('progress and form data not supported');
                //todo: older browser support
            }
            transport = Ext.create(_class, this.config);
        }
        return transport;
    },
    /**
     * @private
     */
    testCompatibility: function () {
        var me = this;
        me.tests = {
            dnd: 'draggable' in document.createElement('span'),
            formdata: !!window.FormData,
            progress: "upload" in new XMLHttpRequest
        };
    },
    getTransport: function () {
        return this.transport;
    },
    upload: function () {
        this.getTransport().upload();
    },
    abort : function () {
        this.getTransport().abortUpload();
    }
});