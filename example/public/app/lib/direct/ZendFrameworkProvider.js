/**
 * @class Ext.directZendFrameworkProvider
 */
Ext.define('MyApp.lib.direct.ZendFrameworkProvider', {
    requires: [
        'Ext.direct.RemotingProvider'
    ],
    extend: 'Ext.direct.RemotingProvider',
    id: 'zfprovider',
    alias: 'direct.zfprovider',
    sessionExpired: false,
    method: {

    },
    // private
    initAPI: function () {
        var tmpActions = this.actions,
            actions = {},
            namespace = this.namespace,
            parts,
            action,
            modules,
            cls,
            methods,
            i,
            len,
            method;
        for (action in tmpActions) {
            parts = action.split('.');
            if (actions[parts[0]] == undefined)
                actions[parts[0]] = [];
            if (actions[parts[0]][parts[1]] == undefined)
                actions[parts[0]][parts[1]] = [];
            actions[parts[0]][parts[1]].push({
                name: parts[2],
                formHandler: tmpActions[action].formHandler,
                len: tmpActions[action].parameters.length
            });
        }

        for (modules in actions) {
            cls = namespace[modules];
            if (!cls) {
                cls = namespace[modules] = {};
            }
            for (action in actions[modules]) {
                if (cls[action] == undefined)
                    cls[action] = {};
                methods = actions[modules][action];
                for (i = 0, len = methods.length; i < len; ++i) {
                    if (!Ext.isFunction(methods[i])) {
                        method = Ext.create('Ext.direct.RemotingMethod', methods[i]);
                        cls[action][method.name] = this.createHandler(modules + '.' + action, method);
                    }
                }
            }
            this.method[modules] = cls;
        }
    },
    getCallData: function (transaction) {
        var array = transaction.data ? transaction.data : [];
        return {
            id: transaction.id,
            jsonrpc: '2.0',
            method: transaction.action + '.' + transaction.method,
            params: array
        };
    },
    onData: function (options, success, xhr) {
        try {
            var rpcresponse = Ext.decode(xhr.responseText),
                tmpResponse,
                tmpText = [];
            for (tmpResponse in rpcresponse) {
                if (!isNaN(parseFloat(tmpResponse)) && isFinite(tmpResponse)) {
                    tmpText.push({
                        type: rpcresponse[tmpResponse].result ? 'rpc' : 'exception',
                        result: rpcresponse[tmpResponse].result ? rpcresponse[tmpResponse].result : rpcresponse[tmpResponse].error,
                        tid: rpcresponse[tmpResponse].id
                    });
                }
            }
            if (tmpText.length) {
                xhr.responseText = Ext.encode(tmpText);
            } else if (typeof rpcresponse != 'undefined')
                xhr.responseText = {
                    type: rpcresponse.result ? 'rpc' : 'exception',
                    result: rpcresponse.result ? rpcresponse.result : rpcresponse.error,
                    tid: rpcresponse.id
                };
        } catch (e) {
            xhr.responseText = {
                type: 'exception',
                result: [],
                tid: null
            };
        }
        this.callParent([options, success, xhr]);
    },
    listeners: {
        exception: function (proxy, request, operation) {

        },
        call: function (proxy, request, operation) {
        },
        beforecall: function (provider, transaction) {

        },
        data: function (provider, e) {

        }
    }
});