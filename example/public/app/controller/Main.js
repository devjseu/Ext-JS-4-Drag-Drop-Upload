Ext.define('MyApp.controller.Main', {
    requires : [
    ],
    extend: 'Ext.app.Controller',
    stores : [
    ],
    init : function () {
        var me = this;
        me.control({
            'layout panel > grid' : {
                'itemclick' : function (grid, record, el, index){
                }
            }
        });
    }
});
