sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, JSONModel, History, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.DeviceDetails", {
		sTenantId: null,
		sDeviceId: null,
		save:false,
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DeviceDetails").attachPatternMatched(this._onRouteMatched, this);
		},

		navBack: function() {
			if(this.save){
				MessageToast.show("Save Settings before Navigating back");
			}else
			{
				var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}
			this.getView().byId("devProps").removeAllContent();
			}
			//this.getView().byId("devicePayload").removeAllContent();
		},
		_onRouteMatched: function(oEvent) {
			this.sTenantId = oEvent.getParameter("arguments").tenantId;
			this.sDeviceId = oEvent.getParameter("arguments").deviceId;
			this._getDeviceDetail();
			// var oModel = new JSONModel();
			// oModel.loadData("model/mockPayload.json");
			// this.getView().setModel(oModel, "payload");
			//this.getView().byId("detailsPage").setTitle(sDeviceId);
		},
		editDevice:function(oEvent){
			var uid=this.getView().byId("uidText");
			var elements=this.getView().byId("payload")._aElements;
			var i;
			if(oEvent.getSource().getProperty("src")==="sap-icon://save")
			{
				this.updateDevice();
				uid.setEditable(false);
			for(i in elements)
			{
				if(elements[i] instanceof sap.m.Input)
				{
					elements[i] .setEditable(false);
				}
			}
			oEvent.getSource().setProperty("src","sap-icon://edit");
			this.save=false;
			this.navBack();
			MessageToast.show("Device Updated Successfully!");
			}
			else{
			oEvent.getSource().setProperty("src","sap-icon://save");
			this.save=true;
			uid.setEditable(true);
			for(i in elements)
			{
				if(elements[i] instanceof sap.m.Input)
				{
					elements[i] .setEditable(true);
				}
			}
			}
		},
		updateDevice:function(){
			var uid=this.getView().byId("uidText");
			var elements=this.getView().byId("payload")._aElements;
			var key,value,messageprops={};
			for(var i in elements)
			{
				if(elements[i] instanceof sap.m.Input)
				{
					value=elements[i].getValue();
					messageprops[key]=value;
				}
				else if(elements[i] instanceof sap.m.Label)
				{
					key=elements[i].getText();
				}
			}
			var deviceDetails=this.getView().getModel("deviceDetails").getData();
			deviceDetails.messageProperties=JSON.stringify(messageprops);
			deviceDetails.uid=uid.getValue();
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/devices/" + this.sDeviceId;
			$.ajax({
				url: sUrl,
				method: 'PUT',
				headers: {
					"content-type": "application/json"
				},
				crossDomain: true,
				data:JSON.stringify(deviceDetails),
				success: function(data) {
				},
				error: function(e) {
					
				}
			});
		},
		addprops: function(that,props,formId) {
			props = JSON.parse(props);
			var form = that.getView().byId(formId);
			form.removeAllContent();
			for (var i in props) {
				if (props.hasOwnProperty(i)) {
					var Label = new sap.m.Label({
						"text": i
					});
					var Input = new sap.m.Input({
						"value": props[i]
					});
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
									MessageToast.show("Device Offboarded");
									that.navBack();
								},
								error: function(e) {
									MessageToast.show(e.responseJSON.message);
								}
							});

						}

					}
				});

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
					var messageProps=data.messageProperties;
					var props = data.data;
					that.addprops(that,props,"devProps");
					that.addprops(that,messageProps,"payload");
				},
				error: function(e) {
					
				}
			});
		}
	});

});