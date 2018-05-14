sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/ndc/BarcodeScanner",
	"sap/m/Dialog"
], function(Controller, JSONModel, History, MessageToast, Dialog) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceOnboard", {
		oDeviceModel: new JSONModel(),
		sTenantId: null,
		sDeviceId: null,
		oPayloadDialog: null,
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DeviceOnboard").attachPatternMatched(this._onRouteMatched, this);
			//this._getDataFromStorage();
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
			var sDeviceprops = JSON.parse(oStorage.get("storeDeviceProperties"));
			var oMessageProps = JSON.parse(oStorage.get("storeMessageProperties"));
			sDeviceprops.messageProperties=JSON.stringify(oMessageProps);
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
				this.oDeviceModel.setData(sDeviceprops);
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
					//Input.bindProperty("type", "");
					//this is to bind the data type of the input box, but right now dataType is not coming in QR or localStorage
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
					that._checkDeviceMapping(that);
					//dialog.close();
				},
				function(Error) {
					MessageToast.show("Scanning failed: " + Error);
				}
			);
		},
		savePayload: function(oEvent) {
			var oItems = oEvent.getSource().getParent().getContent()[0].getItems();
			var oProps = this.getView().getModel("messageProperties").getData();
			for (var i = 0; i < oItems.length; i++) {
				var sVal = oItems[i].getItems()[1].getSelectedKey();
				oProps[i].propertyValue = sVal;
			}
			var oModel = new JSONModel();
			oModel.setData(oProps);
			this.getView().setModel(oModel, "messageProperties");
			this.closeDialog();
		},
		closeDialog: function() {
			this.oPayloadDialog.close();
			//this.oPayloadDialog.getAggregation("buttons")[0].setText("Save");
		},
		_openPayloadFragment: function() {
			if (!this.oPayloadDialog) {
				this.oPayloadDialog = sap.ui.xmlfragment("userapp.UserApp.fragment.MessagePayload", this);
				this.getView().addDependent(this.oPayloadDialog);
			}
			this.oPayloadDialog.open();
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
					var sKey = Object.keys(data)[0];
					oModel.setData(data[sKey]);
					oView.setModel(oModel, "messageProperties");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_checkDeviceMapping: function(that) {
			var qrData = that.oDeviceModel.getData();
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var loacalData = JSON.parse(oStorage.get("storeDeviceProperties"));
			if (loacalData.deviceType !== qrData.deviceType) {
				that._getMessageProperties(qrData.deviceTypeGuid);
				that._openPayloadFragment();
			}
		}
	});

});