sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function(Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("userapp.UserApp.controller.Settings", {
		sTenantId:null,
		oCategories:null,
		oDeviceTypes:null,
		oProperties:null,
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
		onCategorySelect:function(oEvent){
			var sCategoryId=oEvent.getSource().getSelectedKey();
			this._getDeviceTypes(sCategoryId);
		},
		onTypeSelect:function(oEvent){
			var sTypeGUID=oEvent.getSource().getSelectedKey();
			this._getDeviceProperties(sTypeGUID);
		},
		onInit: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.sTenantId = oStorage.get("storeTenantId");
			
			this._getCategories();
		},
		_getCategories: function() {
			var that=this;
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/categories";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					that.oCategories=new JSONModel();
					that.oCategories.setJSON(data);
					oView.setModel(that.oCategories, "categories");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_getDeviceTypes:function(sCategoryId){
			var that=this;
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/"+sCategoryId+"/deviceTypes";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					that.oDeviceTypes=new JSONModel();
					that.oDeviceTypes.setJSON(data);
					oView.setModel(that.oDeviceTypes, "deviceTypes");
				},
				error: function(e) {
					//error code
				}
			});
		},
		_getDeviceProperties:function(sTypeGUID){
			var that= this;
			var sUrl = "/gatewaytest/tenants/" + this.sTenantId + "/"+sTypeGUID+"/deviceProperties";
			var oView = this.getView();
			$.ajax({
				url: sUrl,
				method: 'GET',
				crossDomain: true,
				success: function(data) {
					that.oProperties=new JSONModel();
					that.oProperties.setJSON(data);
					oView.setModel(that.oProperties, "properties");
				},
				error: function(e) {
					//error code
				}
			});
		}
	});

});