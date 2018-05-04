sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.Home", {
		onGoDevice:function(){
			var sTenantId=this.getView().byId("inputTenant").getValue();
			
			//local storage
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			oStorage.put("storeTenantId", sTenantId);
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DeviceManager",{tenantId:sTenantId});
		},
		onCheck:function(){
			// jQuery.sap.require("jquery.sap.storage");
			// var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			// alert(oStorage.get("myLocalData"));
		},
		onBeforeRendering:function(){
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var sTenantId=oStorage.get("storeTenantId");
			if(sTenantId){
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("DeviceManager",{tenantId:sTenantId});
			}
		}
	});
});