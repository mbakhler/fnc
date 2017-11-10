/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.crossDocApp = new function () {
	//******************
	// default 
	//******************



	//******************
	// private 
	//******************
	//objects
	var VendorListItem = function (it) {
		var self = this;
		self.Address1 = it.Address1;
		self.Address2 = typeof (it.Address2) == "object" ? "" : it.Address2;
		self.City = it.City;
		self.Code = it.Code;
		self.Company = it.Company;
		self.RequiredPO = it.RequirePO;
		self.SBVendId = it.SBVendId;
		self.State = it.State;
		self.VendId = it.VendID;
		self.Zip = it.Zip;
		self.GLAccountId = it.GLAccId;
		self.GLAccountNumber = it.GLAccNumber;
		self.GLAccountDescription = it.GLAccDescription;

		self.ItemId = self.SBVendId + "-" + self.VendorId;
		self.Address = self.Address1 + ", " + self.City + " " + self.State + " " + self.Zip;
		self.Selected = ko.observable(false);

		self.Enabled = ko.observable(true);
	};

	var POListItem = function (it) {
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = typeof it.AcceptedDT == "object" ? "" : (new Date(it.AcceptedDT)).format("yyyy-mm-dd");	//it.AcceptedDT;
		self.BackOrder = it.BackOrder;
		self.CompletedManual = it.CompletedManual;
		self.Completed = it.Completed; //-1-question sign; 0-not-completed; 1-completed; 2-completed with price discrepancy
		self.Deleted = it.Deleted;
		self.Company = typeof it.Vendor == "object" ? "" : it.Vendor.replace(/&amp;/g, '&');
		self.DeliveryDate = (new Date(it.DelivDate)).format("yyyy-mm-dd");	//it.DelivDate;		//(new Date(it.DelivDate)).format("mm/dd/yyyy");
		self.EInvoiceAttached = it.EInvoiceAttached;
		self.InvoiceNumber = it.InvoiceNum;
		self.InvoiceId = it.InvoiceId;
		self.IsManual = it.IsManual;
		self.New = it.New;
		self.POTotal = it.OrderTotal;

		self.PostDate = typeof it.PostDate == "object" ? "" : (new Date(it.PostDate)).format("yyyy-mm-dd");

		self.Location = it.OrgName;
		self.UnitId = it.UnitId;
		self.PONumbers = it.VorderNum;
		self.POLabel = '';
		self.OrgId = it.Orgid;
		self.VendId = typeof it.VendId == "object" ? "0" : it.VendId;

		self.SBVendId = it.SBVendId == undefined ? "0" : it.SBVendId;

		self.Xported = it.Xported;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;

		self.AcceptedDate = it.AcceptedDT ? (new Date(it.AcceptedDT)).format("yyyy-mm-dd") : "";
	};

	var InvoiceDuplicateItem = function (it) {
		//AcceptedBy: "Soying (Lily) Yu(SOYING)"
		//AcceptedDT: "Dec 31 2012  4:12PM"
		//IsDuplicate: "1"
		//XportedBy: null
		//XportedDT: null
		var self = this;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = it.AcceptedDT;
		self.IsDuplicate = it.IsDuplicate;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;

		self.WarningText = function () {
			var r = '';
			if (self.IsDuplicate == '1') {
				r = r + 'There is another invoice with the same number.';
				if (self.AcceptedBy) {
					r = r + ' Accepted by ' + self.AcceptedBy + ' on ' + self.AcceptedDT + '.';
				}
				if (self.XportedBy) {
					r = r + ' Exported by ' + self.XportedBy + ' on ' + self.XportedDT + '.';
				}
			}
			return r;
		}
		//
	};

	//TO DO: set up inheritance between crossDocItem and documentItem
	//var DocItem = function (it,observable) {
	//	self.company = it ? self.company = it.Company
	//}
	var crossDocItem = function (it) {
		var self = this;
		//uploading variables
		self.company = "";
		self.sbVendId = 0;
		self.vendId = 0;
		self.location = "";
		self.POList = "";
		self.invoiceNum = "";
		self.docId = "";
		self.docName = "";
		self.uploadDT = new Date();
		self.uploadBy = "";
		self.total = 0;
		self.recordId = "";
		self.orgId = "";
		self.pageCount = 1;
		self.status = "";
		self.invoiceDocTypeId = 1;
		self.typeName = 'Invoice';
		self.contentType = "";
		self.invoiceDate = "";
		self.file;

		if (it) {//server response constructor
			self.company = it.Company;
			self.contentType = it.ContentType;
			self.docId = it.DocId;
			self.docName = it.DocName;
			self.invoiceDate = it.InvoiceDate;
			self.invoiceDocTypeId = it.InvoiceDocTypeId;
			self.invoiceNum = it.InvoiceNum;
			self.location = it.OrgName;
			self.orgId = it.OrganizationId;
			self.pageCount = Number(it.PageCount);
			self.recordId = it.RecordId;
			self.sbVendId = it.SBVendId;
			self.status = it.Status;
			self.total = Number(it.Total);
			self.typeName = it.TypeName;
			self.uploadDT = new Date(it.UploadDT);
			self.uploadBy = it.UploadedBy;
			self.POList = it.VOrderNum != null ? it.VOrderNum.replace(/\s+/g, '') : '';
			self.vendId = it.VendId;
		}
	};
	var documentItem = function (file) {
		var self = this;
		//error and state handling
		self.isUploaded = ko.observable(false);
		self.isAttached = ko.observable(false);
		self.uploadFailed = ko.observable(false);
		self.attachFailed = ko.observable(false);

		//uploading variables
		self.company = ko.observable('');
		self.location = ko.observable('');
		self.validLocation = {};
		self.POList = ko.observable('');
		self.invoiceNum = ko.observable('');
		self.docType = ko.observable('');
		self.recordId = 0;
		self.vendId = 0;
		self.sbVendId = 0;
		self.total = 0;
		self.pageCount = 1;
		self.contentType = "";
		self.docId = '';
		self.file = file ? file : null;

		self.invId = "";
		self.invoiceDate = "";
		self.freight = '';
		self.discount = '';
		self.tax = '';
		self.GLAccountId = '';

		self.arrayBuffer = new ArrayBuffer();
		self.docURL = ko.observable('');

		//naming
		self.docName = file && file.name ? ko.observable(file.name.replace(/\.[^/.]+$/, "")) : ko.observable("");
		//self.uniqueNameInteger = ko.observable(1);
		//self.inputtedName = ko.observable(0);

		//self.automaticName = ko.computed(function () {
		//	return (self.location() != "" ? self.location() + "_" : "") + fnc.app.fullName + "_" + (self.company() != "" ? self.company() + "_" : "") + self.docType().TypeName + self.uniqueNameInteger() +"_" + (self.invoiceNum() != "" ? self.invoiceNum() + "_" : "") + self.pageCount + ("Page(s)");
		//}, self);

		//self.docName = ko.computed({
		//	read: function () {
		//		if (typeof self.inputtedName() == "string" && self.automaticName() != self.inputtedName()) {
		//			return self.inputtedName();
		//		}
		//		else {
		//			return self.automaticName();
		//		}
		//	},
		//	write: function (value) {
		//		self.inputtedName(value);
		//	}
		//}, self);

		//self.docType.subscribe(function (oldValue) {//rename docs of old type
		//	var counter = 0;
		//	var docs = fnc.crossDocApp.currentUploadBatch().documents();
		//	for (var i = 0; i < docs.length; i++) {
		//		if (docs[i].docType() == oldValue && docs[i] != self) {
		//			counter++;
		//			docs[i].uniqueNameInteger(counter);
		//		}
		//	}
		//}, null, "beforeChange");

		//self.docType.subscribe(function (newValue) {//rename docs of new type
		//	var counter = 0;
		//	var docs = fnc.crossDocApp.currentUploadBatch().documents();
		//	for (var i = 0; i < docs.length; i++) {
		//		if (docs[i].docType() == newValue) {
		//			counter++;
		//			docs[i].uniqueNameInteger(counter);
		//		}
		//	}
		//}, self);

		self.attach = function (mode, callbackSuccess, callbackError) {
			if (!self.isAttached()) {
				if (mode == 2 && self.invId == "") {
					createManualInvoiceAndAttach(self.recordId, self.docId, self.validLocation.LocationId, self.sbVendId, self.invoiceNum(), self.invoiceDate, self.total(), self.discount, self.tax, self.freight, self.GLAccountId, function (r) {
						self.invId = r;
						self.attachFailed(false);
						self.isAttached(true);
						if (callbackSuccess) callbackSuccess(r);
					},
					function () {
						if (callbackError) callbackError();
					});
				}
				else if (mode == 1 || mode == 2 && self.invId != "") {
					attachInvoiceDocument(self.recordId, self.docId, self.invId, function () {
						self.attachFailed(false);
						self.isAttached(true);
						if (callbackSuccess) callbackSuccess();
					},
					function () {
						self.attachFailed(true);
						if (callbackError) callbackError();
					});
				}
			}
			else {
				if (callbackSuccess) callbackSuccess();
			}
		};

		self.upload = function (callback) {
			if (!self.isUploaded()) {
				var action = '';
				var blobContainer = 'invoice';
				var fileType = 'invoice';
				var accNum = 0;
				var state = 'raw';
				var contentType = self.file.name.split(".").pop();
				updateFileMetadata(action, blobContainer, contentType, self.docName(), fileType, self.company(), self.vendId, self.sbVendId, accNum, self.invoiceNum(), self.location(), state, function (r) {
					self.docId = r;
					if (self.docId != '') {
						var pageNumber = 1;
						uploadAndUpdateFilePageMetadata(self.file, self.docId, pageNumber, fnc.appid, fnc.app.sessionId, function () {
							var action = 'none';
							finishFileUpload(self.docId, action, function () {
								var invId = 0;
								var invoiceDate = '';
								createInvoiceDocument(self.docId, self.docType().InvoiceDocTypeId, self.docName(), self.pageCount, self.validLocation.LocationId, self.vendId, self.sbVendId, self.company(), invId, self.invoiceNum(), self.POList(), self.total(), contentType, invoiceDate, function (r) {
									self.recordId = r;
									self.uploadFailed(false);
									self.isUploaded(true);
									setTimeout(function () {//refresh document list and make sure to include location
										fnc.crossDocApp.showInvoiceDocumentList(self.validLocation.LocationId);
									}, 500);
									if (callback) callback();
								}, function () { self.uploadFailed(true); });
							}, function () { self.uploadFailed(true); });
						}, function () { self.uploadFailed(true); });
					}
				}, function () { self.uploadFailed(true); });
			}
			else {
				if (callback) callback();
			}
		};

		self.update = function (callback) {
			if (!self.isUploaded()) {
				updateInvoiceDocumentRecord(self.recordId, self.docId, self.docType().InvoiceDocTypeId, self.docName(), self.validLocation.LocationId, self.vendId, self.sbVendId, self.company(), self.invoiceNum(), self.POList(), self.total(), self.contentType, self.invoiceDate, function () {
					self.isUploaded(true);
					if (callback) callback();
				}, function () { self.uploadFailed(true); });
			}
		};

		//controller helper functions
		var updateFileMetadata = function (action, blobContainer, contentType, docName, fileType, company, vendId, sbVendId, accNum, invNum, orgName, state, callbackSuccess, callbackError) {
			var flmd = {};
			flmd.Action = action;
			flmd.BlobContainer = blobContainer;
			flmd.ContentType = contentType;
			flmd.DocName = docName;
			flmd.FileId = '';
			flmd.FileType = fileType;
			flmd.RawFiles = '';
			flmd.RefKey1 = company;
			flmd.RefKey2 = Number(vendId);
			flmd.RefKey3 = Number(sbVendId);
			flmd.RefKey4 = accNum;
			flmd.RefKey5 = invNum;
			flmd.RefKey6 = orgName;
			flmd.RefKey7 = '';
			flmd.RefKey8 = '';
			flmd.RefKey9 = '';
			flmd.RefKey10 = '';
			flmd.State = state;
			// console.log(flmd);
			var params = {};
			params.FlMetaData = flmd;
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.FileManager.UpdateFileMetadata", params, function (response) {
				loading(false);
				if (response.d == '') {
					return;
				}
				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					if (callbackError) callbackError();
					return;
				}
				if (callbackSuccess) callbackSuccess(r.result);
			});
		};

		var uploadAndUpdateFilePageMetadata = function (file, fileId, pageNumber, appId, sessionId, callbackSuccess, callbackError) {
			var fd = new FormData();
			fd.append(file.name, file, file.name);
			fd.append("fileId", fileId);
			fd.append("pagenumber", pageNumber);
			fd.append("appid", appId);
			fd.append("sessionid", sessionId);
			// console.log(fd);
			loading(true);
			$.ajax({
				url: servicesHost + "/ChefMod.Financials.UI.Services/Upload.aspx",
				type: "POST",
				data: fd,
				processData: false,  // tell jQuery not to process the data
				contentType: false,  // tell jQuery not to set contentType
				success: function (result) {
					loading(false);
					if (callbackSuccess) callbackSuccess();

					//var o = eval('(' + result + ')');
					//console.log('FileId=' + o.fileid);
					//console.log('PageNo=' + o.pagenumber);
					//if (o.iserror == '0') {
					//	if (callbackSuccess) callbackSuccess();
					//} else {
					//	errMessage('Unexpected error occurred. Please try again later or contact ChefMod support.');
					//	$('#modMessage').modal('show');
					//	// close modal window
					//	$("#modMessage").on("hidden.bs.modal", function () {
					//		errMessage('');
					//	});
					//	console.log('iserror=' + o.iserror);
					//}

				},
				error: function (err) {
					if (callbackError) callbackError();
					loading(false);
					console.log(err.statusText)
				}
			});
		};

		var finishFileUpload = function (fileId, action, callbackSuccess, callbackError) {
			var params = {};
			params.FileId = fileId;
			params.Action = action;

			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.FileManager.FinishFileUpload", params, function (response) {
				loading(false);
				if (response.d === '') {
					//success
					if (callbackSuccess) callbackSuccess();
					return;
				}
				var r = eval('(' + response.d + ')');
				if (r.result === 'error') {
					//error
					if (callbackError) callbackError();
					windowResized();
					return;
				}
			});
		};

		var updateInvoiceDocumentRecord = function (recordId, docId, invoiceDocType, docName, orgId, vendId, sbVendId, company, invoiceNum, POList, total, contentType, invoiceDate, callbackSuccess, callbackError) {
			var params = {};
			params.RecordId = Number(recordId);
			params.DocId = docId;
			params.InvoiceDocType = Number(invoiceDocType);
			params.DocName = docName;
			params.OrganizationId = Number(orgId);
			params.VendId = Number(vendId);
			params.sbVendId = Number(sbVendId);
			params.Company = company;
			params.InvoiceNum = invoiceNum;
			params.VOrderNum = POList;
			params.Total = Number(total);
			params.ContentType = contentType;
			params.InvoiceDate = invoiceDate;

			//  console.log(params);
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.UpdateInvoiceDocumentRecord", params, function (response) {
				loading(false);
				if (response.d == '') {
					if (callbackSuccess) callbackSuccess();
					windowResized();
					return;
				}

				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					if (callbackError) callbackError();
					windowResized();
					return;
				}
			});
		};

		var loadDuplicateInvoiceInfo = function (invNo, vendId, sbVendId, orgId, invId, callback) {
			var params = {};
			params.InvoiceNumber = invNo;
			params.VendId = vendId;
			params.SBVendId = sbVendId;
			params.OrganizationId = orgId;
			params.InvoiceId = invId;

			//LoadDuplicateInvoiceInfo(o.Params.InvoiceNumber, o.Params.VendId, o.Params.SBVendId, o.Params.OrganizationId, o.Params.InvoiceId)

			loading(true);

			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadDuplicateInvoiceInfo", params, function (response) {
				loading(false);
				if (response.d == '') {
					if (callback) callback([]);
					windowResized();
					return;
				}
				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					windowResized();
					return;
				}
				var obj = JSON.parse(response.d).result.row;
				var arr = [];
				if (obj[0]) {
					obj.forEach(function (it) { arr.push(new InvoiceDuplicateItem(it)) })
				} else {
					arr.push(new InvoiceDuplicateItem(obj))
				}

				if (callback) callback(arr[0]);
			})
		};

		var createInvoiceDocument = function (docId, docType, docName, pageCount, orgId, vendId, sbVendId, company, invId, invNum, poList, total, contentType, invoiceDate, callbackSuccess, callbackError) {
			//o.Params.DocId, o.Params.InvoiceDocType, o.Params.DocName, o.Params.PageCount, o.Params.OrganizationId, o.Params.VendId, o.Params.sbVendId, o.Params.Company, o.Params.InvoiceId, o.Params.InvoiceNum, o.Params.VOrderNum, o.Params.Total, o.uc)
			//Function CreateInvoiceDocument(docId As String, invoiceDocType As Integer, docName As String, pageCount As Integer, organizationId As Integer, vendId As Integer, sbVendId As Integer, company As String, invoiceId As Decimal, invoiceNum As String, VOrderNum As String, Total As Double, userCode As Integer) As Long
			var params = {};
			params.DocId = docId;
			params.InvoiceDocType = Number(docType);
			params.DocName = docName;
			params.PageCount = Number(pageCount);
			params.OrganizationId = Number(orgId);
			params.VendId = Number(vendId);
			params.sbVendId = Number(sbVendId);
			params.Company = company;
			params.InvoiceId = Number(invId);
			params.InvoiceNum = invNum;
			params.VOrderNum = poList;
			params.Total = Number(total);
			params.ContentType = contentType;
			params.InvoiceDate = invoiceDate;
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.CreateInvoiceDocument", params, function (response) {
				loading(false);

				if (response.d == '') {
					windowResized();
					return;
				}

				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					if (callbackError) callbackError();
					windowResized();
					return;
				}

				var obj = JSON.parse(response.d);
				if (callbackSuccess) callbackSuccess(obj);
			});
		};

		var attachInvoiceDocument = function (recordId, docId, invId, callbackSuccess, callbackError) {
			var params = {};
			params.RecordId = Number(recordId);
			params.DocId = docId;
			params.InvoiceId = Number(invId);

			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.AttachInvoiceDocument", params, function (response) {
				loading(false);
				if (response.d == '') {
					//success
					if (callbackSuccess) callbackSuccess();
					return;
				}
				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					//error
					if (callbackError) callbackError();
					windowResized();
					return;
				}
			});
		};

		var createManualInvoiceAndAttach = function (recordId, docId, orgId, sbVendId, invoiceNum, invoiceDate, gross, discount, tax, freight, GLAccId, callbackSuccess, callbackError) {
			var params = {};
			params.RecordId = Number(recordId);
			params.DocId = docId;
			params.OrganizationId = orgId;
			params.sbVendId = Number(sbVendId);
			params.OrganizationId = Number(orgId);
			params.InvoiceNum = invoiceNum;
			params.InvoiceDate = invoiceDate;
			params.Gross = Number(gross);
			params.Discount = Number(discount);
			params.Tax = Number(tax);
			params.Freight = Number(freight);
			params.GLAccId = Number(GLAccId);

			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.CreateManualInvoiceAndAttach", params, function (response) {
				loading(false);
				if (response.d == '') {
					//empty
					return;
				}
				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					//error
					if (callbackError) callbackError();
					windowResized();
					return;
				}
				//success
				if (callbackSuccess) callbackSuccess(Number(response.d));
			});

		};
	};

	var uploadBatch = function (crossDoc) {
		var self = this;
		self.documents = ko.observableArray();
		
		//location
		self.location = ko.observable('');
		self.validLocation = {};
		self.setLocation = function (loc) {
			self.location(loc.LocationName);
			self.validLocation = loc;
		};

		self.location.subscribe(function (newValue) {
			self.company('');
			var validLocation = getValidLocation(newValue);
			if (validLocation) {
				var orgId = validLocation.LocationId;
				loadManualInvoiceVendors(orgId);
				self.validLocation = validLocation;
			}
			else {
				self.validLocation = {};
				self.manualInvoiceVendors.removeAll();
			}
		});

		self.POList = ko.observable('');
		self.invoiceNum = ko.observable('');
		self.company = ko.observable('');
		self.vendor = {};
		self.total = ko.observable('');
		self.manualInvoiceVendors = ko.observableArray();
		self.filteredVendors = ko.computed(function () {
			return filterObservableArray(self.company, self.manualInvoiceVendors);
		}, self);
		self.filteredLocations = ko.computed(function () {
			return filterObservableArray(self.location, fnc.app.filterAvailableLocations);
		}, self);


		//vendor selection
		self.existingVendorSelected = ko.observable(false);
		self.vendorHasGL = ko.observable(false);

		self.setVendor = function (vend) {
			//console.log(vend);
			self.company(vend.Company);
			self.existingVendorSelected(true);
			self.vendor = vend;
			self.vendorHasGL(false);
			if (vend.GLAccountId != 0) {
				//   console.log(vend.GLAccountId);
				self.vendorHasGL(true);
				if (fnc.app.prvCrossDocAttachToInvoiceEnable()) self.createInvoiceSelected(true);
			}
			else if (fnc.app.prvCrossDocAttachToInvoiceEnable()) {
				self.searchExistingOn(true);
			}
			self.getPOs();
		};

		self.company.subscribe(function (newValue) {
			if (!self.existingVendorSelected()) {//if the vendor was inputted without having one selected(case sensitive)
				var vendor = self.manualInvoiceVendors().filter(function (vend) {
					return vend.Company == newValue;
				})[0];
				if (vendor) {
					self.setVendor(vendor);
				}
				else {
					//clear out the vendor
					self.vendor = {};
					self.existingVendorSelected(false);
					self.doNotAttach(true);
				}
			}
			else {
				self.existingVendorSelected(false);
				self.vendor = {};
				self.searchExistingOn(false);
				//self.createInvoiceSelected(false);
				self.clearInvoice();
				self.doNotAttach(true);
			}
		});

		//existing invoice attachment
		self.invoiceFilter = ko.observable('');
		self.invoiceChoices = ko.observableArray();
		self.filteredInvoices = ko.computed(function () {
			return filterObservableArray(self.invoiceFilter, self.invoiceChoices);
		}, self);
		self.invoice = {};
		self.invoiceSelected = ko.observable(false);
		self.invoiceToDate = ko.observable((new Date).format("mm/dd/yyyy"));

		var date = new Date();
		date.setDate((new Date()).getDate() - 30);
		self.invoiceFromDate = ko.observable(date.format("mm/dd/yyyy"));

		self.invoiceFilterDateRange = ko.observable(fnc.app.filterAvailableDateRanges()[3]);
		self.dateFilterVisible = ko.observable(false);
		self.clearInvoice = function () {
			if (self.invoiceSelected()) {
				self.invoiceFilter('');
				self.invoice = {};
				self.invoiceNum('');
				self.total('');
				self.invoiceSelected(false);
			}
		};

		self.setInvoice = function (invoice) {
			self.invoiceSelected(true);
			self.invoiceFilter("PO Number(s): " + (invoice.PONumbers ? invoice.PONumbers : "n/a") + " | Invoice Number: " + invoice.InvoiceNumber + " | Delivery Date: " + invoice.DeliveryDate + " | Total: " + Number(invoice.POTotal).toFixed(2));
			self.invoiceNum(invoice.InvoiceNumber);
			self.POList(invoice.PONumbers);
			self.total(Number(invoice.POTotal).toFixed(2));
			self.invoice = invoice;
		};

		self.invoiceDateSelected = function () {
			self.invoiceFilterDateRange("Custom");
			self.invoiceSelected(false);
		};

		self.invoiceFilterDateRange.subscribe(function (newValue) {//adjust inputs according to filter date range selection
			//var index = fnc.app.filterAvailableDateRanges().indexOf(newValue);
			if (newValue === "Last 7 Days") {
				var date = new Date();
				date.setDate((new Date()).getDate() - 7);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
			else if (newValue === "Last 14 Days") {
				var date = new Date();
				date.setDate(date.getDate() - 14);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
			else if (newValue === "Last 30 Days") {
				var date = new Date();
				date.setDate(date.getDate() - 30);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
			else if (newValue === "Last 60 Days") {
				var date = new Date();
				date.setDate(date.getDate() - 60);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
			else if (newValue === "Last 90 Days") {
				var date = new Date();
				date.setDate(date.getDate() - 90);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
			else if (newValue === "Last 6 Months") {
				var date = new Date();
				date.setMonth(date.getMonth() - 6);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
			else if (newValue === "Last 12 Months") {
				var date = new Date();
				date.setMonth(date.getMonth() - 12);
				date = date.format("mm/dd/yyyy");
				self.invoiceFromDate(date);
				self.invoiceToDate((new Date()).format("mm/dd/yyyy"));
			}
		});

		self.toggleDateFilter = function (d, e) {
			e.stopPropagation();
			self.dateFilterVisible(!self.dateFilterVisible());
		};

		self.getPOs = function () {
			self.invoiceFilter("");
			var orgId = self.validLocation.LocationId;
			loadPOList(orgId, self.invoiceFromDate(), self.invoiceToDate(), function (arr) {
				arr = arr.filter(function (it) {
					return it.InvoiceId != '0' && Number(self.vendor.SBVendId) == Number(it.SBVendId) && Number(self.vendor.VendId) == Number(it.VendId) && it.Deleted !== '1';
				});
				arr.sort(function (a, b) {//sort by InvoiceNumber to facilitate grouping
					if (a.InvoiceNumber < b.InvoiceNumber) return -1;
					if (a.InvoiceNumber > b.InvoiceNumber) return 1;
					return 0;
				});
				//group multiples                
				var i = 0;
				while (i < arr.length - 1) {
					if (arr[i].InvoiceId == arr[i + 1].InvoiceId && arr[i].InvoiceNumber == arr[i + 1].InvoiceNumber) {
						arr[i].POLabel = "Multiple";
						arr[i].PONumbers += ("," + arr[i + 1].PONumbers);
						arr.splice(i + 1, 1);
					}
					else {
						if (arr[i].POLabel != "Multiple") arr[i].POLabel = arr[i].PONumbers;
						i++;
					}
				}
				if (arr[i + 1]) arr[i + 1].POLabel = arr[i + 1].PONumbers;
				self.invoiceChoices(arr);
			});
		};

		//new invoice creation
		self.invoiceDate = ko.observable('');
		self.tax = ko.observable('');
		self.freight = ko.observable('');
		self.discount = ko.observable('');

		//attachment options
		self.dropZoneHeight = ko.observable(0);
		self.searchExistingOn = ko.observable(false);
		self.createInvoiceSelected = ko.observable(false);
		self.doNotAttach = ko.computed({
			read: function () {
				if (self.searchExistingOn() || self.createInvoiceSelected()) return false;
				return true;
			},
			write: function (value) {
				if (value) {
					self.searchExistingOn(false);
					self.createInvoiceSelected(false);
					self.clearInvoice();
					self.alertDuplicateInvoice(false);
					computeDropZoneHeight();
				}
				else {
					self.searchExistingOn(true);
				}
			}
		}, self);
		self.toggleSearchExistingOn = function () {
			self.searchExistingOn(true);
		};
		self.toggleCreateInvoiceSelected = function () {
			self.createInvoiceSelected(true);
		};
		self.toggleDoNotAttach = function () {
			self.doNotAttach(true);
		};
		self.createInvoiceSelected.subscribe(function (newValue) {
			if (newValue) {
				self.clearInvoice();
				self.searchExistingOn(false);
				self.checkDuplicateInvoice();
				computeDropZoneHeight();
			}
		});
		self.searchExistingOn.subscribe(function (newValue) {
			if (newValue) {
				self.alertDuplicateInvoice(false);
				self.createInvoiceSelected(false);
				computeDropZoneHeight();
			}
		});
		//error and state handling
		self.alertInvalidLocation = ko.observable(true);
		self.alertInvalidLocation.subscribe(function () {
			computeDropZoneHeight();
		});
		self.alertTooBig = ko.observable(false);
		self.allDocumentsNamed = ko.computed(function () {
			if (self.documents().length === 0) return false;
			for (var i = 0; i < self.documents().length; i++) {
				if (self.documents()[i].docName() == "") {
					return false;
				}
			}
			return true;
		}, self);

		self.hasUploadFailure = ko.computed(function () {
			for (var i = 0; i < self.documents().length; i++) {
				if (self.documents()[i].uploadFailed()) return true;
			}
			return false;
		});
		self.hasUploadFailure.subscribe(function (newValue) {
			if (newValue) {
				for (var i = 0; i < self.documents().length; i++) {
					if (self.documents()[i].isUploaded() && !self.documents()[i].attachFailed()) {
						self.removeChosenFileUpload(self.documents()[i]);
					}
				}
			}
		});
		self.hasAttachFailure = ko.computed(function () {
			for (var i = 0; i < self.documents().length; i++) {
				if (self.documents()[i].attachFailed()) return true;
			}
			return false;
		});
		self.hasAttachFailure.subscribe(function (newValue) {
			if (newValue) {
				for (var i = 0; i < self.documents().length; i++) {
					if (self.documents()[i].isAttached()) {
						self.removeChosenFileUpload(self.documents()[i]);
					}
				}
			}
		});
		self.isUploadable = ko.computed(function () {
			var searchExistingNotReady = self.searchExistingOn() && !self.invoiceSelected();
			var createInvoiceNotReady = self.createInvoiceSelected() && (self.invoiceNum() === "" || self.total() === "" || self.invoiceDate() === "");
			if (self.alertInvalidLocation() || !self.allDocumentsNamed() || searchExistingNotReady || createInvoiceNotReady) return false;
			return true;
		});

		self.isUploaded = ko.computed(function () {
			if (self.documents().length == 0) return false;
			for (var i = 0; i < self.documents().length; i++) {
				if (!self.documents()[i].isUploaded()) return false;
			}
			return true;
		}, this);

		self.allAttached = ko.computed(function () {
			if (self.documents().length == 0) return false;
			for (var i = 0; i < self.documents().length; i++) {
				if (!self.documents()[i].isAttached()) return false;
			}
			return true;
		}, self);
		self.alertDuplicateInvoice = ko.observable(false);
		self.checkDuplicateInvoice = function () {
			if (self.createInvoiceSelected() && self.invoiceNum() != "") {
				loadDuplicateInvoiceInfo(self.invoiceNum(), self.vendor.VendId, self.vendor.SBVendId, self.validLocation.LocationId, 0, function (r) {
					if (r != []) {
						if (r.IsDuplicate == "1") {
							self.alertDuplicateInvoice(true);
						}
						else {
							self.alertDuplicateInvoice(false);
						}
					}
					else {
						self.alertDuplicateInvoice(false);
					}
				});
			}
			else {
				self.alertDuplicateInvoice(false);
			}
		};

		//general functions
		var getValidLocation = function (location) {
			var matchedLocations = fnc.app.filterAvailableLocations().filter(function (loc) {
				return loc.LocationName.toLowerCase() === location.toLowerCase();
			});
			if (matchedLocations[0]) {
				self.alertInvalidLocation(false);
				return matchedLocations[0];
			}
			else {
				self.alertInvalidLocation(true);
				return false;
			}
		};

		var loadManualInvoiceVendors = function (orgId, callback) {
			self.manualInvoiceVendors([]);
			var params = {};
			params.OrganizationId = orgId;

			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadAllActiveVendors", params, function (response) {
				loading(false);
				if (response.d == '') {
					if (callback) callback([]);
					windowResized();
					return;
				}
				var r = eval('(' + response.d + ')');
				if (r.result == 'error') {
					windowResized();
					return;
				}
				var obj = JSON.parse(response.d).result.row;
				var arr = [];
				if (obj[0]) {
					obj.forEach(function (it) { arr.push(new VendorListItem(it)) })
				}
				else {
					arr.push(new VendorListItem(obj))
				}
				self.manualInvoiceVendors(arr);
				if (callback) callback();
			});
		};

		var loadPOList = function (orgId, fromDate, toDate, callbackSuccess, callbackError) {
			var params = {};
			params.RangeBaseOn = 0;
			params.FromDate = fromDate;
			params.ToDate = toDate;
			params.OrgsIds = orgId;
			params.Vendors = '';//vendorId;
			params.Keywords = '';
			loading(true);
			self.invoiceChoices.removeAll();
			ajaxPostXML("ChefMod.Financials.UI.Controllers.Invoices.LoadPOList", params, function (response) {
				loading(false);
				if (response == '') {
					if (callbackSuccess) callbackSuccess([]);
					windowResized();
					return;
				}

				if (response == 'error') {
					if (callbackError) callbackError();
					return;
				}
				var obj = JSON.parse(response).result.row;
				var arr = [];
				if (obj[0]) {
					obj.forEach(function (it) { arr.push(new POListItem(it)) })
				}
				else {
					arr.push(new POListItem(obj))
				}
				if (callbackSuccess) callbackSuccess(arr);
			});
		};

		var attachFile = function (file) {
			var reader = new FileReader();
			var doc = new documentItem(file);
			loading(true);
			var contentType = file.name.split(".").pop();
			doc.contentType = contentType;
			if (contentType.toLowerCase() == 'pdf') {
				reader.onloadend = function (e) {
					var result = reader.result;//array buffer
					doc.arrayBuffer = result;
					pdf2imageDataURLs(result, {
						callback:function (urls, numPages) {
							loading(false);
							doc.docURL(urls[0]);
							if (self.alertTooBig()) {
								self.alertTooBig(false);
							}
							doc.location = self.location;
							doc.POList = self.POList;
							doc.invoiceNum = self.invoiceNum;
							doc.company = self.company;
							doc.total = self.total;
							doc.pageCount = numPages;
							self.documents.push(doc);
						},
						renderFirst:true
					});
				};
				reader.readAsArrayBuffer(file);
			}
			else {
				reader.onloadend = function (onloadend_e) {
					loading(false);
					var result = reader.result; //base 64 encoded file
					doc.docURL(result);
					if (self.alertTooBig()) {
						self.alertTooBig(false);
					}
					doc.location = self.location;
					doc.POList = self.POList;
					doc.invoiceNum = self.invoiceNum;
					doc.company = self.company;
					doc.total = self.total;
					self.documents.push(doc);
				};
				reader.readAsDataURL(file);
			}
		};

		var uploadORupdate = function (funcName) {
			var count = 0;
			for (var i = 0; i < self.documents().length; i++) {
				var doc = self.documents()[i];
				doc.validLocation = self.validLocation;
				if (self.vendor instanceof VendorListItem) {
					doc.vendId = self.vendor.VendId;
					doc.sbVendId = self.vendor.SBVendId;
					doc.GLAccountId = self.vendor.GLAccountId;
				}
				else {
					doc.vendId = 0;
					doc.sbVendId = 0;
				}
				if (self.searchExistingOn() && self.invoiceSelected()) {
					doc.invId = self.invoice.InvoiceId;
					doc[funcName](function () {
						count++;
						if (count == self.documents().length) {
							for (var j = 0; j < self.documents().length; j++) {
								self.documents()[j].attach(1, function () {
									if (funcName == "update") {
										setTimeout(function () {
											$('#modCrossDocEdit').modal('hide');
											fnc.crossDocApp.showInvoiceDocumentList();
											$('#modUploadComplete').modal('show');
										}, 800);
									}
								});
							}
						}
					});
				}
				else if (self.createInvoiceSelected()) {
					doc.invoiceDate = self.invoiceDate();
					doc.tax = self.tax();
					doc.freight = self.freight();
					doc.discount = self.discount();
					doc[funcName](function () {
						count++;
						if (count == self.documents().length) {
							self.documents()[0].attach(2, function (r) {
								for (var j = 1; j < self.documents().length; j++) {
									self.documents()[j].invId = r;
									self.documents()[j].attach(1);
								}
							},
							function () {
								for (var j = 0; j < self.documents().length; i++) {
									self.documents()[j].attachFailed(true);
								}
							})
						}
					});
				}
				else {
					doc[funcName](function () {
						if (funcName == "update") {
							setTimeout(function () {
								$('#modCrossDocEdit').modal('hide');
								fnc.crossDocApp.showInvoiceDocumentList();
								$('#modUploadComplete').modal('show');
							}, 800);
						}
					});
				}
			}
		};

		self.attachUploadFiles = function (files) {
			if (files[0]) {
				[].forEach.call(files, function (file) {
					if (file.size > maxUploadFileSize) {
						if (file.type.indexOf("image") === 0) {
							loading(true);
							reduceImageFileSizeQuality(file, 0.5, maxUploadFileSize, function (f) {
								attachFile(f);
							});
						}
						else {
							self.alertTooBig(true);
							setTimeout(function () {
								self.alertTooBig(false);
							}, 5000);
						}
					}
					else {
						attachFile(file);
					}
				});
				$('#crossDoc-file-input')[0].value = '';
			}
		};

		self.beginUpload = function () {
			if (!self.isUploaded() || !self.allAttached()) {
				if (!self.alertInvalidLocation() && self.allDocumentsNamed()) {
					if (self.alertDuplicateInvoice()) {
						//open duplicate mod & has to confirm to continue
						var duplicateMod = $('#modDuplicateWarning');
						duplicateMod.modal('show');
						duplicateMod.one('shown.bs.modal', function (e) {
							$(".modal-body #invoiceNo").text(self.invoiceNum());
							$(".modal-body #vendName").text(self.company());
						});

						duplicateMod.one('click', "[data-dismiss='modal']", function (e) {
							$('#modDuplicateWarning').modal('hide');
						});

						duplicateMod.one('click', '#proceedWithDuplicate', function (e) {
							duplicateMod.modal('hide');
							//if confirmed create invoice and attach
							uploadORupdate("upload");
						});
					}
					else {
						uploadORupdate("upload");
					}
				}
			}
		};

		self.beginUpdate = function () {
			if (!self.alertInvalidLocation() && self.documents()[0].docName() != '') {
				if (self.alertDuplicateInvoice()) {
					//open duplicate mod & has to confirm to continue
					var duplicateMod = $('#modDuplicateWarning');
					duplicateMod.modal('show');
					duplicateMod.one('shown.bs.modal', function (e) {
						$(".modal-body #invoiceNo").text(self.invoiceNum());
						$(".modal-body #vendName").text(self.company());
					});

					duplicateMod.one('click', "[data-dismiss='modal']", function (e) {
						$('#modDuplicateWarning').modal('hide');
					});

					duplicateMod.one('click', '#proceedWithDuplicate', function (e) {
						duplicateMod.modal('hide');
						//if confirmed create invoice and attach
						uploadORupdate("update");
					});
				}
				else {
					uploadORupdate("update");
				}
			}
		};
		self.removeChosenFileUpload = function (document) {
			self.documents.remove(document);
		};

		//crossdoc constructor
		if (crossDoc) {
			if (browserName == "IE" || browserName == "Edge" || browserName == 'Safari') {
				var f = new Blob([""], { type: "text/plain" });
				f.name = ""
				f.lastModifiedDate = new Date();
			}
			else {
				var f = new File([""], "");
			}
			self.location(crossDoc.location);
			if (crossDoc.POList != null) {
				self.POList(crossDoc.POList);
			}
			if (crossDoc.invoiceNum != null) {
				self.invoiceNum(crossDoc.invoiceNum);
			}
			if (crossDoc.company != null) {
				self.company(crossDoc.company);
			}
			if (crossDoc.total != null) {
				self.total(crossDoc.total);
			}
			if (crossDoc.invoiceDate != null) {
				self.invoiceDate(crossDoc.invoiceDate);
			}
			var doc = new documentItem(f);
			doc.docName(crossDoc.docName);
			doc.location = self.location;
			doc.POList = self.POList;
			doc.invoiceNum = self.invoiceNum;
			doc.company = self.company;
			doc.total = self.total;
			doc.docType({ "@rowid": crossDoc.invoiceDocTypeId, "TypeName": ko.observable(crossDoc.typeName), "InvoiceDocTypeId": crossDoc.invoiceDocTypeId });
			doc.recordId = crossDoc.recordId;
			doc.docId = crossDoc.docId;
			doc.contentType = crossDoc.contentType;
			doc.pageCount = crossDoc.pageCount;
			doc.invoiceDate = self.invoiceDate;
			doc.sbVendId = crossDoc.sbVendId;
			doc.vendId = crossDoc.vendId;
			self.documents.push(doc);
			self.alertInvalidLocation(false);
			self.validLocation = getValidLocation(self.location());
			if (!self.alertInvalidLocation()) {
				var orgId = self.validLocation.LocationId;
				loadManualInvoiceVendors(orgId, function () {
					var vendor = self.manualInvoiceVendors().filter(function (vend) {
						return self.company() == vend.Company;
					})[0];
					if (vendor) {
						self.setVendor(vendor);
					}
				});
			}
//			console.log(ko.toJS(doc));
		};
	};
	/****** private variables ******/
	var filePreviewWidth = window.innerWidth - 125;

	/****** private functions ******/
	var filterObservableArray = function (filter, observArr) {
		var searchFilter = filter().toLowerCase();
		searchFilter = searchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchFilter.length < 3) {
			var r = observArr();
			return r;
		}
		else {
			return ko.utils.arrayFilter(observArr(), function (item) {
				var words = searchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					var matchArray = [];
					for (var property in item) {
						if (typeof item[property] != 'undefined' && item[property] != null) {
							matchArray.push(item[property].toString().toLowerCase().match(re) != null);
						}
					}
					if (matchArray.indexOf(true) === -1) {
						found = false;
					}
				}
				return found;
			});
		}
	};



	//controller functions
	var loadInvoiceDocumentList = function (fromDate, toDate, invId, orgIds, callback) {
		var params = {};
		params.FromDate = fromDate;//'2016-01-01';		
		params.ToDate = toDate;//'2018-01-01';			
		params.InvoiceId = invId;
		params.orgList = orgIds;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.LoadInvoiceDocumentList", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback([]);
				windowResized();
				return;
			}

			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			var obj = JSON.parse(response.d).result.row;

			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new crossDocItem(it)) })
			}
			else {
				arr.push(new crossDocItem(obj))
			}
			if (callback) callback(arr);
		});
	};

	//function fileRetrieve(fileId, pageCount, fileName, contentType, callback) {
	//	var data = "fileid=" + fileId + "&sessionid=" + fnc.app.sessionId + "&appid=" + fnc.appid + "&pagenumber=" + pageCount;
	//	var oReq = new XMLHttpRequest();
	//	oReq.open("POST", servicesHost + "/ChefMod.Financials.UI.Services/Download.aspx", true);
	//	oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	//	oReq.responseType = "blob";
	//	oReq.onload = function (oEvent) {
	//		var response = oReq.response;
	//		//  console.log(oReq.getAllResponseHeaders());
	//		if (contentType.toLowerCase() == 'pdf') {
	//			var blob = new Blob([response], { type: 'application/pdf' });
	//		}
	//		else {
	//			var blob = response;
	//		}
	//		var fn = fileName + "." + contentType;
	//		if (callback) callback(blob, fn);
	//	};
	//	oReq.send(data);
	//}


	//function loadDocumentTypes() {
	//	var params = {};
	//	loading(true);
	//	ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.LoadInvoiceDocumentType", params, function (response) {
	//		loading(false);
	//		if (response.d == '') {
	//			if (callback) callback([]);
	//			windowResized();
	//			return;
	//		}

	//		var r = eval('(' + response.d + ')');
	//		if (r.result == 'error') {
	//			windowResized();
	//			return;
	//		}
	//		var obj = JSON.parse(response.d).result.row;
	//		if (obj[0]) {
	//			self.documentTypes(obj);
	//		}
	//		else {
	//			self.documentTypes(obj);
	//		}
	//	});
	//}

	function deleteInvoiceDocument(recordId, docId, callback) {
		var params = {};
		params.RecordId = recordId;
		params.DocId = docId;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.DeleteInvoiceDocument", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback([]);
				windowResized();
				return;
			}

			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	}

	function deleteFile(fileId, callback) {
		var params = {};
		params.FileId = fileId;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.FileManager.DeleteFile", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback([]);
				windowResized();
				return;
			}

			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	}

	//******************
	// public 
	//******************
	
	/**********public variables******/
	var self = this;
	self.previewer = ko.observable(new Previewer('modCrossDocPreview', { previewHeight: filePreviewHeight, previewWidth: filePreviewWidth }));
	self.isWindowed = ko.observable(false);
	self.pageNumber = ko.observable(0);
	//table
	self.allItems = ko.observableArray();
	self.init = function (callback) {
		//   PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
		self.showInvoiceDocumentList();
		loadDocumentTypes(function (docTypes) {
			self.documentTypes(docTypes);
		});
		if (callback) callback();
	};

	self.listHeaders = [
			{ title: 'COMPANY', sortPropertyName: 'company', asc: ko.observable(true) },
			{ title: 'LOCATION', sortPropertyName: 'location', asc: ko.observable(true) },
			{ title: "PO(s)", sortPropertyName: 'POList', asc: ko.observable(true) },
			{ title: "INVOICE #", sortPropertyName: 'invoiceNum', asc: ko.observable(true) },
			{ title: 'NAME', sortPropertyName: 'docName', asc: ko.observable(true) },
			{ title: 'DOC TYPE', sortPropertyName: 'typeName', asc: ko.observable(true) },
			{ title: 'PAGE CT', sortPropertyName: 'pageCount', asc: ko.observable(true) },
			{ title: 'TOTAL', sortPropertyName: 'total', asc: ko.observable(false) },
			{ title: 'UPLOADED BY', sortPropertyName: 'uploadBy', asc: ko.observable(true) },
			{ title: 'UPLOAD D/T', sortPropertyName: 'uploadDT', asc: ko.observable(false) },
			{ title: 'ACTION', sortPropertyName: '', asc: ko.observable(true) }
	];

	self.activeSort = ko.observable(self.listHeaders[9]);
	self.searchFilterKeyWords = ko.observable('');

	self.filteredItems = ko.computed(function () {
		self.pageNumber(0);
		delta = 0;
		var r = self.allItems();

		if (self.searchFilterKeyWords().length > 0) {
			var listSearchFilter = self.searchFilterKeyWords().toLowerCase();
			listSearchFilter = listSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(self.allItems(), function (item) {
				var words = listSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					var matchArray = [];
					for (var property in item) {
						if (typeof item[property] != 'undefined' && item[property] != null) {
							matchArray.push(item[property].toString().toLowerCase().match(re) != null);
						}
					}
					if (matchArray.indexOf(true) == -1) {
						found = false;
					}
				}
				return found;
			});
		}
		return r;
	}, self);

	//pagination
	var pageSize = 60;
	self.nbPerPage = ko.observable(pageSize);
	var delta = 0;
	self.totalPagesHolder = ko.observableArray();
	self.totalPages = ko.computed(function () {
		var div = Math.floor(self.filteredItems().length / self.nbPerPage());
		div += self.filteredItems().length % self.nbPerPage() > 0 ? 1 : 0;

		var pages = div - 1;
		self.totalPagesHolder.removeAll();
		for (var i = 0; i < pages + 1; i++) {
			self.totalPagesHolder.push(i + 1);
		}

		return div - 1;
	});

	self.pageController = function (targetPage) {
		if (targetPage === 1) {
			delta = 0;
		}
		self.pageNumber(targetPage - 1);
		$('div#tblCrossDocListBody').scrollTop(1);
	};

	self.hasPrevious = ko.computed(function () {
		return self.pageNumber() !== 0;
	});

	self.hasNext = ko.computed(function () {
		return self.pageNumber() !== self.totalPages();
	});

	self.next = function () {
		if (self.pageNumber() < self.totalPages()) {
			self.pageNumber(self.pageNumber() + 1);
			$('div#tblCrossDocListBody').scrollTop(1);
		}
	};
	self.previous = function () {
		if (self.pageNumber() != 0) {
			if (self.pageNumber() - 1 === 0) {
				delta = 0;
			}
			self.pageNumber(self.pageNumber() - 1);
			$('div#tblCrossDocListBody').scrollTop(1);
		}
	};
	
	self.paginated = ko.computed(function () {
		var first = self.pageNumber() * pageSize;
		var r = self.filteredItems().slice(first - delta, first + pageSize);
		return r;
	});
	self.scrollHandle = function (d, e) {
		var element = e.currentTarget;
		if ((element.scrollHeight - element.offsetHeight) - element.scrollTop  < 1) {//bottom
			if (self.pageNumber() < self.totalPages()) {
				delta = 1;
				setTimeout(function () {
					self.next();
					$('div#' + element.id).scrollTop(1);
				}, 100)
			}
		}
		else if (element.scrollTop === 0) {//top
			if (self.pageNumber() - 1 === 0) {
				delta = 0;
			}
			if (self.pageNumber() !== 0) {
				setTimeout(function () {
					self.previous();
					$('div#' + element.id).scrollTop(element.scrollHeight - element.offsetHeight - 1);
				}, 100);
			}
		}
	};

	//location filter
	self.Selected = ko.observable(false);

	//editing or deleting
	self.chosenCrossDoc = ko.observable(new crossDocItem());
	self.chosenCrossDocBatch = ko.observable(new uploadBatch());

	//uploading
	self.uploadQueue = ko.observableArray();
	self.uploadQueue.push(new uploadBatch());

	self.allUploadAble = ko.computed(function () {
		for (var i = 0; i < self.uploadQueue().length; i++) {
			if (!self.uploadQueue()[i].isUploadable()) return false;
		}
		return true;
	}, self);
	self.allEmpty = ko.computed(function () {
		if (self.uploadQueue().length === 0) return true;
		for (var i = 0; i < self.uploadQueue().length; i++) {
			if (self.uploadQueue()[i].documents().length !== 0) return false;
		}
		return true;
	})
	self.allUploaded = ko.computed(function () {
		if (self.uploadQueue().length === 0) return false;
		for (var i = 0; i < self.uploadQueue().length; i++) {
			if (self.uploadQueue()[i].documents().length === 0 || !self.uploadQueue()[i].isUploaded()) return false;
		}
		return true;
	}, self);

	self.allUploaded.subscribe(function (newValue) {
		if (newValue) {
			$('#modCrossDocUpload').modal('hide');
			$('#modUploadComplete').modal('show');
		}
	});

	self.uploadBatchNumber = ko.observable(0);
	self.fileOver = ko.observable(false);
	self.documentTypes = ko.observableArray();

	self.currentUploadBatch = ko.computed(function () {
		return self.uploadQueue()[self.uploadBatchNumber()];
	}, self);
	self.currentUploadBatch.subscribe(function () {
		computeDropZoneHeight();
	});

	/******public functions******/
	self.openWindowed = function () {
		if (!self.isWindowed()) {
			var size = "height=" + screen.availHeight + ",width=" + screen.availWidth + ",resizable=yes";
			var win = window.open("windowCrossDoc.html", "CrossDoc", size);
			if (win == null) {//window blocked by blocker
				//ask to enable pop-ups on page
				$('#modPopUpError').modal('show');
			}
		}
	};


	//upload dialog functions
	self.uploadAllBatches = function () {
		[].forEach.call(self.uploadQueue(), function (page) {
			page.beginUpload();
		});
	};

	self.onDragOver = function (data, event) {
		self.fileOver(true);
	};

	self.onDragLeave = function (data, event) {
		self.fileOver(false);
	};

	self.onDrop = function (data, event) {
		var files = event.originalEvent.dataTransfer.files;
		self.currentUploadBatch().attachUploadFiles(files);
		self.onDragLeave();
	};

	self.addUploadBatch = function () {
		var batch = new uploadBatch();
		if (fnc.app.singleLocation()) {
			batch.location(fnc.app.filterAvailableLocations()[0].LocationName);
		}
		self.uploadQueue.push(batch);
		self.uploadBatchNumber(self.uploadQueue().length - 1);
	};

	self.removeUploadBatch = function () {
		if (self.uploadQueue().length == 1) {
			self.uploadQueue.replace(self.uploadQueue()[0], new uploadBatch())
		}
		else {
			if (self.uploadBatchNumber() != self.uploadQueue().length - 1) {
				self.uploadQueue.splice(self.uploadBatchNumber(), 1);
			}
			else {
				self.uploadBatchNumber(self.uploadBatchNumber() - 1);
				self.uploadQueue.splice(self.uploadBatchNumber() + 1, 1);
			}
		}
	};

	self.clearUploadQueue = function () {
		var stop = self.uploadQueue().length;
		for (var i = 0; i < stop; i++) {
			self.removeUploadBatch();
		}
		fnc.crossDocApp.showInvoiceDocumentList();
	};

	self.showConfirmClear = function () {
		$('#modCrossDocConfirmClear').modal({ backdrop: 'static', keyboard: false });
	};

	self.uploadBatchController = function (data, event) {
		var ctx = ko.contextFor(event.target);
		return self.uploadBatchNumber(ctx.$index());
	};

	self.uploadHasPrevious = ko.computed(function () {
		return self.uploadBatchNumber() !== 0;
	});

	self.uploadHasNext = ko.computed(function () {
		return self.uploadBatchNumber() < self.uploadQueue().length - 1;
	});

	self.uploadNext = function () {
		if (self.uploadBatchNumber() < self.uploadQueue().length - 1) {
			self.uploadBatchNumber(self.uploadBatchNumber() + 1);
		}
	};

	self.uploadPrevious = function () {
		if (self.uploadBatchNumber() != 0) {
			self.uploadBatchNumber(self.uploadBatchNumber() - 1);
		}
	};

	//table functions
	self.refreshInvoiceDocumentList = function (d,e) {
		self.showInvoiceDocumentList();
	}
	self.showInvoiceDocumentList = function (locationId) {
		self.previewer().clear();
		self.allItems.removeAll();

		//allow for inclusion of another location in document list if it's not already checked
		if (locationId) {
			for (var i = 0; i < fnc.app.filterAvailableLocations().length; i++) {
				var location = fnc.app.filterAvailableLocations()[i];
				if (location.LocationId === locationId) {
					location.Selected(true);
				}
			}
		}
		var locations = fnc.app.filterSelectedLocations().length !== 0 ? fnc.app.filterSelectedLocations().toString() : fnc.app.filterAvailableLocations().map(function (item) {
			return item.LocationId;
		}).toString();
		loadInvoiceDocumentList(fnc.app.filterDateFrom(), fnc.app.filterDateTo(), 0, locations, function (r) {
			self.allItems(r);
			var headers = $("[id=crossDoc_list]");//make sure everything is sorted correctly
			for (var i = 0; i < headers.length; i++) {
				if (headers[i].innerHTML == self.activeSort().title) {
					headers[i].click();
					headers[i].click();
				}
			}
			return true;
		});
	};

	self.showRemoveCrossDoc = function (item) {
		self.chosenCrossDoc(item);
		$('#modCrossDocConfirmDelete').modal('show');
	};

	self.removeChosenCrossDoc = function () {
		deleteInvoiceDocument(self.chosenCrossDoc().recordId, self.chosenCrossDoc().docId, function () {
			deleteFile(self.chosenCrossDoc().docId, function () {
				self.allItems.remove(self.chosenCrossDoc());
			})
		});
	};

	self.showEditCrossDoc = function (item) {
		self.chosenCrossDocBatch(new uploadBatch(item));
		var currentItem = 0;
		var menuItems = [];
		var id = "";
		$('#modCrossDocEdit').modal('show').one('shown.bs.modal', function () {
			//set up event handling for drop downs
			$('.input-dropdown').on('keydown', function (e) {
				if (e.which === 40) {//down key
					if (e.target.parentElement.className.indexOf('open') === -1 && e.target.parentElement.parentElement.className.indexOf('open') === -1) {
						e.target.click();//open dropdown if it's not open
					}
					id = e.target.id;
					menuItems = $('ul.dropdown-menu-fixed[aria-labelledby="' + id + '"] > li > ul > li');
					console.log(menuItems);
					menuItems[0].focus();
					currentItem = 0;
				}
				else if(e.which === 27){
					//close dropdown on escape
					$('[data-toggle="dropdown"]').parent().removeClass('open');
				}
			});
			$('ul.dropdown-menu-fixed > li > ul').on('keydown', function (e) {
				console.log(e.which);
				if (e.which === 40) {//down key
					e.preventDefault();
					if (currentItem < menuItems.length - 1) {
						currentItem++;
					}
					menuItems[currentItem].focus();
				}
				else if (e.which === 38) {//up key
					if (currentItem > 0) {
						currentItem--;
					}
					menuItems[currentItem].focus();
				}
				else if (e.which === 27) {//escape key
					//close drop down on escape
					$('[data-toggle="dropdown"]').parent().removeClass('open');
				}
				else if (e.which === 13) {//enter key
					console.log(id);
					if (id === "vendorInputEdit") {
						self.chosenCrossDocBatch().setVendor(self.chosenCrossDocBatch().filteredVendors()[currentItem]);
					}
					else if (id === "locationInputEdit") {
						self.chosenCrossDocBatch().setLocation(self.chosenCrossDocBatch().filteredLocations()[currentItem]);
					}
					else if (id === "searchExistingInputEdit") {
						self.chosenCrossDocBatch().setInvoice(self.chosenCrossDocBatch().filteredInvoices()[currentItem]);
					}
					$('[data-toggle="dropdown"]').parent().removeClass('open');
				}
				else {
					currentItem = 0;
				}
			})
		}).one('hidden.bs.modal', function () {
			//clear event handlers when modal is closed
			$('.input-dropdown').off('keydown');
			$('ul.dropdown-menu-fixed > li > ul').off('keydown');
		});
	};

	self.showPreviewCrossDoc = function (doc) {
		loading(true);
		self.chosenCrossDoc(doc);
		var id = doc.docId !== '' ? doc.docId : doc.docName();
		var name = typeof doc.docName === "function" ? doc.docName() : doc.docName;
		if (typeof doc.file == "undefined") {//check for cached file
			fnc.fileRetrieve(doc.docId, 0, doc.docName, doc.contentType, function (blob) {
				doc.file = blob;//cache the file to avoid server calls
				self.previewer().preview(name, id, doc.file, doc.contentType, function () {
					loading(false);
				});
			});
		}
		else {
			self.previewer().preview(name, id, doc.file, doc.contentType, function () {
				loading(false);
			});
		}
	};

	self.showUploads = function () {
		if (fnc.app.singleLocation()) {
			self.currentUploadBatch().location(fnc.app.filterAvailableLocations()[0].LocationName);
		}
		$('#modCrossDocUpload').modal({ backdrop: 'static', keyboard: false }).one('shown.bs.modal', function () {
			computeDropZoneHeight();
			var currentItem = 0;
			var menuItems = [];
			var id = "";
			//set up event handling for drop downs
			$('.input-dropdown').on('keydown', function (e) {
				if (e.which === 40) {//down key
					if (e.target.parentElement.className.indexOf('open') === -1 && e.target.parentElement.parentElement.className.indexOf('open') === -1) {
						e.target.click();//open dropdown if it's not open
					}
					id = e.target.id;
					menuItems = $('ul.dropdown-menu-fixed[aria-labelledby="' + id + '"] > li > ul > li');
					menuItems[0].focus();
					currentItem = 0;
				}
				else if(e.which === 27){
					//close dropdown on escape
					$('[data-toggle="dropdown"]').parent().removeClass('open');
				}
			});
			$('ul.dropdown-menu-fixed > li > ul').on('keydown', function (e) {
				if (e.which === 40) {//down key
					e.preventDefault();
					if (currentItem < menuItems.length - 1) {
						currentItem++;
					}
					menuItems[currentItem].focus();
				}
				else if (e.which === 38) {//up key
					if (currentItem > 0) {
						currentItem--;
					}
					menuItems[currentItem].focus();
				}
				else if (e.which === 27) {//escape key
					//close drop down on escape
					$('[data-toggle="dropdown"]').parent().removeClass('open');
				}
				else if (e.which === 13) {//enter key
					if (id === "vendorInputUpload") {
						self.currentUploadBatch().setVendor(self.currentUploadBatch().filteredVendors()[currentItem]);
					}
					else if (id === "locationInputUpload") {
						self.currentUploadBatch().setLocation(self.currentUploadBatch().filteredLocations()[currentItem]);
					}
					else if (id === "searchExistingInputUpload") {
						self.currentUploadBatch().setInvoice(self.currentUploadBatch().filteredInvoices()[currentItem]);
					}
					$('[data-toggle="dropdown"]').parent().removeClass('open');
				}
				else {
					currentItem = 0;
				}
			})
		}).one('hidden.bs.modal', function () {
			//clear event handlers when modal is closed
			$('.input-dropdown').off('keydown');
			$('ul.dropdown-menu-fixed > li > ul').off('keydown');
			if (self.allUploaded()) self.clearUploadQueue();//clear upload queue when modal is closed
		});
	};
	self.stopPropagation = function (d, e) {
		e.stopPropagation();
	};
	//recalculating file display/dropzone height on state changes
	function computeDropZoneHeight() {
		//allow for dom to update before checking
		setTimeout(function () {
			var bodyHeight = $('div#modCrossDocUpload div.modal-body').height();
			var inputsHeight = $('div#uploadInputs').outerHeight();
			self.currentUploadBatch().dropZoneHeight(bodyHeight - inputsHeight + "px");
		}, 0);
	};
	//
};