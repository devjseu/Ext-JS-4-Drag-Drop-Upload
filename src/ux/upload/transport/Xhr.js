/**
 * @class Ext.ux.upload.DD
 * @extends Ext.ux.upload.Basic
 *
 * @author Sebastian Widelak (c) 2013
 */
Ext.define('Ext.ux.upload.transport.Xhr', {
    requires: ['Ext.ux.upload.transport.Abstract'],
    extend: 'Ext.ux.upload.transport.Abstract',
    initConnection: function () {
        var xhr = new XMLHttpRequest(),
            method = this.method,
            url = this.url;

        xhr.open(method, url, true);

        this.abortXhr = function () {
            xhr && xhr.abort();
        };
        this.clearXhr = function () {
            xhr = null;
        }

        return xhr;
    },
    /**
     *
     * @param item
     */
    uploadItem: function (item) {
        var me = this,
            file = item.get('file'),
            formData = new FormData(),
            xhr = this.initConnection(),
            json;

        Ext.Object.each(this.getParams(), function (key, value) {
            console.log(arguments);
            formData.append(key, value);
        });
        Ext.Object.each(this.directParams, function (key, value) {
            formData.append(key, value);
        });
        formData.append(file.name, file);
        xhr.setRequestHeader(this.config.filenameHeader, file.name);
        xhr.setRequestHeader(this.config.sizeHeader, file.size);
        xhr.setRequestHeader(this.config.typeHeader, file.type);
        xhr.addEventListener('loadend', function (event) {
            var response = event.target;
            if (response.status != 200) {
                me.fireEvent('failure', {}, event, item);
            } else {
                try {
                    json = Ext.JSON.decode(response.responseText);
                } catch (e) {
                    json = {};
                }
                if (json.success) {
                    me.fireEvent('success', json, event, item);
                } else {
                    me.fireEvent('failure', json, event, item);
                }
            }
            me.clearXhr();
            return me.fireEvent('afterupload', response.status, event, item);
        }, true);
        xhr.upload.addEventListener("progress", function (event) {
            return me.fireEvent('progresschange', event, item);
        }, true);
        xhr.timeout = me.getTimeout();
        xhr.addEventListener('timeout', function (event) {
            me.fireEvent('timeout', event, item);
        });
        me.fireEvent('beforeupload', formData, item);
        xhr.send(formData);
    },
    /**
     *
     */
    upload: function () {
        var me = this,
            idx =
                me.getFiles().findBy(function (r) {
                    if (r.get('status') === Ext.ux.upload.transport.Abstract.STATUS["pending"]) {
                        return true;
                    }
                });
        if (idx > -1) {
            me.uploadItem(me.getFiles().getAt(idx));
            me.on('afterupload', function (status){
                if(status === 0){
                    return;
                }
                setTimeout(function () {
                    me.upload();
                }, 150);
            }, me, {single: true});
        }
    },

    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#abortUpload}
     */
    abortUpload: function () {
        this.abortXhr();
    },

    /**
     * @protected
     *
     * A placeholder for the abort procedure.
     */
    abortXhr: function () {
    },

    /**
     * @protected
     *
     * A placeholder for the remove procedure.
     */
    clearXhr: function () {
    }

});
