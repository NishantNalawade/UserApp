sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function(Controller, JSONModel, History) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceDetails", {

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DeviceDetails").attachPatternMatched(this._onRouteMatched, this);
		},
		navBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}
		},
		_onRouteMatched: function(oEvent) {
			var sTenantId = oEvent.getParameter("arguments").tenantId;
			var sDeviceId = oEvent.getParameter("arguments").deviceId;
			this._getDeviceDetail(sTenantId, sDeviceId);
			//this.getView().byId("detailsPage").setTitle(sDeviceId);
		},
		_getDeviceDetail: function(sTenantId, sDeviceId) {
			var sUrl = "/gatewaytest/tenants/" + sTenantId + "/devices/" + sDeviceId;
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					oView.setModel(new JSONModel(data), "deviceDetails");
				},
				error: function(e) {
					//error code
				}
			});
		}
	});

});