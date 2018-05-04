sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function(Controller, JSONModel,History) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceOnboard", {
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
					//console.log(data);//Message Pops up for scanned Value
					var oJsonModel=new JSONModel();
					oJsonModel.setJSON(data);
					this.getView().setModel(oJsonModel,"QRdata");
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
							//video.stop();
							video.autoplay = false;
							//console.log(this.codeScanned);
							//delete video;
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