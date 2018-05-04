sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceManager", {
		sTenantId:null,
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DeviceManager").attachPatternMatched(this._onRouteMatched, this);
		},
		
		navSettings:function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Settings");
		},
		navOnboard:function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DeviceOnboard",{tenantId:this.sTenantId});
		},
		navToDetails:function(oEvent){
			var sDeviceId=oEvent.getSource().getDescription();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DeviceDetails",
			{
				tenantId:this.sTenantId,
				deviceId:sDeviceId
			});
		},

		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this._getTenantDetail(this.sTenantId);
			this._getDeviceDetail(this.sTenantId);
		},
		_getTenantDetail:function(sTenantId){
			var sUrl = "/gatewaytest/tenants/" + sTenantId;
			var oView=this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain : true,
				success: function(data) {
					oView.setModel(new JSONModel(data),"tenant");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_getDeviceDetail:function(sTenantId){
			var sUrl = "/gatewaytest/tenants/" + sTenantId + "/devices";
			var oView=this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain : true,
				success: function(data) {
					oView.setModel(new JSONModel(data),"devices");
				},
				error: function(e) {
					//error code
				}
			});
		},
		iconFormatter: function(deviceType) {
			var icon = "sap-icon://product";
			if (deviceType === "cooler") {
				icon = "sap-icon://fridge";
			} else if (deviceType === "dispenser") {
				icon = "sap-icon://measuring-point";
			} else if (deviceType === "container") {
				icon = "sap-icon://lab";
			}
			return icon;

		}
	});

});