/// <reference path="default.js" />

/*jshint evil:true */

var fnc;
fnc = fnc || {};
fnc.legacyListApp = new function () {
	//*********************
	//defaults
	//*********************


	//*********************
	//objects
	//*********************
	var POListLegacyItem = function (it) {
		//Accepted: "1"
		//AcceptedBy: "Luis Vargas(Luis)"
		//AcceptedDT: "04/04/2013"
		//COMPANY: "A & L CESSPOOL SERVICE CORP."
		//DelivDate: "04/04/2013"
		//InvoiceNum: "G513050"
		//OrderTotal: "0.000000000000"
		//OrgName: "BRYANT PARK GRILL"
		//UnitId: "RE0062"
		//VorderNum: "M1324411"
		//orgid: "238"
		//vendid: "4098"
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = typeof it.AcceptedDT == "object" ? "" : (new Date(it.AcceptedDT)).format("yyyy-mm-dd");	//it.AcceptedDT;	it.AcceptedDT;
		self.Company = it.COMPANY;
		self.DeliveryDate = (new Date(it.DelivDate)).format("yyyy-mm-dd");	//it.DelivDate;
		self.InvoiceNumber = it.InvoiceNum;
		self.POTotal = it.OrderTotal;
		self.Location = it.OrgName;
		self.UnitId = it.UnitId;
		self.PONumber = it.VorderNum;
		self.OrgId = it.orgid;
		self.VendId = it.vendid;

		self.Selected = ko.observable(false);

		self.onLinkClick = function (d, e) {
			fnc.legacyListApp.selectedItem(d);
			if (d.PONumber) {
				if (d.PONumber.charAt(0) == 'M') {
					showInvoiceWithoutPO(d);
				} else {
					showInvoiceWithPO(d);
				}
			}
		};
	}

	var POListVendor = function (it) {
		var self = this;
		self.VendId = it.VendId;
		self.Company = typeof it.Company == "object" ? "N/A" : it.Company;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (fnc.legacyListApp == undefined) return;
			if (self.Selected()) {
				fnc.legacyListApp.filterSelectedVendors.push(self.VendId);
				fnc.legacyListApp.clearVendorsFilterVisible(true);
			} else {
				fnc.legacyListApp.filterSelectedVendors.remove(self.VendId);
				if (fnc.legacyListApp.filterSelectedVendors().length == 0)
					fnc.legacyListApp.clearVendorsFilterVisible(false);
			}
		})
	};


	//*********************
	// private
	//*********************

	var showInvoiceWithPO = function (d) {
		var poNo = d.PONumber;
		var company = d.Company;
		var location = d.Location;
		var invId = poNo; //27 temp
		fnc.legacyListApp.PORequiredInvoice.init(invId, company, location, function () {
			$('#modShowInoiceWithPO').modal('show');
			$('[data-toggle="tooltip"]').tooltip();
			$('[data-toggle="popover"]').popover();
		});

	};

	var showInvoiceWithoutPO = function (d) {
		var poNo = d.PONumber;
		var company = d.Company;
		var location = d.Location;
		var invId = poNo; // 128 temp
		fnc.legacyListApp.noPORequiredInvoice.init(invId, company, location, function () {
			$('#modShowInoiceWithoutPO').modal('show');
		});

	};



	//*********************
	// public 
	//*********************

	var self = this;

	self.listHeaders = [
		{ title: 'COMPANY', sortPropertyName: 'Company', asc: ko.observable(true) },
		{ title: 'LOCATION', sortPropertyName: 'Location', asc: ko.observable(true) },
		{ title: 'PO #', sortPropertyName: 'PONumber', asc: ko.observable(true) },
		{ title: 'INVOICE #', sortPropertyName: 'InvoiceNumber', asc: ko.observable(true) },
		{ title: 'DATE', sortPropertyName: 'DeliveryDate', asc: ko.observable(false) },
		{ title: 'PO TOTAL', sortPropertyName: 'POTotal', asc: ko.observable(true) },
		{ title: 'ACCEPTED', sortPropertyName: 'AcceptedDT', asc: ko.observable(true) }
	];
	self.activeSort = ko.observable(self.listHeaders[4]); //set the default sort

	self.poListSearch = ko.observable('');

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

	self.selectedItem = ko.observable(null);

	self.allItems = ko.observableArray();
	self.filteredItems = ko.computed(function () {
		var r = self.allItems();
		if (self.filterSelectedVendors().length > 0) {
			r = ko.utils.arrayFilter(r, function (item) {
				return self.filterSelectedVendors().indexOf(item.VendId) != -1;
			})
		}
		if (self.poListSearch().length > 0) {
			var poListSearchFilter = self.poListSearch().toLowerCase();
			poListSearchFilter = poListSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(r, function (item) {
				var words = poListSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Company.toLowerCase().match(re) != null) || (item.PONumber ? item.PONumber.toLowerCase().match(re) != null : false) || (item.POTotal.toLowerCase().match(re) != null) || (item.InvoiceNumber ? item.InvoiceNumber.toLowerCase().match(re) != null : false));
				}
				return found;
			});
		}
		return r;
	}, self);

	//
	self.poListSearchKeywords = ko.observable('');

	//public function
	self.init = function (callback) {
		self.allItems.removeAll();
		self.filterAvailableVendors.removeAll();
		self.loadLegacyPOList(function () {
			self.loadPOListVendors(function () {
				windowResized();
			});
		})
		//if (self.filterAvailableVendors().length == 0) {
		//	self.loadPOListVendors(function () {
		//		self.loadLegacyPOList(function () {
		//			windowResized();
		//		});
		//	})
		//} else {
		//	self.loadLegacyPOList(function () {
		//		windowResized();
		//	});
		//}
	};

	self.loadPOListVendors = function (callback) {
		var distinct = [];

		self.filterAvailableVendors.removeAll();

		for (var i = 0; i < self.allItems().length; i++) {
			var it = self.allItems()[i].VendId;
			if (distinct.indexOf(it) == -1) {
				distinct.push(it);
				self.filterAvailableVendors.push(new POListVendor({ VendId: self.allItems()[i].VendId, Company: self.allItems()[i].Company }))
			}
		}

		sortArray(self.filterAvailableVendors, 'Company')

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
	};

	self.loadLegacyPOList = function (callback) {
		var params = {};
		params.RangeBaseOn = fnc.app.filterRangeBaseOn();
		params.FromDate = fnc.app.filterDateFrom();
		params.ToDate = fnc.app.filterDateTo();
		params.OrgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();
		params.Vendors = '';
		params.Keywords = self.poListSearchKeywords(); //'';

		//Function LoadLegacyPOList(rangeBasedOn As Integer, fromDate As Date, toDate As Date, orgsIds As String, vendors As String, keywords As String) As String

		loading(true);
		self.allItems.removeAll();
		ajaxPostXML("ChefMod.Financials.UI.Controllers.Invoices.LoadLegacyPOList", params, function (response) {
			loading(false);
			if (response == '') {
				//if (response.d == '') {
				windowResized();
				return;
			}
			//var r = eval('(' + response.d + ')');
			//if (r.result == 'error') {
			//	windowResized();
			//	return;
			//}
			if (response == 'error') return;
			var obj = JSON.parse(response).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new POListLegacyItem(it)) })
			} else {
				arr.push(new POListLegacyItem(obj))
			}
			self.allItems(arr);
			//self.sortPOList();
			if (callback) callback();
		})
	};

	self.sortPOList = function () {
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
		self.allItems.sort(sortFunc);
	};

	self.doLegacyLoad = function () {
		self.loadLegacyPOList(function () {
			self.loadPOListVendors(function () {
				windowResized();
			});
		})
	};

	self.doSearchOnEnter = function (d, e) {
		if (e.keyCode == 13) {
			self.doLegacyLoad();
		}
		return true;
	};

	/* NESTED OBJECTS
* ================================== */

	//-->NO PO REQUIRED INVOICE
	self.noPORequiredInvoice = new (function () {
		//private objects

		var ManualInvoiceItem = function (it) {
			//Accepted: "1"
			//AcceptedBy: "Luis Vargas(Luis)"
			//AcceptedDT: "02/22/2013"
			//Company: "A & L CESSPOOL SERVICE CORP."
			//Discount: "0.000000"
			//Freight: "0.000000"
			//GLAcc: "7150400"
			//GLDescr: "VARIABLE MAINT/REP.OTHERS"
			//GLDiscount: "0.0000000"
			//GLFreight: "0.000000"
			//GLTax: "0.000000"
			//Gross: "350.000000"
			//InvoiceDate: "2013-02-22T00:00:00"
			//InvoiceNum: "P509199"
			//RecordId: "2952337"
			//Status: "COMPLETE"
			//SubTotal: "350.000000"
			//Tax: "0.000000"
			//Total: "350.0000000"
			//VendId: "4098"
			//VorderNum: "M1298925"
			var self = this;
			self.Accepted = it.Accepted;
			self.AcceptedBy = it.AcceptedBy;
			self.AcceptedDT = it.AcceptedDT;
			self.Company = it.Company;
			self.Discount = it.Discount;
			self.Freight = it.Freight;
			self.GLAccNumber = it.GLAcc;
			self.GLAccDescription = it.GLDescr;
			self.GLDiscount = it.GLDiscount;
			self.GLFreight = it.GLFreight;
			self.GLTax = it.GLTax;
			self.Gross = it.Gross;
			self.InvoiceDate = it.InvoiceDate;
			self.InvoiceNum = it.InvoiceNum;
			self.InvoiceId = it.RecordId;
			self.Status = it.Status;
			self.SubTotal = Number(it.SubTotal);
			self.Tax = it.Tax;

			self.VendId = it.VendId;
			self.VorderNum = it.VorderNum;

			//self.Xported = it.Xported;
			//self.XportedBy = it.XportedBy;
			//self.XportedDT = it.XportedDT;

			self.Total = it.Total;

		};


		//private functions

		var loadItems = function (invId, callback) {
			var params = {};
			params.VorderNumString = invId;
			self.allItems.removeAll();
			loading(true);
			//	 LoadOneManualInvoice
			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOneInvoiceManual_Legacy", params, function (response) {
				loading(false);
				if (response.d == '') {

					//set common values
					self.invoiceNumber('');
					self.invoiceDate('');
					self.tax('');
					self.grossAmount('');
					self.discAmount('');
					self.freight('');

					self.invoiceAccepted('0');
					self.invoiceAcceptedDate(null);
					self.invoiceAcceptedBy(null);

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
					obj.forEach(function (it) { arr.push(new ManualInvoiceItem(it)) })
				} else {
					arr.push(new ManualInvoiceItem(obj))
				}

				//set common values

				self.allItems(arr);

				self.invoiceNumber(arr[0].InvoiceNum);
				self.invoiceDate((new Date(arr[0].InvoiceDate)).format(strFormat));
				self.tax(formatToFixed0(arr[0].Tax, 2));
				self.grossAmount(formatToFixed0(arr[0].Gross, 2));
				self.discAmount(formatToFixed0(arr[0].Discount, 2));
				self.freight(formatToFixed0(arr[0].Freight, 2));

				self.invoiceAccepted(arr[0].Accepted);
				self.invoiceAcceptedDate(arr[0].AcceptedDT);
				self.invoiceAcceptedBy(arr[0].AcceptedBy);

				if (callback) callback();
			});
		};

		// public

		var self = this;

		self.init = function (invId, company, location, callback) {
			loadItems(invId, function () {
				self.companyName(company);
				self.orgName(location);
				callback();
			});
		};

		self.allItems = ko.observableArray();
		self.filteredItems = ko.computed(function () {
			var r = self.allItems();
			return r;
		}, self);

		self.listHeaders = [
			{ title: 'GL ACCOUNT', sortPropertyName: 'GLAccNumber', asc: ko.observable(true) },
			{ title: 'DESCRIPTION', sortPropertyName: 'GLAccDescription', asc: ko.observable(true) },
			{ title: 'SUB TOTAL', sortPropertyName: 'SubTotal', asc: ko.observable(true) },
			{ title: 'TAX', sortPropertyName: 'GLTax', asc: ko.observable(true) },
			{ title: 'FREIGHT', sortPropertyName: 'GLFreight', asc: ko.observable(true) },
			{ title: 'DISCOUNT', sortPropertyName: 'GLDiscount', asc: ko.observable(true) },
			{ title: 'TOTAL', sortPropertyName: 'SubTotal', asc: ko.observable(true) }
		];
		self.activeSort = ko.observable(self.listHeaders[0]); //set the default sort

		self.hasChangedHeader = ko.observable(false);

		self.companyName = ko.observable('');

		self.orgName = ko.observable('');

		self.invoiceNumber = ko.observable();

		self.invoiceId = ko.observable('');

		self.invoiceDate = ko.observable('');
		self.invoiceDate.subscribe(function () {
			//validateAccountOverlay();
		}, self);

		//Accepted
		self.invoiceAccepted = ko.observable();
		self.invoiceAcceptedDate = ko.observable();
		self.invoiceAcceptedBy = ko.observable();
		self.showInoiceAccepted = ko.computed(function () {
			return self.invoiceAccepted() == "1";
		}, self);

		self.PONumber = ko.observable('');

		self.grossAmount = ko.observable('');
		self.grossAmount.subscribe(function () {
			//validateAccountOverlay();
		}, self);

		self.discAmount = ko.observable('');

		self.netAmount = ko.computed(function () {
			if (self.grossAmount().length > 0) {
				var r = Number(self.grossAmount());
				if (self.discAmount().length > 0) {
					r = r - Number(self.discAmount());
				}
				return r.toFixed(2);
			} else {
				return "";
			}
		}, self);

		self.tax = ko.observable('');
		self.tax.subscribe(function () {
			//validateAccountOverlay();
		}, self);

		self.freight = ko.observable('');


		self.total = ko.computed(function () {
			var sum = 0;
			for (var i = 0; i < self.allItems().length; i++) {
				var net = Number(self.allItems()[i].SubTotal);
				sum += net;
			}
			var tx = Number(self.tax());
			var fr = Number(self.freight());
			var ds = Number(self.discAmount());
			var rt = sum + tx + fr - ds;
			return ((rt == 0) || isNaN(rt)) ? '' : rt.toFixed(2);
		}, self);

		self.sumSubTotal = ko.computed(function () {
			var r = 0;
			if (self.allItems().length > 0) {
				for (var i = 0; i < self.allItems().length; i++) {
					r = r + Number(self.allItems()[i].SubTotal);
				}
			}
			return r;
		}, self);

		self.sumTax = ko.computed(function () {
			var r = 0;
			if (self.allItems().length > 0) {
				for (var i = 0; i < self.allItems().length; i++) {
					r = r + Number(self.allItems()[i].GLTax);
				}
			}
			return r;
		}, self);

		self.sumFreight = ko.computed(function () {
			var r = 0;
			if (self.allItems().length > 0) {
				for (var i = 0; i < self.allItems().length; i++) {
					r = r + Number(self.allItems()[i].GLFreight);
				}
			}
			return r;
		}, self);

		self.sumDiscount = ko.computed(function () {
			var r = 0;
			if (self.allItems().length > 0) {
				for (var i = 0; i < self.allItems().length; i++) {
					r = r + Number(self.allItems()[i].GLDiscount);
				}
			}
			return r;
		}, self);

		self.sumTotal = ko.computed(function () {
			var r = 0;
			if (self.allItems().length > 0) {
				for (var i = 0; i < self.allItems().length; i++) {
					r = r + Number(self.allItems()[i].Total);
				}
			}
			return r;
		}, self);

		// functions

		self.closeInvoicelDialog = function (d, e) {
			$('#modShowInoiceWithoutPO').modal('hide');
			fnc.legacyListApp.selectedItem(null);
		};

	});

	//-->PO REQUIRED INVOICE
	self.PORequiredInvoice = new (function () {
		//private objects
		var ReconcileTabItem = function (it) {

			//Accepted: "1"
			//AcceptedBy: "Luis Vargas(Luis)"
			//AcceptedDT: "Oct 4 2012 2:39PM"
			//Brand: "FABBRI"
			//Catch: "1.0000000"
			//Company: "Ace Endico"
			//Discount: "0.000000"
			//Freight: "0.000000"
			//Gross: "1537.750000"
			//InvoiceDate: "2012-10-04T00:00:00"
			//InvoiceNum: "F98231-00"
			//ItemDescr: "AMARENA CHERRIES IN SYRUP"
			//ItemID: "37759"
			//Net: "51.420000000000"
			//OrdPrice: "51.420000"
			//OrdQty: "1.000000"
			//OrdUnit: "EA"
			//OrdUnits: "1.000000"
			//PayPrice: "51.420000"
			//RcdPrice: "51.420000"
			//RcdQty: "1.000000"
			//RcdUnit: "EA"
			//RcdUnits: "1.000000"
			//Status: "COMPLETE"
			//Tax: "0.000000"
			//Total: "51.420000000000"
			//VendId: "4282"
			//VendItemCode: "N/A"

			var self = this;
			self.Selected = ko.observable(false);
			//self.InvoiceDetailsId = it.InvoiceDetailsId;

			self.Accepted = it.Accepted;
			self.AcceptedBy = it.AcceptedBy;
			self.AcceptedDT = it.AcceptedDT;

			self.Brand = it.Brand;
			self.Catch = it.Catch;
			self.Company = it.Company;

			//self.BillPrice = it.BillPrice;
			//self.BillUnit = it.BillUnit;

			self.Discount = it.Discount;
			self.Freight = it.Freight;
			self.Gross = it.Gross;
			self.Tax = it.Tax;

			self.InvoiceDate = it.InvoiceDate;
			self.InvoiceId = it.InvoiceId;
			self.InvoiceNumber = it.InvoiceNum;
			//self.IsAuto = it.IsAuto;
			self.ItemId = it.ItemID;
			self.Item = it.ItemDescr;

			self.Net = it.Net;


			//self.Locked = it.Locked;
			//self.LockedByUserCode = typeof (it.LockedByUserCode) == "object" ? null : it.LockedByUserCode;
			//self.Lockedby = it.Lockedby;

			self.Price = ko.utils.unwrapObservable(it.OrdPrice);
			self.Qty = ko.utils.unwrapObservable(it.OrdQty);
			self.Unit = it.OrdUnit;
			self.Units = ko.utils.unwrapObservable(it.OrdUnits);

			self.Total = it.Total;

			self.POList = it.POList;

			self.RcdPrice = it.RcdPrice;
			self.RcdQty = it.RcdQty;
			self.RcdUnits = it.RcdUnits;

			self.Units2 = ko.observable(it.RcdUnits);
			self.Price2 = ko.observable(it.Price2);
			self.PayPrice = ko.observable(it.RcdPrice);

			self.Status = ko.observable(it.Status);

			self.Xported = it.Xported;
			self.XportedBy = it.XportedBy;
			self.XportedDT = it.XportedDT;

			self.VendId = it.VendId;
			self.Code = it.VendItemCode;

			//self.eCode = 'tst' + it.Code;	//it.eCode;
			//self.eQty = it.eQty;
			//self.eUnits = it.eUnits;
			//self.ePrice = it.ePrice;

			//self.dQty = it.dQty;
			//self.dUnits = it.dUnits;

			self.glCode = ko.observable(ko.utils.unwrapObservable(it.glCode));

			self.selectedItemChecked = ko.observable('');

			self.splitInvoices = ko.observableArray();

			self.itemNotes = ko.observableArray();
			self.itemNotes.subscribe(function () {
				if (self.itemNotes().length > 0) {
					self.isExistingNotes(true);
				}
			}, self);

			self.addNote = function (d, e) {
				//$(e.currentTarget).editable({
				//	url: '/post',
				//	title: 'Enter comments',
				//	rows: 4
				//});
			};

			self.isExistingNotes = ko.observable(false);

			self.showItemGLManagement = function (d, e) {
				var invId = d.InvoiceId;
				var itemId = d.ItemId;
				var item = d.Item;
				var net = d.Net();

				loadItemGLAccounts(invId, itemId, function () {
					PORequiredInvoice.itemGLAccountsHeader(item);
					PORequiredInvoice.itemIdOpen4GLManagement(itemId);
					PORequiredInvoice.itemOriginalNet(Number(net).toFixed(2));
					PORequiredInvoice.itemCalculatedNet(Number(net).toFixed(2));
					recalculateOneItemGLAccountsTotal();
					$("#modShowItemGLAccounts").modal("show");
					PORequiredInvoice.validateInvoice();
					$('#modShowItemGLAccounts').one('hidden.bs.modal', function (e) {
						PORequiredInvoice.rememberCostSplitSettings(false);
					});
				});
			};

			self.addSplitInvoice = function (d, e) {
				e.preventDefault();
				//self.splitInvoices.push(new ReconcileTabSplitItem({ InvoiceNumber: null, Units: null }));
			};

			self.removeSplitInvoice = function (d, e) {
				e.preventDefault();
				//self.splitInvoices.remove(d);
			};

			self.submitSelectedItem = function (d, e) {

			};

			self.editSelectedItem = function (d, e) {

			};

			//self.Net = ko.computed(function () {
			//	var r = 0;
			//	r = self.Units2() * self.PayPrice();
			//	if (isNaN(r)) {
			//		r = 0;
			//	} else {
			//		r = Number(r).toFixed(2);
			//	}
			//	return (r == 0) ? '' : r;
			//}, self);

			self.UnitsBeforeEdit = ko.observable(self.Units2());
			self.UnitsDelta = ko.computed(function () {
				return Number(self.Units) - Number(self.Units2());
			}, self)

			self.updateUnits2Cell = function (d, e) {
				e.preventDefault();
			}

			self.updatePayPriceCell = function (d, e) {
				e.preventDefault();
			}

			self.isCheckedPO = ko.observable(false);

			self.isCheckedInvoice = ko.observable(false);

			self.isCheckedDelivery = ko.observable(false);

			self.onItemCheckedPOClick = function (d, e) {
				e.preventDefault();
				e.stopPropagation();
			};

			self.onItemCheckedInvoiceClick = function (d, e) {
			};

			self.onItemCheckedDeliveryClick = function (d, e) {
			};

			self.deleteItem = function (d, e) {
			};

		};

		var GLDistributionItem = function (it) {
			//Freight: "0.000000"
			//GLAcc: "4000500"
			//GLDescr: "GROCERY"
			//Subtotal: "165.480000"
			//Tax: "2.305000"
			//Total: "167.785000"
			var self = this;
			self.GLAccNumber = it.GLAcc;
			self.GLAccDescription = it.GLDescr;
			self.SubTotal = it.Subtotal;
			//self.Prcnt = it.Prcnt;
			self.Tax = it.Tax;
			self.Freight = it.Freight;
			//self.Discount = it.Discount;
			self.Total = it.Total;
			//self.Total = ko.computed(function () {
			//	return Number(self.SubTotal) + Number(self.Tax) + Number(self.Freight) - Number(self.Discount);
			//}, self);
		};

		//private functions
		var loadItems = function (invId, callback) {
			var params = {};
			params.VorderNumString = invId;
			self.allItems.removeAll();
			self.includedPOList.removeAll();
			//reset common values
			resetInvoiceCommonValues();
			loading(true);
			//LoadOneInvoice(o.Params.InvoiceId)		 LoadOneInvoice_Legacy
			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOneInvoice_Legacy", params, function (response) {
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
					obj.forEach(function (it) { arr.push(new ReconcileTabItem(it)) })
				} else {
					arr.push(new ReconcileTabItem(obj))
				}

				//set common values
				self.grossAmount(formatToFixed0(arr[0].Gross, 2))
				self.discAmount(formatToFixed0(arr[0].Discount, 2))
				self.tax(formatToFixed0(arr[0].Tax, 2));
				self.freight(formatToFixed0(arr[0].Freight, 2));
				self.invoiceNumber(arr[0].InvoiceNumber);
				self.invoiceDate((new Date(arr[0].InvoiceDate)).format(strFormat));
				self.invoiceAccepted(arr[0].Accepted);
				self.invoiceAcceptedDate(arr[0].AcceptedDT);
				self.invoiceAcceptedBy(arr[0].AcceptedBy);

				self.includedPOList(arr[0].POList ? arr[0].POList.split(',') : []);

				if (arr[0].InvoiceDetailsId != '0') {
					self.allItems(arr);
				}

				if (callback) callback();
			});
		};

		var resetInvoiceCommonValues = function () {
			self.grossAmount('')
			self.discAmount('')
			self.tax('');
			self.freight('');
			self.invoiceNumber('');
			self.invoiceDate('');
			self.invoiceAccepted('0');
			self.invoiceAcceptedDate(null);
			self.invoiceAcceptedBy('');
		}

		var loadGLDistribution = function (invId, callback) {
			var params = {};
			params.VorderNumString = invId;

			self.glDistributionList.removeAll();

			self.sumSubTotal('');
			self.sumTax('');
			self.sumFreight('');
			self.sumDiscount('');
			self.sumTotal('');

			//loading(true);LoadGLDistribution 

			ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadInvoiceGLDistribution_Legacy", params, function (response) {
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
					obj.forEach(function (it) { arr.push(new GLDistributionItem(it)) })
				} else {
					arr.push(new GLDistributionItem(obj))
				}

				var t2 = 0;
				var t3 = 0;
				var t4 = 0;
				var t5 = 0;
				var t6 = 0;

				for (var i = 0; i < arr.length; i++) {
					t2 = t2 + Number(arr[i].SubTotal);
					t3 = t3 + Number(arr[i].Tax);
					t4 = t4 + Number(arr[i].Freight);
					//t5 = t5 + Number(arr[i].Discount);
					t6 = t6 + Number(arr[i].Total);
				}
				self.glDistributionList(arr);

				self.sumSubTotal(t2);
				self.sumTax(t3);
				self.sumFreight(t4);
				//self.sumDiscount(t5);
				self.sumTotal(t6);

				if (callback) callback();
			})
		};

		//*********************
		//public
		//*********************
		var self = this;

		self.init = function (invId, company, location, callback) {
			loadItems(invId, function () {
				self.companyName(company);
				self.orgName(location);
				callback();
			});
		};

		self.allItems = ko.observableArray();

		self.listHeaders = [
			{ title: 'CODE', sortPropertyName: 'Code', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'ITEM', sortPropertyName: 'Item', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'BRAND', sortPropertyName: 'Brand', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'UNIT', sortPropertyName: 'Unit', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'QTY', sortPropertyName: 'Qty', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'UNITS', sortPropertyName: 'Units', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'PRICE', sortPropertyName: 'Price', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'TOTAL', sortPropertyName: 'Total', asc: ko.observable(true), show: ko.observable(true) },


			{ title: 'QTY', sortPropertyName: 'eQty', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'UNITS', sortPropertyName: 'eUnits', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'PRICE', sortPropertyName: 'ePrice', asc: ko.observable(true), show: ko.observable(true) },

			{ title: 'QTY', sortPropertyName: 'dQty', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'UNITS', sortPropertyName: 'dUnits', asc: ko.observable(true), show: ko.observable(true) },

			{ title: 'STATUS', sortPropertyName: 'Status', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'UNITS', sortPropertyName: 'Units2', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'PAY PRICE', sortPropertyName: 'PayPrice', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'NET', sortPropertyName: 'Net', asc: ko.observable(true), show: ko.observable(true) },
			{ title: 'GL', sortPropertyName: 'glCode', asc: ko.observable(true), show: ko.observable(true) },

			{ title: 'INV. ITEM', sortPropertyName: 'eCode', asc: ko.observable(true), show: ko.observable(true) }
		];

		self.activeSort = ko.observable(self.listHeaders[1]); //set the default sort

		self.glDistributionList = ko.observableArray();
		self.sumSubTotal = ko.observable('');
		self.sumTax = ko.observable('');
		self.sumFreight = ko.observable('');
		self.sumDiscount = ko.observable('');
		self.sumTotal = ko.observable('');

		self.listSearchFilter = ko.observable('');

		self.includedPOList = ko.observableArray();

		self.companyName = ko.observable('');

		self.orgName = ko.observable('');

		self.invoiceNumber = ko.observable();

		self.invoiceId = ko.observable('');

		self.invoiceDate = ko.observable('');
		self.invoiceDate.subscribe(function () {
			//validateAccountOverlay();
		}, self);

		//Accepted
		self.invoiceAccepted = ko.observable();
		self.invoiceAcceptedDate = ko.observable();
		self.invoiceAcceptedBy = ko.observable();
		self.showInoiceAccepted = ko.computed(function () {
			return self.invoiceAccepted() == "1";
		}, self);

		self.PONumber = ko.observable('');

		self.reconciledLineQty = ko.observable();

		self.grossAmount = ko.observable('');
		self.discAmount = ko.observable('');
		self.netAmount = ko.computed(function () {
			if (self.grossAmount().length > 0) {
				var r = Number(self.grossAmount());
				if (self.discAmount().length > 0) {
					r = r - Number(self.discAmount());
				}
				return r.toFixed(2);
			} else {
				return "";
			}
		}, self)

		self.tax = ko.observable();
		self.freight = ko.observable();

		self.total = ko.computed({
			read: function () {
				var sum = 0;
				var qty = 0;
				for (var p = 0; p < self.allItems().length; p++) {
					var net = Number(self.allItems()[p].Net);
					sum += net;
					if (self.allItems()[p].Status()) qty++;
				}
				self.reconciledLineQty(qty);
				var tx = Number(self.tax());
				var fr = Number(self.freight());
				var ds = Number(self.discAmount());
				var rt = sum + tx + fr - ds;
				return ((rt == 0) || isNaN(rt)) ? '' : rt.toFixed(2);
			},
			write: function (v) {

			},
			owner: self
		});

		self.filteredItems = ko.computed(function () {
			var listSearchFilter = self.listSearchFilter().toLowerCase();
			listSearchFilter = listSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (listSearchFilter.length < 3) {
				var r = self.allItems();
				return r;
			} else {
				return ko.utils.arrayFilter(self.allItems(), function (item) {
					var words = listSearchFilter.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.Item.toLowerCase().match(re) != null) || (item.Code.toLowerCase().match(re) != null));
					}
					return found;
				});
			}
		}, self);


		//public functions
		self.showGLDistribution = function (d, e) {
			if ($(e.currentTarget).attr('data-content').length != 0) {
				$("[data-toggle='popover']").popover('destroy');
				$(e.currentTarget).attr("data-content", "");
				$(e.currentTarget).text("Show GL Distribution");
				return;
			}
			var invId = fnc.legacyListApp.selectedItem().PONumber; //temp '27';
			loadGLDistribution(invId, function () {
				var content =
					"<table class='table table-condensed table-bordered' style='font-size: 10px;'>" +
					"<thead style='font-weight: bold;'><tr>" +
					"<td>GL ACCOUNT DISTRIBUTION</td>" +
					"<td>GL DESCRIPTION</td>" +
					"<td style='text-align:right;'>SUBTOTAL</td>" +
					"<td style='text-align:right;'>TAX</td>" +
					"<td style='text-align:right;'>FREIGHT</td>" +
					//"<td style='text-align:right;'>DISCOUNT</td>" +
					"<td style='text-align:right;'>TOTAL</td>" +
					"</tr></thead><tfoot style='font-weight: bold;'><tr>" +
					"<td style='white-space:nowrap;'>Total:</td>" +
					"<td style='white-space:nowrap;'></td>" +
					"<td style='text-align:right;'>" + formatCurrency(self.sumSubTotal()) + "</td>" +
					"<td style='text-align:right;'>" + formatCurrency(self.sumTax()) + "</td>" +
					"<td style='text-align:right;'>" + formatCurrency(self.sumFreight()) + "</td>" +
					//"<td style='text-align:right;'>" + formatCurrency(self.sumDiscount()) + "</td>" +
					"<td style='text-align:right;'>" + formatCurrency(self.sumTotal()) + "</td>" +
					"</tr></tfoot><tbody>";
				for (var i = 0; i < self.glDistributionList().length; i++) {
					var it = self.glDistributionList()[i];
					content = content + "<tr>" +
						"<td style='white-space:nowrap;'>" + it.GLAccNumber + "</td>" +
						"<td style='white-space:nowrap;'>" + it.GLAccDescription + "</td>" +
						"<td style='text-align:right;'>" + formatCurrency(it.SubTotal) + "</td>" +
						"<td style='text-align:right;'>" + formatCurrency(it.Tax) + "</td>" +
						"<td style='text-align:right;'>" + formatCurrency(it.Freight) + "</td>" +
						//"<td style='text-align:right;'>" + formatCurrency(it.Discount) + "</td>" +
						"<td style='text-align:right;'>" + formatCurrency(it.Total) + "</td>" +
						"</tr>";
				}
				//content = content + "<tr><td colspan='7'>test</td></tr>";
				content = content + "</tbody></table>";
				$(e.currentTarget).text("Hide GL Distribution");
				$(e.currentTarget).attr("data-content", content);
				$(e.currentTarget).popover("show");

			});
		};

		self.closeInvoicelDialog = function (d, e) {
			$("[data-toggle='popover']").popover('destroy');
			$("#btnShowGLDistribution").attr("data-content", "");
			$("#btnShowGLDistribution").text("Show GL Distribution");
			$('#modShowInoiceWithPO').modal('hide');
			fnc.legacyListApp.selectedItem(null);
		};

	});

	//return self;

};

