sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function(Controller, JSONModel, History, MessageBox) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceDetails", {
		sTenantId: null,
		sDeviceId: null,
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
			this.getView().byId("devProps").removeAllContent();
		},
		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this.sDeviceId = oEvent.getParameter("arguments").deviceId;
			this._getDeviceDetail();
			//this.getView().byId("detailsPage").setTitle(sDeviceId);
		},
		addprops: function(that) {
			var props = that.getView().getModel("deviceDetails").getData().data;
			props = JSON.parse(props);
			var form = that.getView().byId("devProps");
			form.removeAllContent();
			for (var i in props) {
				if (props.hasOwnProperty(i)) {
					var Label = new sap.m.Label().bindProperty("value", props[i]);
					var Input = new sap.m.Input().bindProperty("value", props[i]);
					Input.setEditable(false);
					form.addContent(Label);
					form.addContent(Input);
				}
			}
		},
		offBoard: function() {
			var that = this;
			MessageBox.confirm(
				"Do you want to OffBoard the Device?", {
					styleClass: "sapUiSizeCompact",
					onClose: function(oAction) {
						if (oAction === "OK") {
							var sUrl = "/gatewaytest/tenants/" + that.sTenantId + "/devices/" + that.sDeviceId;
							$.ajax({
								url: sUrl,
								method: 'DELETE',
								crossDomain: true,
								success: function(data) {
									
								},
								error: function(e) {
									//error code
								}
							});
						that.navBack();
						}
						
					}
				}
			);

		},

		_getDeviceDetail: function() {
			var that = this;
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/devices/" + this.sDeviceId;
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					oView.setModel(new JSONModel(data), "deviceDetails");
					that.addprops(that);
				},
				error: function(e) {
					//error code
				}
			});
		}
	});

});