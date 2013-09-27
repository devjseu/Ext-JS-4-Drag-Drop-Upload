
Ext.define('Ext.app.JSONRPC_API',
{
"transport":"POST",
"envelope":"JSON-RPC-2.0",
"contentType":"application\/json",
"SMDVersion":"2.0",
"target":"\/api\/json\/1.0\/jsonrpc.php",
"services":{
"MyApp.File.upload":{
"envelope":"JSON-RPC-2.0",
"transport":"POST",
"parameters":[

],
"returns":"array",
"formHandler":true
}
},
"singleton":true
} );
