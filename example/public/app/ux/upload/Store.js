Ext.define('Ext.ux.upload.Store', {
    extend : 'Ext.data.Store',
    fields : [
        {
            name : 'name',
            type : 'string'
        }, {
            name : 'size',
            type : 'integer'
        }, {
            name : 'type',
            type : 'string'
        }, {
            name : 'status',
            type : 'integer'
        },{
            name : 'progress',
            type : 'integer'
        }, {
            name : 'message',
            type : 'string'
        },
        {
            name : 'file'
        }
    ],
    proxy : {
        type : 'memory',
        reader : {
            type : 'array',
            idProperty : 'filename'
        }
    }
});