/**
 * @class Ext.ux.upload.transport.Abstract
 * @extends Ext.util.Observable
 *
 * @author Sebastian Widelak (c) 2013
 */
Ext.define('Ext.ux.upload.transport.Abstract', {
    extend: 'Ext.util.Observable',
    requires: ['Ext.ux.upload.Store'],
    files: null,
    directParams: {
        extType: 'rpc',
        extUpload: true,
        extMethod: '',
        extAction: ''
    },
    statics: {
        STATUS: {
            'pending': 0,
            'in progress': 1,
            'failure': 2,
            'success': 3,
            'abort' : 4
        }
    },
    config: {

        /**
         * @cfg {Number} id
         *
         * Unique id of uploader
         */
        id: null,

        /**
         * @cfg {Object} params (required)
         *
         * Additional parameters to be send with upload request
         */
        params: {},

        /**
         * @cfg {Number} [maxFileSize=500000000]
         *
         * The maximum file size allowed to be uploaded.
         */
        maxFileSize: 500000000,

        /**
         * @cfg {String} url (required)
         *
         * The server URL to upload to.
         */
        url: null,

        /**
         * @cfg {String} url (required)
         *
         * The direct method which will be used to upload.
         */
        directMethod: '',

        /**
         * @cfg {Number} [timeout=60000]
         *
         * The connection timeout in miliseconds.
         */
        timeout: 60 * 1000,

        /**
         * @cfg {String} [contentType='application/binary']
         *
         * The content type announced in the HTTP headers. It is autodetected if possible, but if autodetection
         * cannot be done, this value is set as content type header.
         */
        contentType: 'application/binary',

        /**
         * @cfg {Object} acceptedTypes (required)
         *
         * Object with accepted type of files
         */
        acceptedTypes: {},

        /**
         * @cfg {Object} acceptedTypes (required)
         *
         * Object with extra headers
         */
        extraHeaders: {},

        /**
         * @cfg {String} [method='POST']
         *
         * The HTTP method to be used.
         */
        method: 'POST',

        /**
         * @cfg {String} [filenameHeader='X-File-Name']
         *
         * The name of the HTTP header containing the filename.
         */
        filenameHeader: 'X-File-Name',

        /**
         * @cfg {String} [sizeHeader='X-File-Size']
         *
         * The name of the HTTP header containing the size of the file.
         */
        sizeHeader: 'X-File-Size',

        /**
         * @cfg {String} [typeHeader='X-File-Type']
         *
         * The name of the HTTP header containing the MIME type of the file.
         */
        typeHeader: 'X-File-Type'
    },
    listeners: {
    },
    constructor: function (cfg) {
        var me = this;
        me.addEvents({
            /**
             * @event
             *
             * Fired when dropped file has not accepted extension.
             *
             */
            'notaccepted': true,
            /**
             * @event
             *
             * Fired when progress of upload was changed
             *
             */
            'progresschange': true,
            /**
             * @event
             *
             * Fired when error occurred.
             *
             */
            'failure': true,
            /**
             * @event
             *
             * Fired when file was uploaded.
             *
             */
            'success': true,
            /**
             * @event
             * @param formData
             * @param record
             *
             * Fires when upload process start.
             *
             */
            'beforeupload': true,
            /**
             * @event
             * @param status
             * @param event
             * @param record
             *
             * Fired whatever file was uploaded or error occurred.
             *
             */
            'afterupload': true,
            /**
             * @event
             * @param event
             * @param record
             *
             * Fired after request timeout.
             *
             */
            'timeout': true
        });
        me.initConfig(cfg);
        if (typeof me.config.url === 'undefined') {
            throw Error("uploadUrl missing in configuration object");
        }
        /**
         * create unique id
         */
        me.id = me.config.id = 'transport-' + (me.config.id || (+new Date()) + Math.floor(Math.random() * 101));

        /**
         * create store for files
         */
        me.files = Ext.create('Ext.ux.upload.Store', {
            storeId: this.getId()
        });
        me.callParent(arguments);
        me.directParams = me.initDirectParams();
        me.on('progresschange', me.onFileProgress);
        me.on('success', me.onFileSuccess);
        me.on('failure', me.onFileFailure);
    },
    /**
     * @returns {null}
     *
     * Return current id
     */
    getId: function () {
        return this.config.id;
    },
    /**
     * @returns {Ext.ux.upload.Store}
     *
     * return store of files ready to upload
     */
    getFiles: function () {
        return this.files;
    },
    /**
     * @private
     * @param file
     * @returns {{name: *, size: *, type: *, status: number, progress: number, message: string, file: *}}
     *
     * Convert file object to store model
     */
    getFileModel: function (file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            status: 0,
            progress: 0,
            message: '',
            file: file
        }
    },
    /**
     *
     * @param fileType
     * @returns {*}
     */
    setAcceptedFileType: function (fileType) {
        this.config.acceptedTypes[fileType] = true;
        return this;
    },
    /**
     * @private
     * @param file
     * @returns {boolean}
     */
    isAccepted: function (file) {
        var ret = true;
        if(Ext.Object.getSize(this.config.acceptedTypes) > 0 && !this.config.acceptedTypes[file.type]){
            ret = false;
        }
        if(file.size > this.config.maxFileSize) {
            ret = false;
        }
        return ret;
    },
    /**
     * @private
     * @param files
     * @returns {*}
     *
     * Add new files to upload queue
     */
    addFiles: function (files) {
        for (var i = 0, len = files.length; i < len; i++) {
            if (this.isAccepted(files[i])) {
                this.files.add(this.getFileModel(files[i]));
            } else {
                this.fireEvent('notaccepted', files[i]);
            }
        }
        return this;
    },
    /**
     * Initialize params if send using direct
     * @returns {*}
     */
    initDirectParams: function () {
        var directMethod = this.config.directMethod,
            parts = directMethod.split("."),
        directParams = {
            extType: 'rpc',
            extUpload: true,
            extMethod: '',
            extAction: ''
        };
        directParams.extMethod = parts.pop();
        directParams.extAction = parts.join(".");
        return directParams;
    },
    onFileProgress: function (event, item) {
        if (event.lengthComputable) {
            var complete = (event.loaded / event.total * 100 | 0);
            item.set({
                progress : complete,
                status : Ext.ux.upload.transport.Abstract.STATUS["in progress"]
            });
        }
    },
    onFileSuccess: function (json, event, item) {
        item.set('status', Ext.ux.upload.transport.Abstract.STATUS["success"]);
    },
    onFileFailure: function (json, event, item) {
        if(event.target.status === 0){
            item.set('status', Ext.ux.upload.transport.Abstract.STATUS["abort"]);
        }else{
            item.set('status', Ext.ux.upload.transport.Abstract.STATUS["failure"]);
        }
    },
    /**
     * @abstract
     * @private
     * @returns {Ext.ux.data.Connection}
     *
     * Initialize connection
     */
    initConnection: function () {
    },
    /**
     * @abstract
     */
    upload: function () {
    },
    /**
     * @abstract
     * @param item Ext.data.model
     *
     * Upload single item
     */
    uploadItem: function (item) {
    },
    /**
     * @abstract
     * @protected
     *
     * Prepare request headers
     */
    initHeaders: function (item) {
    },
    /**
     * @abstract
     * @protected
     *
     * Abort xhr request
     */
    abortUpload: function () {
    }
});