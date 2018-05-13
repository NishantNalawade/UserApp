sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.Settings", {
		sTenantId: null,
		oCategories: null,
		oDeviceTypes: null,
		oProperties: null,
		mandatoryFormatter: function(mandatory) {
			if(mandatory==="true"){
				return true;
			}
			else{
				return false;
			}

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
		onCategorySelect: function(oEvent) {
			var sCategoryId = oEvent.getSource().getSelectedKey();
			this._getDeviceTypes(sCategoryId);
			if (this.getView().getModel("deviceProperties") != null) {
				this.getView().getModel("deviceProperties").setData(null);
			}

		},
		onTypeSelect: function(oEvent) {
			var sTypeGUID = oEvent.getSource().getSelectedKey();
			//var sType = oEvent.getSource().getSelectedItem().getText();
			this._getDeviceProperties(sTypeGUID);
			this._getMessageProperties(sTypeGUID);
			this._getHardwareProperties();
			this.getView().byId("saveButton").setEnabled(true);
		},
		onInit: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.sTenantId = oStorage.get("storeTenantId");

			this._getCategories();
		},
		_getCategories: function() {
			var that = this;
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/categories";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {

					that.oCategories = new JSONModel();

					that.oCategories.setData(data);
					oView.setModel(that.oCategories, "categories");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_getDeviceTypes: function(sCategoryId) {
			var that = this;
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/" + sCategoryId + "/deviceTypes";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {

					that.oDeviceTypes = new JSONModel();
					that.oDeviceTypes.setData(data);
					oView.setModel(that.oDeviceTypes, "deviceTypes");
				},
				error: function(e) {

				}
			});
		},
		_getDeviceProperties: function(sTypeGUID) {
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/" + sTypeGUID + "/deviceProperties";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {

					var oModel = new JSONModel();

					oModel.setData(data);
					oView.setModel(oModel, "deviceProperties");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_getMessageProperties: function(sTypeGUID) {
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/" + sTypeGUID + "/messageProperties";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {

					var oModel = new JSONModel();
					var sKey=Object.keys(data)[0];
					oModel.setData(data[sKey]);
					oView.setModel(oModel, "messageProperties");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_getHardwareProperties: function() {
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/hardwareProperties";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				success: function(data) {

					var oModel = new JSONModel();

					oModel.setJSON(data);
					oView.setModel(oModel, "hardwareProperties");
				},
				error: function(e) {
					//error code
				}
			});
		},

		onSave: function() {
			var sCategory = this.getView().byId("selectCategory").getSelectedItem().getText();
			var oType = this.getView().byId("selectDeviceType").getSelectedItem();
			var sType = oType.getText();
			var sTypeGUID = oType.getKey();
			var oData = this.getView().getModel("deviceProperties").getData();
			var oTempJson = {
				"deviceId": "",
				"uid": "",
				"category": sCategory,
				"deviceType": sType,
				"deviceTypeGuid": sTypeGUID,
				"oProperties": oData
			};

			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			oStorage.put("storeDeviceProperties", JSON.stringify(oTempJson));
			MessageToast.show("Settings Saved");

			this.navBack();
		}
	});

});