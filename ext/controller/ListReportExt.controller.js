sap.ui.define([
    "sap/ui/model/Filter", 
    "sap/ui/comp/smartfilterbar/SmartFilterBar", 
    "sap/m/ComboBox"
    ,"sap/m/MultiComboBox",
    "sap/ui/unified/FileUploaderParameter",
    "sap/m/MessageBox"

], function (Filter, SmartFilterBar, ComboBox,MultiComboBox,FileUploaderParameter,MessageBox) {
    "use strict";
    return {
        getCustomAppStateDataExtension: function (oCustomData) {
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            if (oCustomData) {
                var oCustomField1 = this.oView.byId("Status");
                if (oCustomField1) {
                    oCustomData.status = oCustomField1.getSelectedKeys();
                }
            }
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                if (oCustomData.status) {
                    var oComboBox = this.oView.byId("Status");
                    oComboBox.setSelectedKeys(
                        oCustomData.Status
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function(oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};

            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("Status");
                if (oCustomControl instanceof MultiComboBox) {
                    var astatus = oCustomControl.getSelectedKeys();
                    var aStatusFilters = [];
                    for(var i=0;i<astatus.length;i++){
                        aStatusFilters.push(new Filter("Status","EQ",astatus[i]));
                    }
                    oBindingParams.filters.push(new Filter(aStatusFilters,false));
                }
            }
        },
        onAfterRendering:function(){
            var oSmartFilterBar1 = this.byId("listReportFilter");
            var oDesigFilter = oSmartFilterBar1.getAllFilterItems()[2].getControl();
            oDesigFilter.setTokens([new sap.m.Token({
                key:"MANAGER",
                text:"=MANAGER"
            })]);
        },
        SendNoticetoEmployees: function(oEvent) {
        var extensionAPI = this.extensionAPI;
        var aSelectedRows = extensionAPI.getSelectedContexts();
        var aEmails= [];
        for(var i=0;i<aSelectedRows.length;i++){
           aEmails.push(aSelectedRows[i].getProperty("Email"));
        }
        var toList = aEmails.toString();
        var sub = "Notice to Employees";
        var body = "Hi, \n Improve your performance \n Regards, \n HR Team.";
        sap.m.URLHelper.triggerEmail(toList,sub,body);
        },
        uploadImage: function(oEvent) {
            if(!this.oDialog){
                this.oDialog = sap.ui.xmlfragment(this.getView().getId(), 
                "com/anjali/localannonationslistreportapp1/uploadPhoto",this);
                this.getView().addDependent(this.oDialog);
            }
            this.oDialog.open();
        },
        onChangeFile:function(oEvent){
            this.fileName = oEvent.getParameter("files")[0].name;
            this.fileType = oEvent.getParameter("files")[0].type;
        },
        onCloseDialog:function(){
            this.oDialog.close();
        },
        onUpload:function(oEvent){
            var oFileUploader = this.getView().byId("idFileUploader");
            var empId = this.extensionAPI.getSelectedContexts()[0].getProperty("Empid");
            var slug = empId + ","+this.fileName;
            oFileUploader.destroyHeaderParameters();
            //slug
            oFileUploader.addHeaderParameter(new FileUploaderParameter({
                name:"slug",
                value: slug
            }));
            //fileType
            oFileUploader.addHeaderParameter(new FileUploaderParameter({
                name:"Content-Type",
                value:this.fileType
            }));
            //x-csrf-token
            this.getOwnerComponent().getModel().refreshSecurityToken();
            oFileUploader.addHeaderParameter(new FileUploaderParameter({
                name:"x-csrf-token",
                value: this.getOwnerComponent().getModel().getHeaders()['x-csrf-token']
            }));
            //fileCOntent
            oFileUploader.upload();
        },
        onUploadComplete:function(oEvent){
            var status = oEvent.getParameter("status");
            if(status === 201 ){
                MessageBox.success("Upload successfully");
                this.oDialog.close();
            }
            else{
                MessageBox.error("Somethin went wrong!!");
                this.oDialog.close();
            }
        }
    };
});