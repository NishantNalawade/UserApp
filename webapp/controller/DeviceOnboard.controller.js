sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function(Controller, JSONModel,History) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceOnboard", {
		oDeviceModel:new JSONModel(),
		sTenantId:null,
		sDeviceId:null,
		onInit:function(){
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    oRouter.getRoute("DeviceOnboard").attachPatternMatched(this._onRouteMatched, this);
			    this.getDataFromStorage();
			    this.getView().setModel(this.oDeviceModel,"QRdata");
		},
		onAfterRendering:function(){
			console.log("hi")
		},
		getDataFromStorage:function(){
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var sDeviceprops=oStorage.get("storeDeviceProperties");
			var props=this.oDeviceModel.getData().oProperties;
			if(sDeviceprops){
				this.oDeviceModel.setJSON(sDeviceprops);
			}
			var data={};
			for(var i in props){
				data[props[i].propertyName]="";
			}
		    this.oDeviceModel.getData().data=data;
			this.addprops(this);
		},
		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this.sDeviceId = oEvent.getParameter("arguments").deviceId;
			 this.getDataFromStorage();
			//this.getView().setModel(this.oDeviceModel,"QRdata");
		},
		_getProperties:function(){
			var aPropertiesList=this.getView().byId("propertiesList").getContent();
			var sJson="{";
			var prop, val;
			for(var i=0;i<aPropertiesList.length;i+=2){
					prop=aPropertiesList[i].getText();
					val=aPropertiesList[i+1].getValue();
					sJson+="\""+prop+"\": \""+val+"\",";
			}
			sJson=sJson.substring(0, sJson.length-1);
			sJson=sJson+"}";
			this.oDeviceModel.getData().data=sJson;
			
		},
		onBoardDevice:function(oEvent){
			this._getProperties();
		     var that=this;     
		    	var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/devices";
			var oData=that.oDeviceModel.getData();
			delete oData.oProperties;
			$.ajax({
				url: sUrl,
				headers:{
				"content-type": "application/json"
				},
				method: 'POST',
				crossDomain: true,
				data:JSON.stringify(oData),
				success: function(data) {
					alert("success");
				},
				error: function(e) {
					alert(e);
					//error code
				}
			});
			
			
		},
		addprops:function(that){
			var props=that.oDeviceModel.getData().data;
		    	var form=that.getView().byId("propertiesList");
		    	form.removeAllContent();
			for(var i in props)
			{
				
				if(props.hasOwnProperty(i)){
				var Label=new sap.m.Label({"text":i});
				var Input=new sap.m.Input({"value":props[i]});
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
				width:"100%",
				type:"Reject",
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