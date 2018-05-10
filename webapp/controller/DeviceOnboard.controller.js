sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function(Controller, JSONModel, History, MessageToast) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceOnboard", {
		oDeviceModel: new JSONModel(),
		sTenantId: null,
		sDeviceId: null,
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DeviceOnboard").attachPatternMatched(this._onRouteMatched, this);
			this.getDataFromStorage();
			this.getView().setModel(this.oDeviceModel, "QRdata");
		},
		onAfterRendering: function() {
			//console.log("hi")
		},
		getDataFromStorage: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var sDeviceprops = oStorage.get("storeDeviceProperties");
			if (sDeviceprops) {
				this.oDeviceModel.setJSON(sDeviceprops);
				// var tempJSON=JSON.parse(sDeviceprops);
			}
			var props = this.oDeviceModel.getData().oProperties;
			var data = {};
			for (var i in props) {
				data[props[i].propertyName] = "";
			}
			delete this.oDeviceModel.getData().oPoperties;
			this.oDeviceModel.getData().data = data;
			this.addprops(this);
		},
		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this.sDeviceId = oEvent.getParameter("arguments").deviceId;
			this.getDataFromStorage();
			//this.getView().setModel(this.oDeviceModel,"QRdata");
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
			this.codeScanned = false;
			var container = new sap.m.VBox({
				"width": "400px",
				"height": "400px"
			});
			var button = new sap.m.Button({
				text: "Cancel",
				width: "100%",
				type: "Reject",
				press: function() {
					dialog.close();
				}
			});
			var dialog = new sap.m.Dialog({
				title: "QR Scanner",
				content: [
					container,
					button
				]
			});
			dialog.open();
			var video = document.createElement("video");
			video.autoplay = true;
			var that = this;
			qrcode.callback = function(data) {
				if (data !== "error decoding QR Code") {
					this.codeScanned = true;
					that._oScannedInspLot = data;

					that.oDeviceModel.setJSON(data);
					//	this.getView().setModel(that.oDeviceModel,"QRdata");
					that.addprops(that);
					dialog.close();
				}
			}.bind(this);

			var canvas = document.createElement("canvas");
			canvas.width = 400;
			canvas.height = 400;
			navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						facingMode: "environment",
						width: {
							ideal: 400
						},
						height: {
							ideal: 400
						}
					}
				})
				.then(function(stream) {
					video.srcObject = stream;
					var ctx = canvas.getContext('2d');
					var loop = (function() {
						if (this.codeScanned) {
							video.stop();
							video.autoplay = false;
							//console.log(this.codeScanned);
							video.srcObject = null;
							return;
						} else {
							ctx.drawImage(video, 0, 0);
							setTimeout(loop, 1000 / 60); // drawing at 30fps
							qrcode.decode(canvas.toDataURL());
						}
					}.bind(this));
					loop();
				}.bind(this))
				.catch(function(error) {
					sap.m.MessageBox.error("Unable to get Video Stream");
				});

			container.getDomRef().appendChild(canvas);
		}
	});

});