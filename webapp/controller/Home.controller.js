sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.Home", {
		onGoDevice: function() {
			var sTenantId = this.getView().byId("inputTenant").getValue();
			this._getTenantDetail(sTenantId);
		},
		_getTenantDetail: function(sTenantId) {
			var sUrl = "/gatewaytest/tenants/" + sTenantId;
			var that=this;
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					//local storage
					jQuery.sap.require("jquery.sap.storage");
					var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
					oStorage.put("storeTenantId", sTenantId);

					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("DeviceManager", {
						tenantId: sTenantId
					});

				},
				error: function(e) {
					var error = JSON.parse(e.responseText);
					MessageToast.show(error.message);
				}
			});
		},
		onBeforeRendering: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var sTenantId = oStorage.get("storeTenantId");
			if (sTenantId) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("DeviceManager", {
					tenantId: sTenantId
				});
			}
		}
	});
});