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
		oMessagePayloads:[],
		oRouter:null,
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("DeviceOnboard").attachPatternMatched(this._onRouteMatched, this);
			this.getView().setModel(this.oDeviceModel, "QRdata");
			this._getHardwareProperties();
		},
		onAfterRendering: function() {
			//console.log("hi")
		},
		navSettings: function(){
			this.oRouter.navTo("Settings");
		},
		mandatoryFormatter: function(mandatory) {
			if (mandatory === "true") {
				return true;
			} else {
				return false;
			}

		},
		jsonToArrayConverter:function(oMessageProps){
			var oMessageJson = [];
			for (var i = 0; i < Object.keys(oMessageProps).length; i++) {
				var sKey = Object.keys(oMessageProps)[i];
				var temp = {
					"propertyName": sKey,
					"propertyValue": oMessageProps[sKey]
				};
				oMessageJson.push(temp);
			}
			return oMessageJson;
		},
		_getDataFromStorage: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			if(oStorage.get("storeDeviceProperties")&&oStorage.get("storeMessageProperties"))
			{
			var sDeviceprops = JSON.parse(oStorage.get("storeDeviceProperties"));
			var oMessageProps = JSON.parse(oStorage.get("storeMessageProperties"));
			}
			sDeviceprops.messageProperties=JSON.stringify(oMessageProps);
			var oMessageJson=this.jsonToArrayConverter(oMessageProps);
			var oModel = new JSONModel();
			oModel.setData(oMessageJson);
			this.getView().setModel(oModel, "messageProperties");
			
			if (sDeviceprops) {
				this.oDeviceModel.setData(sDeviceprops);
			}
			var props = this.oDeviceModel.getData().data;
			var data = {};
			for (var i in props) {
				data[props[i].propertyName] = "";
			}
		
			this.oDeviceModel.getData().data = data;
			this.addprops(this);
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
		onBoardDevice: function() {
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
				success: function() {
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
				this.oRouter.navTo("overview", {}, true);
			}
		},
		onScan: function() {
			var that = this;
			sap.ndc.BarcodeScanner.scan(
				function(mResult) {
					that.oDeviceModel.setJSON(mResult.text);
					that.addprops(that);
					that._checkDeviceMapping(that);
				},
				function(Error) {
					MessageToast.show("Scanning failed: " + Error);
				}
			);
		},
		onMessageSelect: function(oEvent){
				var sMessageType = oEvent.getSource().getSelectedKey();
				var oModel=new JSONModel(this.oMessagePayloads[sMessageType]);
				this.getView().setModel(oModel, "messagePropertiesQr");
		},
		_jsonMessagePayload:function(oMessageItems){
			var oMessagePayload={};
			for(var i=0;i<oMessageItems.length;i++){
				var sKey=oMessageItems[i].getItems()[0].getText();
				var sValue=oMessageItems[i].getItems()[1].getValue();
				oMessagePayload[sKey]=sValue;
			}
			return oMessagePayload;
		},
		savePayload: function() {
			var oMessageItems=sap.ui.getCore().byId("messagePayloadQr").getItems();
			var jsonPayload=this._jsonMessagePayload(oMessageItems);
			var messsageProps=this.jsonToArrayConverter(jsonPayload);
			var oModel = new JSONModel();
			oModel.setData(messsageProps);
			this.getView().setModel(oModel, "messageProperties");
			var sDeviceMessageType=sap.ui.getCore().byId("selectMessageQr").getValue();
			this.oDeviceModel.getData().deviceMessageType=sDeviceMessageType;
			this.oDeviceModel.getData().messageProperties=JSON.stringify(jsonPayload);
			this.getView().getModel("messagePropertiesQr").setData(null);
			this.getView().getModel("messageTypes").setData(null);
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
			var that =this;
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					var keys=Object.keys(data);
					var MessageTypes=[];
					that.oMessagePayloads=data;
					for(var i in keys){
					MessageTypes.push({"value":keys[i] });
					}
					var oModel= new JSONModel();
					oModel.setData({"MessageTypes":MessageTypes});
					oView.setModel(oModel, "messageTypes");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_checkDeviceMapping: function(that) {
			var qrData = that.oDeviceModel.getData();
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var localData = JSON.parse(oStorage.get("storeDeviceProperties"));
			if (localData.deviceType !== qrData.deviceType) {
				that._getMessageProperties(qrData.deviceTypeGuid);
				that._openPayloadFragment();
			}
			else
			{
				qrData.messageProperties=oStorage.get("storeMessageProperties");
				qrData.deviceMessageType=localData.deviceMessageType;
			}
		}
	});

});