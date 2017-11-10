/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.poListApp = new function () {
	//*********************
	//defaults
	//********************* 
	var RS_PATH = "/System/Invoice List Print Summary";
	var RS_FORMAT_PDF = 0;
	var RS_FORMAT_HTML = 1;
	var RS_FORMAT_EXCEL = 2;
	var RS_FORMAT_IMAGE = 3;
	var RS_FORMAT_WORD = 4;
	var RS_FORMAT_XML = 5;
	var RS_FORMAT_CSV = 6;



	//*********************
	// private 
	//*********************

	var POListItem = function (it) {
		//Accepted: "0"
		//AcceptedBy: null
		//AcceptedDT: null
		//BackOrder: "0"
		//Completed: "0"
		//CompletedManual: "0"
		//Deleted: "0"
		//DelivDate: "07/11/2016"
		//DocsAttached: "1,1,2,3,3,3"
		//EInvoiceAttached: "0"
		//InvoiceId: "0"
		//InvoiceNum: null
		//IsManual: "0"
		//New: "1"
		//OrderTotal: "353.080000000000"
		//OrgName: "ChefMod, LLC."
		//Orgid: "151"
		//PostDate: "1900-01-01"
		//SBVendId: "0"
		//UnitId: "560"
		//VendId: "55"
		//Vendor: "Franklin Machine Products"
		//VorderNum: "1341762"
		//Xported: "0"
		//XportedBy: null
		//XportedDT: null
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = typeof it.AcceptedDT == "object" ? "" : (new Date(it.AcceptedDT)).format("yyyy-mm-dd");	//it.AcceptedDT;
		self.BackOrder = it.BackOrder;
		self.CompletedManual = it.CompletedManual;
		self.Completed = it.Completed; //-1-question sign; 0-not-completed; 1-completed; 2-completed with price discrepancy
		self.Deleted = it.Deleted;
		self.DocsAttached = typeof it.DocsAttached == "object" ? "" : it.DocsAttached;
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
		self.PONumber = it.VorderNum;
		self.OrgId = it.Orgid;
		self.VendId = typeof it.VendId == "object" ? "0" : it.VendId;

		self.SBVendId = it.SBVendId == undefined ? "0" : it.SBVendId;

		self.Xported = it.Xported;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;

		self.AcceptedDate = it.AcceptedDT ? (new Date(it.AcceptedDT)).format("yyyy-mm-dd") : "";

		self.Selected = ko.observable(false);
		self.Highlighted = ko.observable(false);
		// 0 - initial; 1 - inprogress; 2 - success; 3 - error;
		self.ExportStatus = ko.observable('initial');
		self.ExportMessage = ko.observable('');
		self.showExportMessage = function (d, e) {
			if ($(e.currentTarget).attr('data-content').length != 0) {
				$("[data-toggle='popover']").popover('destroy');
				$(e.currentTarget).attr("data-content", "");
				return;
			}

			$("[data-toggle='popover']").popover('destroy');
			$(e.currentTarget).attr("data-content", "");

			var content =
				"<div class='panel panel-default' style='margin-bottom:0;width:200px;'>" +
				"<div class='panel-body' style='padding:5px;font-size:0.8em;'>" +
				"<p style='margin:0;'>Unable to export to QuickBooks online. Please insure that all Vendors and GL Accounts are mapped and Invoice Number is not used for this Vendor.</p>" +
				"</div>" +
				"</div>"
			$(e.currentTarget).attr("data-content", content);
			$(e.currentTarget).popover("show");
		};

		self.AttachedTitle = ko.computed(function () {
			var r = '';
			if (self.DocsAttached) {
				r = "Documents attached";
				if (self.DocsAttached.indexOf(4) != -1) {
					r = "Proof of delivery attached";
				}
			}
			return r;
		}, self)

		self.AttachedCSS = ko.computed(function () {
			// 1-invoice;2-support-img;3-support-doc;4-proof-of-delivery
			var r = '';
			if (self.DocsAttached) {
				r = "fa-paperclip";
				//if (self.DocsAttached.indexOf(1) != -1) r = "glyphicon-bookmark";

				if (self.DocsAttached.indexOf(4) != -1) r = "fa-truck";

			}
			return r;
		}, self)

		self.AttachedProofOfDelivery = ko.computed(function () {
			r = false;
			if (self.DocsAttached) {
				if (self.DocsAttached.indexOf(4) != -1) {
					r = true;
				}
			}
			return r;
		}, self);

		self.StatusIcon = ko.computed(function () {
			var dummy = self.Selected();
			//completed; not-completed; accepted; exported;	deleted; price-discrepancy; question-sign; back-order;
			var r = "";
			if (self.Completed == -1) r = "question-sign";
			if (self.Completed == 0) r = "not-completed";
			if (self.Completed == 1) r = "completed";
			if (self.Completed == 2) r = "price-discrepancy";
			if (self.Accepted == 1) r = "accepted";
			if (self.Xported == 1) r = "exported";
			if (self.BackOrder == 1) r = "back-order";
			if (self.Deleted == 1) r = "deleted";
			return r;
		}, self);

		self.Linked2Invoice = ko.computed(function () {
			return self.InvoiceId == "0" ? false : true;
		}, self);

		self.DeleteButtonVisible = ko.computed(function () {
			return self.Deleted == "0" && true;
		}, self);

		self.RestoreButtonVisible = ko.computed(function () {
			return self.Deleted == "1" && true;
		}, self);

		self.CheckBoxVisible = ko.computed(function () {
			return self.InvoiceId == "0" && true;
		}, self);

		self.onItemSelectedChange = function (p, i, d, e) {
			if (fnc.poListApp.poListMode() == "invoice-management") {
				if (d.Selected()) {
					if (fnc.poListApp.selectedCompany() == '' || fnc.poListApp.selectedCompany() == d.Company) {
						fnc.poListApp.selectedCompany(d.Company);
						fnc.poListApp.selectedVendId(d.VendId);
						fnc.poListApp.selectedLocation(d.Location);
						fnc.poListApp.selectedOrgId(d.OrgId);
						fnc.poListApp.selectedItems.push(d);
						enableFilterPanel(false);
					}
				} else {
					fnc.poListApp.selectedItems.remove(d);
					if (fnc.poListApp.selectedItems().length == 0) {
						fnc.poListApp.selectedCompany('');
						fnc.poListApp.selectedVendId('');
					}
					enableFilterPanel(true);
				}
				fnc.poListApp.validateActionButtons();
			} else if (fnc.poListApp.poListMode() === "invoice-export") {
				//invoice-export

				if (d.Selected()) {
					fnc.poListApp.filteredItems().forEach(function (it) {
						if (d.InvoiceId == it.InvoiceId && !it.Selected()) {
							it.Selected(d.Selected());
							fnc.poListApp.selectedForExportItems.push(it);
						}
					})
					fnc.poListApp.selectedForExportItems.push(d);
				} else {
					fnc.poListApp.filteredItems().forEach(function (it) {
						if (d.InvoiceId == it.InvoiceId) {
							it.Selected(d.Selected());
							fnc.poListApp.selectedForExportItems.remove(it);
						}
					})
					fnc.poListApp.selectedForExportItems.remove(d);
				}

				fnc.poListApp.exportSelectedEnable(true);
				fnc.poListApp.exportSelectType('selected');

			}
			else {//invoice-download
				if (d.Selected()) {
					fnc.poListApp.selectedForDownloadItems.push(d);
				} else {
					fnc.poListApp.filteredItems().forEach(function (it) {
						if (d.InvoiceId == it.InvoiceId) {
							it.Selected(d.Selected());
							fnc.poListApp.selectedForDownloadItems.remove(it);
						}
					})
					fnc.poListApp.selectedForDownloadItems.remove(d);
				}
			}
			windowResized();
			return true;
		};

		self.onPOLinkClick = function (d, e) {
			if (d.InvoiceId == '0') {
				var poNo = Number(d.PONumber);
				fnc.poListApp.selectedPOItemSearch('');
				fnc.poListApp.selectedPOAllItems.removeAll();
				if (d.BackOrder == 1) {
					loadBackOrderItems(poNo, function () {
						fnc.poListApp.selectedPONumber(poNo);
						fnc.poListApp.selectedPOType('back-order-item');
						$("#modPOItems").modal('show');
						$("#modPOItems").one("hidden.bs.modal", function () {
							fnc.poListApp.selectedPOType('');
						})
						windowResized();
					});
				} else {
					loadPOListItems(poNo, function () {
						fnc.poListApp.selectedPONumber(poNo);
						fnc.poListApp.selectedPOType('po-item');
						$("#modPOItems").modal('show');
						$("#modPOItems").one("hidden.bs.modal", function () {
							fnc.poListApp.selectedPOType('');
						})
						windowResized();
					})
				}
			} else {
				self.onInvoiceLinkClick(d, e);
			}

		};

		self.onInvoiceLinkClick = function (d, e) {
			var companyName = d.Company;
			var invTotal = d.POTotal;
			var invNo = d.InvoiceNumber;
			var invId = d.InvoiceId;
			var poNumbers = [];
			var orgId = d.OrgId;
			var vendId = d.VendId;
			var sbVendId = d.SBVendId;
			if (sbVendId > 0) vendId = sbVendId;
			var location = d.Location;
			var invoiceType = d.IsManual == "1" ? "tabInvoiceWithoutPO2" : "tabInvoiceWithPO";
			$("#invoices-page").html("");
			fnc.app.hiddenTabs.removeAll();
			fnc.app.hiddenTabs.push(new HiddenTab(vendId, orgId, invId, invNo, '', companyName, location, poNumbers, invTotal, invoiceType));
			$('.nav.nav-pills>li.active').removeClass("active");
			$('.nav.nav-pills>li.hidden-tab').addClass("active");
			$('.nav.nav-pills>li.hidden-tab').removeClass("hidden-tab-hide");
			if (invoiceType == "tabInvoiceWithoutPO2") {
				load_hiddenTab2(function () {
					windowResized();
				});
			} else {
				load_hiddenTab(function () {
					fnc.invoicesApp.scrollRight();
					windowResized();
				});
			}
			//?
			ko.utils.arrayForEach(fnc.poListApp.selectedItems(), function (it) {
				it.Selected(false);
			});
			fnc.poListApp.selectedItems.removeAll()
		};

		self.onDeleteInvoiceClick = function (d, e) {
			fnc.poListApp.selectedForDeleteItem(d);
			$('#modConfirmDelPoInv').modal('show');
			e.preventDefault();
			return;
		};

		self.onRestoreInvoiceClick = function (d, e) {
			var invId = d.InvoiceId;
			var poNumber = d.PONumber;

			if (invId != "0") poNumber = "0";

			restoreInvoice(invId, poNumber, function () {
				fnc.poListApp.loadPOList(function () {
					fnc.poListApp.loadPOListVendors(function () {
						//fnc.poListApp.setInvoicesWithMultiplePOs(function () {
						if (callback) callback();
						windowResized();
						//})
					})
				});
			});
		};

		self.onCompletedClick = function (d, e) {
			var invId = d.InvoiceId;
			updateAccepted(invId, true, function () {
				fnc.poListApp.updateInvoicePostedStatus(invId, function () {
					//console.log(ko.toJSON(fnc.poListApp.allItems(), null, 2))
					windowResized();
				})
				//fnc.poListApp.loadPOListSummary({ InvoiceId: invId }, function () {
				//	windowResized();
				//})
			})
		};

		self.showEInvoice = function (d, e) {
			var invId = d.EInvoiceAttached;
			fnc.app.EInvoice(new fnc.EInvoiceItem);
			loadEInvoiceItems(invId, fnc.app.EInvoice(), function () {
				$("#modShowEInvoice").modal('show');
				$("#modShowEInvoice").one("hidden.bs.modal", function () {
					fnc.app.EInvoice(null);
				})
				windowResized();
			});
		};

		self.ExpandedView = ko.observable(false);
		self.MultiplePOs = ko.observable(false);
		self.RelatedPOList = ko.observableArray();

		self.showAttachedDocs = function (d, e) {
			var orgId = self.OrgId;
			var orgName = self.Location;
			var invId = self.InvoiceId;
			var invNum = self.InvoiceNumber;
			var invTotal = self.POTotal;
			var poList = '';
			var vendId = self.VendId;
			var sbVendId = self.SBVendId;
			var company = self.Company;
			var attachedDocs = fnc.app.attachedItems;
			var availableDocs = ko.observableArray()
			var invDate = toMmDdYy(self.DeliveryDate);		//self.DeliveryDate;

			fnc.loadInvoiceDocumentList('', '', invId, orgId, function (r) {
				attachedDocs(r);
				var toDate = getTodayString();
				var fromDate = addDays2(toDate, -29);
				fnc.loadInvoiceDocumentList(fromDate, toDate, 0, orgId, function (r) {
					availableDocs(r);
					var it = new fnc.AttachmentsClass(orgId, orgName, invId, invNum, invTotal, invDate, poList, vendId, sbVendId, company, attachedDocs, availableDocs);
					loadDocumentTypes(function (r) {
						it.documentTypes(r);
						fnc.app.attachmentsObject(it);
						$('#modAttachments').modal('show');
					})
				})
			})

			$("#modAttachments").one("hidden.bs.modal", function () {
				fnc.app.attachmentsObject(null);
			})

		};
		// </self.showAttachedDocs>
	};

	var POListLegacyItem = function (it) {
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = it.AcceptedDT;
		self.Company = it.Vendor;
		self.DeliveryDate = it.DelivDate;
		self.InvoiceNumber = it.InvoiceNum;
		self.New = it.New;
		self.POTotal = it.OrderTotal;
		self.Location = it.OrgName;
		self.UnitId = it.UnitId;
		self.PONumber = it.VorderNum;
		self.OrgId = it.orgid;
		self.VendId = it.vendid;

		self.Selected = ko.observable(false);
	}

	var POListVendor = function (it) {
		var self = this;
		self.VendId = it.VendId;
		self.SBVendId = it.SBVendId;
		self.Company = typeof it.Company == "object" ? "N/A" : it.Company;
		self.isPODeleted = it.Deleted;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (fnc.poListApp == undefined) return;
			fnc.poListApp.pageNumber(0);
			if (self.Selected()) {
				fnc.poListApp.filterSelectedVendors.push(self.VendId + '||' + self.SBVendId);
				fnc.poListApp.clearVendorsFilterVisible(true);
			} else {
				fnc.poListApp.filterSelectedVendors.remove(self.VendId + '||' + self.SBVendId);
				if (fnc.poListApp.filterSelectedVendors().length == 0)
					fnc.poListApp.clearVendorsFilterVisible(false);
			}
		})
	};

	var VendorListItem = function (it) {
		var self = this;
		self.Address1 = it.Address1;
		self.Address2 = it.Address2;
		self.City = it.City;
		self.Code = it.Code;
		self.Company = it.Company;
		self.CustomVendCode = it.CustomVendCode;
		self.CustomVendCompany = it.CustomVendCompany;
		self.DefaultRecordId = it.DefaultRecordId;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccId = it.GLAccId;
		self.GLAccNumber = it.GLAccNumber;
		self.PayTermId = it.PayTermId;
		self.RequiredPO = it.RequirePO;
		self.SBVendId = it.SBVendId;
		self.State = it.State;
		self.VendorId = it.VendID;
		self.Zip = it.Zip;

		self.Address = self.Address1 + ", " + self.City + " " + self.State + " " + self.Zip;
		self.Tooltip = it.RequirePO == "1" ? "PO will be automatically created upon a manual invoice creation in your purchase history" : "";

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.poListApp.manualInvoiceVendors().length; i++) {
					if (fnc.poListApp.manualInvoiceVendors()[i] != self) {
						//if ((fnc.poListApp.manualInvoiceVendors()[i].VendorId != self.VendorId) && (fnc.poListApp.manualInvoiceVendors()[i].SBVendId != self.SBVendId) && fnc.poListApp.manualInvoiceVendors()[i].Selected()) {
						fnc.poListApp.manualInvoiceVendors()[i].Selected(false);
					}
				}
				fnc.poListApp.manualInvoiceSelectedVendor(self);
			} else {
				fnc.poListApp.manualInvoiceSelectedVendor(null);
			}
		});

	};

	var POItem = function (it) {
		var self = this;
		self.Brand = it.Brand;
		self.CWT = it.CWT;
		self.Description = it.Description;
		self.Ext = it.Ext;
		self.Quantity = it.Quantity;
		self.UOM = it.UOM;
		self.Unit = it.Unit;
		self.UnitPrice = it.UnitPrice;
		self.ItemId = it.itemid;

	}

	var BackOrderItem = function (it) {
		var self = this;
		self.Brand = it.Brand;
		self.Ext = it.Ext;
		self.Description = it.ItemDescr;
		self.Quantity = it.Qty;
		self.UOM = it.UOM;
		self.Unit = it.Unit;
		self.UnitPrice = it.UnitPrice;
		self.CWT = it.Units;
		self.InvId = it.invoiceid;
		self.ItemId = it.itemid;

	}

	var LocationItem = function (it) {
		var self = this;
		self.LocationId = it.locationId;
		self.LocationName = it.locationName;
		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.poListApp.manualInvoiceOrganizations().length; i++) {
					if ((fnc.poListApp.manualInvoiceOrganizations()[i].LocationId != self.LocationId) && fnc.poListApp.manualInvoiceOrganizations()[i].Selected()) {
						fnc.poListApp.manualInvoiceOrganizations()[i].Selected(false);
					}
				}
				fnc.poListApp.manualInvoiceSelectedOrganization(self);
			} else {
				fnc.poListApp.manualInvoiceSelectedOrganization(null);
			}
		})
	};

	var HiddenTab = function (vendId, orgId, invId, invNo, invDate, companyName, location, includedPoIdList, includedPoTotalSum, tabType) {
		var self = this;
		self.VendId = ko.observable(vendId);
		self.OrgId = ko.observable(orgId);
		self.OrgName = ko.observable(location);
		self.InvoiceId = invId;
		self.InvoiceNumber = ko.observable(invNo);
		self.InvoiceDate = invDate;
		self.CompanyName = ko.observable(companyName);
		self.Total = includedPoTotalSum;
		self.TabType = tabType;
		self.Active = ko.observable(false);

		self.removeHiddenTab = function (d, e) {
			e.stopPropagation();
			//e.preventDefault();
			$("ul.nav-pills li.active").removeClass("active");
			$("#invoices-page").html("");
			fnc.app.hiddenTabs.removeAll();

			$("ul.nav-pills li.invoices-tab").addClass("active");
			load_polist();
			setTimeout(function () {
				$("#po-list").addClass("active");
				windowResized();
			});
		};

	};

	//temp
	var GLDistributionItem = function (it) {
		var self = this;
		self.GLAccNumber = it.GLAccNumber;
		self.GLAccDescription = it.GLAccDescription;
		self.SubTotal = it.SubTotal;
		self.Deposit = '';	//it.Deposit;
		self.Tax = it.Tax;
		self.Freight = it.Freight;
		self.Discount = it.Discount;

		self.Total = ko.computed(function () {
			return Number(self.SubTotal) + Number(self.Deposit) + Number(self.Tax) + Number(self.Freight) - Number(self.Discount);
		}, self);
	};

	//functions



	var enableFilterPanel = function (enabled) {
		if (enabled) {
			$("#filterShowOptions :input").removeAttr("disabled");
			$("#filterShowOptions").css("opacity", "1");
			$("#filterVendorOptions :input").removeAttr("disabled");
			$("#filterVendorOptions").css("opacity", "1");
		} else {
			$("#filterShowOptions :input").attr("disabled", true);
			$("#filterShowOptions").css("opacity", ".4");
			$("#filterVendorOptions :input").attr("disabled", true);
			$("#filterVendorOptions").css("opacity", ".4");
		}
	};

	var enableFilterPanel1 = function (enabled) {
		if (enabled) {
			//deleted enable and disable is controlled by ko observable deleteDisabled
			$("#filterShowOptions :input:not(#showOptionsDeleted)").removeAttr("disabled");
			$("#filterShowOptions").css("opacity", "1");
		} else {
			$("#filterShowOptions :input").attr("disabled", true);
			$("#filterShowOptions").css("opacity", ".4");
		}
	};

	var resetEnteredData = function () {
		var self = fnc.poListApp;
		if (self == undefined) return;
		self.enteredInvoiceNo('');
		self.enteredInvoiceDate('');
		self.enteredGross('');
		self.enteredDiscount('');
		self.enteredTax('');
		self.enteredFreight('');

		self.selectedCompany('');
		self.selectedItems.removeAll();
	}

	var loadPOListItems = function (poNumber, callback) {
		var params = {};
		params.VorderNum = poNumber;

		//POListLoadPOItems(o.Params.VorderNum)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.POListLoadPOItems", params, function (response) {
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
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new POItem(it)) })
			} else {
				arr.push(new POItem(obj))
			}

			self.selectedPOAllItems(arr);

			if (callback) callback();
		})

	};

	var loadPOListOneInvoiceSummary = function (invId, arr, callback) {
		var params = {};
		params.InvoiceId = invId;

		//Function LoadPOListOneInvoiceSummary(InvoiceId As Decimal) As String

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadPOListOneInvoiceSummary", params, function (response) {
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
			var obj = JSON.parse(response.d).result.row;
			//var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new POListItem(it)) })
			} else {
				arr.push(new POListItem(obj))
			}

			if (callback) callback();
		})
	};

	var createInvoice = function (vendId, orgId, invNo, invDate, gross, discount, tax, freight, invId, callback) {
		var params = {};
		params.VendId = vendId;
		params.OrganizationId = orgId;
		params.InvoiceNumber = invNo;
		params.InvoiceDate = invDate;
		params.Gross = gross;
		params.Discount = discount;
		params.Tax = tax;
		params.Freight = freight;

		//CreateInvoice(o.Params.VendId, o.Params.OrganizationId, o.Params.InvoiceNumber, o.Params.InvoiceDate, o.Params.Gross, o.Params.Discount, o.Params.Tax, o.Params.Freight, o.uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.CreateInvoice", params, function (response) {
			loading(false);
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			invId(r);

			if (callback) callback();
		})
	};

	var createInvoiceFromPO = function (poList, invNo, invDate, gross, discount, tax, freight, invId, callback) {
		var params = {};
		params.PONumList = poList;
		params.InvoiceNumber = invNo;
		params.InvoiceDate = invDate;
		params.Gross = gross;
		params.Discount = discount;
		params.Tax = tax;
		params.Freight = freight;

		//CreateInvoiceFromPO(o.Params.PONumList, o.Params.InvoiceNumber, o.Params.InvoiceDate, o.Params.Gross, o.Params.Discount, o.Params.Tax, o.Params.Freight, o.uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.CreateInvoiceFromPO", params, function (response) {
			loading(false);
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			invId(r);

			if (callback) callback();
		})

	};

	var createManualInvoice = function (sbVendId, vendId, orgId, invNo, invDate, gross, discount, tax, freight, invId, callback) {
		var params = {};
		params.SBVendId = sbVendId;
		params.VendId = vendId;
		params.OrganizationId = orgId;
		params.InvoiceNumber = invNo;
		params.InvoiceDate = invDate;
		params.Gross = gross;
		params.Discount = discount;
		params.Tax = tax;
		params.Freight = freight;

		//Function CreateManualInvoice(SBVendId As Integer, VendId As Integer, OrganizationId As Integer, InvoiceNumber As String, InvoiceDate As Date, Gross As Double, Discount As Double, Tax As Double, Freight As Double, UserCode As Integer) As Decimal

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.CreateManualInvoice", params, function (response) {
			loading(false);
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			invId(r);

			if (callback) callback();
		})
	};

	var addInvoiceItemManual = function (invId, glAccId, subTotal, callback) {
		// AddInvoiceItemManual(o.Params.InvoiceId, o.Params.GLAcctId, o.Params.SubTotal, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.GLAcctId = glAccId;
		params.SubTotal = subTotal;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.AddInvoiceItemManual", params, function (response) {
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


	var deleteInvoice = function (invId, poNo, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.PONumber = poNo;

		//DeleteInvoice(o.Params.InvoiceId, o.Params.PONumber, .uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.DeleteInvoice", params, function (response) {
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

	var restoreInvoice = function (invId, poNo, callback) {
		var params = {};
		params.InvoiceId = Number(invId);
		params.PONumber = poNo;

		//RestoreInvoice(o.Params.InvoiceId, o.Params.PONumber, .uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.RestoreInvoice", params, function (response) {
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

	var updateExportedInvoices = function (invoices, exported, callback) {
		var params = {};
		params.InvoiceIdList = invoices;
		params.Exported = exported;

		//Sub UpdateExported(InvoiceIdList As String, Exported As Boolean, UserCode As Integer)
		//UpdateExportedInvoices
		//loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateExportedInvoices", params, function (response) {
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

	var loadExportedData = function (invoices, fileName, orgId, callback) {
		var params = {};
		params.InvoiceIds = invoices;
		params.ExportType = fnc.poListApp.exportType();
		params.FullBill = fnc.poListApp.exportQBFullBill() == '1';

		if (fnc.poListApp.exportType() == 'export-excel') {
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ExportInvoices", params, function (response) {
				loading(false);
				var arr = [];

				if (response.d == '') {
					if (callback) callback();
					windowResized();
					return;
				} else {
					var r = eval('(' + response.d + ')');
					if (r.result == 'error') {
						windowResized();
						return;
					}

					var obj = JSON.parse(response.d).result.row;

					if (obj[0]) {
						//******* ARRAY *********
						//file header
						var hr = obj[0];
						var row = [];
						for (var key in hr) {
							//console.log("Field: " + key);
							if (typeof (hr[key]) == 'object') {
								if (hr[key] != null) {
									var it2 = hr[key];
									for (var key2 in it2) {
										if (key2.toLowerCase().indexOf('header') != -1) {
											row.push(it2[key2]);
										}
									}
								}
							} else {
								//console.log("Field: " + key);
								//console.log("Value: " + hr[key]);
							}
						}
						arr.push(row);

						//file data
						obj.forEach(function (it) {
							row = [];
							for (var key in it) {
								//console.log("Field: " + key);
								if (typeof (it[key]) == 'object') {
									if (it[key] != null) {
										var it2 = it[key];
										var n = 0;
										for (var key2 in it2) {
											n++;
											if (key2.toLowerCase().indexOf('text') != -1) {
												row.push(it2[key2]);
											}
										}
										if (n == 1) {
											row.push('');
										}
									}
								} else {
									//console.log("Field: " + key);
									//console.log("Value: " + it[key]);
								}
							}
							arr.push(row);
						})
					} else {
						//******* SINGLE OBJECT (NOT ARRAY)  *********
						//console.log(obj);
						//file header
						var hr = obj;
						var row = [];
						for (var key in hr) {
							//console.log("Field: " + key);
							if (typeof (hr[key]) == 'object') {
								if (hr[key] != null) {
									var it2 = hr[key];
									for (var key2 in it2) {
										if (key2.toLowerCase().indexOf('header') != -1) {
											row.push(it2[key2]);
										}
									}
								}
							} else {
								//console.log("Field: " + key);
								//console.log("Value: " + hr[key]);
							}
						}
						arr.push(row);

						row = [];
						for (var key in obj) {
							//console.log("Field: " + key);
							if (typeof (obj[key]) == 'object') {
								if (obj[key] != null) {
									var it2 = obj[key];
									var n = 0;
									for (var key2 in it2) {
										n++;
										if (key2.toLowerCase().indexOf('text') != -1) {
											row.push(it2[key2]);
										}
									}
									if (n == 1) {
										row.push('');
									}
								}
							} else {
								//console.log("Field: " + key);
								//console.log("Value: " + obj[key]);
							}
						}
						arr.push(row);
					}

				}

				var data = arr.slice(0);
				var csvContent = "";
				csvContent = arraysToRows(data);
				var encodedUri = encodeURIComponent(csvContent);
				//console.log(encodedUri);
				//browserName.toUpperCase().indexOf('IE') != -1 
				if (browserName == 'IE' || browserName == 'Edge') {
					var fileData = [csvContent];
					var blobObject = new Blob(fileData);
					window.navigator.msSaveOrOpenBlob(blobObject, csvInvoiceExportFileName);
				} else if (browserName == 'Safari') {


					console.log('Safari csv files export');
					errMessage('Export works with the following browsers: Chrome, Firefox, IE, Edge.\nPlease try again or contact ChefMod support.');
					$('#modMessage').modal('show');
					// close modal window
					$("#modMessage").one("hidden.bs.modal", function () {
						errMessage('');
					});


					//var fileData = [csvContent];
					//var blobObject = new Blob(fileData, { type: "text/plain;charset=utf-8" });
					//saveAs(blobObject, csvInvoiceExportFileName);


					//var file = new File(["Hello, world!"], "hello world.txt", { type: "text/plain;charset=utf-8" });
					//saveAs(file);


					//var link = document.createElement("a");
					//link.id = "csvDwnLink";
					//document.body.appendChild(link);
					//window.URL = window.URL || window.webkitURL;
					//var csv = "\ufeff" + [csvContent],
					//		csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
					//		filename = 'filename.csv';
					//$("#csvDwnLink").attr({ 'download': filename, 'href': csvData });
					//$('#csvDwnLink')[0].click();
					//document.body.removeChild(link);


				} else {
					var a = document.createElement('a');
					a.href = 'data:attachment/csv,' + encodedUri;
					a.target = '_blank';
					a.download = csvInvoiceExportFileName;
					document.body.appendChild(a);
					a.click();
				}
				if (callback) callback();
			});
		} else if (fnc.poListApp.exportType() == 'export-qbd') {
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ExportInvoices", params, function (response) {
				loading(false);
				var arr = [];

				if (response.d == '') {
					if (callback) callback();
					windowResized();
					return;
				} else {
					var r = eval('(' + response.d + ')');
					if (r.result == 'error') {
						windowResized();
						return;
					}
					//var obj = JSON.parse(response.d).result.row;
				}

				var csvContent = JSON.parse(response.d).result;
				csvContent = csvContent.replace(/\\t/g, '\t');
				csvContent = csvContent.replace(/\\n/g, '\n');
				var encodedUri = encodeURIComponent(csvContent);
				//console.log(encodedUri);
				//browserName.toUpperCase().indexOf('IE') != -1 
				if (browserName == 'IE' || browserName == 'Edge') {
					var fileData = [csvContent];
					var blobObject = new Blob(fileData);
					window.navigator.msSaveOrOpenBlob(blobObject, fileName);
				} else {
					var a = document.createElement('a');
					a.href = 'data:attachment/iif,' + encodedUri;
					a.target = '_blank';
					a.download = fileName;
					document.body.appendChild(a);
					a.click();
				}
				if (callback) callback();
			});
		} else if (fnc.poListApp.exportType() == 'export-qbo') {
			//UploadInvoices(o.Params.OrganizationId, o.Params.InvoiceIds)
			params.OrganizationId = orgId;
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.UploadInvoices", params, function (response) {
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
		} else {
			console.log(fnc.poListApp.exportType());
		}

	};

	var doExport = function () {
		var xType = fnc.poListApp.exportType();
		var arrInvoices = [];
		var strInvoices = "";
		var arrLocations = [];
		var orgIds = [];
		if (xType == "export-excel") {
			fnc.poListApp.selectedForExportItems().forEach(function (it) {
				if (arrInvoices.indexOf(it.InvoiceId) == -1) {
					arrInvoices.push(it.InvoiceId);
				}
			});
			strInvoices = arrInvoices.toString();

			loadExportedData(strInvoices, "", 0, function () {
				updateExportedInvoices(strInvoices, true, function () {
					self.loadPOList(function () {
						fnc.poListApp.selectedForExportItems.removeAll();
						//self.filteredItems().forEach(function (it) {
						//	if (strInvoices.indexOf(it.InvoiceId) != -1 && it.Accepted == '1' && it.Xported == '1') {
						//		it.Selected(true);
						//	} else {
						//		it.Selected(false);
						//	}
						//})
						//self.setInvoicesWithMultiplePOs(function () {
						//if (callback) callback();
						windowResized();
						//})
					})
				});
			});
		} else if (xType == "export-qbd") {

			fnc.poListApp.selectedForExportItems().forEach(function (it) {
				var obj = { id: it.OrgId, name: it.Location };
				if (orgIds.indexOf(obj.id) == -1) {
					orgIds.push(obj.id);
					arrLocations.push(obj);
				}
			});
			//console.log(orgIds.toString());
			//console.log(arrLocations);
			for (var i = 0; i < arrLocations.length; i++) {
				var l = arrLocations[i];
				var orgName = l.name;
				var orgId = l.id;
				arrInvoices = [];
				for (var j = 0; j < fnc.poListApp.selectedForExportItems().length; j++) {
					var it = fnc.poListApp.selectedForExportItems()[j];
					if (arrInvoices.indexOf(it.InvoiceId) == -1 && it.OrgId == orgId) {
						arrInvoices.push(it.InvoiceId);
					}
				}
				iifInvoiceExportFileName = l.name.replace(/[^\w]/g, '_') + ".iif";
				strInvoices = arrInvoices.toString();
				//console.log(iifInvoiceExportFileName);
				//console.log(arrInvoices.toString());
				loadExportedData(strInvoices, iifInvoiceExportFileName, orgId, function () {
					updateExportedInvoices(strInvoices, true, function () {
						if (i == arrLocations.length - 1) {
							self.loadPOList(function () {
								self.filteredItems().forEach(function (it) {
									if (strInvoices.indexOf(it.InvoiceId) != -1 && it.Accepted == '1' && it.Xported == '1') {
										it.Selected(true);
									} else {
										it.Selected(false);
									}
								})
								windowResized();
							})
						}
					});
				});
			}
		} else if (xType == "export-qbo") {
			arrInvoices = [];
			fnc.poListApp.selectedForExportItems().forEach(function (it) {
				if (arrInvoices.indexOf(it.InvoiceId) == -1) {
					//var obj = { orgId: it.OrgId, orgName: it.Location, invId: it.InvoiceId };
					//console.log(obj);

					arrInvoices.push(it.InvoiceId);
					var orgId = it.OrgId;
					var invId = it.InvoiceId;

					uploadQBOneInvoice(orgId, invId, function () {
						updateExportedInvoices(invId, true, function () {
							it.Selected(false);
							console.log();
						});
					})
				}

			});
		}
	};

	var uploadQBOneInvoice = function (orgId, invId, callback) {
		//UploadInvoices(o.Params.OrganizationId, o.Params.InvoiceIds)

		var params = {};
		params.OrganizationId = orgId;
		params.InvoiceIds = invId;

		//if (callback) callback("");
		//return;

		//loading(true);
		ajaxPostMsg("ChefMod.Financials.UI.Controllers.QBOHelper.UploadInvoices", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback("");
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				var m = eval('(' + response.m + ')');
				if (callback) callback(m.errMsg);
				return;
			}
		});
	};


	var loadBackOrderItems = function (poNumber, callback) {
		var params = {};
		params.VorderNum = poNumber;

		//LoadBackOrderItems(o.Params.VorderNum)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadBackOrderItems", params, function (response) {
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
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new BackOrderItem(it)) })
			} else {
				arr.push(new BackOrderItem(obj))
			}

			self.selectedPOAllItems(arr);

			if (callback) callback();
		})
	};

	var echoUserCode = function (callback) {
		var params = {};
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.EchoUserCode", params, function (response) {
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
			var obj = JSON.parse(response.d);

			if (callback) callback();
		})
	}

	function checkFileExists(fileId, pageNumber, callbackSuccess, callbackError) {
		var params = {};
		params.fileId = fileId;
		params.pageNumber = Number(pageNumber);
		ajaxPost("ChefMod.Financials.UI.Controllers.FileManager.FileExists", params, function (response) {
			if (response.d) {
				var fileExists = JSON.parse(response.d).result.toLowerCase() === "true";
				if (callbackSuccess) callbackSuccess(fileExists);
			}
			else {
				if (callbackError) callbackError();
			}
		});
	}

	//*********************
	// public 
	//*********************

	var self = this;

	self.init = function (callback) {
		self.allItems.removeAll();
		self.selectedItems.removeAll();
		self.filterAvailableVendors.removeAll();
		//reset search result filters
		self.poListSearch("");
		self.showResultOption("all");
		self.deletedSearch(false);
		self.searchVendorsFilter("");
		//self.clearVendorsFilter();
		self.filterSelectedVendors.removeAll();
		self.clearVendorsFilterVisible(false);

		self.loadPOList(function () {
			self.loadPOListVendors(function () {
				//self.setInvoicesWithMultiplePOs(function () {
				self.allItems.valueHasMutated();
				if (callback) callback();
				windowResized();
				//})
			})
		});
	}

	self.goBack = function (callback) {
		self.allItems.removeAll();
		self.selectedItems.removeAll();

		if (self.filterSelectedVendors().length == 0) {
			self.filterAvailableVendors.removeAll();
			self.loadPOList(function () {
				self.loadPOListVendors(function () {
					//self.setInvoicesWithMultiplePOs(function () {
					if (callback) callback();
					windowResized();
					//})
				});
			});
		} else {
			self.loadPOList(function () {
				//self.setInvoicesWithMultiplePOs(function () {
				if (callback) callback();
				windowResized();
				//})
			});
		}
	};

	self.drillDown = function (callback) {
		self.allItems.removeAll();
		self.selectedItems.removeAll();
		self.filterAvailableVendors.removeAll();
		//reset search result filters
		self.poListSearch("");
		//self.showResultOption("all");
		self.deletedSearch(false);
		self.searchVendorsFilter("");
		self.clearVendorsFilter();
		self.clearVendorsFilterVisible(false);

		self.loadPOList(function () {
			self.loadPOListVendors(function () {
				//self.setInvoicesWithMultiplePOs(function () {
				if (callback) callback();
				windowResized();
				//})
			});
		});

	};

	self.sortPOList = function (arr) {
		//
		var prop = self.activeSort().sortPropertyName;
		var ascSort, descSort;
		if (prop != 'POTotal') {
			ascSort = function (a, b) { return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
			descSort = function (a, b) { return a[prop] > b[prop] ? -1 : a[prop] < b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
		} else {
			ascSort = function (a, b) { return a[prop] - b[prop] };
			descSort = function (a, b) { return b[prop] - a[prop] };
		}

		var sortFunc = self.activeSort().asc() ? ascSort : descSort;
		arr.sort(sortFunc);
	};

	self.updateInvoicePostedStatus = function (invId, callback) {
		for (var j = 0; j < fnc.poListApp.allItems().length; j++) {
			var item = fnc.poListApp.allItems()[j];
			if (invId == item.InvoiceId) {
				item.Accepted = '1';
				item.Selected.valueHasMutated();
				fnc.poListApp.allItems.splice(j, 1, item);
			}
		}
		if (callback) callback();
	};

	self.loadPOListSummary = function (d, callback) {
		var invId = d.InvoiceId;
		var arr = [];
		loadPOListOneInvoiceSummary(invId, arr, function () {
			for (var i = 0; i < arr.length; i++) {
				var it = arr[i];
				var found = false;
				for (var j = 0; j < fnc.poListApp.allItems().length; j++) {
					var item = fnc.poListApp.allItems()[j];
					//item.PONumber == it.PONumber || item.InvoiceId == it.InvoiceId
					if (item.InvoiceId == it.InvoiceId && item.PONumber == it.PONumber) {
						it.ExpandedView(item.ExpandedView());
						it.MultiplePOs(item.MultiplePOs());
						it.RelatedPOList(item.RelatedPOList());
						found = true;
						//replace					
						fnc.poListApp.allItems.splice(j, 1, it);
					}
				}
				//if (!found) {
				//	//insert
				//	fnc.poListApp.allItems.push(it);
				//}
			}
			if (callback) callback();
		});
	};

	//invoice-management, invoice-export
	self.poListMode = ko.observable('invoice-management');
	self.poListMode.subscribe(function () {
		var mode = self.poListMode();
		if (mode == 'invoice-management') {
			self.filteredItems().forEach(function (it) {
				it.Selected(false);
			});
			enableFilterPanel(true);
		} else if (self.poListMode() === "invoice-export") {
			self.exportSelectType('all-not-exported');
			self.exportSelectType.valueHasMutated();
			self.exportType.valueHasMutated();
			//debugg
			//windowResized();
		}
		else {
			self.selectedForDownloadItems.removeAll();
			self.filteredItems().forEach(function (it) {
				it.Selected(false);
			})
			enableFilterPanel(true);
		}
	}, self);

	self.poListManagementCSS = ko.computed(function () {
		//poListModeInactiveTab
		var cssName = '';
		var mode = self.poListMode();
		if (mode == 'invoice-management') {
			cssName = 'poListModeActiveTab';
		} else {
			cssName = 'poListModeInactiveTab';
		}
		return cssName;
	});

	self.poListExportModeCSS = ko.computed(function () {
		//poListModeInactiveTab
		var cssName = '';
		var mode = self.poListMode();
		if (!fnc.app.prvInvoicesExportEnable()) {
				cssName = 'cm-disabled-tab'
		}
		else if (mode == 'invoice-export') {
			cssName = 'poListModeActiveTab';
		}
		else {
			cssName = 'poListModeInactiveTab';
		}
		return cssName;
	});

	self.poListDownloadModeCSS = ko.computed(function () {
		return self.poListMode() === 'invoice-download' ? 'poListModeActiveTab' : 'poListModeInactiveTab';
	});

	self.setPOListManagementMode = function (d, e) {
		self.poListMode('invoice-management');
		self.showResultOption('all');
		self.preShowResultOption('all');
		self.deleteDisabled(false);
		enableFilterPanel1(true);
	};

	self.setPOListExportMode = function (d, e) {
		self.poListMode('invoice-export');
		self.showResultOption('accepted');
		self.preShowResultOption('all');
		self.deleteDisabled(false);
		enableFilterPanel1(false);
	};

	self.setPOListDownloadMode = function (d, e) {
		self.poListMode('invoice-download');
		self.preShowResultOption('invoices');
		self.showResultOption('accepted');
		self.deleteDisabled(true);
		enableFilterPanel1(true);
	}
	//search database
	self.poListSearchKeywords = ko.observable('');

	//search result filters
	self.poListSearch = ko.observable('');
	//all; accepted; not-accepted; not-completed; completed;
	self.showResultOption = ko.observable("all");
	//invoices or all
	self.preShowResultOption = ko.observable("all");
	self.deleteDisabled = ko.observable(false);

	self.deletedSearch = ko.observable(false);

	//invoice management
	self.enteredInvoiceNo = ko.observable('');
	self.enteredInvoiceNo.subscribe(function () {
		self.validateActionButtons();
	}, self);

	//invoice No and Date 
	self.enteredInvoiceDate = ko.observable('');
	self.enteredInvoiceDate.subscribe(function () {
		self.validateActionButtons();
	}, self);

	//invoice Gross, Discount, Net
	self.enteredGross = ko.observable('');
	self.enteredGross.subscribe(function () {
		self.validateActionButtons();
	}, self);
	self.enteredDiscount = ko.observable('');
	self.computedNet = ko.computed(function () {
		if (self.enteredGross().length == 0) {
			return '';
		} else {
			var total = 0;
			if (self.enteredDiscount().length == 0) {
				total = Number(self.enteredGross());
			} else {
				total = Number(self.enteredGross()) - Number(self.enteredDiscount());
			}

			return formatCurrency(total);
		}
	});

	//invoice Total, Tax, Freight
	self.enteredTax = ko.observable('');
	self.enteredFreight = ko.observable('');

	self.exportSelectedEnable = ko.observable(false);
	//self.printSelectedEnable = ko.observable(false);

	//all, all-not-exported, selected
	self.exportSelectType = ko.observable('all-not-exported');
	self.exportSelectType.subscribe(function () {
		if (self.poListMode() == 'invoice-export') {
			//Export
			var type = self.exportSelectType();
			if (type == 'all-not-exported') {
				self.exportSelectedEnable(false);
				self.selectedForExportItems.removeAll();
				self.filteredItems().forEach(function (it) {
					if (it.Accepted == '1' && it.Xported == '0') {
						it.Selected(true);
						self.selectedForExportItems.push(it);
					} else {
						it.Selected(false);
					}
				})
			}
		}
		else {
			//Management
			return;
		}
	}, self);

	self.downloadIncludeOptions = {
		invoiceSummary: {
			selected: ko.observable(true),
			name: "Invoice Summary"
		},
		invoiceRecord: {
			selected: ko.observable(false),
			name: "Invoice Printout"
		},
		eInvoice: {
			selected: ko.observable(false),
			name: "EInvoice Printout"
		},
		invoiceDocuments: {
			selected: ko.observable(true),
			name: "Invoice Document Attachments"
		},
		proofOfDeliveries: {
			selected: ko.observable(true),
			name: "Proof of Delivery Attachments"
		},
		supportingImages: {
			selected: ko.observable(false),
			name: "Supporting Image Attachments"
		},
		supportingDocuments: {
			selected: ko.observable(false),
			name: "Supporting Document Attachments"
		}
	}

	//export-excel, export-qbd, export-qbo
	self.exportType = ko.observable("export-excel");
	self.exportType.subscribe(function () {
		switch (self.exportType()) {
			case 'export-excel':
				$("button[data-value='export-qbd']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-qbo']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-excel']").addClass('cm-active-toggle-button');
				break;
			case 'export-qbd':
				$("button[data-value='export-excel']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-qbo']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-qbd']").addClass('cm-active-toggle-button');
				break;
			case 'export-qbo':
				$("button[data-value='export-excel']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-qbd']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-qbo']").addClass('cm-active-toggle-button');
				break;
			default:
				$("button[data-value='export-qbd']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-qbo']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-excel']").addClass('cm-active-toggle-button');
		}
	}, self);
	self.setExportType = function (d, e) {
		self.exportType(e.currentTarget.getAttribute('data-value'));
	}
	//canceled: -1; initial: 0; started: 1; ended: 2; 
	self.exportProgress = ko.observable('initial');

	//Full Bill == '1' or Transactions Only == '0'
	self.exportQBFullBill = ko.observable('0');


	//selected
	self.selectedItems = ko.observableArray();
	self.selectedForDeleteItem = ko.observable(null);
	self.selectedForExportItems = ko.observableArray();

	self.selectedForDownloadItems = ko.observableArray();
	self.allSelected = ko.pureComputed({
		read: function () {
			var poListMode = self.poListMode();
			var selectedItems = poListMode === 'invoice-export' ? self.selectedForExportItems() :  self.selectedForDownloadItems()
			var allRelevantItems = poListMode === 'invoice-export' ? self.filteredItems().filter(function (item) {
				return item.Accepted === "1";
			}) : self.collapsedItems();
			return allRelevantItems.length === selectedItems.length && allRelevantItems.length !== 0;
		},
		write: function (value) {
			var poListMode = self.poListMode();
			if (value) {//selecting all
				if (poListMode === "invoice-export") {
					self.exportSelectType("selected");
					self.exportSelectedEnable(true);
					self.selectedForExportItems.removeAll();
					self.filteredItems().forEach(function (it) {
						if (it.Accepted == '1') {
							it.Selected(true);
							self.selectedForExportItems.push(it);
						} else {
							it.Selected(false);
						}
					});
				}
				else if (poListMode === "invoice-download") {
					self.selectedForDownloadItems.removeAll();
						var addedIds = {};
						self.filteredItems().forEach(function (it) {
							if (!addedIds[it.InvoiceId]) {
								it.Selected(true);
								self.selectedForDownloadItems.push(it);
								addedIds[it.InvoiceId] = true;
							}
						});
				}
			}
			else {//deselecting all
				var selectedItems = poListMode === 'invoice-export' ? self.selectedForExportItems : poListMode === 'invoice-download' ? self.selectedForDownloadItems : self.selectedItems;
				selectedItems.removeAll();
				self.collapsedItems().forEach(function (item) {
					item.Selected(false);
				});
			}
		},
		owner: this
	});	//qbo online export
	self.selectedForQboExportInvoices = ko.observableArray();
	self.exportCanceled = ko.observable(false);
	self.exportWithError = ko.observable(false);

	self.selectedItemsSum = ko.computed(function () {
		if (self.selectedItems().length == 0) {
			//resetEnteredData();
			return '';
		} else {
			var total = 0;
			ko.utils.arrayForEach(self.selectedItems(), function (it) {
				total += Number(it.POTotal);
			});
			if (self.enteredTax().length != 0) { total += Number(self.enteredTax()); }
			if (self.enteredFreight().length != 0) { total += Number(self.enteredFreight()); }
			if (self.enteredDiscount().length != 0) { total -= Number(self.enteredDiscount()); }
			return formatCurrency(total);
		}
	});

	self.selectedEInvoiceId = ko.observable(0);
	self.selectedEInvoice = ko.observable(null);

	self.listHeaders = [
		{ title: 'COMPANY', sortPropertyName: 'Company', asc: ko.observable(true) },
		{ title: 'LOCATION', sortPropertyName: 'Location', asc: ko.observable(true) },
		{ title: 'PO #', sortPropertyName: 'PONumber', asc: ko.observable(true) },
		{ title: 'INVOICE #', sortPropertyName: 'InvoiceNumber', asc: ko.observable(true) },
		{ title: 'DELIVERY DATE', sortPropertyName: 'DeliveryDate', asc: ko.observable(false) },
		{ title: 'PO/INV.TOTAL', sortPropertyName: 'POTotal', asc: ko.observable(true) },
		{ title: 'POSTED', sortPropertyName: 'AcceptedDate', asc: ko.observable(true) }
	];
	self.activeSort = ko.observable(self.listHeaders[4]); //set the default sort

	self.selectedPOsNumbers = ko.computed(function () {
		if (self.selectedItems().length == 0) {
			return '';
		} else {
			var str = '';
			ko.utils.arrayForEach(self.selectedItems(), function (it) {
				if (str == '')
					str = it.PONumber;
				else
					str = str + ',' + it.PONumber;
			});

			return str;
		}
	});


	self.selectedCompany = ko.observable('');
	self.selectedVendId = ko.observable('');

	self.selectedLocation = ko.observable('');
	self.selectedOrgId = ko.observable('');

	self.allItems = ko.observableArray();

	//collapse; expand;
	self.ExpandCollapseToggle = ko.observable('collapse');

	self.createManualInvoiceStep = ko.observable('select-location');

	self.manualInvoiceOrganizations = ko.observableArray();
	self.manualInvoiceOrganizationSearch = ko.observable('');
	self.filteredManualInvoiceOrganizations = ko.computed(function () {
		var searchOrgsFilter = self.manualInvoiceOrganizationSearch().toLowerCase();
		searchOrgsFilter = searchOrgsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchOrgsFilter.length < 3) {
			var r = self.manualInvoiceOrganizations();
			return r;
		} else {
			return ko.utils.arrayFilter(self.manualInvoiceOrganizations(), function (item) {
				var words = searchOrgsFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.LocationName.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);

	self.manualInvoiceSelectedOrganization = ko.observable(null);

	self.manualInvoiceVendors = ko.observableArray();
	self.manualInvoiceVendorSearch = ko.observable('');
	self.filteredManualInvoiceVendors = ko.computed(function () {
		var searchVendorsFilter = self.manualInvoiceVendorSearch().toLowerCase();
		searchVendorsFilter = searchVendorsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchVendorsFilter.length < 3) {
			var r = self.manualInvoiceVendors();
			return r;
		} else {
			return ko.utils.arrayFilter(self.manualInvoiceVendors(), function (item) {
				var words = searchVendorsFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Company.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);

	self.manualInvoiceSelectedVendor = ko.observable(null);

	self.selectedPOItemSearch = ko.observable('');
	self.selectedPONumber = ko.observable('');
	self.selectedPOType = ko.observable('');
	self.selectedPOAllItems = ko.observableArray();
	self.selectedPOTotal = ko.computed(function () {
		var total = 0;
		for (var i = 0; i < self.selectedPOAllItems().length; i++) {
			var it = self.selectedPOAllItems()[i];
			total = total + Number(it.Ext);
		}
		if (total == 0) total = '';
		return total;
	}, self);

	self.selectedPOFilteredItems = ko.computed(function () {
		var selectedPOItemSearch = self.selectedPOItemSearch().toLowerCase();
		selectedPOItemSearch = selectedPOItemSearch.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (selectedPOItemSearch.length < 1) {
			var r = self.selectedPOAllItems();
			return r;
		} else {
			return ko.utils.arrayFilter(self.selectedPOAllItems(), function (item) {
				var words = selectedPOItemSearch.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Description.toLowerCase().match(re) != null) || (item.ItemId.match(re) != null) || (item.UnitPrice.match(re) != null) || (item.Ext.match(re) != null));
				}
				return found;
			});
		}
	}, self);

	self.filterAvailableVendors = ko.observableArray();
	self.filterSelectedVendors = ko.observableArray();
	self.clearVendorsFilterVisible = ko.observable(false);
	self.searchVendorsFilter = ko.observable('');
	self.filteredVendors = ko.computed(function () {
		var searchVendorsFilter = self.searchVendorsFilter().toLowerCase();
		searchVendorsFilter = searchVendorsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchVendorsFilter.length < 3) {
			var r = self.filterAvailableVendors();
			return r;
		} else {
			return ko.utils.arrayFilter(self.filterAvailableVendors(), function (item) {
				var words = searchVendorsFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Company.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);


	self.clearVendorsFilter = function (d, e) {
		self.filterAvailableVendors().forEach(function (it) { it.Selected(false); });
		self.filterSelectedVendors([]);
	};

	self.vendorSearch = ko.observable('');
	self.vendorSearchList = ko.observableArray();

	self.enableQuickAccept = ko.observable(false);
	self.enableReconcile = ko.observable(false);
	self.enableCreateNew = ko.observable(false);

	self.timerId = 0;
	self.replicatedItems = ko.observableArray();
	self.collapsedItems = ko.observableArray();

	self.filteredItems = ko.computed(function () {

		var r = self.allItems();
		if (r == []) return r;

		if (self.preShowResultOption() === "invoices") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.InvoiceId !== "0" && item.Deleted == "0";
				} else {
					return item.InvoiceId !== "0";
				}
			})
		}

		if (self.selectedItems().length > 0) {
			r = ko.utils.arrayFilter(self.allItems(), function (item) {
				return item.Company == self.selectedCompany() && item.Location == self.selectedLocation() && item.InvoiceId == "0";
			})
			//console.log('r1 (items) = ' + r.length);
		}

		if (self.filterSelectedVendors().length > 0) {
			r = ko.utils.arrayFilter(r, function (item) {
				return self.filterSelectedVendors().indexOf(item.VendId + '||' + item.SBVendId) != -1;
			})
			//console.log('r2 (vendors) = ' + r.length);
		}


		if (self.showResultOption() == "accepted") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.Accepted == "1" && item.Deleted == "0";
				} else {
					return item.Accepted == "1";
				}
			})
			//console.log('r3 (accepted) = ' + r.length);
		}

		if (self.showResultOption() == "not-accepted") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.Accepted == "0" && item.Deleted == "0";
				} else {
					return item.Accepted == "0";
				}
			})
			//console.log('r4 (not accepted) = ' + r.length);
		}

		if (self.showResultOption() == "not-completed") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.Accepted == "0" && item.Completed == "0" && item.Deleted == "0";
				} else {
					return item.Accepted == "0" && item.Completed == "0";
				}
			})
			//console.log('r4 (not accepted) = ' + r.length);
		}

		if (self.showResultOption() == "completed") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.Completed == "1" && item.Accepted == "0" && item.Deleted == "0";
				} else {
					return item.Completed == "1" && item.Accepted == "0";
				}
			})
			//console.log('r5 (new only) = ' + r.length);
		}

		if (self.showResultOption() == "proof-of-delivery") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.AttachedProofOfDelivery() && item.Deleted == "0";
				} else {
					return item.AttachedProofOfDelivery();
				}
			})
			//console.log('r4 (not accepted) = ' + r.length);
		}

		if (self.showResultOption() == "no-proof-of-delivery") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return !item.AttachedProofOfDelivery() && item.Deleted == "0";
				} else {
					return !item.AttachedProofOfDelivery();
				}
			})
			//console.log('r4 (not accepted) = ' + r.length);
		}


		if (self.showResultOption() == "all") {
			r = ko.utils.arrayFilter(r, function (item) {
				if (!self.deletedSearch()) {
					return item.Deleted == "0";
				} else {
					return item.Deleted == "0" || item.Deleted == "1";
				}
			})
			//console.log('r6 (all) = ' + r.length);
		}

		if (self.poListSearch().length > 0) {
			var poListSearchFilter = self.poListSearch().toLowerCase();
			poListSearchFilter = poListSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(r, function (item) {
				var words = poListSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					//if (item.InvoiceNumber) {
					found = found && ((item.Company.toLowerCase().match(re) != null) || (item.PONumber ? item.PONumber.toLowerCase().match(re) != null : false) || (item.Location.toLowerCase().match(re) != null) || (item.InvoiceNumber ? item.InvoiceNumber.toLowerCase().match(re) != null : false));
					//} else {
					//	found = found && ((item.Company.toLowerCase().match(re) != null) || (item.PONumber.toLowerCase().match(re) != null) || (item.POTotal.toLowerCase().match(re) != null));
					//}					
				}
				return found;
			});
			//console.log('r7 (search) = ' + r.length);
		}

		//console.log('r8 (return) = ' + r.length);

		// Now let's inspect ko.computedContext
		//var isFirstEvaluation = ko.computedContext.isInitial(),
		//    dependencyCount = ko.computedContext.getDependenciesCount();
		//console.log("Evaluating " + (isFirstEvaluation ? "for the first time" : "again"));
		//console.log("By now, this computed has " + dependencyCount + " dependencies");

		return r;


	}, self);		//, { deferEvaluation: true });
	self.filteredItems.subscribe(function () {
		//FOR DEBUGGING
		//setTimeout(function () { windowResized(); }, 1000)

		//*** po list timer ***
		//clearInterval(self.timerId);
		//self.replicatedItems.removeAll();
		//self.timerId = setInterval(function () { copyFilteredItems() }, 300);

		//function copyFilteredItems() {
		//	var ln1 = self.filteredItems().length;
		//	var ln2 = self.replicatedItems().length;
		//	var chunkSize = 30;
		//	if (ln2 < ln1) {
		//		var chunk = self.filteredItems().slice(ln2, ln2 + chunkSize);
		//		for (var i = 0; i < chunk.length; i++) {
		//			self.replicatedItems.push(chunk[i]);
		//		}
		//	} else {
		//		clearInterval(self.timerId);
		//	}
		//};
		//*** /po list timer ***
		self.collapsedItems.removeAll();
		//var hl = 0;
		for (var i = 0; i < self.filteredItems().length; i++) {
			var it = self.filteredItems()[i];
			if (!it.ExpandedView()) {
				//hl++
				//if (((hl) % 30) == 0) {
				//	it.Highlighted(true);
				//}
				self.collapsedItems.push(it);
			}
		}

	});

	self.vendorItems = ko.computed(function () {
		var itemDescription = self.vendorSearch().toLowerCase();
		itemDescription = itemDescription.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (itemDescription.length < 3) {
			self.vendorSearchList.removeAll();
			$("#vendorSearchResult").hide();
		} else {
			self.doVendorSearch(itemDescription, function () {
				//console.log('callback');
				$("#vendorSearchResult").show();
			})
		}
	}, self);



	//self.showEqualSign = ko.computed(function () {
	//	var r = false;
	//	if ((self.selectedItems().length > 0) && (self.computedNet() == self.selectedItemsSum())) {
	//		r = true;
	//	}
	//	return r;
	//}, self);

	//self.showNotEqualSign = ko.computed(function () {
	//	var r = false;
	//	if ((self.selectedItems().length > 0) && (self.computedNet() != self.selectedItemsSum())) {
	//		r = true;
	//	}
	//	return r;
	//}, self);



	//*** po list scrolling ***
	var pageSize = 60;
	var pageDelta = 30;
	self.pageNumber = ko.observable(0);
	self.nbPerPage = ko.observable(pageSize);

	self.totalPagesHolder = ko.observableArray();
	self.totalPages = ko.computed(function () {
		var div = Math.floor(self.collapsedItems().length / pageSize);
		div += self.collapsedItems().length % pageSize > 0 ? 1 : 0;
		var pages = div - 1;
		self.totalPagesHolder.removeAll();
		for (var i = 0; i < pages + 1; i++) {
			self.totalPagesHolder.push(i + 1);
		}
		return div - 1;
	});
	self.pageController = function (targetPage) {
		return self.pageNumber(targetPage - 1);
	}
	self.paginated = ko.computed(function () {
		var first = self.pageNumber() * pageSize;
		var r = self.collapsedItems().slice(0, pageSize);
		if (first == 0) {
		} else {
			r = self.collapsedItems().slice(first - pageDelta, first + pageDelta);
		}
		return r;
	});
	self.hasPrevious = ko.computed(function () {
		return self.pageNumber() !== 0;
	});
	self.hasNext = ko.computed(function () {
		return self.pageNumber() !== self.totalPages();
	});
	self.next = function (callback) {
		if (self.pageNumber() < self.totalPages()) {
			self.pageNumber(self.pageNumber() + 1);
			if (callback) {
				echoUserCode(callback);
			}
		}
	}
	self.previous = function (callback) {
		if (self.pageNumber() != 0) {
			self.pageNumber(self.pageNumber() - 1);
			if (callback) {
				echoUserCode(callback);
			}
		}
	}
	self.originalPageNumber = ko.observable(0);
	// **** /po list scrolling ****





	//functions
	self.loadPOListVendors = function (callback) {
		//console.log(Date.now() + "||" + 'loadPOListVendors');
		var distinct = [];
		var distinct2 = [];
		self.filterAvailableVendors.removeAll();

		for (var i = 0; i < self.allItems().length; i++) {
			var it = self.allItems()[i].VendId + "_" + self.allItems()[i].SBVendId;
			var it2 = self.allItems()[i].VendId + "_" + self.allItems()[i].SBVendId + "_" + self.allItems()[i].Deleted;
			if (distinct.indexOf(it) == -1 && distinct2.indexOf(it2) == -1) {
				distinct.push(it);
				distinct2.push(it2);
				self.filterAvailableVendors.push(new POListVendor({ VendId: self.allItems()[i].VendId, SBVendId: self.allItems()[i].SBVendId, Company: self.allItems()[i].Company, Deleted: self.allItems()[i].Deleted }))
			}
			if (distinct.indexOf(it) != -1 && distinct2.indexOf(it2) == -1) {
				//there are items with different status (deleted 0/1). find and update
				var vendor = ko.utils.arrayFirst(self.filterAvailableVendors(), function (vendor) {
					return vendor.VendId === self.allItems()[i].VendId && vendor.SBVendId === self.allItems()[i].SBVendId;
				});
				vendor.isPODeleted = 0;
			}
		}

		sortArray(self.filterAvailableVendors, 'Company')
		//console.log(Date.now() + "||" + '/loadPOListVendors');
		if (callback) callback();

		//var params = {};
		//params.RangeBaseOn = fnc.app.filterRangeBaseOn();
		//params.FromDate = fnc.app.filterDateFrom();
		//params.ToDate = fnc.app.filterDateTo();
		//params.OrgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();

		////Function LoadPOListVendors(rangeBasedOn As Integer, fromDate As Date, toDate As Date, orgsIds As String) As String

		//loading(true);
		//self.filterAvailableVendors.removeAll();
		//ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadPOListVendors", params, function (response) {
		//	loading(false);
		//	if (response.d == '') {
		//		if (callback) callback();
		//		windowResized();
		//		return;
		//	}
		//	var r = eval('(' + response.d + ')');
		//	if (r.result == 'error') {
		//		windowResized();
		//		return;
		//	}
		//	var obj = JSON.parse(response.d).result.row;
		//	var arr = [];
		//	if (obj[0]) {
		//		obj.forEach(function (it) { arr.push(new POListVendor(it)) })
		//	} else {
		//		arr.push(new POListVendor(obj))
		//	}
		//	self.filterAvailableVendors(arr);
		//	if (callback) callback();
		//})
	}

	self.loadManualInvoiceVendors = function (orgId, callback) {
		var params = {};
		params.OrganizationId = orgId;

		//Function LoadAllActiveVendors(organizationId As Integer) As String

		loading(true);
		self.manualInvoiceVendors.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadAllActiveVendors", params, function (response) {
			loading(false);
			if (response.d == '') {
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
			} else {
				arr.push(new VendorListItem(obj))
			}
			self.manualInvoiceVendors(arr);
			if (callback) callback();
		})
	}

	self.loadPOList = function (callback) {
		var params = {};
		params.RangeBaseOn = fnc.app.filterRangeBaseOn();
		params.FromDate = fnc.app.filterDateFrom();
		params.ToDate = fnc.app.filterDateTo();
		params.OrgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();
		params.Vendors = '';
		params.Keywords = self.poListSearchKeywords(); //'';

		//Function LoadPOList(rangeBasedOn As Integer, fromDate As Date, toDate As Date, orgsIds As String, vendors As String, keywords As String) As String

		loading(true);
		self.allItems.removeAll();
		ajaxPostXML("ChefMod.Financials.UI.Controllers.Invoices.LoadPOList", params, function (response) {
			loading(false);
			//console.log(Date.now() + "||" + "loadPOList_1");
			if (response == '') {
				if (callback) callback();
				windowResized();
				return;
			}

			if (response == 'error') return;
			var obj = JSON.parse(response).result.row;
			//console.log(Date.now() + "||" + "loadPOList_2");
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new POListItem(it)) })
				//obj.forEach(function (it) { arr.push(new POListItem(it)) })
				//obj.forEach(function (it) { arr.push(new POListItem(it)) })
				//obj.forEach(function (it) { arr.push(new POListItem(it)) })
				//obj.forEach(function (it) { arr.push(new POListItem(it)) })
				//obj.forEach(function (it) { arr.push(new POListItem(it)) })
			} else {
				arr.push(new POListItem(obj))
			}
			//console.log(Date.now() + "||" + "loadPOList_3");
			self.sortPOList(arr);
			//console.log(Date.now() + "||" + "loadPOList_4");

			self.setInvoicesWithMultiplePOs(arr, function () {
				//console.log(Date.now() + "||" + "loadPOList_5");
				//debugger
				self.allItems(arr);
				//debugger
				//console.log(Date.now() + "||" + "loadPOList_6");
				if (callback) callback();
				windowResized();
				return;
			});
		})
	};

	self.doVendorSearch = function (vendor, callback) {
		//Function LoadAllActiveVendors(organizationId As Integer) As String			
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadList", { keyword: "vendorlist" }, function (response) {
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				console.log("Server Error");
				return;
			}
			var arrayList = ko.utils.arrayMap(r.result.row, function (listItem) { return new VendorListItem(listItem) });
			self.vendorSearchList(arrayList);
			if (callback) callback();
		});
	};

	self.validateActionButtons = function () {
		//reset
		self.enableQuickAccept(false);
		self.enableReconcile(false);
		self.enableCreateNew(false);
		//validate
		var arr = self.allItems();
		var isItemSelected = false;
		var isInvoiceNumberValid = false;
		var isInvoiceDateValid = false;
		var isGrossValid = false;

		for (var i = 0; i < arr.length; i++) {
			if (arr[i].Selected()) {
				isItemSelected = true;
				break;
			}
		}
		if (self.enteredInvoiceNo().length > 0) {
			isInvoiceNumberValid = true;
		}
		if (self.enteredInvoiceDate().length > 0) {
			isInvoiceDateValid = true;
		}
		if (self.enteredGross().length > 0) {
			isGrossValid = true;
		}

		//set
		if (isInvoiceNumberValid && isInvoiceDateValid) {
			self.enableCreateNew(true);
		}
		if (isItemSelected && isInvoiceNumberValid && isInvoiceDateValid && isGrossValid) {
			self.enableQuickAccept(true);
			self.enableReconcile(true);
			self.enableCreateNew(false);
		}
	};

	self.reconcileInvoice = function (d, e) {
		var companyName = self.selectedCompany();
		var invoiceTotal = self.selectedItemsSum();
		var invoiceNo = self.enteredInvoiceNo();
		var invoiceDate = self.enteredInvoiceDate();
		var poNumbers = self.selectedPOsNumbers();
		var gross = Number(self.enteredGross());
		var discount = Number(self.enteredDiscount());
		var tax = Number(self.enteredTax());
		var freight = Number(self.enteredFreight());
		var orgId = self.selectedOrgId();
		var vendId = self.selectedVendId();
		var invId = ko.observable(0);
		var location = self.selectedLocation();

		loadDuplicateInvoiceInfo(invoiceNo, vendId, 0, orgId, 0, function (r) {
			if (r != []) {
				//check for duplicates
				if (r.IsDuplicate == "1") {
					$('#modDuplicateWarning').modal('show');
					$("#modDuplicateWarning").on('shown.bs.modal', function (e) {
						$(".modal-body #invoiceNo").text(invoiceNo);
						$(".modal-body #vendName").text(companyName);
					});

					$('#modDuplicateWarning').on('click', "[data-dismiss='modal']", function (e) {
						$('#modDuplicateWarning').modal('hide');
					});

					$('#modDuplicateWarning').on('click', '#proceedWithDuplicate', function (e) {
						$('#modDuplicateWarning').modal('hide');

						$("#invoices-page").html("");

						createInvoiceFromPO(poNumbers, invoiceNo, invoiceDate, gross, discount, tax, freight, invId, function () {
							updateLock(invId(), true, function () {
								fnc.app.hiddenTabs.removeAll();
								fnc.app.hiddenTabs.push(new HiddenTab(vendId, orgId, invId(), invoiceNo, invoiceDate, companyName, location, poNumbers, invoiceTotal, 'tabInvoiceWithPO'));
								load_hiddenTab(function () { $('.modal-backdrop').removeClass(); });
								resetEnteredData();
							});
						});
					});

					$("#modDuplicateWarning").on('hidden.bs.modal', function (e) {
						$(e.currentTarget).unbind();

					});
				} else {
					$("#invoices-page").html("");

					createInvoiceFromPO(poNumbers, invoiceNo, invoiceDate, gross, discount, tax, freight, invId, function () {
						updateLock(invId(), true, function () {
							fnc.app.hiddenTabs.removeAll();
							fnc.app.hiddenTabs.push(new HiddenTab(vendId, orgId, invId(), invoiceNo, invoiceDate, companyName, location, poNumbers, invoiceTotal, 'tabInvoiceWithPO'));
							load_hiddenTab();
							resetEnteredData();
						});
					});
				}
			} else {
				// if it's possible
				$("#invoices-page").html("");

				createInvoiceFromPO(poNumbers, invoiceNo, invoiceDate, gross, discount, tax, freight, invId, function () {
					updateLock(invId(), true, function () {
						fnc.app.hiddenTabs.removeAll();
						fnc.app.hiddenTabs.push(new HiddenTab(vendId, orgId, invId(), invoiceNo, invoiceDate, companyName, location, poNumbers, invoiceTotal, 'tabInvoiceWithPO'));
						load_hiddenTab();
						resetEnteredData();
					});
				});
			}

		});

	};

	self.createPORequiredInvoice = function (d) {
		var companyName = d.Company;
		var vendId = d.VendorId;
		var orgId = d.OrgId;
		var invNo = self.enteredInvoiceNo();
		var invDate = self.enteredInvoiceDate();
		var gross = Number(self.enteredGross());
		var discount = Number(self.enteredDiscount());
		var tax = Number(self.enteredTax());
		var freight = Number(self.enteredFreight());
		var invId = ko.observable(0);
		var location = d.OrgName;

		$("#invoices-page").html("");
		fnc.app.hiddenTabs.removeAll();

		createInvoice(vendId, orgId, invNo, invDate, gross, discount, tax, freight, invId, function () {
			updateLock(invId(), true, function () {
				fnc.app.hiddenTabs.push(new HiddenTab(vendId, orgId, invId(), invNo, invDate, companyName, location, '', '', 'tabInvoiceWithPO'));
				load_hiddenTab();
				resetEnteredData();
				$('.modal-backdrop').removeClass();
			})
		});
	};

	self.createNoPORequiredInvoice = function (d) {
		var companyName = d.Company;
		var sbVendId = d.SBVendId;
		var vendId = d.VendorId;
		var orgId = d.OrgId;
		var invNo = self.enteredInvoiceNo();
		var invDate = self.enteredInvoiceDate();
		var gross = Number(self.enteredGross());
		var discount = Number(self.enteredDiscount());
		var tax = Number(self.enteredTax());
		var freight = Number(self.enteredFreight());
		var invId = ko.observable(0);
		var location = d.OrgName;

		var glAccId = d.GLAccId != 0 ? d.GLAccId : 0;
		var subTotal = gross - (tax + freight);

		fnc.app.hiddenTabs.removeAll();

		createManualInvoice(sbVendId, vendId, orgId, invNo, invDate, gross, discount, tax, freight, invId, function () {
			fnc.app.hiddenTabs.push(new HiddenTab(sbVendId, orgId, invId(), invNo, invDate, companyName, location, '', '', 'tabInvoiceWithoutPO2'));

			$('.nav.nav-pills>li.active').removeClass("active");
			$('.nav.nav-pills>li.hidden-tab').addClass("active");
			$('.nav.nav-pills>li.hidden-tab').removeClass("hidden-tab-hide");

			if (glAccId != 0 && subTotal > 0) {
				addInvoiceItemManual(invId(), glAccId, subTotal, function () {
					load_hiddenTab2(function () {
						fnc.invoicesAppNoPo.companyName(companyName);
						fnc.invoicesAppNoPo.companyId(sbVendId);
						fnc.invoicesAppNoPo.invoiceDate(invDate);
						fnc.invoicesAppNoPo.invoiceNumber(invNo);
					});

				})
			} else {
				load_hiddenTab2(function () {
					fnc.invoicesAppNoPo.companyName(companyName);
					fnc.invoicesAppNoPo.companyId(sbVendId);
					fnc.invoicesAppNoPo.invoiceDate(invDate);
					fnc.invoicesAppNoPo.invoiceNumber(invNo);
				});
			}


			//?


			resetEnteredData();
			$('.modal-backdrop').removeClass();

		})
	};

	self.deleteInvPO = function () {
		var d = fnc.poListApp.selectedForDeleteItem();
		var invId = d.InvoiceId;
		var poNumber = d.PONumber;
		$('#modConfirmDelPoInv').modal('hide');
		fnc.poListApp.selectedForDeleteItem(null);
		if (invId != "0") poNumber = "0";

		deleteInvoice(invId, poNumber, function () {
			fnc.poListApp.loadPOList(function () {
				fnc.poListApp.loadPOListVendors(function () {
					//fnc.poListApp.setInvoicesWithMultiplePOs(function () {
					if (callback) callback();
					windowResized();
					//})
				})
			});
		});
	};

	self.cancelDelInvPO = function () {
		$('#modConfirmDelPoInv').modal('hide');
		return;
	};

	self.copyLocations = function (locations) {
		var arr2 = [];
		if (locations[0]) {
			for (var i = 0; i < locations.length; i++) {
				var it = locations[i];
				var o = new LocationItem({ locationId: it.LocationId, locationName: it.LocationName });
				arr2.push(o);
			}
		} else {
			var it = locations;
			var o = new LocationItem({ locationId: it.LocationId, locationName: it.LocationName });
			arr2.push(o);
		}
		return arr2;
	}

	self.showCreateManualInvoice = function () {
		var arr = self.copyLocations(fnc.app.filterAvailableLocations());
		self.manualInvoiceOrganizations(arr);
		if (self.manualInvoiceOrganizations().length == 1) {
			fnc.poListApp.manualInvoiceSelectedOrganization(self.manualInvoiceOrganizations()[0]);
			var orgId = fnc.poListApp.manualInvoiceSelectedOrganization().LocationId;
			self.loadManualInvoiceVendors(orgId, function () {
				self.createManualInvoiceStep('select-vendor');
				$('#modCreateManualInvoice').modal('show');
				// mutually exclusive checkboxes
				//$('.vend-checkbox').click(function () {
				//	checkedState = this.checked;
				//	for (i = 0; i < self.manualInvoiceVendors().length; i++) {
				//		$('.vend-checkbox')[i].checked = false;
				//	}
				//	this.checked = checkedState;
				//});
				// close modal window
				$("#modCreateManualInvoice").one("hidden.bs.modal", function () {
					fnc.poListApp.manualInvoiceSelectedOrganization(null);
					fnc.poListApp.manualInvoiceSelectedVendor(null);
					fnc.poListApp.createManualInvoiceStep('select-location');
					fnc.poListApp.manualInvoiceOrganizationSearch('');
					fnc.poListApp.manualInvoiceVendorSearch('');
				})
			});
		} else {
			$('#modCreateManualInvoice').modal('show');
			// mutually exclusive checkboxes
			//$('.org-checkbox').click(function () {
			//	checkedState = this.checked;
			//	for (i = 0; i < $('.org-checkbox').length; i++) {
			//		$('.org-checkbox')[i].checked = false;
			//	}
			//	this.checked = checkedState;
			//});
			//$('.vend-checkbox').click(function () {
			//	checkedState = this.checked;
			//	for (i = 0; i < $('.vend-checkbox').length; i++) {
			//		$('.vend-checkbox')[i].checked = false;
			//	}
			//	this.checked = checkedState;
			//});
			// close modal window
			$("#modCreateManualInvoice").one("hidden.bs.modal", function () {
				fnc.poListApp.manualInvoiceSelectedOrganization(null);
				fnc.poListApp.manualInvoiceSelectedVendor(null);
				fnc.poListApp.createManualInvoiceStep('select-location');
				fnc.poListApp.manualInvoiceOrganizationSearch('');
				fnc.poListApp.manualInvoiceVendorSearch('');
			})
		}
	};

	self.showSelectLocation = function () {
		self.createManualInvoiceStep('select-location');

		return false;
	};

	self.showSelectVendor = function () {
		var orgId = fnc.poListApp.manualInvoiceSelectedOrganization().LocationId;

		self.loadManualInvoiceVendors(orgId, function () {
			self.createManualInvoiceStep('select-vendor');
			return false;
		});
	};

	self.createAndShowManualInvoice = function () {
		var o = fnc.poListApp.manualInvoiceSelectedOrganization();
		var v = fnc.poListApp.manualInvoiceSelectedVendor();
		var d = {};
		d.Company = v.Company;
		d.VendorId = v.VendorId;
		d.SBVendId = v.SBVendId;

		d.GLAccId = Number(v.GLAccId);

		d.OrgName = o.LocationName;
		d.OrgId = o.LocationId;
		$('#modCreateManualInvoice').modal('hide');
		// ??? clean up after modCreateManualInvoice closes
		fnc.poListApp.manualInvoiceSelectedOrganization(null);
		fnc.poListApp.manualInvoiceSelectedVendor(null);
		fnc.poListApp.createManualInvoiceStep('select-location');
		fnc.poListApp.manualInvoiceOrganizationSearch('');
		fnc.poListApp.manualInvoiceVendorSearch('');

		loadDuplicateInvoiceInfo(self.enteredInvoiceNo(), v.VendorId, v.SBVendId, o.LocationId, 0, function (r) {

			if (r != []) {
				//check for duplicates
				if (r.IsDuplicate == "1") {
					$('#modDuplicateWarning').modal('show');
					$("#modDuplicateWarning").on('shown.bs.modal', function (e) {
						$(".modal-body #invoiceNo").text(self.enteredInvoiceNo());
						$(".modal-body #vendName").text(v.Company);
					});

					$('#modDuplicateWarning').on('click', "[data-dismiss='modal']", function (e) {
						$('#modDuplicateWarning').modal('hide');
					});

					$('#modDuplicateWarning').on('click', '#proceedWithDuplicate', function (e) {
						//console.log('invNo=' + self.enteredInvoiceNo() + '||vendId=' + v.VendorId + '||sbVendId=' + v.SBVendId);
						$('#modDuplicateWarning').modal('hide');
						if (v.RequiredPO == '1') {
							fnc.poListApp.createPORequiredInvoice(d);
						} else {
							fnc.poListApp.createNoPORequiredInvoice(d);
						}
					});

					$("#modDuplicateWarning").on('hidden.bs.modal', function (e) {
						$(e.currentTarget).unbind();
					});

					return false;
				} else {
					if (v.RequiredPO == '1') {
						fnc.poListApp.createPORequiredInvoice(d);
					} else {
						fnc.poListApp.createNoPORequiredInvoice(d);
					}
				}

			} else {
				if (v.RequiredPO == '1') {
					fnc.poListApp.createPORequiredInvoice(d);
				} else {
					fnc.poListApp.createNoPORequiredInvoice(d);
				}
			}

		});


	};
	//download
	self.showDownloadInvoiceListOptions = function (d, e) {
		$('#modDownloadOptions').modal('show');
		var options = fnc.poListApp.downloadIncludeOptions;
		options.invoiceSummary.selected(true);
		options.invoiceRecord.selected(false);
		options.eInvoice.selected(false);
		options.invoiceDocuments.selected(true);
		options.proofOfDeliveries.selected(true);
		options.supportingImages.selected(false);
		options.supportingDocuments.selected(false);
	};

	self.downloadInvoiceList = function (d, e) {
		var zipFolderName = "invoices_downloaded_on_" + (new Date().toLocaleString().split(',')[0]);
		blockLoading = true;
		blockResize = true;
		$('#modDownloadOptions').modal('hide');

		var downloadIncludeOptions = fnc.poListApp.downloadIncludeOptions;
		var includeInvoiceSummary = downloadIncludeOptions.invoiceSummary.selected();
		var includeInvoiceRecords = downloadIncludeOptions.invoiceRecord.selected();
		var includeEInvoices = downloadIncludeOptions.eInvoice.selected();
		var includeInvoiceDocs = downloadIncludeOptions.invoiceDocuments.selected();
		var includePODs = downloadIncludeOptions.proofOfDeliveries.selected();
		var includeSupportingImages = downloadIncludeOptions.supportingImages.selected();
		var includeSupportingDocs = downloadIncludeOptions.supportingDocuments.selected();

		var selectedItems = fnc.poListApp.selectedForDownloadItems();
		var loadedDocs = {};
		fnc.app.progressBar.reset(4, {
			title: "Cooking up your documents!<br/> This might take a few minutes depending on how many documents you have on your plate.",
			//displayDownloadLink: browserName === "Safari" ? true : false
		});
		fnc.app.progressBar.show();
		fnc.app.progressBar.setStage(1, "Gathering merge ingredients...");
		loadDocuments(function () {
			var action = "";
			var blobContainer = "invoicemerge-results";
			var fileType = blobContainer;
			var contentType = "zip";
			var docName = zipFolderName;
			var accNum = 0;
			var state = "raw";
			var status = "Waiting";
			fnc.app.progressBar.setStage(2, "Generating merge recipe...");
			updateFileMetadata(action, blobContainer, contentType, docName, fileType, status, "", "", accNum, "", "", state, function (reservedId) {
				fnc.app.progressBar.update(1, 3);
				var mergeDataXMLBlob = generateMergeDataXMLBlob(reservedId);
				fnc.app.progressBar.update(2, 3, "Sending merge recipe to our document kitchen...");
				fileType = blobContainer = "invoicemerge-requests";
				contentType = "xml";
				docName = "mergeData";
				updateFileMetadata(action, blobContainer, contentType, docName, fileType, "", "", "", accNum, "", "", state, function (mergeDataFileId) {
					uploadAndUpdateFilePageMetadata(mergeDataXMLBlob, mergeDataFileId, 0, fnc.appid, fnc.app.sessionId, function () {
						var action = "invoicemerge";
						finishFileUpload(mergeDataFileId, action, function () {
							fnc.app.progressBar.update(3, 3);
							fnc.app.progressBar.setStage(3, "Waiting for response...");
							var statusTimeout = 5000;
							var timeWaitingWithoutChange = 0;
							var cancelBound = 60000;
							var currentNumDone;
							(function checkPDFstatusAndDownload() {
								setTimeout(function () {
									checkStatus(reservedId, function (status) {
										if (typeof status === "string") {
											timeWaitingWithoutChange += statusTimeout;
											if (timeWaitingWithoutChange > cancelBound) {
												fnc.app.progressBar.allowCancel(true);
												fnc.app.progressBar.update(0, selectedItems.length, "The document kitchen is unusually busy, thank you for your patience");
											}
											if (fnc.app.progressBar.isShown()) {
												checkPDFstatusAndDownload();
											}
										}
										else {
											if (status.numDone !== currentNumDone) {
												fnc.app.progressBar.update(status.numDone, status.total, "Merging documents... " + status.numDone + "/" + status.total + " invoices processed");
												currentNumDone = status.numDone;
												timeWaitingWithoutChange = 0;
												fnc.app.progressBar.allowCancel(false);
												if (status.numDone === status.total) {
													(function checkFileExistsAndDownload() {
														var fileExistsTimeout = 0;
														setTimeout(function () {
															fnc.app.progressBar.setStage(4, "Downloading...")
															checkFileExists(reservedId, 0, function (fileExists) {
																if (fileExists) {
																	fnc.app.progressBar.update(1, 2);
																	var fileName = zipFolderName
																	fnc.fileRetrieve(reservedId, 0, fileName, "zip", function (fileBlob, fileName) {
																		saveAs(fileBlob, fileName);
																		fnc.app.progressBar.update(2, 2);
																		fnc.app.progressBar.hide();
																		blockLoading = false;
																		blockResize = false;
																		//deleteFile(reservedId);
																		//deleteFile(mergeDataFileId);
																	}, function () {
																		fnc.app.progressBar.update(2, 2, "something went wrong while retrieving the file. Please contact chefmod support, or try again.");
																		blockLoading = false;
																		blockResize = false;
																	})
																}
																else {
																	fileExistsTimeout = 1000;
																	checkFileExistsAndDownload();
																}
															})
														}, fileExistsTimeout)
													})();
												}
												else {
													checkPDFstatusAndDownload();
												}
											}
											else {
												timeWaitingWithoutChange += statusTimeout;
												if (timeWaitingWithoutChange > cancelBound) {
													fnc.app.progressBar.allowCancel(true);
													var errorString = "Something seems to have gone wrong. If you wait 10 minutes the process will restart and continue or you can cancel and try again."
													fnc.app.progressBar.update(currentNumDone, selectedItems.length, errorString);
												}
												if (fnc.app.progressBar.isShown())
													checkPDFstatusAndDownload();
											}
										}
									})
								}, statusTimeout);
							})();
						});
					});
				});
			});
		});
		function loadDocuments(callback) {
			var documentRetrieveBatchSize = browserName === "Safari" ? 1 : 1000;
			var numItemsLoaded = 0;
			(function preloadDocumentsInBatch(documentStartIndex, documentBatchSize) {
				var documentBatchLimit = documentStartIndex + documentBatchSize;
				var numItemsBatchLoaded = 0;
				for (var i = documentStartIndex; i < selectedItems.length && i < documentBatchLimit; i++) {
					var item = selectedItems[i];

					var attachedDocs = item.DocsAttached;
					var hasInvoiceDocs = attachedDocs.indexOf("1") !== -1;
					var hasPODs = attachedDocs.indexOf("4") !== -1;
					var hasSupportingImages = attachedDocs.indexOf("2") !== -1;
					var hasSupportingDocs = attachedDocs.indexOf("3") !== -1;

					var shouldLoadDocs = (includeInvoiceDocs && hasInvoiceDocs) || (includePODs && hasPODs) || (includeSupportingImages && hasSupportingImages) || (includeSupportingDocs && hasSupportingDocs);

					if (shouldLoadDocs) {
						//load the documents
						fnc.loadInvoiceDocumentList('', '', item.InvoiceId, item.OrgId, function (r) {
							var invoices = []
							var proofOfDeliveries = [];
							var supportingImages = [];
							var supportingDocuments = [];
							//types 1=invoice, 2=supporting Image, 3=supporting document, 4=proof of delivery
							for (var j = 0; j < r.length; j++) {
								var document = r[j];
								var type = document.InvoiceDocTypeId();
								if (type === "1" && includeInvoiceDocs) {
									invoices.push(document);
								}
								else if (type === "2" && includeSupportingImages) {
									supportingImages.push(document);
								}
								else if (type === "3" && includeSupportingDocs) {
									supportingDocuments.push(document);
								}
								else if (type === "4" && includePODs) {
									proofOfDeliveries.push(document);
								}
							}
							loadedDocs[this.InvoiceId] = invoices.concat(proofOfDeliveries, supportingImages, supportingDocuments);
							numItemsLoaded++;
							numItemsBatchLoaded++;
							fnc.app.progressBar.update(numItemsLoaded, selectedItems.length);
							if (numItemsLoaded === selectedItems.length) {
								if(callback) callback();
							}
							else if (numItemsBatchLoaded === documentBatchSize) preloadDocumentsInBatch(documentBatchLimit, documentBatchSize);
						}.bind(item), numItemsLoaded > 0);
					}
					else {
						numItemsLoaded++;
						numItemsBatchLoaded++;
						fnc.app.progressBar.update(numItemsLoaded, selectedItems.length);
						if (numItemsLoaded === selectedItems.length) {
							if(callback) callback();
						}
						else if (numItemsBatchLoaded === documentBatchSize) preloadDocumentsInBatch(documentBatchLimit, documentBatchSize);
					}
				}
			})(0, documentRetrieveBatchSize);
		}
		function checkStatus(reservedId, callback) {
			loadFileMetadata(reservedId, function (metaData) {
				var statusString = metaData.RefKey1;
				if (statusString.indexOf("/") !== -1) {
					var statusValues = metaData.RefKey1.split('/');
					var status = {
						numDone: Number(statusValues[0]),
						total: Number(statusValues[1])
					};
					if (callback) callback(status);
				}
				else {
					if (callback) callback(statusString);
				}
			});
		}
		function generateMergeDataXMLBlob(reservedId) {
			var mergeData = document.implementation.createDocument("", "", null);
			var root = mergeData.createElement("invoiceMerge");
			mergeData.appendChild(root);
			root.setAttribute("id", reservedId);
			root.setAttribute("appId", fnc.appid);
			root.setAttribute("sessionId", fnc.app.sessionId);
			var nodeTextPropertyKey = browserName === "IE" ? "textContent" : "innerHTML";

			if (includeInvoiceSummary) {
				var docTypeIds = [];
				if (includeInvoiceDocs) {
					docTypeIds.push("1");
				}
				if (includeSupportingImages) {
					docTypeIds.push("2");
				}
				if (includeSupportingDocs) {
					docTypeIds.push("3");
				}
				if (includePODs) {
					docTypeIds.push("4");
				}
				docTypeIds = docTypeIds.join(',');
				var invoiceIds = selectedItems.map(function (item) {
					return item.InvoiceId;
				}).join(',');

				var invoiceSummaryNode = mergeData.createElement("invoiceSummary");
				var invoiceIdsNode = mergeData.createElement("invoiceIds");
				invoiceIdsNode[nodeTextPropertyKey] = invoiceIds;
				invoiceSummaryNode.appendChild(invoiceIdsNode);

				var docTypeIdsNode = mergeData.createElement("docTypeIds");
				docTypeIdsNode[nodeTextPropertyKey] = docTypeIds;
				invoiceSummaryNode.appendChild(docTypeIdsNode);

				root.appendChild(invoiceSummaryNode);
			}
			selectedItems.forEach(function (item) {
				var invoiceNode = mergeData.createElement("invoice");
				mergeData.createElement("invoice");

				var invoiceId = item.InvoiceId !== null ? escapeXML(item.InvoiceId) : "N/A";
				invoiceNode.setAttribute("invoiceId", invoiceId);

				var invoiceNum = item.InvoiceNumber !== null ? escapeXML(item.InvoiceNumber) : "N/A";
				invoiceNode.setAttribute("invoiceNum", invoiceNum);

				var company = item.Company !== null ? escapeXML(item.Company) : "N/A";
				invoiceNode.setAttribute("company", company);

				var location = item.Location !== null ? escapeXML(item.Location) : "N/A";
				invoiceNode.setAttribute("orgName", location);


				if (includeInvoiceRecords) {
					var invoiceRecordNode = mergeData.createElement("invoiceRecord");

					var isManualNode = mergeData.createElement("isManual");
					isManualNode[nodeTextPropertyKey] = item.IsManual;
					invoiceRecordNode.appendChild(isManualNode);

					var invoiceIdNode = mergeData.createElement("invoiceId");
					invoiceIdNode[nodeTextPropertyKey] = invoiceId;
					invoiceRecordNode.appendChild(invoiceIdNode);

					var orgNameNode = mergeData.createElement("orgName");
					orgNameNode[nodeTextPropertyKey] = location;
					invoiceRecordNode.appendChild(orgNameNode);

					var companyNode = mergeData.createElement("company");
					companyNode[nodeTextPropertyKey] = company;
					invoiceRecordNode.appendChild(companyNode);

					var invoiceNumNode = mergeData.createElement("invoiceNum");
					invoiceNumNode[nodeTextPropertyKey] = invoiceNum;
					invoiceRecordNode.appendChild(invoiceNumNode);

					invoiceNode.appendChild(invoiceRecordNode);

				}
				if (includeEInvoices && item.EInvoiceAttached !== "0") {
					var eInvoiceNode = mergeData.createElement('eInvoice');
					invoiceNode.appendChild(eInvoiceNode);

					var eInvoiceIdNode = mergeData.createElement("eInvoiceId");
					eInvoiceIdNode[nodeTextPropertyKey] = item.EInvoiceAttached;
					eInvoiceNode.appendChild(eInvoiceIdNode);


					var orgNameNode = mergeData.createElement("orgName");
					orgNameNode[nodeTextPropertyKey] = location;
					eInvoiceNode.appendChild(orgNameNode);

					var companyNode = mergeData.createElement("company");
					companyNode[nodeTextPropertyKey] = company;
					eInvoiceNode.appendChild(companyNode);

					var invoiceNumNode = mergeData.createElement("invoiceNum");
					invoiceNumNode[nodeTextPropertyKey] = invoiceNum;
					eInvoiceNode.appendChild(invoiceNumNode);

					invoiceNode.appendChild(eInvoiceNode);
				}
				var attachedDocs = loadedDocs[item.InvoiceId];
				if (attachedDocs) {
					attachedDocs.forEach(function (doc) {
						var docNode = mergeData.createElement("attachment");

						var fileIdNode = mergeData.createElement("fileId");
						fileIdNode[nodeTextPropertyKey] = doc.DocId !== null ? escapeXML(doc.DocId) : "N/A";
						docNode.appendChild(fileIdNode);

						var contentTypeNode = mergeData.createElement("contentType");
						contentTypeNode[nodeTextPropertyKey] = doc.ContentType !== null ? escapeXML(doc.ContentType) : "N/A";
						docNode.appendChild(contentTypeNode);

						var typeNameNode = mergeData.createElement("typeName");
						typeNameNode[nodeTextPropertyKey] = doc.TypeName !== null ? escapeXML(doc.TypeName) : "N/A";
						docNode.appendChild(typeNameNode);

						var orgNameNode = mergeData.createElement("orgName");
						orgNameNode[nodeTextPropertyKey] = location;
						docNode.appendChild(orgNameNode);

						var companyNode = mergeData.createElement("company");
						companyNode[nodeTextPropertyKey] = company;
						docNode.appendChild(companyNode);

						var invoiceNumNode = mergeData.createElement("invoiceNum");
						invoiceNumNode[nodeTextPropertyKey] = invoiceNum;
						docNode.appendChild(invoiceNumNode);

						invoiceNode.appendChild(docNode);
					});
				}
				root.appendChild(invoiceNode);
			});
			if (root.childNodes.length > 0) {
				var mergeDataXMLString = (new XMLSerializer()).serializeToString(mergeData);
				mergeData = new Blob([mergeDataXMLString], { type: 'text/xml' })
				mergeData.name = "mergeData.xml";
				return mergeData;
			}
			else {
				return false;
			}


			function escapeXML(unsafe) {
				return unsafe.replace(/(<|>|&(?!(amp;|lt;|gt;|apos;|quot;))|'|")/g, function (c) {
					switch (c) {
						case '<': return '&lt;';
						case '>': return '&gt;';
						case '&': return '&amp;';
						case '\'': return '&apos;';
						case '"': return '&quot;';
					}
				});
			}
		}
	}
	self.exportInvoiceList = function (d, e) {
		//if (fnc.poListApp.exportType() == 'export-qbd') {
		//	$('#modConfirmFullBillExport').modal('show');
		//	$("#modConfirmFullBillExport").on("hidden.bs.modal", function () {
		//		console.log();
		//	});
		//} else {
		//	doExport();
		//}
		if (fnc.poListApp.exportType() == 'export-qbo') {
			// EXPORT QUICKBOOKS ONLINE
			self.exportProgress("initial");
			var distinct = {};
			self.selectedForQboExportInvoices.removeAll();
			var arr = self.selectedForQboExportInvoices;
			for (var n = 0; n < self.selectedForExportItems().length; n++) {
				var it = self.selectedForExportItems()[n];
				if (!distinct[it.InvoiceId]) {
					distinct[it.InvoiceId] = true;
					arr.push(it);
				}
			}

			$('#modQboExportProgress').modal('show');

			var i = 0;

			function f2(i, callback) {
				//console.log("f2_" + i + "=" + Date.now());
				if (callback) callback();
			};

			function f1(i) {
				//console.log("f1_" + i + "=" + Date.now());
				var it = arr()[i];
				var orgId = it.OrgId;
				var invId = it.InvoiceId;
				it.ExportStatus('inprogress');
				uploadQBOneInvoice(orgId, invId, function (result) {
					if (result == "") {
						updateExportedInvoices(invId, true, function () {
							it.ExportStatus('success');
							it.ExportMessage(result);
							it.Selected(false);
						});
					} else {
						fnc.poListApp.exportWithError(true);
						updateExportedInvoices(invId, false, function () {
							console.log(result);
							it.ExportStatus('error');
							it.ExportMessage(result);
							it.Selected(false);
						});
					}
					f2(i, function () {
						if (i == arr().length - 1 || self.exportCanceled()) {
							//$(function () {
							//	$('[data-toggle="popover"]').popover()
							//})
							self.exportProgress('ended');
							return;
						}
						if (i > 9) {																			//10 lines viewport
							$("#exportListBody").scrollTop((i - 1) * 19);		//20 - line height
						}
						i++;
						setTimeout(function () { f1(i) }, 1000);
					});
				})
			};

			f1(i);

			$("#modQboExportProgress").one("hidden.bs.modal", function () {
				//$("[data-toggle='popover']").popover('destroy');
				self.exportCanceled(false);
				self.exportWithError(false);
				self.loadPOList(function () {
					self.exportSelectType('all-not-exported');
					self.exportSelectType.valueHasMutated();
					windowResized();
				});
			});
		} else {
			//EXPORT INTO FILES
			doExport();
		}
	};

	self.submitExport = function (d, e) {
		$('#modConfirmFullBillExport').modal('hide');
		doExport();
	};

	self.setInvoicesWithMultiplePOs = function (arr, callback) {
		var distinct = [];
		var distinct2 = [];

		for (var i = 0; i < arr.length; i++) {
			var it = arr[i];
			it.RelatedPOList.push(it.PONumber);
			if (it.InvoiceId != 0) {
				var indx = distinct.indexOf(it.InvoiceId);
				if (indx == -1) {
					distinct.push(it.InvoiceId);
					distinct2.push(it);
				} else {
					it.ExpandedView(true);
					it.MultiplePOs(true);

					distinct2[indx].MultiplePOs(true);
					distinct2[indx].RelatedPOList.push(it.PONumber);
				}
			}
		}

		if (callback) callback();
	};

	self.setExpandCollapseToggle = function (d, e) {
		//var it = e.currentTarget;
		//$(it).find('span').removeClass();
		//if (it.getAttribute('aria-pressed') == 'true') {
		////if (self.ExpandCollapseToggle() == 'expand') {
		//	self.ExpandCollapseToggle('collapse');
		//	$(it).find('span').addClass('glyphicon glyphicon-chevron-right');
		//} else {
		//	self.ExpandCollapseToggle('expand');
		//	$(it).find('span').addClass('glyphicon glyphicon-chevron-down');
		//}

		if (self.ExpandCollapseToggle() == 'expand') {
			self.ExpandCollapseToggle('collapse');
		} else {
			self.ExpandCollapseToggle('expand');
		}

		//self.ExpandCollapseToggle(e.currentTarget.getAttribute('data-value')); 
	};

	self.cancelQboExport = function (d, e) {
		self.exportCanceled(true);
	};

	self.doPOListLoad = function (d, e) {
		self.pageNumber(0);
		self.filterSelectedVendors.removeAll();
		self.clearVendorsFilterVisible(false);
		self.loadPOList(function () {
			self.loadPOListVendors(function () {
				self.allItems.valueHasMutated();
				if (self.poListMode() === "invoice-export") {
					self.exportSelectType.valueHasMutated();
				}
				//if (callback) callback();
				windowResized();
			})
		});
	};

	self.doSearchOnEnter = function (d, e) {
		if (e.keyCode == 13) {
			self.doPOListLoad();
		}
		return true;
	};

}



