	/// <reference path="polist.js" />
	/// <reference path="invoices.js" />
	/// <reference path="legacy.js" />
	/// <reference path="vendors.js" />
	/// <reference path="einvoices.js" />
	/// <reference path="calendar.js" />
	/// <reference path="setup.js" />
	/// <reference path="weather.js" />
	/// <reference path="crossDoc.js" />

	//overwrites
	//Number.prototype.toFixed = function (precision) {
	//	var power = Math.pow(10, precision || 0);
	//	return String(Math.round(this * power) / power);
	//}

	String.prototype.escapeSpecialChars = function () {
		return this.replace(/\\n/g, "\\n")
			.replace(/\\'/g, "\\'")
			.replace(/\\"/g, '\\"')
			.replace(/\\&/g, "\\&")
			.replace(/\\r/g, "\\r")
			.replace(/\\t/g, "\\t")
			.replace(/\\b/g, "\\b")
			.replace(/\\f/g, "\\f");
	};

	var fnc;
	fnc = fnc || {};

	//lookups
	fnc.usaStateList = [
		{ name: 'ALABAMA', abbreviation: 'AL' },
		{ name: 'ALASKA', abbreviation: 'AK' },
		{ name: 'AMERICAN SAMOA', abbreviation: 'AS' },
		{ name: 'ARIZONA', abbreviation: 'AZ' },
		{ name: 'ARKANSAS', abbreviation: 'AR' },
		{ name: 'CALIFORNIA', abbreviation: 'CA' },
		{ name: 'COLORADO', abbreviation: 'CO' },
		{ name: 'CONNECTICUT', abbreviation: 'CT' },
		{ name: 'DELAWARE', abbreviation: 'DE' },
		{ name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC' },
		{ name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM' },
		{ name: 'FLORIDA', abbreviation: 'FL' },
		{ name: 'GEORGIA', abbreviation: 'GA' },
		{ name: 'GUAM', abbreviation: 'GU' },
		{ name: 'HAWAII', abbreviation: 'HI' },
		{ name: 'IDAHO', abbreviation: 'ID' },
		{ name: 'ILLINOIS', abbreviation: 'IL' },
		{ name: 'INDIANA', abbreviation: 'IN' },
		{ name: 'IOWA', abbreviation: 'IA' },
		{ name: 'KANSAS', abbreviation: 'KS' },
		{ name: 'KENTUCKY', abbreviation: 'KY' },
		{ name: 'LOUISIANA', abbreviation: 'LA' },
		{ name: 'MAINE', abbreviation: 'ME' },
		{ name: 'MARSHALL ISLANDS', abbreviation: 'MH' },
		{ name: 'MARYLAND', abbreviation: 'MD' },
		{ name: 'MASSACHUSETTS', abbreviation: 'MA' },
		{ name: 'MICHIGAN', abbreviation: 'MI' },
		{ name: 'MINNESOTA', abbreviation: 'MN' },
		{ name: 'MISSISSIPPI', abbreviation: 'MS' },
		{ name: 'MISSOURI', abbreviation: 'MO' },
		{ name: 'MONTANA', abbreviation: 'MT' },
		{ name: 'NEBRASKA', abbreviation: 'NE' },
		{ name: 'NEVADA', abbreviation: 'NV' },
		{ name: 'NEW HAMPSHIRE', abbreviation: 'NH' },
		{ name: 'NEW JERSEY', abbreviation: 'NJ' },
		{ name: 'NEW MEXICO', abbreviation: 'NM' },
		{ name: 'NEW YORK', abbreviation: 'NY' },
		{ name: 'NORTH CAROLINA', abbreviation: 'NC' },
		{ name: 'NORTH DAKOTA', abbreviation: 'ND' },
		{ name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP' },
		{ name: 'OHIO', abbreviation: 'OH' },
		{ name: 'OKLAHOMA', abbreviation: 'OK' },
		{ name: 'OREGON', abbreviation: 'OR' },
		{ name: 'PALAU', abbreviation: 'PW' },
		{ name: 'PENNSYLVANIA', abbreviation: 'PA' },
		{ name: 'PUERTO RICO', abbreviation: 'PR' },
		{ name: 'RHODE ISLAND', abbreviation: 'RI' },
		{ name: 'SOUTH CAROLINA', abbreviation: 'SC' },
		{ name: 'SOUTH DAKOTA', abbreviation: 'SD' },
		{ name: 'TENNESSEE', abbreviation: 'TN' },
		{ name: 'TEXAS', abbreviation: 'TX' },
		{ name: 'UTAH', abbreviation: 'UT' },
		{ name: 'VERMONT', abbreviation: 'VT' },
		{ name: 'VIRGIN ISLANDS', abbreviation: 'VI' },
		{ name: 'VIRGINIA', abbreviation: 'VA' },
		{ name: 'WASHINGTON', abbreviation: 'WA' },
		{ name: 'WEST VIRGINIA', abbreviation: 'WV' },
		{ name: 'WISCONSIN', abbreviation: 'WI' },
		{ name: 'WYOMING', abbreviation: 'WY' }
	];

	//
	fnc.intuitURL;
	//
	fnc.invoiceUnlockInterval = 10000;
	fnc.invoiceUnlockTimer;
	//
	fnc.salesFormUnlockInterval = 10000;
	fnc.salesFormUnlockTimer;

	var w_href = window.location.href;
	fnc.appid = '88A16020-BE57-4EE4-9FB7-5B028E4A2D1C';
	var chartPrefix = 'COA';

	//prod
	//var servicesHost = "https://www.chefmod.com";
	//var ajaxURL = "https://www.chefmod.com/ChefMod.Financials.UI.Services/HostPage.aspx/ExecAppMethod";

	//test
	//var servicesHost = "http://test.chefmod.com";
	//var ajaxURL = "http://test.chefmod.com/ChefMod.Financials.UI.Services/HostPage.aspx/ExecAppMethod";

	//dev
	var servicesHost = "http://testweb.chefmod.com/tst";
	var ajaxURL = "http://testweb.chefmod.com/tst/ChefMod.Financials.UI.Services/HostPage.aspx/ExecAppMethod";

	// Environment variables
	var scrollBarWidth = 17;
	var minWidthSection0 = 800;
	var minWidthSection1 = 1000;
	var minWidthSection2 = 1000;
	var maxResizableWidth = 1450;	//1500
	var minResizableWidth = 1288;
	var deltaWidth = 136;

	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;
	var screenAvailWidth = window.screen.availWidth;
	var screenAvailHeight = window.screen.availHeight < 850 ? 850 : window.screen.availHeight;		// + 70;
	var poListTableHeight = screenAvailHeight - 554;	//524;	//494;
	var poListLocationHeight = screenAvailHeight - 630; //575;	//610;
	var poListVendorHeight = screenAvailHeight - 666;
	var poListSectionHeigh = screenAvailHeight - 354;

	var calendarLocationHeight = screenAvailHeight - 354;

	var legacyListTableHeight = screenAvailHeight - 415;	//387;
	var legacyListLocationHeight = screenAvailHeight - 600; //564;	//610;
	var legacyListVendorHeight = screenAvailHeight - 448;

	var vendorsAppHeight = screenAvailHeight - 340;			 //330;
	var vendorsTableHeight = screenAvailHeight - 480;		//460;

	var qbSetupTableHeight = screenAvailHeight - 480;		 //480
	var qbSetupLocationTableHeight = screenAvailHeight - 544;
	var qbSetupVendorTableHeight = screenAvailHeight - 522;
	var qbSetupAccountTableHeight = screenAvailHeight - 522;

	var eInvoicesListTableHeight = screenAvailHeight - 495;	//465;
	var eInvoiceItemsTableHeight = screenAvailHeight - 565;

	var appWidht = screenAvailWidth - 115;
	var appHeight = 700;	//screenAvailHeight - 250;
	var invoicesPageHeight = screenAvailHeight - 300;
	var tabNavHeight = null;
	var tabPaneHeight = null;

	var reconcileTableWidth = ko.observable(appWidht - 100);
	var reconcileTableCaptionHeight = null;
	var reconcileTableHeaderHeight = null;
	var reconcileTableBodyHeight = screenAvailHeight - 500;		//527;
	var reconcileTableColumnItemWidth = null;
	var reconcileTableColumnGLWidth = 0;

	var salesListTableHeight = screenAvailHeight - 411;
	var salesListLocationHeight = screenAvailHeight - 527;
	var salesListRighSideBarHeight = screenAvailHeight - 354;

	var crossDocListTableHeight = screenAvailHeight - 480;
	var crossDocListLocationHeight = screenAvailHeight - 550;

	//pdf preview
	//var minimumPreviewWidth = 200;
	var filePreviewHeight = appHeight - 160;
	var filePreviewWidth = window.innerWidth - 332;

	var windowWidth = ko.observable();
	var $window = $(window);
	$window.resize(function () {
		windowWidth(Math.floor($window.width() * 0.95));
	});

	// Default variables
	var csvInvoiceExportFileName = 'InvoiceExport.csv';
	var iifInvoiceExportFileName = '';			//'InvoiceExport.iif';

	var csvSalesExportFileName = 'SalesExport.csv';


	var invoiceItemsSearchDelay = 500;
	var GLItemsSearchDelay = 1000;
	
	var defaultDateText = 'Last 30 Days';
	var defaultDateNumber = 30;
	
	var strFormat = 'mm/dd/yyyy';
	
	var browserName = get_browser_name_cm();	

	
	//var defaultDate;
	//defaultDate = (new Date());

	//pdf preview
	//var previewWidth = ko.observable(window.innerWidth - 100);
	
	//var minimumPreviewWidth = 200;

	//uploads
	var maxUploadFileSize = 2500000;
	//blocking variables for loading and resizing
	var blockLoading = false;
	var blockResize = false;


	var emptyDataHtml = '<h6 style="text-align:center;">NO DATA</h6>';
	var massLocationChangeEvent = ko.observable(false);


	var navigationTabsFocusIn = function () {
		//fnc.itemListTab.closeSearch();
		//console.log('navigationTabsFocusIn');
	}


	/*	GLOBAL OBJECTS
	* ================================== */
	var errMessage = ko.observable('');

	fnc.locationItem = function (it) {
		var self = this;
		self.LocationId = it.locationId;
		self.LocationName = it.locationName;
		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (fnc == undefined) return;
			if (self.Selected()) {
				fnc.app.filterSelectedLocations.push(self.LocationId);
				fnc.app.clearLocationFilterVisible(true);
			} else {
				fnc.app.filterSelectedLocations.remove(self.LocationId);
				if (fnc.app.filterSelectedLocations().length == 0) {
					fnc.app.clearLocationFilterVisible(false);
					fnc.app.notSelectedLocationsHidden(false);
				}
			}
		})
	};

	fnc.EInvoiceItem = function () {
		var self = this;

		self.listSearchFilter = ko.observable('');

		self.invoiceAllItems = ko.observableArray();
		self.invoiceFilteredItems = ko.computed(function () {
			var listSearchFilter = self.listSearchFilter().toLowerCase();
			listSearchFilter = listSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (listSearchFilter.length < 3) {
				var r = self.invoiceAllItems();
				return r;
			} else {
				return ko.utils.arrayFilter(self.invoiceAllItems(), function (item) {
					var words = listSearchFilter.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.VendItemCode.toLowerCase().match(re) != null) || (item.Description.toLowerCase().match(re) != null) || (item.ItemId.toLowerCase().match(re) != null));
					}
					return found;
				});
			}

		}, self);

		self.includedPOList = ko.observableArray();
		self.accountNum = ko.observable('');
		self.selectedOrgId = ko.observable('');
		self.msg = ko.observable('');
		self.gross = ko.observable('');
		self.discount = ko.observable('');
		self.tax = ko.observable('');
		self.freight = ko.observable('');
		self.computedTotal = ko.observable('');
		self.computedNet = ko.observable('');

		self.lineTotal = ko.observable('');
		self.depositOrCredit = ko.observable('');
		self.discountComputed = ko.observable('');

		self.locationName = ko.observable('');
		self.vendor = ko.observable('');
		self.invoiceNumber = ko.observable('');
		self.invoiceDate = ko.observable('');

	}

	//<attachments>
	fnc.AttachmentsClass = function (orgId, orgName, invId, invNum, invTotal, invDate, poList, vendId, sbVendId, company, attachedDocs, availableDocs) {
		//private
		var uploadPage = function () {
			var self = this;
			self.documents = ko.observableArray();
			self.location = ko.observable('');//fnc.app.filterAvailableLocations().length == 1 ? ko.observable('') : ko.observable(fnc.app.filterAvailableLocations()[0].LocationName);
			self.POList = ko.observable('');
			self.invoiceNum = ko.observable('');
			self.company = ko.observable('');
			self.total = ko.observable('');
			self.manualInvoiceVendors = ko.observableArray();

		};

		var documentItem = function (file) {
			var self = this;
			self.isUploaded = ko.observable(false);
			self.uploadFailed = ko.observable(false);
			self.location = ko.observable('');
			self.POList = ko.observable('');
			self.invoiceNum = ko.observable('');
			self.company = ko.observable('');
			self.vendId = ko.observable(0);
			self.sbVendId = ko.observable(0);
			self.total = ko.observable(0);
			self.file = ko.observable(file);
			self.docURL = ko.observable('');
			self.docType = ko.observable('');
			self.fileId = ko.observable('');
			//naming
			self.docName = file && file.name ? ko.observable(file.name.replace(/\.[^/.]+$/, "")) : ko.observable("");

			self.upload = function (callback) {
				var action = '';
				var blobContainer = 'invoice';
				var contentType = self.file().name.substr(self.file().name.lastIndexOf('.') + 1);		//self.file().type.split('/')[1];		//'txt';
				var docName = self.docName();
				var fileType = 'invoice';
				var company = ''//self.company();
				var vendId = ''//self.sbVendId();
				var sbVendId = ''//self.vendId();
				var accNum = ''//0;
				var invNum = ''//self.invoiceNum();
				var orgName = ''//self.location();
				var state = 'raw';
				updateFileMetadata(action, blobContainer, contentType, docName, fileType, company, vendId, sbVendId, accNum, invNum, orgName, state, function (r) {
					self.fileId(r);
					if (self.fileId() != '') {
						var fileId = self.fileId();
						var pageNumber = 1;
						var appId = fnc.appid;
						var sessionId = fnc.app.sessionId;
						var file = self.file();
						uploadAndUpdateFilePageMetadata(file, fileId, pageNumber, appId, sessionId, function () {
							//	console.log('file has been uploaded');
							var action = 'none';
							finishFileUpload(fileId, action, function () {
								//console.log('upload finished');
								var orgId = Number(fnc.app.attachmentsObject().OrgId);
								var vendId = Number(fnc.app.attachmentsObject().VendId);
								var sbVendId = 0;
								var company = fnc.app.attachmentsObject().Company;
								var invId = Number(fnc.app.attachmentsObject().InvId);
								var invNum = fnc.app.attachmentsObject().InvNum;
								var poList = fnc.app.attachmentsObject().poList;
								var total = fnc.app.attachmentsObject().InvTotal;
								//1-invoice; 2-image; 3-supporting doc;
								var docType = self.docType().InvoiceDocTypeId;
								var invoiceDate = fnc.app.attachmentsObject().InvDate;
								createInvoiceDocument(fileId, docType, docName, pageNumber, orgId, vendId, sbVendId, company, invId, invNum, poList, total, contentType, invoiceDate, function (r) {
									//		console.log(r);
									self.uploadFailed(false);
									self.isUploaded(true);
									if (callback) callback();
								}, function () {
									self.uploadFailed(true);
								});
							});
						});
					}
				})

			}
		};

		//
		var self = this;
		self.OrgId = orgId;
		self.OrgName = orgName;

		self.InvId = invId;
		self.InvNum = invNum;
		self.InvTotal = invTotal;
		self.InvDate = invDate;

		self.poList = poList;

		self.VendId = vendId;
		self.sbVendId = sbVendId;
		self.Company = company;

		self.AttachedDocs = attachedDocs;
		self.availableDocs = availableDocs;

		self.uploadDateFrom = ko.observable('');
		self.uploadDateTo = ko.observable('');

		self.filterAvailableDateRanges = ko.observableArray(['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 60 Days', 'Last 90 Days', 'Last 6 Months', 'Last 12 Months']);
		self.filterDateRange = ko.observable('Last 30 Days');
		self.filterDateRange.subscribe(function () {
			//console.log(self.filterDateRange());
			var newValue = self.filterDateRange();
			var fromDate = ''
			var toDate = getTodayString();

			switch (newValue) {
				case 'Last 7 Days':
					fromDate = addDays2(toDate, -6);
					break;
				case 'Last 14 Days':
					fromDate = addDays2(toDate, -13);
					break;
				case 'Last 30 Days':
					fromDate = addDays2(toDate, -29);
					break;
				case 'Last 60 Days':
					fromDate = addDays2(toDate, -59);
					break;
				case 'Last 90 Days':
					fromDate = addDays2(toDate, -89);
					break;
				case 'Last 6 Months':
					fromDate = addDays2(toDate, -182);
					break;
				case 'Last 12 Months':
					fromDate = addDays2(toDate, -364);
					break;
				default:
					fromDate = addDays2(toDate, -29);
			}

			self.availableDocs.removeAll();
			fnc.loadInvoiceDocumentList(fromDate, toDate, 0, self.OrgId, function (r) {
				self.availableDocs(r);
			})
		}, self);

		self.searchDocsInput = ko.observable('');
		self.filteredDocs = ko.computed(function () {
			var searchDocsInput = self.searchDocsInput().toLowerCase();
			searchDocsInput = searchDocsInput.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (searchDocsInput.length < 3) {
				var r = self.availableDocs();
				return r;
			} else {
				return ko.utils.arrayFilter(self.availableDocs(), function (item) {
					var words = searchDocsInput.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.Company.toLowerCase().match(re) != null) || (item.DocName().toLowerCase().match(re) != null));
					}
					return found;
				});
			}

		}, self);

		//****************************************
		//uploading
		self.uploadQueue = ko.observableArray();
		self.uploadQueue.push(new uploadPage());
		self.uploadPageNumber = ko.observable(0);
		self.currentUploadBatch = ko.pureComputed(function () {
			return self.uploadQueue()[self.uploadPageNumber()];
		});
		self.fileOver = ko.observable(false);
		self.alertTooBig = ko.observable(false);
		self.documentTypes = ko.observableArray();

		self.onDragOver = function (data, event) {
			self.fileOver(true);
		};
		self.onDragLeave = function (data, event) {
			self.fileOver(false);
		};
		self.onDrop = function (data, event) {
			var files = event.originalEvent.dataTransfer.files;
			self.attachUploadFiles(files);
			self.onDragLeave();
		};
		self.attachUploadFiles = function (files) {
			if (files[0]) {
				[].forEach.call(files, function (file) {
					if (file.size > maxUploadFileSize) {
						if (file.type.indexOf("image") === 0) {
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
				$('#local-file-input')[0].value = '';
			}
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
						callback: function (urls, numPages) {
							loading(false);
							doc.docURL(urls[0]);
							if (self.alertTooBig()) {
								self.alertTooBig(false);
							}
							doc.pageCount = numPages;
							self.currentUploadBatch().documents.push(doc);
						},
						renderFirst: true
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
					self.currentUploadBatch().documents.push(doc);
				};
				reader.readAsDataURL(file);
			}
		};

		self.removeChosenFileUpload = function (document) {
			self.currentUploadBatch().documents.remove(document);
		};

		self.isAttachEnabled = ko.computed(function () {
			var r = false;
			var arr = self.availableDocs();
			if (arr.length > 0) {
				arr.forEach(function (it) {
					if (it.Selected()) {
						r = true;
					}
				});
			}
			return r;
		}, self);

		self.isUploadEnabled = ko.computed(function () {
			var r = false;
			var arr = self.uploadQueue()[0].documents();
			if (arr.length > 0) {
				r = true;
				arr.forEach(function (it) {
					if (it.docName() == '') {
						r = false;
					}
				});
			}
			return r;
		}, self);

		//****************************************

		self.previewDoc = function (d, e) {
			fnc.app.attachmentsObject().selectedDocument(d);

			var docName = d.DocName ? d.DocName() : d.docName();
			var fileId = d.DocId;
			var id = d.DocId ? d.DocId : docName;		//self.RecordId;
			var contentType = d.ContentType ? d.ContentType : d.contentType;

			loading(true);
			if (typeof d.file() == "undefined") {
				fnc.fileRetrieve(fileId, 0, docName, contentType, function (blob) {
					d.file(blob);//cache file to avoid server calls
					fnc.app.previewer().preview(docName, id, d.file(), contentType, function () {
						loading(false);
					});
				});
			}
			else {//avoid server calls if the file was already retrieved
				fnc.app.previewer().preview(docName, id, d.file(), contentType, function () {
					loading(false);
				});
			}

			$("#modPreview").on("hidden.bs.modal", function () {
				fnc.app.attachmentsObject().selectedDocument(null);
			})

		}

		self.attachSelected = function (d, e) {
			var arr = self.availableDocs();
			var invId = self.InvId;
			var orgId = self.OrgId;
			var i = 0;
			function f1(i) {
				var it = arr[i];
				if (it.Selected()) {
					//console.log(it);
					var recordId = it.RecordId;
					var docId = it.DocId;

					attachInvoiceDocument(recordId, docId, invId, function () {
						f2(i, function () {
							if (i == arr.length - 1) {
								//refresh
								fnc.app.attachedItems.removeAll();
								fnc.loadInvoiceDocumentList("", "", invId, orgId, function (r) {
									fnc.app.attachedItems(r);
									setTimeout(function () {
										//refresh available docs
										fnc.app.attachmentsObject().filterDateRange.valueHasMutated();
									}, 100);
									//fnc.app.attachmentsObject().filterDateRange.valueHasMutated();
								});
							} else {
								i++;
								setTimeout(function () { f1(i) }, 10);
							}
						});
					})
				} else {
					f2(i, function () {
						if (i == arr.length - 1) {
							//refresh
							fnc.app.attachedItems.removeAll();
							fnc.loadInvoiceDocumentList("", "", invId, orgId, function (r) {
								fnc.app.attachedItems(r);
								setTimeout(function () {
									//refresh available docs
									fnc.app.attachmentsObject().filterDateRange.valueHasMutated();
								}, 100);
								//fnc.app.attachmentsObject().filterDateRange.valueHasMutated();
							});
						} else {
							i++;
							setTimeout(function () { f1(i) }, 10);
						}
					});
				}
			};
			function f2(i, callback) {
				if (callback) callback();
			};
			f1(i);

		};

		self.uploadAll = function (d, e) {
			var arr = self.uploadQueue()[0].documents();
			var count = 0;
			for (var i = 0; i < arr.length; i++) {
				var doc = arr[i];
				doc.location(self.OrgName);
				doc.POList(self.poList);
				doc.invoiceNum(self.InvNum);
				doc.company(self.Company);
				doc.vendId(self.VendId);
				doc.sbVendId(self.sbVendId);
				doc.total(self.InvTotal);
				doc.upload(function () {
					count++;
					//console.log(ko.toJSON(doc, null, 2));
					//the last doc
					if (count == arr.length) {
						self.AttachedDocs.removeAll();
						fnc.loadInvoiceDocumentList("", "", self.InvId, self.OrgId, function (r) {
							self.AttachedDocs(r);
							setTimeout(function () {
								self.uploadQueue()[0].documents.removeAll();
							}, 500)
						});
					}
				});

			}
		};

		self.selectedDocument = ko.observable(null);

		self.saveFile = function (d, e) {
			var name = fnc.downloadFileName();
			saveAs(self.selectedDocument().file(), self.selectedDocument().DocName() + "." + self.selectedDocument().ContentType);
		};

	};
	//</attachments>

	/* GLOBAL FUNCTIONS
	* ================================== */
	//<attachments>

	fnc.fileRetrieve = function (fileId, pageCount, fileName, contentType, callbackSuccess, callbackError) {
		var data = "fileid=" + fileId + "&sessionid=" + fnc.app.sessionId + "&appid=" + fnc.appid + "&pagenumber=" + pageCount;
		var oReq = new XMLHttpRequest();
		oReq.open("POST", servicesHost + "/ChefMod.Financials.UI.Services/Download.aspx", true);
		oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		oReq.responseType = "blob";
		oReq.onload = function (oEvent) {
			if (oReq.status !== 500) {
				var response = oReq.response;
				//  console.log(oReq.getAllResponseHeaders());
				if (contentType == 'pdf') {
					var blob = new Blob([response], { type: 'application/pdf' });
				}
				else {
					var blob = response;
				}
				var fn = fileName + "." + contentType;
				if (callbackSuccess) callbackSuccess(blob, fn);
			}
			else {
				if (callbackError) callbackError(oReq.statusText);
			}
		};
		oReq.onerror = function () {
			if (callbackError) callbackError();
		}
		oReq.send(data);
	};

	fnc.loadInvoiceDocumentList = function (fromDate, toDate, invId, orgId, callback, noContinueSession) {
		var params = {};
		params.FromDate = fromDate == '' ? '2017-01-01' : fromDate;		//fromDate;
		params.ToDate = toDate == '' ? getTodayString() : toDate;			//toDate;
		params.InvoiceId = Number(invId);
		params.orgList = orgId;

		loading(true);
		if (invId) {
			fnc.app.attachedDocTypes.removeAll();
		}

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

			var AttachmentItem = function (it) {
				var self = this;
				self.Company = it.Company;
				self.ContentType = it.ContentType;
				self.DocId = it.DocId;
				self.DocName = ko.observable(it.DocName == null ? '' : it.DocName);
				self.InvoiceDocTypeId = ko.observable(it.InvoiceDocTypeId);
				self.InvoiceNum = it.InvoiceNum;
				self.OrgName = it.OrgName;
				self.OrganizationId = it.OrganizationId;
				self.PageCount = it.PageCount;
				self.RecordId = it.RecordId;
				self.SBVendId = it.SBVendId;
				self.Status = it.Status;
				self.Total = it.Total;
				self.TypeName = it.TypeName;
				self.UploadDT = it.UploadDT;
				self.UploadedBy = it.UploadedBy;
				self.VOrderNum = it.VOrderNum;
				self.VendId = it.VendId;

				self.Selected = ko.observable(false);
				self.DetachFlag = ko.observable(false);
				//
				self.file = ko.observable();

				self.showDetachDocWarning = function (d, e) {
					fnc.app.attachmentsObject().selectedDocument(d);

					$('#modDetachDocWarning').modal('show');

					$("#modDetachDocWarning").on("hidden.bs.modal", function () {
						$("#modDetachDocWarning").unbind();
						if (self.DetachFlag()) {
							self.detachDocument(function () {
								fnc.app.attachmentsObject().selectedDocument(null);
							})
						} else {
							fnc.app.attachmentsObject().selectedDocument(null);
						}
					});

				}

				self.detachDocument = function (callback) {
					var recordId = self.RecordId;
					var docId = self.DocId;
					var invId = fnc.app.attachmentsObject().InvId;
					var orgId = fnc.app.attachmentsObject().OrgId;
					detachInvoiceDocument(recordId, docId, invId, function () {
						fnc.app.attachedItems.removeAll();
						fnc.loadInvoiceDocumentList("", "", invId, orgId, function (r) {
							fnc.app.attachedItems(r);
							setTimeout(function () {
								//refresh available docs
								fnc.app.attachmentsObject().filterDateRange.valueHasMutated();
								if (callback) callback();
							}, 100);
						})
					})
				}

				self.editDocument = function (d, e) {
					fnc.app.attachmentsObject().selectedDocument(d);

					$('#modEditDocument').modal('show')

					$("#modEditDocument").on("hidden.bs.modal", function () {
						fnc.app.attachmentsObject().selectedDocument(null);
					});
				};

				self.updateDocument = function (d, e) {
					var invId = fnc.app.attachmentsObject().InvId;
					var orgId = fnc.app.attachmentsObject().OrgId;

					updateInvoiceDocumentRecord(d, function () {
						fnc.app.attachedItems.removeAll();
						fnc.loadInvoiceDocumentList("", "", invId, orgId, function (r) {
							fnc.app.attachedItems(r);
							$('#modEditDocument').modal('hide');
							return;
						})
					})
				};

				self.doDetachDocument = function () {
					self.DetachFlag(true);
					$('#modDetachDocWarning').modal('hide');
				};

				self.cancelDetachDocument = function () {
					self.DetachFlag(false);
					$('#modDetachDocWarning').modal('hide');
				};

			}

			var obj = JSON.parse(response.d).result.row;

			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new AttachmentItem(it));
					if (invId) fnc.app.attachedDocTypes.push(it.InvoiceDocTypeId);
				})
			} else {
				arr.push(new AttachmentItem(obj));
				if (invId) fnc.app.attachedDocTypes.push(obj.InvoiceDocTypeId);
			}

			if (callback) callback(arr);
		}, noContinueSession);


	};

	function updateFileMetadata(action, blobContainer, contentType, docName, fileType, company, vendId, sbVendId, accNum, invNum, orgName, state, callback) {
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
				return;
			}
			if (callback) callback(r.result);
		});
	};

	function uploadAndUpdateFilePageMetadata(file, fileId, pageNumber, appId, sessionId, callback) {
		var fd = new FormData();
		fd.append(file.name, file, file.name);
		fd.append("fileid", fileId);
		fd.append("pagenumber", pageNumber);
		fd.append("appid", appId);
		fd.append("sessionid", sessionId);

		//console.log(fd);
		$.ajax({
			url: servicesHost + "/ChefMod.Financials.UI.Services/Upload.aspx",
			type: "POST",
			data: fd,
			processData: false,  // tell jQuery not to process the data
			contentType: false,  // tell jQuery not to set contentType
			success: function (result) {
				if (callback) callback();
				////var o = eval('(' + result + ')');
				////console.log('FileId=' + o.fileid);
				////console.log('PageNo=' + o.pagenumber);
				////if (o.iserror == '0') {
				////	if (callback) callback();
				////} else {
				////	errMessage('Unexpected error occurred. Please try again later or contact ChefMod support.');
				////	$('#modMessage').modal('show');
				////	// close modal window
				////	$("#modMessage").on("hidden.bs.modal", function () {
				////		errMessage('');
				////	});
				////	console.log('iserror=' + o.iserror);
				////}
			},
			error: function (err) {
				console.log(err.statusText)
			}
		});
	}

	function finishFileUpload(fileId, action, callback) {
		//FinishFileUpload(o.Params.FileId, o.Params.Action)
		var params = {};
		params.FileId = fileId;
		params.Action = action;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.FileManager.FinishFileUpload", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	function createInvoiceDocument(docId, docType, docName, pageCount, orgId, vendId, sbVendId, company, invId, invNum, poList, total, contentType, invoiceDate, callbackSuccess, callbackError) {
		//o.Params.DocId, o.Params.InvoiceDocType, o.Params.DocName, o.Params.PageCount, o.Params.OrganizationId, o.Params.VendId, o.Params.sbVendId, o.Params.Company, o.Params.InvoiceId, o.Params.InvoiceNum, o.Params.VOrderNum, o.Params.Total, o.uc)
		//Function CreateInvoiceDocument(docId As String, invoiceDocType As Integer, docName As String, pageCount As Integer, organizationId As Integer, vendId As Integer, sbVendId As Integer, company As String, invoiceId As Decimal, invoiceNum As String, VOrderNum As String, InvoiceDate As String, Total As Double, userCode As Integer) As Long
		var params = {};
		params.DocId = docId;
		params.InvoiceDocType = docType;
		params.DocName = docName;
		params.PageCount = pageCount;
		params.OrganizationId = orgId;
		params.VendId = vendId;
		params.sbVendId = sbVendId;
		params.Company = company;
		params.InvoiceId = Number(invId);
		params.InvoiceNum = invNum;
		params.VOrderNum = poList;
		params.Total = total;
		params.ContentType = contentType;
		params.InvoiceDate = invoiceDate;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.CreateInvoiceDocument", params, function (response) {
			loading(false);

			if (response.d == '') {
				if (callback) callback('');
				windowResized();
				return;
			}

			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {

				windowResized();
				if (callbackError) callbackError();
				return;
			}

			var obj = JSON.parse(response.d);

			if (callbackSuccess) callbackSuccess(obj);
		});

	};

	function attachInvoiceDocument(recordId, docId, invId, callback) {
		//AttachInvoiceDocument(o.Params.RecordId, o.Params.DocId, o.Params.InvoiceId, o.uc)
		var params = {};
		params.RecordId = recordId;
		params.DocId = docId;
		params.InvoiceId = invId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.AttachInvoiceDocument", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});

	};

	function detachInvoiceDocument(recordId, docId, invId, callback) {
		//DetachInvoiceDocument(recordid As Long, docId As String, invoiceId As Decimal, userCode As Integer)
		var params = {};
		params.RecordId = recordId;
		params.DocId = docId;
		params.InvoiceId = invId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.DetachInvoiceDocument", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	function loadDocumentTypes(callback) {
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.LoadInvoiceDocumentType", params, function (response) {
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
				obj.forEach(function (it) { arr.push(it) })
			}
			else {
				arr.push(obj);
			}

			if (callback) callback(arr);
		});
	};

	function updateInvoiceDocumentRecord(it, callback) {
		//UpdateInvoiceDocumentRecord(
		//o.Params.RecordId, o.Params.DocId, o.Params.InvoiceDocType, o.Params.DocName, o.Params.OrganizationId, o.Params.VendId, 
		//o.Params.sbVendId, o.Params.Company, o.Params.InvoiceNum, o.Params.VOrderNum, o.Params.Total, o.Params.ContentType, o.uc)
		var params = {};
		params.RecordId = it.RecordId;
		params.DocId = it.DocId;
		params.InvoiceDocType = it.InvoiceDocTypeId();
		params.DocName = it.DocName();
		params.OrganizationId = it.OrganizationId;
		params.VendId = it.VendId;
		params.sbVendId = it.sbVendId;
		params.Company = it.Company;
		params.InvoiceNum = it.InvoiceNum;
		params.VOrderNum = it.VOrderNum;
		params.Total = it.Total;
		params.ContentType = it.ContentType;//it.ContentType;'pdf';'png';
		params.InvoiceDate = fnc.app.attachmentsObject().InvDate;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.InvoiceDocument.UpdateInvoiceDocumentRecord", params, function (response) {
			loading(false);

			if (response.d == '') {
				if (callback) callback('');
				windowResized();
				return;
			}

			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

		})
	}

	function loadFileMetadata(fileId, callback) {
		//LoadFileMetadata(o.Params.FileId)
		var params = {};
		params.FileId = fileId;

		ajaxPost("ChefMod.Financials.UI.Controllers.FileManager.LoadFileMetadata", params, function (response) {
			loading(false);
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') return;

			if (callback) callback(r);
		});
	}

	//</attachments>

	function validateAccountOverlay() {
		if (fnc.invoicesAppNoPo.invoiceDate() != '' && fnc.invoicesAppNoPo.grossAmount() != '' && fnc.invoicesAppNoPo.tax() != '') {
			$("#glAccountOverlay").remove();
		} else {
			if ($("#glAccountOverlay").length == 0) {
				appendAccountOverlay();
			}
		}
	};

	function appendAccountOverlay() {
		//$("<div id='glAccountOverlay'><h3>Value required for: 'INVOICE DATE', 'INVOICE #', 'GROSS AMOUNT', and 'TAX'</h3></div>").css({
		//	position: "absolute",
		//	width: "102%",
		//	height: "100%",
		//	top: 0,
		//	left: -15,
		//	background: "#ccc",
		//	opacity: 1.0,
		//	textAlign: "center",
		//	padding: "3%",
		//	color: "red"
		//}).appendTo($("#glAccountSection").css("position", "relative"));
	};


	function hideAllPopovers() {
		$('.popover-span').each(function () {
			$(this).popover('hide');
		});
	};

	function tableResized1(e) {
		//debugger
		var tbl = $(e.currentTarget);
		w = tbl.context.childNodes[3].rows[0].cells[0].clientWidth;
		var hdr = $('#tblRecHead');
		hdr[0].children[0].children[1].children[0].clientWidth = w;
	}


	function saveLocal(fileName, data) {
		var localData = { t: Date.now(), d: data };
		localStorage.setItem(fileName, JSON.stringify(localData));
	}

	function getLocal(fileName, callback) {
		var localData = JSON.parse(localStorage.getItem(fileName));
		var localDate;
		var r;
		if (localData) {
			localDate = new Date(localData.t);
			r = localData;
		}
		if (callback) callback(r);
		return r;
	}

	function numericOnly(event) {
		// Allow only backspace, delete, tab
		if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9) {
			// let it happen, don't do anything
		}
		else {
			// Ensure that it is a number and stop the keypress
			if (event.keyCode < 48 || event.keyCode > 57) {
				event.preventDefault();
			}
		}
	}

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function formatCurrency(value) {
		if (isNumber(value)) {
			return "$" + Number(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			//return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
		} else {
			return "";
		}
		//var n = this,
		//  c = isNaN(c = Math.abs(c)) ? 2 : c,
		//  d = d == undefined ? "." : d,
		//  t = t == undefined ? "," : t,
		//  s = n < 0 ? "-" : "",
		//  i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		//  j = (j = i.length) > 3 ? j % 3 : 0;
		//return "$" + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}

	function formatUnits(value, d) {
		if (isNaN(value)) {
			value = 0;
		}
		if (d.isCheckedPO() || d.isCheckedInvoice()) {
			return Number(value).toFixed(2);
		} else {
			return '';
		}
	}

	function formatNet(value) {
		if (isNaN(value)) {
			value = 0;
		}
		return "$" + Number(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		//return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

		//var n = this,
		//  c = isNaN(c = Math.abs(c)) ? 2 : c,
		//  d = d == undefined ? "." : d,
		//  t = t == undefined ? "," : t,
		//  s = n < 0 ? "-" : "",
		//  i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		//  j = (j = i.length) > 3 ? j % 3 : 0;
		//return "$" + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}

	function formatInteger(value) {
		if (isNumber(value)) {
			return Number(value).toFixed(0);
		} else {
			return "";
		}
	}

	function formatToFixed(value, n) {
		if (isNumber(value)) {
			var f = Number(value).toFixed(n);
			if (f == 0) f = "";
			return f;
		} else {
			return "";
		}
	}

	function formatToFixed0(value, n) {
		if (isNumber(value)) {
			var f = Number(value).toFixed(n);
			//if (f == 0) f = "";
			return f;
		} else {
			return "";
		}
	}

	function formatPercent(value) {
		if (isNumber(value)) {
			return Number(value).toFixed(0) + "%";
		} else {
			return "";
		}
	};

	function fnbPercent(v1, v2) {
		var r = 0;
		var t = Number(v1) + Number(v2);
		if (t != 0) {
			r = (Number(v1) / t) * 100;
		}
		return formatPercent(r);
	}

	function formatTemperature(value) {
		if (isNumber(value)) {
			return Number(value).toFixed(0) + String.fromCharCode(176);
		} else {
			return "";
		}
	};

	function format2Date(value) {
		var r = '';
		if (value != '' && value != null) {
			try {
				var yy = value.substr(0, 4);
				var mm = value.substr(5, 2);
				var dd = value.substr(8, 2);
				//r = (new Date(value)).format("mm/dd/yyyy");
				r = mm + '/' + dd + '/' + yy;
			} catch (e) {
				console.log(e);
				r = '';
			}
		}
		return r;
	};

	function setDraggableModalDialog() {
		$('.modal.draggable>.modal-dialog').draggable({
			cursor: 'move',
			handle: '.modal-header'
		});
		//$('.modal.draggable>.modal-dialog>.modal-content>.modal-header').css('cursor', 'move');
		$('.modal.draggable').find('.modal-header').css('cursor', 'move');
		//$('.modal-header').css('cursor', 'move');

	};

	function setDraggableModalDialog2() {
		$('.modal.draggable>.modal-dialog').draggable({
			cursor: 'move',
			handle: '.modal-content'
		});
		//$('.modal.draggable>.modal-dialog>.modal-content>.modal-header').css('cursor', 'move');
		//$('.modal.draggable>.modal-dialog').siblings('.modal-header').css('cursor', 'move');
	};

	function sortListItems(header, event) {
		var self;
		if (event.currentTarget.id == 'crossDoc_list') {
			self = fnc.crossDocApp;
		}
		else if (event.currentTarget.id == 'po_list') {
			self = fnc.poListApp;
		} else if (event.currentTarget.id == 'legacy_list') {
			self = fnc.legacyListApp;
		} else if (event.currentTarget.id == 'einv_list') {
			self = fnc.eInvoicesApp;
		} else if (event.currentTarget.id == 'legacy_invoice') {
			self = fnc.legacyListApp.PORequiredInvoice;
		} else if (event.currentTarget.id == 'legacy_invoice2') {
			self = fnc.legacyListApp.noPORequiredInvoice;
		} else if (event.currentTarget.id == 'item_list') {
			//self = fnc.itemListTab;
			self = fnc.invoicesApp;
		} else if (event.currentTarget.id == 'inoice_list2') {
			//self = fnc.itemListTab;
		} else if (event.currentTarget.id == 'gl_list') {
			self = fnc.invoicesAppNoPo;
		} else if (event.currentTarget.id == 'sales_list') {
			self = fnc.salesApp;
		} else {
			return;
		}


		//if this header was just clicked a second time
		if (self.activeSort() === header) {
			//header.asc = !header.asc; //toggle the direction of the sort
			header.asc(!header.asc());
		} else {
			self.activeSort(header); //first click, remember it
		}

		//console.log('pty=' + self.activeSort().sortPropertyName);
		//console.log('asc=' + self.activeSort().asc());

		var prop = ko.utils.unwrapObservable(self.activeSort().sortPropertyName);
		var ascSort, descSort;
		if (event.currentTarget.className == 'sort-alpha') {
			ascSort = function (a, b) { return ko.utils.unwrapObservable(a[prop]) < ko.utils.unwrapObservable(b[prop]) ? -1 : ko.utils.unwrapObservable(a[prop]) > ko.utils.unwrapObservable(b[prop]) ? 1 : ko.utils.unwrapObservable(a[prop]) == ko.utils.unwrapObservable(b[prop]) ? 0 : 0; };
			descSort = function (a, b) { return ko.utils.unwrapObservable(a[prop]) > ko.utils.unwrapObservable(b[prop]) ? -1 : ko.utils.unwrapObservable(a[prop]) < ko.utils.unwrapObservable(b[prop]) ? 1 : ko.utils.unwrapObservable(a[prop]) == ko.utils.unwrapObservable(b[prop]) ? 0 : 0; };
		} else {
			ascSort = function (a, b) { return ko.utils.unwrapObservable(a[prop]) - ko.utils.unwrapObservable(b[prop]) };
			descSort = function (a, b) { return ko.utils.unwrapObservable(b[prop]) - ko.utils.unwrapObservable(a[prop]) };
		}

		var sortFunc = self.activeSort().asc() ? ascSort : descSort;

		//if (prop == "Status") {
		//	sortFunc = function (a, b) {
		//		return a.Status() == b.Status() ? 0 : (a.Status() < b.Status() ? -1 : 1);
		//	}
		//}
		//console.log('fun=' + sortFunc);
		self.allItems.sort(sortFunc);
	};

	function sortArray(arr, str) {
		var prop = str;
		var ascSort, descSort;
		if (prop != '') {
			ascSort = function (a, b) { return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
			descSort = function (a, b) { return a[prop] > b[prop] ? -1 : a[prop] < b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
		} else {
			ascSort = function (a, b) { return a[prop] - b[prop] };
			descSort = function (a, b) { return b[prop] - a[prop] };
		}

		var sortFunc = ascSort;
		arr.sort(sortFunc);
	};

	function windowResized(ww, hh) {
		if (!blockResize) {
			var h = $("body").height();
			//var h = $(document).height();
			//var h = $("#appContent").height();
			if (h < 600) { h = 600 }
			//if (h < 700) { h = 700 }
			var w = $("body").width();
			if (parent.cp) {
				parent.cp.events.iFrame.resize(w, h);
			}
			//initDatePicker();
			//console.log($("body").height());
		}
	};

	function decodeText(txt) {
		var r = "";
		txt = ko.utils.unwrapObservable(txt);
		if (txt) r = txt.replace(/&amp;/g, '&');
		return r;
	};



	function getIP() {
		var ip = "0.0.0.0";
		$.get('http://jsonip.com', function (res) {
			ip = res.ip;
			clientIP(ip);
		});
	}

	function get_browser_info() {
		//var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident|edge(?=\/))\/?\s*(\d+)/i) || [];
		//if (ua.toLowerCase().indexOf('edge') != 1) {
		//	return { name: 'IE', version: '12' };
		//}
		//if (/trident/i.test(M[1])) {
		//	tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		//	return { name: 'IE', version: (tem[1] || '') };
		//}
		//if (M[1] === 'Chrome') {
		//	tem = ua.match(/\bOPR\/(\d+)/)
		//	if (tem != null) { return { name: 'Opera', version: tem[1] }; }
		//}
		//M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
		//if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
		//return {
		//	name: M[0],
		//	version: M[1]
		//};

		var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if (/trident/i.test(M[1])) {
			tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
			return { name: 'IE ', version: (tem[1] || '') };
		}
		if (M[1] === 'Chrome') {
			tem = ua.match(/\bOPR\/(\d+)/)
			if (tem != null) { return { name: 'Opera', version: tem[1] }; }
		}
		M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
		if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
		return {
			name: M[0],
			version: M[1]
		};

	};
	
	function get_browser_name_cm() {
		var name = '';
		// Opera 8.0+
		var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Firefox 1.0+
		var isFirefox = typeof InstallTrigger !== 'undefined';
		// At least Safari 3+: "[object HTMLElementConstructor]"
		var isSafari = navigator.userAgent.indexOf("Safari") > -1;
		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		// Edge 20+
		var isEdge = !isIE && !!window.StyleMedia;
		// Chrome 1+
		var isChrome = !!window.chrome && !!window.chrome.webstore;
		// Blink engine detection
		// Blink engine detection
		var isBlink = (isChrome || isOpera) && !!window.CSS;

		if (isChrome) {
			name = 'Chrome';
		} else if (isFirefox) {
			name = 'Firefox';
		} else if (isIE) {
			name = 'IE';
		} else if (isEdge) {
			name = 'Edge';
		} else if (isSafari) {
			name = 'Safari'
		}
		return name;
	}

	function toggleSelectedLocations(d, e) {
		fnc.app.notSelectedLocationsHidden(fnc.app.notSelectedLocationsHidden() ? false : true);
		if (fnc.app.notSelectedLocationsHidden()) {
			$(e.currentTarget).removeClass('glyphicon-unchecked')
			$(e.currentTarget).addClass('glyphicon-check')
			fnc.app.searchLocationsFilter('');
		} else {
			$(e.currentTarget).removeClass('glyphicon-check')
			$(e.currentTarget).addClass('glyphicon-unchecked')
		}
	}

	function clearLocationFilter(d, e) {
		massLocationChangeEvent(true);
		fnc.app.filterAvailableLocations().forEach(function (it) { it.Selected(false); });
		fnc.app.filterSelectedLocations([]);
		if ($("ul.nav li.active").hasClass("calendar-tab")) {
			fnc.app.notSelectedLocationsHidden(false);
			$("#selectedLocationsIcon").removeClass('glyphicon-check');
			$("#selectedLocationsIcon").addClass('glyphicon-unchecked');
			load_home();
		}
		if ($("ul.nav li.active").hasClass("invoices-tab")) {
			fnc.app.notSelectedLocationsHidden(false);
			$("#selectedLocationsIcon").removeClass('glyphicon-check');
			$("#selectedLocationsIcon").addClass('glyphicon-unchecked');
			fnc.app.searchLocationsFilter('');
			//load_polist();

		}
		if ($("ul.nav li.active").hasClass("legacy-tab")) {
			fnc.app.notSelectedLocationsHidden(false);
			$("#selectedLocationsIcon").removeClass('glyphicon-check');
			$("#selectedLocationsIcon").addClass('glyphicon-unchecked');
			//load_legacy();
		}
		if ($("ul.nav li.active").hasClass("sales-tab")) {
			fnc.app.notSelectedLocationsHidden(false);
			$("#selectedLocationsIcon").removeClass('glyphicon-check');
			$("#selectedLocationsIcon").addClass('glyphicon-unchecked');
			load_sales();
		};
		massLocationChangeEvent(false);
	};

	

	function ajaxPost(action, params, callback, noContinueSession) {
		var json = {
			oid: fnc.app.oid,
			uc: fnc.app.uc,
			iuc: fnc.app.iuc,
			SessionId: fnc.app.sessionId,
			AppId: fnc.appid,
			params: params
		};
		var d = { appid: fnc.appid, method: action, json: JSON.stringify(json) };
		//console.log(Date.now() + "||" + action + "||" + JSON.stringify(json.params));
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			url: ajaxURL,
			data: JSON.stringify(d),
			success: function (response) {
				//console.log(Date.now() + "||" + action + "||done");

				if (response.d == '') {
					callback(response);
					return;
				}

				if (jQuery.parseJSON(response.d).hasOwnProperty('errorNumber') && jQuery.parseJSON(response.d).errorNumber == 100) {
					console.log(xhr);
					loading(false);
					console.log('Authorization failed');
					errMessage('Authorization failed. Please try again later.');
					$('#modMessage').modal('show');
					// close modal window
					$("#modMessage").one("hidden.bs.modal", function () {
						errMessage('');
					});
					return;
				}

				callback(response);

			},

			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				loading(false);
				errMessage('Unexpected error occurred. Please try again later or contact ChefMod support.');
				$('#modMessage').modal('show');
				// close modal window
				$("#modMessage").one("hidden.bs.modal", function () {
					errMessage('');
				});
				callback({ d: "{result:'error'}" });
			}
		});
		if (parent.continueSession && !noContinueSession) {
			parent.continueSession();
		}
	};

	function ajaxPostMsg(action, params, callback) {
		var json = {
			oid: fnc.app.oid,
			uc: fnc.app.uc,
			iuc: fnc.app.iuc,
			SessionId: fnc.app.sessionId,
			AppId: fnc.appid,
			params: params
		};
		var d = { appid: fnc.appid, method: action, json: JSON.stringify(json) };
		//console.log(Date.now() + "||" + action + "||" + JSON.stringify(json.params));
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			url: ajaxURL,
			data: JSON.stringify(d),
			success: function (response) {
				//console.log(Date.now() + "||" + action);
				if (response.d == '') {
					callback(response);
					return;
				}

				if (jQuery.parseJSON(response.d).hasOwnProperty('errorNumber') && jQuery.parseJSON(response.d).errorNumber == 100) {
					console.log(xhr);
					loading(false);
					console.log('Authorization failed');
					return;
				}

				callback(response);
			},

			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				//var err = eval("(" + xhr.responseText + ")");
				loading(false);
				//callback({ d: "{result:'error'}", m: "{errMsg:'" + err.d + "'}" });
				callback({ d: "{result:'error'}", m: "{errMsg:'error'}" });
			}
		});
		parent.continueSession();

	};

	function ajaxPostXML(action, params, callback) {
		var json = {
			oid: fnc.app.oid,
			uc: fnc.app.uc,
			iuc: fnc.app.iuc,
			SessionId: fnc.app.sessionId,
			AppId: fnc.appid,
			params: params
		};
		var d = { appid: fnc.appid, method: action, json: JSON.stringify(json) };
		//console.log(Date.now() + "||" + action + "||" + JSON.stringify(json.params));
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			url: ajaxURL,
			data: JSON.stringify(d),
			success: function (response) {
				//console.log(Date.now() + "||" + action + "||done");
				if (response.d == '') {
					callback('');
					return;
				}

				var r2 = parseXml(response.d);
				var r = xml2json(r2, '');

				if (jQuery.parseJSON(r).hasOwnProperty('errorNumber') && jQuery.parseJSON(r).errorNumber == 100) {
					console.log('Authorization failed');
					$('#modMessage').modal('show');
					return;
				}

				callback(r);
			},

			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				loading(false);
				callback({ d: "{result:'error'}" });
			}
		});
		if (parent.continueSession) {
			parent.continueSession();
		}
	};

	function parseXml(xml) {
		var dom = null;
		if (window.DOMParser) {
			try {
				dom = (new DOMParser()).parseFromString(xml, "text/xml");
			}
			catch (e) { dom = null; }
		}
		else if (window.ActiveXObject) {
			try {
				dom = new ActiveXObject('Microsoft.XMLDOM');
				dom.async = false;
				if (!dom.loadXML(xml)) // parse error ..

					window.alert(dom.parseError.reason + dom.parseError.srcText);
			}
			catch (e) { dom = null; }
		}
		else
			alert("cannot parse xml string!");
		return dom;
	}

	// Changes XML to JSON
	function xmlToJson(xml) {

		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for (var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof (obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof (obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};

	function loading(show) {
		//windowResized();
		var margins = 300;
		//var h = window.screen.availHeight - margins;
		//var w = $("body").width();
		//parent.cp.events.iFrame.resize(w, h);
		//initDatePicker();
		$("body").height(window.screen.availHeight - margins);
		var div = "<div id='loading' class='ui-widget-overlay ui-front' style='z-index:1051;'><div style='vertical-align: middle; margin-left:auto; margin-right:auto; width:50px; margin-top:200px;'><img class='img-circle' style='margin-left:-75px;' src='img/loading_spinner.gif' alt='' /></div></div>";
		//var div = "<div id='loading' class='ui-widget-overlay ui-front'><div style='margin-left:auto; margin-right:auto; width:50px;'><span style='display: inline-block; height: 100%; vertical-align: middle;'></span><img class='img-circle' src='img/loading_spinner.gif' alt='' style='vertical-align: middle;margin-left:-75px;'  /></div></div>";
		if (show) {
			if ($('#loading').length === 0 && !blockLoading) {
				$("body").append(div);
			}
		} else {
			$("body div#loading").remove();
			$("body").css("height", "auto");
		}
		windowResized();
	};



	function initDatePicker() {
		//if ($('[type="date"]').prop('type') != 'date') {
		//	$('[type="date"]').datepicker({
		//		changeMonth: true,
		//		changeYear: true,
		//		showButtonPanel: true,
		//		numberOfMonths: 1,
		//		showAnim: ""
		//	});
		//}
		$('.jq-datepicker').datepicker({
			changeMonth: true,
			changeYear: true,
			showButtonPanel: true,
			numberOfMonths: 1,
			showAnim: ""
		});
	}

	function initDatePickerAllDates() {
		$('.jq-datepicker').datepicker({
			changeMonth: true,
			changeYear: true,
			showButtonPanel: true,
			numberOfMonths: 1,
			showAnim: ""
		});
	}

	function initDatePickerPastDates(id) {
		$(id).datepicker({
			changeMonth: true,
			changeYear: true,
			showButtonPanel: true,
			numberOfMonths: 1,
			showAnim: "",
			maxDate: new Date
		});
	}
	
	function addDays2(day, n) {
		var dateString;
		if (browserName == "Chrome") {
			var d = day.split("-");
			dateString = d[1] + "/" + d[2] + "/" + d[0];
		} else {
			dateString = day
		}

		var t = new Date(dateString);	//new Date(anlt.filterDateTo());
		t.setDate(t.getDate()); //-400 for the last year debugging
		if (n > 0) {
			t.setDate(t.getDate() + n);
		} else if (n < 0) {
			t.setDate(t.getDate() + n);
		} else {
			t.setDate(t.getDate());
		}
		var r = t.format(strFormat);
		return r;
	};

	//***********************************
	// shared function
	//***********************************

	//***************************************
	// Cost Centers
	//***************************************

	function getOrgClassList(orgId, callback) {
		var params = {};
		params.OrganizationId = orgId;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.ClassSetup.LoadClassList", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) return callback([]);
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				loading(false);
				windowResized();
				return;
			}
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push({ ClassCode: it.ClassCode, ClassName: it.ClassName, OrgClassId: it.OrganizationClassId });
				})
			} else {
				arr.push({ ClassCode: obj.ClassCode, ClassName: obj.ClassName, OrgClassId: obj.OrganizationClassId });
			}
			if (callback) return callback(arr);
		})
	}

	// Convert an array of columns into an escaped csv row
	function arrayToRow(arr, del, enc) {
		del = del || ',';
		enc = enc || '"';

		arr = arr.slice(0);
		var i, ii = arr.length;
		for (i = 0; i < ii; i++) {
			// if value is not empty and not a number, escape embedded enclosures
			//if (arr[i] && isNaN(arr[i])) {
			// if value is not empty
			//if (arr[i]) {
			arr[i] = String(arr[i]).split(enc).join(enc + enc);
			arr[i] = enc + arr[i] + enc;
			//}
		}
		return arr.join(del);
	};

	// Convert a two-dimensional array into an escaped multi-row csv 
	function arraysToRows(arr, sep) {
		sep = sep || "\r\n";

		arr = arr.slice(0);
		var i, ii = arr.length;
		for (i = 0; i < ii; i++) {
			arr[i] = arrayToRow(arr[i]);
		}

		return arr.join(sep);
	};

	// GL
	function glAccountAddItem(glAcctId, itemId, prcnt, callback) {
		var params = {};
		params.GLAcctId = glAcctId;
		params.ItemId = itemId;
		params.Prcnt = prcnt;
		//Sub GLAccountAddItem(glAccId As Integer, itemId As Integer, userCode As Integer, prcnt As Double)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountAddItem", params, function (response) {
			if (response.d == '') {
				//success
				if (callback) callback();
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {

				windowResized();
				return;
			}
		});
	};

	function glAccountUpdItem(glAcctId, itemId, prcnt, callback) {
		var params = {};
		params.GLAcctId = glAcctId;
		params.ItemId = itemId;
		params.Prcnt = prcnt;
		//Sub GLAccountModifyItem(glAccId As Integer, itemId As Integer, prcnt As Double, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountModifyItem", params, function (response) {
			if (response.d == '') {
				//success
				if (callback) callback();
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {

				windowResized();
				return;
			}
		});
	};

	// /GL

	// INVOICES
	var loadEInvoiceItems = function (invId, eIvoice, callback) {
		var params = {};
		params.EInvoiceId = invId;

		loading(true);
		//LoadOneInvoice(o.Params.EInvoiceId)
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.LoadOneInvoice", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			var OneEInvoiceItem = function (it) {
				var self = this;

				self.AccountNum = it.AccountNum;
				self.AdjTotal = it.AdjTotal;
				self.BackOrdQuantity = it.BackOrdQuantity;
				self.CreditAmt = it.CreditAmt;
				self.CWTList = it.CWTList;
				self.DepositAmt = it.DepositAmt;
				self.Description = it.Description;
				self.Discount = it.Discount;
				self.EInvoiceId = it.EInvoiceId;
				self.Freight = it.Freight;
				self.Gross = it.Gross;
				self.InvoiceDate = it.InvoiceDate;
				self.InvoiceNum = it.InvoiceNum;
				self.ItemId = it.ItemId;
				self.Msg = typeof (it.Msg) == "object" ? null : it.Msg;
				self.OrdQuantity = it.OrdQuantity;
				self.OrgId = it.OrgId;
				self.OrgName = it.OrgName;
				self.POList = it.POList;
				self.PackSize = it.PackSize;
				self.PriceUnit = it.PriceUnit;
				self.ShipQuantity = it.ShipQuantity;
				self.Status = it.Status;
				self.Tax = it.Tax;
				self.TaxAmt = it.TaxAmt;
				self.Taxable = it.Taxable;
				self.TotalAmt = it.TotalAmt;
				self.TotalPriceUnits = it.TotalPriceUnits;
				self.Unit = it.Unit;
				self.Price = it.UnitPrice;
				self.VendId = it.VendId;
				self.VendItemCode = it.VendItemCode;
				self.Vendor = it.Vendor;

				self.Selected = ko.observable(false);

			}

			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new OneEInvoiceItem(it))
				})
			} else {
				arr.push(new OneEInvoiceItem(obj))
			}


			eIvoice.invoiceAllItems(arr);
			eIvoice.locationName(arr[0].OrgName);
			eIvoice.vendor(arr[0].Vendor);
			eIvoice.invoiceNumber(arr[0].InvoiceNum);
			eIvoice.invoiceDate(arr[0].InvoiceDate);

			eIvoice.includedPOList(arr[0].POList.split(","));
			eIvoice.accountNum(arr[0].AccountNum);
			eIvoice.selectedOrgId(arr[0].OrgId);
			eIvoice.msg(arr[0].Msg);


			//compute total and net
			var gr = Number(arr[0].Gross);
			var tx = Number(arr[0].Tax);
			var fr = Number(arr[0].Freight);
			var ds = Number(arr[0].Discount);
			var dcr = Number(arr[0].AdjTotal);

			eIvoice.gross(gr);
			eIvoice.discount(ds);
			eIvoice.discountComputed(ds);
			eIvoice.tax(tx);
			eIvoice.freight(fr);
			eIvoice.depositOrCredit(dcr);

			var sum = 0;
			for (var p = 0; p < arr.length; p++) {
				var t = Number(arr[p].TotalAmt);
				sum += t;
			}
			var rt = sum + dcr + tx + fr - ds;

			eIvoice.lineTotal(sum);
			eIvoice.computedTotal(rt);
			eIvoice.computedNet(gr - ds);

			if (callback) callback();
		});
	};


	function updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, showloading, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.InvoiceNumber = invNo;
		params.InvoiceDate = invDate;
		params.Gross = Number(gross);
		params.Discount = Number(discount);
		params.Tax = Number(tax);
		params.Freight = Number(freight);

		//Sub UpdateInvoiceSummary(InvoiceId As Decimal, InvoiceNumber As String, InvoiceDate As Date, Gross As Double, Discount As Double, Tax As Double, Freight As Double, UserCode As Integer)
		//UpdateInvoiceSummary(o.Params.InvoiceId, o.Params.InvoiceNumber, o.Params.InvoiceDate, o.Params.Gross, o.Params.Discount, o.Params.Tax, o.Params.Freight, o.uc)
		loading(showloading);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateInvoiceSummary", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})

	};

	function updateInvoiceOrganization(invId, orgId, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.OrganizationId = Number(orgId);

		//Sub UpdateInvoiceOrganization(InvoiceId As Decimal, Organizationid As Integer, UserCode As Integer)
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateInvoiceOrganization", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})

	};

	function updateInvoiceVendor(invId, vendId, sbVendId, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.VendId = Number(vendId);
		params.SBVendId = Number(sbVendId);

		if (params.VendId == 0 && params.SBVendId == 0) {
			if (callback) callback();
			return;
		}
		//Sub UpdateInvoiceVendor(InvoiceId As Decimal, Vendid As Integer, SBVendId As Long, UserCode As Integer)
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateInvoiceVendor", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})

	};

	var loadInvoiceAdjustments = function (invId, fArray, callback) {
		var params = {};
		params.InvoiceId = invId;

		fArray.removeAll();
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadInvoiceAdjustments", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			var InvoiceAdjustmentItem = function (it) {
				var self = this;
				self.AddedBy = it.AddedBy;
				self.AddedDT = it.AddedDT;
				self.AdjustmentId = it.AdjustmentId;
				self.Amount = it.Amount;
				self.GLAccDescription = it.GLAccDescription;
				self.GLAccNumber = it.GLAccNumber;
				self.InvoiceId = it.InvoiceId;
				self.IsAuto = it.IsAuto;
				self.Notes = it.Notes;

				self.deleteItem = function (d, e) {
					if (fnc.app.hiddenTabs()[0].TabType != 'tabInvoiceWithoutPO2') {
						fnc.invoicesApp.selectedForDeleteDeposit(d);
						$('#modConfirmDelInvDeposit').modal('show');
					} else {
						fnc.invoicesAppNoPo.selectedForDeleteDeposit(d);
						$('#modNoPOConfirmDelInvDeposit').modal('show');
					}
					return;
				}
			};

			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new InvoiceAdjustmentItem(it)) })
			} else {
				arr.push(new InvoiceAdjustmentItem(obj))
			}

			fArray(arr);

			if (callback) callback();
		})
	};

	function loadDuplicateInvoiceInfo(invNo, vendId, sbVendId, orgId, invId, callback) {
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

			var InvoiceDuplicateItem = function (it) {
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


	var addInvoiceAdjustment = function (invId, glAcctId, amount, notes, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.GLAcctId = glAcctId;
		params.Amount = amount;
		params.Notes = notes;

		//AddInvoiceAdjustment(o.Params.InvoiceId, o.Params.GLAcctId, o.Params.Amount, o.Params.Notes, o.uc)

		//loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.AddInvoiceAdjustment", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	var deleteInvoiceAdjustment = function (adjId, invId, callback) {
		//DeleteInvoiceAdjustment(o.Params.AdjustmentId, o.Params.InvoiceId, .uc)
		var params = {};
		params.AdjustmentId = adjId;
		params.InvoiceId = invId;

		//loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.DeleteInvoiceAdjustment", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	var goBack2POList = function (d, e) {
		$("ul.nav-pills li.active").removeClass("active");
		$("#invoices-page").html("");
		fnc.app.hiddenTabs.removeAll();

		$("ul.nav-pills li.invoices-tab").addClass("active");

		$("#sales-page").html("");
		$("#home-page").html("");
		$("#setup-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		windowResized()

		fnc.poListApp.goBack(function () {
			$("#po-list").load("polist.html" + appV + " #poLst", function () {
				ko.applyBindings(fnc.poListApp, poLst);
				$("#poLst").show();

				$("#tblPOListBody").height(poListTableHeight);
				scrollPOList();
				$("#poListLocation").height(poListLocationHeight);
				$("#poListVendor").height(poListVendorHeight);
				//$(".cm-layout-section").height(poListSectionHeigh);
				setDraggableModalDialog();

				$("#po-list").addClass("active");
				//hide unselected locations
				if (fnc.app.filterSelectedLocations().length > 0 && fnc.app.notSelectedLocationsHidden()) {
					$('#selectedLocationsIcon').removeClass('glyphicon-unchecked');
					$("#selectedLocationsIcon").addClass('glyphicon-check');
				}

				//set defaults
				if (fnc.poListApp.poListMode() == 'invoice-export') {

					fnc.poListApp.exportSelectType('all-not-exported');
					fnc.poListApp.exportSelectType.valueHasMutated();

					fnc.poListApp.exportType.valueHasMutated();

					$("#filterShowOptions :input").attr("disabled", true);
					$("#filterShowOptions").css("opacity", ".4");
				}

				//if (callback) callback();

				windowResized();
				initDatePickerAllDates();
				initDatePickerPastDates('#rcnPOListInvoiceDate');
			});
		});


		//load_polist(function () {
		//	$("#po-list").addClass("active");
		//	if (fnc.poListApp.poListMode() == 'invoice-export') {
		//		//set default for export mode
		//		fnc.poListApp.exportSelectType('all-not-exported');
		//		fnc.poListApp.exportSelectType.valueHasMutated();

		//		fnc.poListApp.exportType.valueHasMutated();

		//		$("#filterShowOptions :input").attr("disabled", true);
		//		$("#filterShowOptions").css("opacity", ".4");
		//	}
		//	windowResized();
		//});
	};

	var goBack2HomePage = function () {
		load_home(function () {
			$("ul.nav-pills li.active").removeClass("active");

			$("ul.nav-pills li.calendar-tab").addClass("active");
		});
	};
	// /INVOICES

	function updateLock(invId, locked, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.Locked = locked;

		//UpdateEditLock(o.Params.InvoiceId, o.Params.Locked, .uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateEditLock", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	function applyOrdered(invId, itemId, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.ItemId = itemId;

		//ApplyOrdered(o.Params.InvoiceId, o.Params.ItemId, .uc)  itemId = -1 (all items)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ApplyOrdered", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	function applyEInvoice(invId, itemId, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.ItemId = itemId;

		//ApplyInvoiced(o.Params.InvoiceId, o.Params.ItemId, .uc)  itemId = -1 (all items)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ApplyInvoiced", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	function updateAccepted(invId, accepted, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.Accepted = accepted;

		//UpdateAccepted(o.Params.InvoiceId, o.Params.Accepted, .uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateAccepted", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	function updateExported(invId, exported, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.Exported = exported;

		//Sub UpdateExported(InvoiceId As Decimal, Exported As Boolean, UserCode As Integer)
		//UpdateExportedInvoices
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateExported", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		})
	};

	//***************************************
	// eINVOICES JQUERY EFFECTS FUNCTIONS
	//***************************************
	function showElements3(tr) {
		var n = $(tr).attr('data-row-index');
		$("tr[data-row-index='" + n + "']").each(function (i, it) {
			//it.setAttribute('bgColor', 'lightblue');
			it.className = 'cm-hover';
		})
	};

	function hideElements3(tr) {
		var n = $(tr).attr('data-row-index');
		$("tr[data-row-index='" + n + "']").each(function (i, it) {
			//it.setAttribute('bgColor', 'white');
			it.className = '';
		})
	};

	function ellipsesAfterNthCharacter(txt, n) {
		var r = txt;
		var l = txt.length;
		if (l > n + 3) {
			r = txt.substr(0, n) + '...'
		}
		return r;
	}
	//***************************************
	// SETUP JQUERY EFFECTS FUNCTIONS
	//***************************************
	function showElements2(tr) {
		$(tr).attr('bgColor', 'lightblue');
		//$(tr).find('td:first input').show();
		$(tr).find('td:last button').show();
	};

	function hideElements2(tr) {
		//var checkBox = $(tr).find('td:first input');
		//if (checkBox[0].checked) {
		//	return;
		//}
		$(tr).attr('bgColor', 'white');
		//checkBox.hide();
		$(tr).find('td:last button').hide();
	};
	//***************************************
	// INVOICES JQUERY EFFECTS FUNCTIONS
	//***************************************
	function showElements(tr) {
		if (!$(tr).hasClass('cm-active-row')) {
			$(tr).attr('bgColor', 'lightblue');
			//$(tr).find('td.cm-cell-with-input').addClass('cm-tabindex-box-border');
			$(tr).find('input.cm-inputcell').addClass('cm-tabindex-box-border');
			//$(tr).find('td:last button').show();
		}
	};

	function hideElements(tr) {
		if (!$(tr).hasClass('cm-active-row')) {
			$(tr).attr('bgColor', 'white');
			//$(tr).find('td.cm-cell-with-input').removeClass('cm-tabindex-box-border');
			$(tr).find('input.cm-inputcell').removeClass('cm-tabindex-box-border');
			//$(tr).find('td:last button').hide();
		}
	};

	//***********************************
	// navigation functions			
	//***********************************

	function load_weather(callback) {
		//
		$("#default-weather-page").load("weather.html" + appV + " #weatherGadget", function () {
			fnc.weatherApp.init(function () {
				console.log('weatherGadget');
			});

			if (callback) callback();
			windowResized();
		});
	};

	function load_home(callback) {
		$("#sales-page").html("");
		$("#po-list").html("");
		$("#setup-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();
		$("#home-page").load("calendar.html" + appV + " #cldrApp", function () {
			fnc.calendarApp.init();
			ko.applyBindings(fnc.calendarApp, cldrApp);
			$("#home-page").addClass("active");
			//hide unselected locations
			if (fnc.app.filterSelectedLocations().length > 0 && fnc.app.notSelectedLocationsHidden()) {
				$('#selectedLocationsIcon').removeClass('glyphicon-unchecked');
				$("#selectedLocationsIcon").addClass('glyphicon-check');
			}


			$("#calendarLocation").height(calendarLocationHeight);

			setDraggableModalDialog();
			if (callback) callback();
			windowResized();
		})
	};

	function load_sales(callback) {
		$("#home-page").html("");
		$("#po-list").html("");
		$("#setup-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();
		fnc.salesApp.init(function () {
			$("#sales-page").load("sales.html" + appV + " #slsApp", function () {
				ko.applyBindings(fnc.salesApp, slsApp);
				$("#sales-page").addClass("active");
				//hide unselected locations
				if (fnc.app.filterSelectedLocations().length > 0 && fnc.app.notSelectedLocationsHidden()) {
					$('#selectedLocationsIcon').removeClass('glyphicon-unchecked');
					$("#selectedLocationsIcon").addClass('glyphicon-check');
				}

				$("#salesListLocation").height(salesListLocationHeight);
				$("#tblSalesListBody").height(salesListTableHeight);
				$("#salesListRightSideBar").height(salesListRighSideBarHeight);

				setDraggableModalDialog();
				if (callback) callback();
				windowResized();
				initDatePickerAllDates();
			});
		});

	};

	function load_vendors() {
		$("#home-page").html("");
		$("#po-list").html("");
		$("#setup-page").html("");
		$("#sales-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();
		fnc.vendorsApp.init(function () {
			$("#vendors-page").load("vendors.html" + appV + " #vendApp", function () {
				$("#vendApp").height(vendorsAppHeight);
				$("#tblVendorsListBody").height(vendorsTableHeight);
				scrollVendors();
				ko.applyBindings(fnc.vendorsApp, vendApp);
				setDraggableModalDialog();
				windowResized();
			});
		});
	};

	function load_polist(callback) {
		$("#sales-page").html("");
		$("#home-page").html("");
		$("#setup-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();

		fnc.poListApp.init(function () {
			$("#po-list").load("polist.html" + appV + " #poLst", function () {
				ko.applyBindings(fnc.poListApp, poLst);
				$("#poLst").show();
				//hide unselected locations
				if (fnc.app.filterSelectedLocations().length > 0 && fnc.app.notSelectedLocationsHidden()) {
					$('#selectedLocationsIcon').removeClass('glyphicon-unchecked');
					$("#selectedLocationsIcon").addClass('glyphicon-check');
				}


				$("#tblPOListBody").height(poListTableHeight);
				scrollPOList();
				$("#poListLocation").height(poListLocationHeight);
				$("#poListVendor").height(poListVendorHeight);
				//$(".cm-layout-section").height(poListSectionHeigh);
				setDraggableModalDialog();

				//set defaults
				if (fnc.poListApp.poListMode() == 'invoice-export') {

					fnc.poListApp.exportSelectType('all-not-exported');
					fnc.poListApp.exportSelectType.valueHasMutated();

					fnc.poListApp.exportType.valueHasMutated();

					$("#filterShowOptions :input").attr("disabled", true);
					$("#filterShowOptions").css("opacity", ".4");
				}

				if (callback) callback();
				windowResized();
				initDatePickerAllDates();
				initDatePickerPastDates('#rcnPOListInvoiceDate');
			});
		});
	};

	function load_legacy() {
		if (!fnc.app.prvLegacyVouchersViewEnable()) {
			return false;
		}
		$("#sales-page").html("");
		$("#home-page").html("");
		$("#po-list").html("");
		$("#setup-page").html("");
		$("#invoices-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();
		$("#legacy-page").load("legacy.html" + appV + " #legacyApp", function () {
			$("#tblLegacyListBody").height(legacyListTableHeight);
			$("#legacyListLocation").height(legacyListLocationHeight);
			$("#legacyListVendor").height(legacyListVendorHeight);

			fnc.legacyListApp.init();
			ko.applyBindings(fnc.legacyListApp, legacyApp);
			$("#legacy-page").addClass("active");
			//hide unselected locations
			if (fnc.app.filterSelectedLocations().length > 0 && fnc.app.notSelectedLocationsHidden()) {
				$('#selectedLocationsIcon').removeClass('glyphicon-unchecked');
				$("#selectedLocationsIcon").addClass('glyphicon-check');
			}

			setDraggableModalDialog2();
			windowResized();
			initDatePickerAllDates();
		});
	};

	function loadInvoice(d, e) {
		if (d.TabType == 'tabInvoiceWithPO') {
			load_hiddenTab(function () {
				//$('#invoices-page').height(invoicesPageHeight);
				fnc.invoicesApp.scrollRight();
			});
		} else if (d.TabType == 'tabInvoiceWithoutPO2') {
			load_hiddenTab2(function () {
				//$('#invoices-page').height(invoicesPageHeight);
			});
		} else {
			//console.log();
		}
	};

	function load_hiddenTab(callback) {
		$("#sales-page").html("");
		$("#po-list").html("");
		$("#setup-page").html("");
		$("#home-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();
		if (fnc.app.hiddenTabs().length) {
			var vendId = fnc.app.hiddenTabs()[0].VendId();
			var orgId = fnc.app.hiddenTabs()[0].OrgId();
			var invId = fnc.app.hiddenTabs()[0].InvoiceId;
			fnc.invoicesApp.init(vendId, orgId, invId, function () {
				$("#invoices-page").load("invoices.html" + appV + " #invApp", function () {
					ko.applyBindings(fnc.invoicesApp, invApp);

					$('.nav.nav-pills>li.active').removeClass("active");
					$('.nav.nav-pills>li.hidden-tab').addClass("active");
					$('.nav.nav-pills>li.hidden-tab').removeClass("hidden-tab-hide");

					$(".tab-pane").removeClass("active");
					$("#invoices-page").addClass("active");

					$('#tblReconcileItemListBody').on('scroll', function () {
						$('#recTableScroll').scrollLeft(this.scrollLeft);
						fnc.invoicesApp.closeCWTDropdown();
						hideAllPopovers();
					});


					if (!fnc.invoicesApp.invoiceIsReadOnly()) $('#tblRecBody').editableTableWidget();

					fnc.invoicesApp.validateInvoice(function () { });
					fnc.invoicesApp.attachBlurFunctions(function () { });

					$('#invApp').height(invoicesPageHeight);

					setDraggableModalDialog();

					if (callback) callback();

					windowResized();
					initDatePickerPastDates('#invoiceDateRegularInvoice');
				})
			});
		}
	};

	function load_hiddenTab2(callback) {
		$("#sales-page").html("");
		$("#po-list").html("");
		$("#setup-page").html("");
		$("#home-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		windowResized();
		if (fnc.app.hiddenTabs().length) {
			var vendId = fnc.app.hiddenTabs()[0].VendId();
			var orgId = fnc.app.hiddenTabs()[0].OrgId();
			var invId = fnc.app.hiddenTabs()[0].InvoiceId;
			fnc.invoicesAppNoPo.init(vendId, orgId, invId, function () {
				$("#invoices-page").load("invoices.html" + appV + " #invApp", function () {
					ko.applyBindings(fnc.invoicesApp, invApp);

					$('.nav.nav-pills>li.active').removeClass("active");
					$('.nav.nav-pills>li.hidden-tab').addClass("active");
					$('.nav.nav-pills>li.hidden-tab').removeClass("hidden-tab-hide");

					$(".tab-pane").removeClass("active");
					$("#invoices-page").addClass("active");

					fnc.invoicesAppNoPo.validateInvoice(function () { });
					fnc.invoicesAppNoPo.attachBlurFunctions(function () { });

					$('#invApp').height(invoicesPageHeight);
					$('#noPOInvoiceItems').height(400);
					setDraggableModalDialog();

					if (callback) callback();

					windowResized();
					initDatePickerPastDates('#invoiceDateManualInvoice');
				})
			});
		}
	};

	function load_setup(callback) {
		$("#sales-page").html("");
		$("#po-list").html("");
		$("#home-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#einvoices-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		fnc.setupApp.init(function () {
			$("#setup-page").load("setup.html" + appV + " #stpApp", function () {
				//load templates
				loadTemplateCollection(
					['setup/invoices/start-date.html',
						'setup/invoices/charts.html',
						'setup/invoices/dtf.html',
						'setup/invoices/gl-accounts.html',
						'setup/invoices/items-assignments.html',
						'setup/sales/charts.html',
						'setup/sales/deposits.html',
						'setup/sales/gl-accounts.html',
						'setup/sales/meal-period.html',
						'setup/connect/qb-online.html',
						'setup/general/cost-centers.html'],
					'#setupTemplates', function () {
						ko.applyBindings(fnc.setupApp, stpApp);
						$(".tab-pane").removeClass("active");
						$("#setup-page").addClass("active");
						//
						$("#tblCmStartDateBody").height(qbSetupTableHeight);

						setDraggableModalDialog();
						if (callback) callback();
						windowResized();

					})
				//includeHTML();
				//delay
				//setTimeout(function () {
				//	ko.applyBindings(fnc.setupApp, stpApp);
				//}, 1000)


			});

			fnc.setupQb.init(function () {

				//console.log('qb');
			});

		});


	};

	function load_einvoices(callback) {
		if (!fnc.app.prvEInvoicesViewEnable()) {
			return false;
		}
		$("#sales-page").html("");
		$("#po-list").html("");
		$("#home-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#setup-page").html("");
		$("#crossDoc-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		fnc.eInvoicesApp.init(function () {
			$("#einvoices-page").load("einvoices.html" + appV + " #eInvApp", function () {
				$("#tblEInvListBody").height(eInvoicesListTableHeight);
				$("#tblEInvListFilter").height(eInvoicesListTableHeight + 28);
				ko.applyBindings(fnc.eInvoicesApp, eInvApp);
				setDraggableModalDialog();
				if (callback) callback();
				windowResized();
			});
		});

	};

	function load_crossDoc(callback) {
		//privilege to load this app
		if (!true) {
			return false;
		}
		$("#sales-page").html("");
		$("#po-list").html("");
		$("#home-page").html("");
		$("#invoices-page").html("");
		$("#legacy-page").html("");
		$("#vendors-page").html("");
		$("#setup-page").html("");
		$("#einvoices-page").html("");

		clearInterval(fnc.invoiceUnlockTimer);
		clearInterval(fnc.salesFormUnlockTimer);

		fnc.crossDocApp.init(function () {
			$("#crossDoc-page").load("crossDoc.html" + appV + " #crssDcApp", function () {
				$('div#tblCrossDocListBody').height(crossDocListTableHeight);
				$('ul#crossDocListLocation').height(crossDocListLocationHeight);
				ko.applyBindings(fnc.crossDocApp, crssDcApp);
				ko.applyBindings(fnc.crossDocApp.previewer(), document.getElementById('modCrossDocPreview'));
				//hide unselected locations
				if (fnc.app.filterSelectedLocations().length > 0 && fnc.app.notSelectedLocationsHidden()) {
					$('#selectedLocationsIcon').removeClass('glyphicon-unchecked');
					$("#selectedLocationsIcon").addClass('glyphicon-check');
				}


				if (callback) callback();
				windowResized();
				initDatePickerPastDates('#invoiceDateInput1');
				initDatePickerPastDates('#invoiceDateInput2');
				initDatePickerAllDates();
				$('[id=ui-datepicker-div]').click(function (e) {
					e.stopPropagation();
				});
			});
		});
	};


	function scrollPOList() {
		$("#tblPOListBody").on('scroll', function () {
			if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
				//console.log('next page');
				if (fnc.poListApp.hasNext()) {
					fnc.poListApp.next();
					$(this).scrollTop($("#tblPOListBody").height());		//($("#tblPOListBody").height() / 2);
					windowResized();
				}
			} else if ($(this).scrollTop() == 0) {
				//console.log('previous page');
				if (fnc.poListApp.hasPrevious()) {
					fnc.poListApp.previous();
					$(this).scrollTop($("#tblPOListBody").height());				//($("#tblPOListBody").height() / 2);
					windowResized();
				}
			}
		});
	}

	function scrollVendors() {
		$("#tblVendorsListBody").on('scroll', function () {
			if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
				//console.log('next page');
				if (fnc.vendorsApp.hasNext()) {
					fnc.vendorsApp.next();
					$(this).scrollTop($("#tblVendorsListBody").height());
					windowResized();
				}
			} else if ($(this).scrollTop() == 0) {
				//console.log('previous page');
				if (fnc.vendorsApp.hasPrevious()) {
					fnc.vendorsApp.previous();
					$(this).scrollTop($("#tblVendorsListBody").height());
					windowResized();
				}
			}
		});
	}



	function getDayOfWeekName(dateStr) {
		var parts = dateStr.split("-");
		var d = new Date(parts[0], parts[1] - 1, parts[2]);
		var weekday = new Array(7);
		weekday[0] = "Sunday";
		weekday[1] = "Monday";
		weekday[2] = "Tuesday";
		weekday[3] = "Wednesday";
		weekday[4] = "Thursday";
		weekday[5] = "Friday";
		weekday[6] = "Saturday";

		var n = weekday[d.getDay()];

		return n;
	}

	var DataGrouper = (function () {
		var has = function (obj, target) {
			return _.any(obj, function (value) {
				return _.isEqual(value, target);
			});
		};

		var keys = function (data, names) {
			return _.reduce(data, function (memo, item) {
				var key = _.pick(item, names);
				if (!has(memo, key)) {
					memo.push(key);
				}
				return memo;
			}, []);
		};

		var group = function (data, names) {
			var stems = keys(data, names);
			return _.map(stems, function (stem) {
				return {
					key: stem,
					vals: _.map(_.where(data, stem), function (item) {
						return _.omit(item, names);
					})
				};
			});
		};

		group.register = function (name, converter) {
			return group[name] = function (data, names) {
				return _.map(group(data, names), converter);
			};
		};

		return group;
	})();

	DataGrouper.register("sum", function (item) {
		return _.extend({}, item.key, {
			Value: _.reduce(item.vals, function (memo, node) {
				return memo + Number(node.Value);
			}, 0)
		});
	});

	function isToday(dt) {
		var r = false;
		var t = new Date();
		var m = t.getMonth() + 1;
		var d = t.getDate();
		var y = t.getFullYear();
		if (m < 10) m = "0" + m;
		if (d < 10) d = "0" + d;
		var str = m + "/" + d + "/" + y;
		if (dt == str) r = true;
		return r;
	};
	
	function getTodayString() {
		var t = new Date();
		var m = t.getMonth() + 1;
		var d = t.getDate();
		var y = t.getFullYear();
		if (m < 10) m = "0" + m;
		if (d < 10) d = "0" + d;
		var str = m + "/" + d + "/" + y;
		return str;
	}

	function getQBOGrantURL(callback) {
		var r = "";
		$.ajax({
			dataType: "json",
			url: "/chefmod.financials.ui/qbo/config.txt",
			data: null,
			success: function (r) {
				if (callback) callback(r.qbGrantURL);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
			}
		});



	}

	function toMmDdYy(input) {
		var ptrn = /(\d{4})\-(\d{2})\-(\d{2})/;
		if (!input || !input.match(ptrn)) {
			return null;
		}
		return input.replace(ptrn, '$2/$3/$1');
	};

	includeHTML = function (callback) {
		var z, i, elmnt, file, xhttp;
		z = document.getElementsByTagName("*");
		for (i = 0; i < z.length; i++) {
			elmnt = z[i];
			file = elmnt.getAttribute("cm-include-html");
			if (file) {
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function () {
					if (this.readyState == 4 && this.status == 200) {
						elmnt.innerHTML = this.responseText;
						elmnt.removeAttribute("cm-include-html");
						includeHTML();
					}
				}
				xhttp.open("GET", file, true);
				xhttp.send();
				return;
			}
		}
		if (callback) callback();
	};


	loadTemplateCollection = function (files, templatesContainer, callback) {
		files.forEach(function (file, index) {
			$.get(file, function (template) {
				$(templatesContainer).append('<div style="display:none">' + template + '<\/div>');
				if (index == files.length - 1) {
					if (callback) callback();
				}
			})
		})
	}



