/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.eInvoicesApp = new function () {
	//*********************
	//defaults
	//*********************
	var pageSize = 100;
	var TOGGLE_INV_PO_BTN_CAPTION_INV = 'Back to PO Details'
	var TOGGLE_INV_PO_BTN_CAPTION_PO = 'Compare PO with Invoice'
	var VIEW_INV_PO_TITLE_INV = 'Compare Invoice/PO'
	var VIEW_INV_PO_TITLE_PO = 'PO Details'

	//*********************
	//objects
	//*********************
	var uniqueFailureTypeItem = function (it) {
		var self = this;
		
		self.StatusCode = it.StatusCode;
		self.FailMsg = (self.StatusCode == '-1' || self.StatusCode == '0') ? 'Valid' : it.FailMsg;
		self.Selected = ko.observable(false);
		if (self.StatusCode != '99') {
			self.Selected = ko.observable(true);
			fnc.eInvoicesApp.selectedFailureTypes.remove(self.StatusCode);
			fnc.eInvoicesApp.selectedFailureTypes.push(self.StatusCode);
		}
		//self.Selected = ko.observable(self.StatusCode != '99');
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				fnc.eInvoicesApp.selectedFailureTypes.push(self.StatusCode);
			} else {
				fnc.eInvoicesApp.selectedFailureTypes.remove(self.StatusCode);
			}
		}, self);

	};

	var EInvoicesListItem = function (it) {
		//@rowid: "1"
		//Deleted: "0"
		//EInvoiceId: "7"
		//InvoiceDate: "2015-07-30"
		//InvoiceNum: "M11651-00"
		//Msg: "Account Number, Purchase Order(s), and ItemCode for each line item are required."
		//OrgId: "238"
		//OrgName: "BRYANT PARK GRILL"
		//POList:"1943509"
		//Total: "346.360000"
		//VendId: "4282"
		//Vendor: "Ace Endico"
		var self = this;
		self.Deleted = it.Deleted;
		self.InvoiceId = it.EInvoiceId;
		self.InvoiceDate = it.InvoiceDate;	//(new Date(it.InvoiceDate)).format("mm/dd/yyyy");
		self.InvoiceNumber = it.InvoiceNum;
		self.FailMsg = typeof it.Msg == "object" ? "" : it.Msg;
		self.OrgId = it.OrgId;
		self.POList = typeof it.POList == "object" ? "" : it.POList;
		self.Location = it.OrgName;
		self.StatusCode = it.Status;
		self.Total = it.Total;
		self.VendId = typeof it.VendId == "object" ? "0" : it.VendId;
		self.Vendor = typeof it.Vendor == "object" ? "" : it.Vendor;

		self.Selected = ko.observable(false);
		self.selectedOrgId = ko.observable(it.OrgId);
		self.selectedOrgId.subscribe(function () {
			if (self.selectedOrgId() == undefined) return;
			if (self.OrgId != self.selectedOrgId()) {
				var invId = self.InvoiceId;
				var orgId = self.selectedOrgId();
				updateEInvoiceOrganization(invId, orgId, function () {
					self.OrgId = self.selectedOrgId();
					var vendId = self.VendId;
					var status = ko.observable();
					validateEInvoice(invId, vendId, status, function(){
						//console.log(status());
						loadInvoiceItems(invId, function () {
							self.Location = fnc.eInvoicesApp.invoiceAllItems()[0].OrgName;
							windowResized();
						})
					})
				});
			};
		}, self);

		self.isValid = ko.observable(false);

		self.includedPOList = ko.observableArray();

		self.accountNum = ko.observable("");
		self.gross = ko.observable("");
		self.discount = ko.observable("");
		self.tax = ko.observable("");
		self.freight = ko.observable("");
		self.computedNet = ko.observable("");
		self.computedTotal = ko.observable("");
		self.msg = ko.observable("");
		self.status = ko.observable("");
		self.lineTotal = ko.observable('');
		self.depositOrCredit = ko.observable('');
		self.discountComputed = ko.observable('');

		self.onInvoiceLinkClick = function (d, e) {
			var vendId = d.VendId;
			fnc.eInvoicesApp.originalPageNumber(fnc.eInvoicesApp.pageNumber());
			loadVendorLocations(vendId, function () {
				fnc.eInvoicesApp.selectedItem(d);
				windowResized();
			});
		};

		self.onDeleteInvoiceClick = function (d, e) {			
			fnc.eInvoicesApp.selectedForDeleteItem(d);
			$("#modConfirmDelInvoice").modal("show");
		};

		self.onRestoreInvoiceClick = function (d, e) {
			var invId = self.InvoiceId;
			restoreEInvoice(invId, function () {
				loadFailedList(function () {
					sortArray();
					windowResized();
				});
			});
		};

		self.DeleteButtonVisible = ko.computed(function () {
			return self.Deleted == "0" && true;
		}, self);

		self.RestoreButtonVisible = ko.computed(function () {
			return self.Deleted == "1" && true;
		}, self);

		self.validateInvoiceClick = function () {
			var invId = fnc.eInvoicesApp.selectedItem().InvoiceId;
			var vendId = fnc.eInvoicesApp.selectedItem().VendId;
			var status = ko.observable();
			validateEInvoice(invId, vendId, status, function () {
				//console.log(status());
				//if (!(status() == 'True')) {
				//	load_einvoices();
				//} else {
					loadInvoiceItems(invId, function () {
						windowResized();
					})
				//}
			});
		};

		self.processInvoiceClick = function () {
			//if (self.status() == '99') {
			//	//
			//	loadFailedList(function () {
			//		sortArray();
			//		fnc.eInvoicesApp.selectedItem(null);
			//		windowResized();
			//	});
			//} else {
				//regular
				var invId = fnc.eInvoicesApp.selectedItem().InvoiceId;
				processEInvoice(invId, function () {
					fnc.eInvoicesApp.selectedItem(null);
					fnc.eInvoicesApp.listSearchFilter('');
					loadFailedList(function () {
						sortArray();
						windowResized();
					});
				});
			//}
		};

		self.showAddPO = function () {
			var vendId = self.VendId;
			var orgId = self.selectedOrgId();
			var invId = self.InvoiceId
			loadOneVendorPOList(vendId, orgId, invId, function () {
				for (var i = 0; i < fnc.eInvoicesApp.addPONewItems().length; i++) {
					if (self.includedPOList() != '') {
						if (self.includedPOList().join().indexOf(fnc.eInvoicesApp.addPONewItems()[i].PONumber) != -1) {
							fnc.eInvoicesApp.addPONewItems()[i].Selected(true);
						}
					}
				}
				$('#modAddPO').modal('show');
				//fnc.eInvoicesApp.addPONumberList(fnc.eInvoicesApp.selectedItem().includedPOList() == "" ? [] : fnc.eInvoicesApp.selectedItem().includedPOList());

				$("#modAddPO").one("hidden.bs.modal", function () {
					fnc.eInvoicesApp.addPONewItems.removeAll();
					fnc.eInvoicesApp.addPONumberList.removeAll();
				});

				
			});
		};

	};

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
		self.Msg = it.Msg;
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
		self.VendItemCode = it.VendItemCode;		// testing ONLY == '220720' ? it.VendItemCode+'xyzabcopqr' : it.VendItemCode;
		self.Vendor = it.Vendor;

		self.Selected = ko.observable(false);

	};

	var LocationItem = function (it) {
		//Active: "1"
		//IsDefault: Object
		//Notes: null
		//OrgId: "564"
		//OrgName: "*RIVERWALK BAR AND GRILL"
		//ParentId: "151"
		//RegionId: "0"
		//RegionName: null
		//SalesRepId: "1154"
		//SalesRepName: "Robert Stevenson"
		//Type: "CLIENT"
		//UnitId: "RIVERWALK"
		//UserCode: "1021"
		var self = this;
		self.LocationId = it.OrgId;
		self.LocationName = it.OrgName;
		self.Selected = ko.observable(false);
	};

	var POListItem = function (it) {
		//Company: "Bartlett Dairy"
		//DelivDate: "2015-12-10"
		//OrderTotal: "69.058800"
		//OrgName: "YOUR RESTAURANT"
		//UnitId: "RE1060"
		//VENDID: "9"
		//VOrderNum: "1341110"
		//orgid: "313"

		var self = this;
		self.Company = it.Company;
		self.DeliveryDate = it.DelivDate;	//(new Date(it.DelivDate)).format("yyyy-mm-dd");
		self.POTotal = it.OrderTotal;
		self.Location = it.OrgName;
		self.UnitId = it.UnitId;
		self.PONumber = it.VOrderNum;
		self.OrgId = it.orgid;
		self.VendId = it.VENDID;

		self.SBVendId = it.SBVendId == undefined ? "0" : it.SBVendId;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				fnc.eInvoicesApp.addPONumberList.push(self.PONumber);
			} else {
				fnc.eInvoicesApp.addPONumberList.remove(self.PONumber);
			}
		}, self);

		self.onPOLinkClick = function (d, e) {
			//console.log(d);
			var poNo = Number(d.PONumber);
			fnc.eInvoicesApp.selectedPONumber(poNo);
			loadPOListItems(poNo, function () {
				if (false) {
					$("#modPOItems").modal('show');
				} else {
					createCompareItemsList2(fnc.eInvoicesApp.invoiceAllItems(), fnc.eInvoicesApp.selectedPOAllItems(), function () {		//console.log()});
					//createCompareItemsList(fnc.eInvoicesApp.invoiceAllItems(), fnc.eInvoicesApp.selectedPOAllItems(), function () {
						$("#modCompareInvoicePOItems").modal('show');

						//$('#modCompareInvoicePOItems').on('shown.bs.modal', function (e) {
						//	$('#rightItemComparePane').on('scroll', function () {
						//		$('#leftItemComparePane').scrollTop($(this).scrollTop());
						//		$('#leftItemComparePane').scrollLeft($(this).scrollLeft());
						//	});
						//	$('#leftItemComparePane').on('scroll', function () {
						//		$('#rightItemComparePane').scrollTop($(this).scrollTop());
						//		$('#rightItemComparePane').scrollLeft($(this).scrollLeft());
						//	});
						//});

						$('#modCompareInvoicePOItems').one('hidden.bs.modal', function (e) {
							fnc.eInvoicesApp.compareInvoiceItems.removeAll();
							fnc.eInvoicesApp.comparePOItems.removeAll();
							fnc.eInvoicesApp.invoicePoViewName('po');
							fnc.eInvoicesApp.selectedPONumber('');
							fnc.eInvoicesApp.compareInvoicePoTitle(VIEW_INV_PO_TITLE_PO);
							fnc.eInvoicesApp.btnToggleInvPoCaption(TOGGLE_INV_PO_BTN_CAPTION_PO);
						});
					});
				}
			});
		};

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

		self.InvoiceExist = ko.observable(false);
		self.POExist = ko.observable(false);
	};
	
	var InvoicePOCompareItem = function (it) {
		var self = this;
		self.Brand = it.Brand;
		self.CWT = it.CWT;
		self.Description = it.Description;
		self.Ext = it.Ext;
		self.Quantity = it.Quantity;
		self.TotalPriceUnits = it.TotalPriceUnits;
		self.UOM = it.UOM;
		self.Unit = it.Unit;
		self.UnitPrice = it.UnitPrice;
		self.VendItemCode = it.VendItemCode;
		self.ItemId = it.itemid;

		self.Brand2 = it.Brand;
		self.CWT2 = it.CWT;
		self.Description2 = it.Description;
		self.Ext2 = it.Ext;
		self.Quantity2 = it.Quantity;
		self.PriceUnits = it.PriceUnits;
		self.UOM2 = it.UOM;
		self.Unit2 = it.Unit;
		self.UnitPrice2 = it.UnitPrice;
		self.ItemId2 = it.itemid;

		self.InvoiceExist = ko.observable(false);
		self.POExist = ko.observable(false);
	};

	//*********************
	// private
	//*********************
	var loadPOListItems = function (poNumber, callback) {
		var params = {};
		params.VorderNum = poNumber;

		loading(true);
		self.selectedPOAllItems.removeAll();

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

	var loadFailedList = function (callback) {
		var params = {};

		loading(true);
		self.allItems.removeAll();
		ajaxPostXML("ChefMod.Financials.UI.Controllers.ElcInvoices.LoadFailedList", params, function (response) {
			loading(false);
			if (response == '') {
				if (callback) callback();
				windowResized();
				return;
			}
			//var r = eval('(' + response.d + ')');
			//if (r.result == 'error') {
			//	windowResized();
			//	return;
			//}
			//var obj = JSON.parse(response.d).result.row;
			if (response == 'error') return;
			var obj = JSON.parse(response).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new EInvoicesListItem(it));
				})
			} else {
				arr.push(new EInvoicesListItem(obj));
			}
			self.allItems(arr);
			if (callback) callback();
		})
	};

	var loadInvoiceItems = function (invId, callback) {
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
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new OneEInvoiceItem(it))
				})
			} else {
				arr.push(new OneEInvoiceItem(obj))
			}

			fnc.eInvoicesApp.invoiceAllItems(arr);

			fnc.eInvoicesApp.selectedItem().includedPOList(arr[0].POList == null ? "" : arr[0].POList.split(","));
			fnc.eInvoicesApp.selectedItem().accountNum(arr[0].AccountNum);
			fnc.eInvoicesApp.selectedItem().selectedOrgId(arr[0].OrgId);
			fnc.eInvoicesApp.selectedItem().msg(typeof arr[0].Msg == "object" ? "" : arr[0].Msg);
			fnc.eInvoicesApp.selectedItem().isValid(arr[0].Status == "0" || arr[0].Status == "-1");
			fnc.eInvoicesApp.selectedItem().status(typeof arr[0].Msg == "object" ? "" : arr[0].Status);
			//compute total and net
			var gr = Number(arr[0].Gross);
			var tx = Number(arr[0].Tax);
			var fr = Number(arr[0].Freight);
			var ds = Number(arr[0].Discount);
			var dcr = Number(arr[0].AdjTotal);

			fnc.eInvoicesApp.selectedItem().gross(gr);
			fnc.eInvoicesApp.selectedItem().discount(ds);
			fnc.eInvoicesApp.selectedItem().discountComputed(ds);
			fnc.eInvoicesApp.selectedItem().tax(tx);
			fnc.eInvoicesApp.selectedItem().freight(fr);
			fnc.eInvoicesApp.selectedItem().depositOrCredit(dcr);

			var sum = 0;
			for (var p = 0; p < arr.length; p++) {
				var t = Number(arr[p].TotalAmt);
				sum += t;
			}
			var rt = sum + tx + fr - ds;

			fnc.eInvoicesApp.selectedItem().lineTotal(sum);
			fnc.eInvoicesApp.selectedItem().computedTotal(rt);
			fnc.eInvoicesApp.selectedItem().computedNet(gr - ds);

			if (callback) callback();
		});
	};

	var loadVendorLocations = function (vendId, callback) {
		//LoadVendorLocations(o.Params.VendId, o.uc)
		var params = {};
		params.VendId = vendId;

		loading(true);
		self.filterAvailableLocations.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.LoadVendorLocations", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				if (callback) callback();
				windowResized();
				return;
			}
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new LocationItem(it));
				})
			} else {
				arr.push(new LocationItem(obj));
			}
			self.filterAvailableLocations(arr);
			if (callback) callback();
		})
	};

	var loadOneVendorPOList = function (vendId, orgId, invId, callback) {
		var d = new Date();
		var fd = new Date(new Date().setDate(d.getDate() - 30));		 //-430 for testing
		var td = new Date();
		
		var params = {};
		params.RangeBaseOn = 0; // Delivery Date
		params.FromDate = fd.toISOString().substring(0, 10);		//fd.toISOString().substring(0, 10); fnc.app.filterDateFrom();
		params.ToDate = td.toISOString().substring(0, 10);			//td.toISOString().substring(0, 10); fnc.app.filterDateTo()
		params.OrgsIds = orgId;
		params.Vendors = vendId;
		params.EInvoiceId = invId;

		//Function LoadPOList(rangeBasedOn As Integer, fromDate As Date, toDate As Date, orgsIds As String, vendors As String, keywords As String) As String

		loading(true);
		self.addPONewItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.EInvoiceLoadPOList", params, function (response) {
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
				obj.forEach(function (it) {
					arr.push(new POListItem(it));
				})
			} else {
				arr.push(new POListItem(obj))
			}
			self.addPONewItems(arr);
			if (callback) callback();
		})
	};

	var deleteEInvoice = function (invId, callback) {
		var params = {};
		params.EInvoiceId = invId;

		//loading(true);
		//DeleteEInvoice(o.Params.EInvoiceId, o.uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.DeleteEInvoice", params, function (response) {
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

	var restoreEInvoice = function (invId, callback) {
		var params = {};
		params.EInvoiceId = invId;

		loading(true);
		//RestoreEInvoice(o.Params.EInvoiceId, o.uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.RestoreEInvoice", params, function (response) {
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

	var updateEInvoiceOrganization = function (invId, orgId, callback) {
		var params = {};
		params.EInvoiceId = invId;
		params.OrgId = orgId;

		//loading(true);
		//Public Sub UpdateEInvoiceOrganization(EInvoiceId As Decimal, OrgId As Integer, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.UpdateEInvoiceOrganization", params, function (response) {
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

	var updateEInvoicePOList = function (invId, poList, callback) {
		var params = {};
		params.EInvoiceId = invId;
		params.POList = poList;

		//debug
		//if (callback) callback();
		//return;

		//loading(true);
		//UpdateEInvoicePOList(o.Params.EInvoiceId, o.Params.POList, o.uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.UpdateEInvoicePOList", params, function (response) {
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

	var validateEInvoice = function (invId, vendId, status, callback) {
		var params = {};
		params.EInvoiceId = invId;
		params.VendId = vendId;

		//Public Function ValidateEInvoice(EInvoiceId As Decimal, VendId As Integer, UserCode As Integer) As Boolean
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.ValidateEInvoice", params, function (response) {
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
			//success
			status(r.status);
			if (callback) callback();

		})
	};

	var processEInvoice = function (invId, callback) {
		var params = {};
		params.EInvoiceId = invId;

		loading(true);
		//Public Sub ProcessEInvoice(EInvoiceId As Decimal, UserCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.ElcInvoices.ProcessEInvoice", params, function (response) {
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

	var sortArray = function () {
		var h = self.activeSort();
		var e = { currentTarget: {} };
		e.currentTarget.id = 'einv_list';
		if (h.sortPropertyName != 'Total') {
			e.currentTarget.className = 'sort-alpha';
		}
		h.asc(!h.asc());
		sortListItems(h, e);
	};

	var populateUniqueFailureTypes = function () {
		var distinct = [];
		self.uniqueFailureTypes.removeAll();
		self.selectedFailureTypes.removeAll();
		for (var i = 0; i < self.allItems().length; i++) {
			if (distinct.indexOf(self.allItems()[i].StatusCode) == -1) {
				distinct.push(self.allItems()[i].StatusCode);
				self.uniqueFailureTypes.push(new uniqueFailureTypeItem({ StatusCode: self.allItems()[i].StatusCode, FailMsg: self.allItems()[i].FailMsg }))
			}
		}
		self.sortUniqueFailureTypes();
	};

	var createCompareItemsList = function (invItems, poItems, callback) {
		var invArr = [], poArr = [], compareInvPoArr = [];
		var invItem, poItem;
		var invExist = false, poExist = false;
		//iterate	eInvoice Items
		for (var i = 0; i < invItems.length; i++) {
			invItem = new InvoicePOCompareItem({});
			invItem.InvoiceExist(true);

			invItem.Brand = "";
			invItem.CWT = "";
			invItem.Description = invItems[i].Description;
			invItem.Ext = invItems[i].TotalAmt;
			invItem.ItemId = invItems[i].ItemId;
			invItem.Quantity = invItems[i].ShipQuantity;
			invItem.Unit = invItems[i].Unit;
			invItem.UnitPrice = invItems[i].Price;
			invItem.UOM = "";
			//iterate	selected PO Items
			for (var j = 0; j < poItems.length; j++) {
				if (invItem.ItemId == poItems[j].ItemId) {
					invItem.POExist(true);
					poItems[j].InvoiceExist(true);
					poItems[j].POExist(true);
					poItem = new InvoicePOCompareItem({});
					poItem.Brand = "";
					poItem.CWT = "";
					poItem.Description = poItems[j].Description;
					poItem.Ext = poItems[j].Ext;
					poItem.ItemId = poItems[j].ItemId;
					poItem.Quantity = poItems[j].Quantity;
					poItem.Unit = poItems[j].Unit;
					poItem.UnitPrice = poItems[j].UnitPrice;
					poItem.UOM = "";

					poItem.POExist(true);
					poItem.InvoiceExist(true);
					//po items
					poArr.push(poItem);

					poExist = true;
				}
			}
			if (poExist) {
				poExist = false;
			} else {
				poItem = new InvoicePOCompareItem({});
				poItem.Description = "&nbsp;";
				poItem.InvoiceExist(true);
				//po items
				poArr.push(poItem);
			}
			//invoice items
			invArr.push(invItem);
		}

		for (var n = 0; n < poItems.length; n++) {
			if (!poItems[n].InvoiceExist()) {
				invItem = new InvoicePOCompareItem({});
				invItem.Description = "&nbsp;";
				invItem.POExist(true);

				invArr.push(invItem);

				poItem = new InvoicePOCompareItem({});
				poItem.POExist(true);
				poItem.Brand = "";
				poItem.CWT = "";
				poItem.Description = poItems[n].Description;
				poItem.Ext = poItems[n].Ext;
				poItem.ItemId = poItems[n].ItemId;
				poItem.Quantity = poItems[n].Quantity;
				poItem.Unit = poItems[n].Unit;
				poItem.UnitPrice = poItems[n].UnitPrice;
				poItem.UOM = "";
				//po items
				poArr.push(poItem);
			}
		}

		fnc.eInvoicesApp.compareInvoiceItems(invArr);
		fnc.eInvoicesApp.comparePOItems(poArr);

		if (callback) callback();
	};

	var createCompareItemsList2 = function (invItems, poItems, callback) {
		var invPoArr = [];
		var invPoItem;
		var poExist = false;	//flag
		//iterate selected	eInvoice Items
		for (var i = 0; i < invItems.length; i++) {
			//create Invoice/PO one row item 
			invPoItem = new InvoicePOCompareItem({});
			invPoItem.InvoiceExist(true);
			invPoItem.Brand = "";
			invPoItem.CWT = "";
			invPoItem.Description = invItems[i].Description;
			invPoItem.Ext = invItems[i].TotalAmt;
			invPoItem.ItemId = invItems[i].ItemId;
			invPoItem.Quantity = invItems[i].ShipQuantity;
			invPoItem.TotalPriceUnits = invItems[i].TotalPriceUnits;
			invPoItem.Unit = invItems[i].Unit;
			invPoItem.UnitPrice = invItems[i].Price;
			invPoItem.UOM = "";
			invPoItem.VendItemCode = invItems[i].VendItemCode;
			//iterate	selected PO Items
			for (var j = 0; j < poItems.length; j++) {
				if (invPoItem.ItemId == poItems[j].ItemId) {
					//there is a match
					invPoItem.POExist(true);
					poItems[j].InvoiceExist(true);
					poItems[j].POExist(true);
					invPoItem.Brand2 = "";
					invPoItem.CWT2 = poItems[j].CWT;
					invPoItem.Description2 = poItems[j].Description;
					invPoItem.Ext2 = poItems[j].Ext;
					invPoItem.ItemId2 = poItems[j].ItemId;
					invPoItem.Quantity2 = poItems[j].Quantity;
					invPoItem.PriceUnits = Number(poItems[j].CWT) * Number(poItems[j].Quantity);
					invPoItem.Unit2 = poItems[j].Unit;
					invPoItem.UnitPrice2 = poItems[j].UnitPrice;
					invPoItem.UOM2 = "";
					invPoItem.POExist(true);
					poExist = true;
				}
			}
			if (poExist) {
				//reset flag
				poExist = false;
			} else {
				//there is no match (blank values)
				invPoItem.Brand2 = "";
				invPoItem.CWT2 = "";
				invPoItem.Description2 = "&nbsp";
				invPoItem.Ext2 = "";
				invPoItem.ItemId2 = "";
				invPoItem.Quantity2 = "";
				invPoItem.PriceUnits = "";
				invPoItem.Unit2 = "";
				invPoItem.UnitPrice2 = "";
				invPoItem.UOM2 = "";
			}
			//push one row (combined Invoice/PO values)	into an array
			invPoArr.push(invPoItem);
		}

		//iterate not matched PO items and add them to the array
		for (var n = 0; n < poItems.length; n++) {
			if (!poItems[n].InvoiceExist()) {
				invPoItem = new InvoicePOCompareItem({});
				//blank invoice values
				invPoItem.Brand = "";
				invPoItem.CWT = "";
				invPoItem.Description = "&nbsp";
				invPoItem.Ext = "";
				invPoItem.ItemId = "";
				invPoItem.Quantity = "";
				invPoItem.TotalPriceUnits = "";
				invPoItem.Unit = "";
				invPoItem.UnitPrice = "";
				invPoItem.UOM = "";
				invPoItem.VendItemCode = "";
				invPoItem.InvoiceExist(false);
				//po values
				invPoItem.POExist(true);
				invPoItem.Brand2 = "";
				invPoItem.CWT2 = "";
				invPoItem.Description2 = poItems[n].Description;
				invPoItem.Ext2 = poItems[n].Ext;
				invPoItem.ItemId2 = poItems[n].ItemId;
				invPoItem.Quantity2 = poItems[n].Quantity;
				invPoItem.PriceUnits = Number(poItems[n].CWT) * Number(poItems[n].Quantity);
				invPoItem.Unit2 = poItems[n].Unit;
				invPoItem.UnitPrice2 = poItems[n].UnitPrice;
				invPoItem.UOM2 = "";
				//add to the array
				invPoArr.push(invPoItem);
			}
		}

		fnc.eInvoicesApp.compareInvWithPOItems(invPoArr);
		//console.log(ko.toJSON(fnc.eInvoicesApp.compareInvWithPOItems(), null, 2))
		if (callback) callback();
	};

	//*********************
	// public 
	//*********************
	var self = this;

	self.listHeaders = [
	{ title: 'VENDOR', sortPropertyName: 'Vendor', asc: ko.observable(true) },
	{ title: 'LOCATION', sortPropertyName: 'Location', asc: ko.observable(true) },
	{ title: 'PO(s)', sortPropertyName: 'POList', asc: ko.observable(true) },
	{ title: 'INVOICE #', sortPropertyName: 'InvoiceNumber', asc: ko.observable(true) },
	{ title: 'DATE', sortPropertyName: 'InvoiceDate', asc: ko.observable(true) },
	{ title: 'TOTAL', sortPropertyName: 'Total', asc: ko.observable(true) },
	{ title: 'FAILURE MESSAGE', sortPropertyName: 'FailMsg', asc: ko.observable(true) }
	];
	self.activeSort = ko.observable(self.listHeaders[0]); //set the default sort

	self.init = function (callback) {
		self.selectedItem(null);
		self.listSearchFilter('');
		loadFailedList(function(){
			sortArray();
			self.showDeleted(false);
			self.listSearchFilter('');
			populateUniqueFailureTypes();
			if (callback) callback();
		});
	};

	self.listSearchFilter = ko.observable('');
	self.invoiceMsg = ko.observable('');

	self.filterAvailableLocations = ko.observableArray();

	self.showDeleted = ko.observable(false);

	self.pageNumber = ko.observable(0);
	self.nbPerPage = ko.observable(pageSize);

	self.selectedFailureTypes = ko.observableArray();

	self.allItems = ko.observableArray();
	self.filteredItems = ko.computed(function () {
		var r = self.allItems();
		//console.log('r1 (all) = ' + r.length);

		if (!self.showDeleted()) {
			r = ko.utils.arrayFilter(self.allItems(), function (item) {
				return item.Deleted == '0';
			})
		}
		//console.log('r2 (del) = ' + r.length);

		if (self.selectedFailureTypes().length > 0 ) {
			r = ko.utils.arrayFilter(r, function (item) {
				return self.selectedFailureTypes().toString().indexOf(item.StatusCode) != -1;
			})
		}
		//console.log('r3 (fil) = ' + r.length);

		if (self.listSearchFilter().length > 2) {
			var listSearchFilter = self.listSearchFilter().toLowerCase();
			listSearchFilter = listSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(r, function (item) {
				var words = listSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Vendor.toLowerCase().match(re) != null) || (item.Location.toLowerCase().match(re) != null) || (item.InvoiceNumber.toLowerCase().match(re) != null) || (item.POList.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
		//console.log('r4 (res) = ' + r.length);
		return r;
	}, self);
	self.filteredItems.subscribe(function () {
		self.pageNumber(0);
	}, self);
	
	self.uniqueFailureTypes = ko.observableArray();

	self.sortUniqueFailureTypes = function () {
		var prop = 'StatusCode';
		var ascSort, descSort;
		if (prop != '') {
			ascSort = function (a, b) { return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
			descSort = function (a, b) { return a[prop] > b[prop] ? -1 : a[prop] < b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
		} else {
			ascSort = function (a, b) { return a[prop] - b[prop] };
			descSort = function (a, b) { return b[prop] - a[prop] };
		}

		var sortFunc = ascSort;
		self.uniqueFailureTypes.sort(sortFunc);
	};

	//self.distinctStatuses = ko.computed(function () {
	//	var distinct = [];
	//	self.uniqueFailureTypes.removeAll();
	//	for (var i = 0; i < self.allItems().length; i++) {
	//		if (distinct.indexOf(self.allItems()[i].StatusCode) == -1) {
	//			distinct.push(self.allItems()[i].StatusCode);
	//			self.uniqueFailureTypes.push(new uniqueFailureTypeItem({ StatusCode: self.allItems()[i].StatusCode, FailMsg: self.allItems()[i].FailMsg }))
	//		}
	//	}
	//	self.sortUniqueFailureTypes();
	//	return distinct;
	//}, self);

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
		return self.pageNumber(targetPage - 1);
	}
	self.paginated = ko.computed(function () {
		var first = self.pageNumber() * self.nbPerPage();
		return self.filteredItems().slice(first, first + self.nbPerPage());
	});
	self.hasPrevious = ko.computed(function () {
		return self.pageNumber() !== 0;
	});
	self.hasNext = ko.computed(function () {
		return self.pageNumber() !== self.totalPages();
	});
	self.next = function () {
		if (self.pageNumber() < self.totalPages()) {
			self.pageNumber(self.pageNumber() + 1);
		}
	}
	self.previous = function () {
		if (self.pageNumber() != 0) {
			self.pageNumber(self.pageNumber() - 1);
		}
	}

	self.originalPageNumber = ko.observable(0);

	self.selectedItem = ko.observable(null);
	self.selectedItem.subscribe(function () {
		self.listSearchFilter2('');
		if (self.selectedItem() == null) {
			self.invoiceAllItems.removeAll();
		} else {
			var invId = self.selectedItem().InvoiceId;
			loadInvoiceItems(invId, function () {
				$("#tblEInvItemsBody").height(eInvoiceItemsTableHeight);
				windowResized();
			});
		}
	});

	self.selectedForDeleteItem = ko.observable(null);

	self.invoiceAllItems = ko.observableArray();

	self.listSearchFilter2 = ko.observable('');

	self.invoiceFilteredItems = ko.computed(function () {
		var listSearchFilter = self.listSearchFilter2().toLowerCase();
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

	self.addPONewItems = ko.observableArray();
	self.addPONumberList = ko.observableArray();

	self.selectedPOAllItems = ko.observableArray();
	self.selectedPONumber = ko.observable('');
	self.selectedPOItemSearch = ko.observable('');
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

	self.selectedForRemovePO = ko.observable('');

	self.compareInvoiceItems = ko.observableArray();
	self.comparePOItems = ko.observableArray();

	self.compareInvWithPOSearchFilter = ko.observable('');

	self.compareInvWithPOItems = ko.observableArray();
	self.compareInvWithPOFilteredItems = ko.computed(function () {
		var compareInvWithPOSearchFilter = self.compareInvWithPOSearchFilter().toLowerCase();
		compareInvWithPOSearchFilter = compareInvWithPOSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (compareInvWithPOSearchFilter.length < 3) {
			var r = self.compareInvWithPOItems();
			return r;
		} else {
			return ko.utils.arrayFilter(self.compareInvWithPOItems(), function (item) {
				var words = compareInvWithPOSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.VendItemCode.toLowerCase().match(re) != null) || (item.ItemId.toLowerCase().match(re) != null) || (item.ItemId2.toLowerCase().match(re) != null) || (item.Description.toLowerCase().match(re) != null) || (item.Description2.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	
	//invoice; po;
	self.invoicePoViewName = ko.observable('po');
	self.compareInvoicePoTitle = ko.observable(VIEW_INV_PO_TITLE_PO);
	self.btnToggleInvPoCaption = ko.observable(TOGGLE_INV_PO_BTN_CAPTION_PO);

	self.deleteInvoiceClick = function () {
		var invId = fnc.eInvoicesApp.selectedForDeleteItem().InvoiceId;
		deleteEInvoice(invId, function () {
			$("#modConfirmDelInvoice").modal("hide");
			fnc.eInvoicesApp.selectedForDeleteItem(null);
			loadFailedList(function () {
				sortArray();
				windowResized();
			});
		});
	};

	self.cancelDeleteInvoiceClick = function () {
		$("#modConfirmDelInvoice").modal("hide");
		fnc.eInvoicesApp.selectedForDeleteItem(null);
	};

	self.submitAddPO = function () {
		var invId = fnc.eInvoicesApp.selectedItem().InvoiceId;
		var poList = self.addPONumberList().join();
		var vendId = fnc.eInvoicesApp.selectedItem().VendId;
		var status = ko.observable('');
		updateEInvoicePOList(invId, poList, function () {
			$("#modAddPO").modal('hide');
			fnc.eInvoicesApp.addPONewItems.removeAll();
			fnc.eInvoicesApp.addPONumberList.removeAll();
			
			validateEInvoice(invId, vendId, status, function () {
				//console.log(status());
				loadInvoiceItems(invId, function () {
					windowResized();
				});
			});
		});
	};

	self.removePOFromInvoice = function (d, e) {
		self.selectedForRemovePO(d);
		$('#modConfirmRemovePO').modal('show');
		$("#modConfirmRemovePO").one("hidden.bs.modal", function () {
			self.selectedForRemovePO('');
		});
	};

	self.submitRemovePO = function (d, e) {
		self.selectedItem().includedPOList.remove(self.selectedForRemovePO());
		var invId = self.selectedItem().InvoiceId;
		var poList = self.selectedItem().includedPOList().join();
		var vendId = fnc.eInvoicesApp.selectedItem().VendId;
		var status = ko.observable('');
		updateEInvoicePOList(invId, poList, function () {
			$('#modConfirmRemovePO').modal('hide');
			self.selectedForRemovePO('');
			validateEInvoice(invId, vendId, status, function () {
				//console.log(status());
				loadInvoiceItems(invId, function () {
					windowResized();
				});
			});
		});
	};

	self.cancelRemovePO = function (d, e) {
		$('#modConfirmRemovePO').modal('hide');
		self.selectedForRemovePO('');
	};

	self.goBack2eInvoicesList = function (d, e) {
		loadFailedList(function () {
			//self.listHeaders[0].asc(true);
			//self.activeSort = ko.observable(self.listHeaders[0]);			
			sortArray();
			self.selectedItem(null);
			self.pageNumber(self.originalPageNumber());
			windowResized();
		});
	};

	self.createPOClick = function () {
		var invId = fnc.eInvoicesApp.selectedItem().InvoiceId;
		var vendId = fnc.eInvoicesApp.selectedItem().VendId;

		var poList = 'CreatePO';		//self.addPONumberList().join();
		var status = ko.observable('');
		updateEInvoicePOList(invId, poList, function () {
			$("#modAddPO").modal('hide');
			fnc.eInvoicesApp.addPONewItems.removeAll();
			fnc.eInvoicesApp.addPONumberList.removeAll();

			validateEInvoice(invId, vendId, status, function () {
				//console.log(status());
				loadInvoiceItems(invId, function () {
					windowResized();
				});
			});
		});
	};

	self.toggleInoicePoView = function (d, e) {
		var viewName = self.invoicePoViewName();
		switch (viewName) {
			case 'invoice':
				self.invoicePoViewName('po');
				self.compareInvoicePoTitle(VIEW_INV_PO_TITLE_PO);
				self.btnToggleInvPoCaption(TOGGLE_INV_PO_BTN_CAPTION_PO);
				break;
			case 'po':
				self.invoicePoViewName('invoice');
				self.compareInvoicePoTitle(VIEW_INV_PO_TITLE_INV);
				self.btnToggleInvPoCaption(TOGGLE_INV_PO_BTN_CAPTION_INV);
				break;
			default:
				self.invoicePoViewName('po');
		}
	}

}