sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function(Controller, JSONModel, MessageBox, Filter) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceManager", {
		oRouter: null,
		sTenantId: null,
		oDeviceModel: new JSONModel(),
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("DeviceManager").attachPatternMatched(this._onRouteMatched, this);
			this.getView().setModel(this.oDeviceModel, "devices");
		},

		navSettings: function() {
			this.oRouter.navTo("Settings");
		},
		navOnboard: function() {
			this.oRouter.navTo("DeviceOnboard", {
				tenantId: this.sTenantId
			});
		},
		navToDetails: function(oEvent) {
			var sDeviceId = oEvent.getSource().getTitle();
			var oJson = this.getView().getModel("devices").getData();
			var sGUID;
			for (var i = 0; i < oJson.length; i++) {
				if (oJson[i].deviceId === sDeviceId) {
					sGUID = oJson[i].deviceGuid;
				}
			}
			this.oRouter.navTo("DeviceDetails", {
				tenantId: this.sTenantId,
				deviceId: sGUID
			});
		},
		onLogout: function() {
			var that = this;
			MessageBox.confirm(
				"Do you want to change tenant?", {
					styleClass: "sapUiSizeCompact",
					onClose: function(oAction) {
						if (oAction === "OK") {
							jQuery.sap.require("jquery.sap.storage");
							var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
							oStorage.clear();
							that.oRouter.navTo("Home");
						}

					}
				}
			);
		},
		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this.getView().byId("devicePage").setTitle(this.sTenantId);
			this._getDeviceDetail(this.sTenantId);
		},
		_getDeviceDetail: function(sTenantId) {
			var sUrl = "/gatewaytest/tenants/" + sTenantId + "/devices";
			var oView = this.getView();
			var that = this;
			var oList=this.getView().byId("deviceList");
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				beforeSend:function(){
					oList.setBusy(true);
				},
				success: function(data) {
					oList.setBusy(false);
					that.oDeviceModel.setData(data);
					that.oDeviceModel.refresh();
					oView.rerender();
					// oView.setModel(new JSONModel(data), "devices");
				},
				error: function(e) {
					//error code
				}
			});
		},
		iconFormatter: function(deviceType) {
			var icon = "sap-icon://product";
			if (deviceType === "COOLER" || deviceType === "FRIDGE") {
				icon = "sap-icon://fridge";
			} else if (deviceType === "BARREL" || deviceType === "Dispenser") {
				icon = "sap-icon://lab";
			} else if (deviceType === "Container") {
				icon = "sap-icon://measuring-point";
			}
			return icon;

		},
		timeFormatter: function(timestamp) {
			var date = new Date(timestamp);
			return (date.toLocaleString());
		},
		onSearch: function(oEvt) {

			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("deviceId", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var list = this.getView().byId("deviceList");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		onBeforeRendering: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var sSettings = oStorage.get("storeDeviceProperties");
			if (!sSettings) {
				this.navSettings();
			}
		},
		refreshDevices:function(){
			this._getDeviceDetail(this.sTenantId);
			//sap.m.MessageToast.show("Device list refreshed");
		}
	});

});