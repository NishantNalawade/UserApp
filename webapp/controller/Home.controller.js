sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.Home", {
		onGoDevice:function(){
			var sTenantId=this.getView().byId("inputTenant").getValue();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DeviceManager",{tenantId:sTenantId});
			// var text=this.getView().byId("input").getValue();
			// jQuery.sap.require("jquery.sap.storage");
			// var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			// oStorage.put("myLocalData", text);
			
		},
		onCheck:function(){
			// jQuery.sap.require("jquery.sap.storage");
			// var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			// alert(oStorage.get("myLocalData"));
		}
	});
});