sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/ndc/BarcodeScanner"
], function(Controller, JSONModel, History, MessageToast) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceOnboard", {
		oDeviceModel: new JSONModel(),
		sTenantId: null,
		sDeviceId: null,
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DeviceOnboard").attachPatternMatched(this._onRouteMatched, this);
			this._getDataFromStorage();
			this.getView().setModel(this.oDeviceModel, "QRdata");
			this._getHardwareProperties();
		},
		onAfterRendering: function() {
			//console.log("hi")
		},
		mandatoryFormatter: function(mandatory) {
			if (mandatory === "true") {
				return true;
			} else {
				return false;
			}

		},
		_getDataFromStorage: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var sDeviceprops = oStorage.get("storeDeviceProperties");
			var oMessageProps = JSON.parse(oStorage.get("storeMessageProperties"));

			var oMessageJson = [];
			for (var i = 0; i < Object.keys(oMessageProps).length; i++) {
				var sKey = Object.keys(oMessageProps)[i];
				var temp = {
					"propertyName": sKey,
					"propertyValue": oMessageProps[sKey]
				};
				oMessageJson.push(temp);
			}

			var oModel = new JSONModel();
			oModel.setData(oMessageJson);

			this.getView().setModel(oModel, "messageProperties");

			if (sDeviceprops) {
				this.oDeviceModel.setJSON(sDeviceprops);
			}
			var props = this.oDeviceModel.getData().oProperties;
			var data = {};
			for (var i in props) {
				data[props[i].propertyName] = "";
			}
			delete this.oDeviceModel.getData().oPoperties;
			this.oDeviceModel.getData().data = data;
			this.addprops(this);
			//this.addMessage();
		},
		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this.sDeviceId = oEvent.getParameter("arguments").deviceId;
			this._getDataFromStorage();
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
		onBoardDevice: function(oEvent) {
			var that = this;
			var oModel = new JSONModel();
			oModel.setData(JSON.parse(JSON.stringify(that.oDeviceModel.getData()))); //to make a copy of device model
			var props = oModel.getData();
			props.data = JSON.stringify(oModel.getData().data);
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/devices";
			$.ajax({
				url: sUrl,
				headers: {
					"content-type": "application/json"
				},
				method: 'POST',
				crossDomain: true,
				data: JSON.stringify(props),
				success: function(data) {
					MessageToast.show("Device Onboarded Succesfully");
					that.navBack();
				},
				error: function(e) {
					MessageToast.show(e.responseJSON.message);
					//error code
				}
			});

		},
		addprops: function(that) {
			var props = that.oDeviceModel.getData().data;
			var form = that.getView().byId("propertiesList");
			form.removeAllContent();

			for (var i in props) {

				if (props.hasOwnProperty(i)) {
					var Label = new sap.m.Label({
						"text": i
					});
					var Input = new sap.m.Input().bindProperty("value", "QRdata>/data/" + String(i));
					form.addContent(Label);
					form.addContent(Input);
				}
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
		onScan: function() {
			var that = this;
			sap.ndc.BarcodeScanner.scan(
				function(mResult) {
					that.oDeviceModel.setJSON(mResult.text);
					that.addprops(that);
					//dialog.close();
				},
				function(Error) {
					MessageToast.show("Scanning failed: " + Error);

				}
			);
		}
	});

});