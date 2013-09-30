/**
 * @class Ext.ux.upload.transport.ExtJS
 * @extends Ext.ux.upload.Basic
 *
 * @author Sebastian Widelak (c) 2013
 */
Ext.define('Ext.ux.upload.transport.ExtJS', {
    requires: ['Ext.ux.upload.transport.Abstract'],
    extend: 'Ext.ux.upload.transport.Abstract',
    config : {
        /**
         * @cfg {String} [method='POST']
         *
         * The HTTP method to be used.
         */
        method: 'POST',

        /**
         * @cfg {Ext.data.Connection}
         *
         * If set, this connection object will be used when uploading files.
         */
        connection : null
    },
    initConnection: function () {
        var conn,
            url = this.config.url;
        if (this.conn instanceof Ext.data.Connection) {
            conn = this.conn;
        } else {
            if (this.config.params) {
                url = Ext.urlAppend(url, Ext.urlEncode(this.config.params));
            }
            conn = Ext.create('Ext.ux.data.Connection', {
                disableCaching: true,
                method: this.config.method,
                url: url,
                timeout: this.config.timeout,
                defaultHeaders: {
                    'Content-Type': this.config.contentType,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }
        return conn;
    },
    uploadItem: function (item) {
        var me = this;
        me.conn = me.initConnection();
        me.conn.request({
            scope: this,
            headers: this.initHeaders(item),
            rawData: item.file,
            success: function (response, options, item) {
                console.log(arguments);
                me.fireEvent('success');
            },
            failure: function (response, options, item) {
                console.log(arguments);
                me.fireEvent('failure');
            },
            progress: function (response, options, item) {
                console.log(arguments);
                me.fireEvent('progresschange');
            }
        });
    },
    /**
     * @protected
     */
    initHeaders: function (item) {
        var headers = this.extraHeaders || {};
        headers[this.config.filenameHeader] = item.get('name');
        headers[this.config.sizeHeader] = item.get('size');
        headers[this.config.typeHeader] = item.get('type');
        headers['Content-Type'] = item.get('type');
        console.log('headers', headers);
        return headers;
    },
    abortUpload: function () {
        if (this.conn) {
            this.suspendEvents();
            this.conn.abort();
            this.resumeEvents();
        }
    }
});