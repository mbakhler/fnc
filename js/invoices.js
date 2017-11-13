/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.invoicesApp = (function () {
	//*********************
	//defaults
	//*********************

	// Environment variables
	var scrollBarWidth = 17;
	var minWidthSection0 = 800;
	var minWidthSection1 = 1000;
	var minWidthSection2 = 1000;
	var maxResizableWidth = 1450;	//1500
	var minResizableWidth = 1288;
	var deltaWidth = 136;

	var appWidht = window.screen.availWidth - 115;

	var reconcileTableWidth = ko.observable(appWidht - 100);

	//*********************
	//private
	//*********************

	//objects
	var ReconcileTabItem = function (it) {
		//Accepted: "0"
		//AcceptedBy: null
		//AcceptedDT: null
		//AdjTotal: 0
		//BillPrice: "8.180000"
		//BillUnit: "CS"
		//Company: "Ace Endico"
		//Discount: "0.000000"
		//ECWTList: "19.10, 19.00"
		//EItemDescr: "Chocolate Dark 61%"
		//EPackSize: "3/3 KG"
		//EPriceUnit: "KG"
		//EQuantity: "2.000000"
		//ETaxAmt: "0.000000"
		//ETaxable: "0"
		//ETotalAmt: "312.860000"
		//EUnit: "CS"
		//EUnitPrice: "8.210000"
		//Freight: "0.000000"
		//Gross: "346.360000"
		//InvoiceDate: "07/30/2015"
		//InvoiceDetailsId: "174"
		//InvoiceId: "174"
		//InvoiceNum: "M11656-01"
		//IsAuto: "1"
		//ItemDescr: "CHOCOLATE PISTOL FEVES EXTRA BITTER 61%"
		//ItemId: "8338"
		//Locked: "0"
		//LockedByUserCode: Object
		//Lockedby: null
		//OrdPrice: "8.180000"
		//OrdQty: "2.000000"
		//OrdUnit: "CS"
		//OrdUnits: "39.600000"
		//POList: "1340973"
		//PrcntTotal" "0.00000000000"
		//RcdFrom: "2" 0- ; 1- ordered checked ; 2-electronoc invoice checked;
		//RcdPrice: "8.210000"
		//RcdQty: "2.000000"
		//RcdUnit: "CS"
		//RcdUnits: "38.100000"
		//SBVendId: "0"
		//Status: "COMPLETE"
		//Tax: "7.170000"
		//TotalPriceUnits: "38.100000"
		//VendID: "4282"
		//VendItemCode: "600432-CS"
		//Xported: "0"
		//XportedBy: null
		//XportedDT: null

		var self = this;
		self.Selected = ko.observable(false);
		self.InvoiceDetailsId = it.InvoiceDetailsId;

		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = it.AcceptedDT;

		self.AdjTotal = it.AdjTotal;

		self.BillPrice = it.BillPrice;
		self.BillUnit = it.BillUnit;

		self.Discount = it.Discount;
		self.Freight = it.Freight;
		self.Gross = it.Gross;
		self.Tax = it.Tax;

		self.InvoiceDate = it.InvoiceDate;
		self.InvoiceId = it.InvoiceId;
		self.InvoiceNumber = it.InvoiceNum;
		self.IsAuto = it.IsAuto;
		self.ItemId = it.ItemId;
		self.Item = it.ItemDescr;
		self.Code = it.VendItemCode;

		self.Locked = it.Locked;
		self.LockedByUserCode = typeof (it.LockedByUserCode) == "object" ? null : it.LockedByUserCode;
		self.Lockedby = it.Lockedby;

		self.Price = ko.utils.unwrapObservable(it.BillPrice);
		self.Qty = ko.utils.unwrapObservable(it.OrdQty);
		self.Unit = it.OrdUnit;
		self.Units = ko.utils.unwrapObservable(it.OrdUnits);

		self.Total = Number(self.Units) * Number(self.BillPrice);

		self.POList = it.POList;

		self.PrcntTotal = Number(it.PrcntTotal);
		self.PrcntSplittingTitle = self.PrcntTotal == 100 ? "" : "Total cost must be 100%";

		self.RcdPrice = it.RcdPrice > 0 ? it.RcdPrice : '';
		self.RcdQty = it.RcdQty > 0 ? it.RcdQty : '';
		self.RcdUnits = it.RcdUnits > 0 ? it.RcdUnits : '';

		self.RcdFrom = it.RcdFrom;

		self.Units2 = ko.observable(ko.utils.unwrapObservable(it.RcdUnits > 0 ? it.RcdUnits : ''));
		self.Price2 = ko.observable(it.Price2);
		self.PayPrice = ko.observable(ko.utils.unwrapObservable(it.RcdPrice > 0 ? it.RcdPrice : ''));

		self.Status = ko.observable(it.Status);

		self.Xported = it.Xported;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;

		self.DueDate = it.DueDate;
		self.Term = it.Term;

		self.EInvoiceId = typeof (it.EInvoiceId) == "object" ? null : it.EInvoiceId;

		self.ECWTList = typeof (it.ECWTList) == "object" ? null : it.ECWTList;
		self.EItemDescr = typeof (it.EItemDescr) == "object" ? null : it.EItemDescr;
		self.EPackSize = typeof (it.EPackSize) == "object" ? null : it.EPackSize;
		self.EPriceUnit = typeof (it.EPriceUnit) == "object" ? null : it.EPriceUnit;
		self.eUnits = typeof (it.ETotalPriceUnits) == "object" ? null : it.ETotalPriceUnits;
		self.eQty = typeof (it.EQuantity) == "object" ? null : it.EQuantity;
		self.ETaxAmt = typeof (it.ETaxAmt) == "object" ? null : it.ETaxAmt;
		self.ETaxable = typeof (it.ETaxable) == "object" ? null : it.ETaxable;
		self.ETotalAmt = typeof (it.ETotalAmt) == "object" ? null : it.ETotalAmt;
		self.EUnit = typeof (it.EUnit) == "object" ? null : it.EUnit;
		self.ePrice = typeof (it.EUnitPrice) == "object" ? null : it.EUnitPrice;

		self.ECWTArray = typeof (it.ECWTList) == "string" ? it.ECWTList.split(',') : [];
		//console.log(it.VendItemCode + '||' + it.ECWTList + '||' + self.ECWTArray);
		self.eCode = 'tst' + it.Code;	//it.eCode;
		//self.eQty = it.eQty;
		//self.eUnits = it.eUnits;
		//self.ePrice = it.ePrice;

		self.PriceDiscrepancy = ko.computed(function () {
			var r = false;
			if ((self.ePrice != null) && (formatCurrency(self.ePrice) != formatCurrency(self.Price))) r = true;
			if ((self.PayPrice() != '') && (formatCurrency(self.PayPrice()) != formatCurrency(self.Price))) r = true;
			return r;
		}, self);

		self.PriceDiscrepancyObject = {
			poPrice: self.Price,
			ePrice: self.ePrice,
			payPrice: self.PayPrice()
		};

		self.dQty = it.dQty;
		self.dUnits = it.dUnits;

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
				fnc.invoicesApp.itemGLAccountsHeader(item);
				fnc.invoicesApp.itemIdOpen4GLManagement(itemId);
				fnc.invoicesApp.itemOriginalNet(Number(net).toFixed(2));
				//fnc.invoicesApp.itemCalculatedNet(Number(net).toFixed(2));
				recalculateOneItemGLAccountsTotal();
				recalculateOneItemGLAccountsSubTotal();
				$("#modShowItemGLAccounts").modal("show");
				fnc.invoicesApp.validateInvoice();
				fnc.invoicesApp.invoiceLocked.valueHasMutated();
				$('#modShowItemGLAccounts').one('hidden.bs.modal', function (e) {
					fnc.invoicesApp.rememberCostSplitSettings(false);
				});
			});
		};

		self.showItemCostCenters = function (d, e) {
			var invId = d.InvoiceId;
			var itemId = d.ItemId;
			var item = d.Item;

			fnc.invoicesApp.selectedForCostCentersItem(d);

			loadItemCostCenters(invId, itemId, function (arr) {
				fnc.invoicesApp.itemCostCentersList(arr);
				if (arr.length) {
					//set SplitTypeValue
					fnc.invoicesApp.itemCostCentersSplitTypeValue(arr[0].SplitValueType());
				}
					
				$("#modShowItemCostCenters").modal("show");

				$('#modShowItemCostCenters').one('hidden.bs.modal', function (e) {
					fnc.invoicesApp.selectedForCostCentersItem(null);
					fnc.invoicesApp.itemRememberCostCenterSplitSettings(false);
					fnc.invoicesApp.itemCostCentersSplitTypeValue('1'); //default 'Unit' = 1
				});
			})
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
			e.preventDefault();
			var invId = d.InvoiceId;
			var itemId = d.ItemId;
			var status = 'Completed'
			switch (self.selectedItemChecked()) {
				case 'short':
					status = 'SHORT';
					break;
				case 'back_order':
					status = 'BACKORDER';
					break;
				case 'split':
					status = 'Split';
					break;
				case 'return':
					status = 'RETURN';
					break;

			}

			updateItemStatus(invId, itemId, status, function () {
				//d.Status(status);
				$('#modManageInvoiceItem').modal('hide');
				loadItems(invId, function () {
					fnc.invoicesApp.scrollRight();
					windowResized();
				})
			})

		};

		self.editSelectedItem = function (d, e) {
			var status = '';
			if (d.Status() == 'SHORT') {
				status = 'short';
			}
			if (d.Status() == 'BACKORDER') {
				status = 'back_order';
			}
			if (d.Status() == 'RETURN') {
				status = 'return';
			}
			var c = new ReconcileTabItem(d);
			c.Units = d.Units;
			c.selectedItemChecked(status);
			c.UnitsDelta((Number(d.Units) - Number(d.Units2())).toFixed(2));
			fnc.invoicesApp.selectedItem(c);
			//self.UnitsDelta(Number(d.Units) - Number(d.Units2()));
			//$('#tblSplitInvoices').editableTableWidget();
			$('#modManageInvoiceItem').modal('show');
			$("#modManageInvoiceItem").on("hidden.bs.modal", function () {
				fnc.invoicesApp.selectedItem(null);
			})
		};

		self.Net = ko.computed(function () {
			var r = 0;
			r = self.Units2() * self.PayPrice();
			if (isNaN(r)) {
				r = 0;
			} else {
				r = Number(r).toFixed(2);
			}
			return (r == 0) ? '' : r;
		}, self);

		self.UnitsBeforeEdit = ko.observable(self.Units2());
		//self.UnitsDelta = ko.computed(function () {
		//	var r = '';
		//	if (fnc.invoicesApp.selectedItem()!=null) {
		//		var v1 = Number(fnc.invoicesApp.selectedItem().Units);
		//		var v2 = Number(fnc.invoicesApp.selectedItem().Units2());
		//		if (!(isNaN(v1) || isNaN(v2))) {
		//			r = (v1 - v2).toFixed(2);

		//		}
		//	}
		//	return r;
		//}, self)
		self.UnitsDelta = ko.observable('');

		self.updateUnits2Cell = function (d, e) {
			var invId = d.InvoiceId;
			var itemId = d.ItemId;
			var units = Number(e.target.textContent);
			var status = ko.observable("N/A");
			updateUnits(invId, itemId, units, status, function () {
				//d.Status(status());
				//d.Units2(units == 0 ? '' : e.target.textContent);
				self.Status(status());
				self.Units2(units == 0 ? '' : e.target.textContent);
				self.Units2.valueHasMutated();
			})

			e.preventDefault();
		}

		self.updatePayPriceCell = function (d, e) {
			var invId = d.InvoiceId;
			var itemId = d.ItemId;
			var price = Number(e.target.textContent.replace('$', ''));
			updatePayPrice(invId, itemId, price, function () {
				d.PayPrice(Number(e.target.textContent.replace('$', '')));
			});

			e.preventDefault();
		}

		self.isCheckedPO = ko.observable(self.RcdFrom == "1");
		self.isCheckedPO.subscribe(function (checked) {
			if (self.Locked) {
				var invId = self.InvoiceId;
				var itemId = self.ItemId;
				//var unit = self.Unit;
				//var price = Number(self.Price);
				//var units = Number(self.Units);

				if (checked) {
					applyOrdered(invId, itemId, function () {
						loadItems(invId, function () {
							//self.isCheckedInvoice(false);
							//self.isCheckedDelivery(false);
							fnc.invoicesApp.scrollRight();
							windowResized();
						})
						//self.isCheckedInvoice(false);
						//self.isCheckedDelivery(false);
						//self.Units2(Number(self.Units).toFixed(0));
						//self.UnitsBeforeEdit(Number(self.Units).toFixed(0))
						//self.PayPrice(Number(self.Price).toFixed(2));
						//self.Status('COMPLETE');
					})
				} else {
					undoApplyOrdered(invId, itemId, function () {
						loadItems(invId, function () {
							fnc.invoicesApp.scrollRight();
							windowResized();
						})
						//self.Units2('');
						//self.PayPrice('');
						//self.Status('');
					})
				}
			}
		}, self);

		self.isCheckedInvoice = ko.observable(self.RcdFrom == "2");
		self.isCheckedInvoice.subscribe(function (checked) {
			if (self.Locked) {
				var invId = self.InvoiceId;
				var itemId = self.ItemId

				if (checked) {
					applyEInvoice(invId, itemId, function () {
						loadItems(invId, function () {
							//self.isCheckedPO(false);
							//self.isCheckedDelivery(false);
							fnc.invoicesApp.scrollRight();
							windowResized();
						})
						//self.isCheckedPO(false);
						//self.isCheckedDelivery(false);
						//if (self.eUnits != null) {
						//	self.Units2(Number(self.eUnits).toFixed(0));
						//	self.UnitsBeforeEdit(Number(self.eUnits).toFixed(0));
						//	self.PayPrice(Number(self.ePrice).toFixed(2));
						//	self.Status('COMPLETE');
						//}
					})
				} else {
					undoApplyOrdered(invId, itemId, function () {
						loadItems(invId, function () {
							fnc.invoicesApp.scrollRight();
							windowResized();
						})
						//self.Units2('');
						//self.PayPrice('');
						//self.Status('');
					})
				}
			}
		}, self);

		self.isCheckedDelivery = ko.observable(false);
		self.isCheckedDelivery.subscribe(function (checked) {
			//if (checked) {
			//	self.isCheckedInvoice(false);
			//	self.isCheckedPO(false);
			//	if (self.dUnits != null) {
			//		self.Units2(Number(self.dUnits).toFixed(0));
			//		self.UnitsBeforeEdit(Number(self.dUnits).toFixed(0));
			//		self.PayPrice((self.ePrice == null) ? Number(self.Price).toFixed(2) : Number(self.ePrice).toFixed(2));
			//		self.Status('COMPLETE');
			//	}
			//} else {
			//	self.Units2('');
			//	self.PayPrice('');
			//	self.Status('');
			//}
		}, self);

		self.onItemCheckedPOClick = function (d, e) {
			e.preventDefault();
			e.stopPropagation();
			d.isCheckedPO(!d.isCheckedPO());
		};

		self.onItemCheckedInvoiceClick = function (d, e) {
			e.preventDefault();
			e.stopPropagation();
			d.isCheckedInvoice(!d.isCheckedInvoice());
		};

		self.onItemCheckedDeliveryClick = function (d, e) {
			d.isCheckedDelivery(!d.isCheckedDelivery());
			//if (d.isCheckedDelivery()) {
			//	d.isCheckedPO(false);
			//	d.isCheckedInvoice(false);
			//}
			return true;
		};

		self.deleteItem = function (d, e) {
			fnc.invoicesApp.selectedForDeleteItem(d);
			$('#modConfirmDelInvItem').modal('show');
			return;
		};

		self.isCWTButtonVisible = ko.computed(function () {
			return ((self.Net() != '') && (self.ECWTList != null || formatToFixed0(self.Qty, 2) != formatToFixed0(self.Units, 2)));
		}, self);

		self.showECWTList = function (d, e) {
			if ($(e.currentTarget).attr('data-content').length != 0) {
				$("[data-toggle='popover']").popover('destroy');
				$(e.currentTarget).attr("data-content", "");
				return;
			}
			fnc.invoicesApp.closeCWTDropdown();
			var content = "<p style='padding: 2px; border: solid 1px lightgray; margin: 4px; border-radius: 4px; font-size: 12px;'>" + d.ECWTList + "</p>";
			$(e.currentTarget).attr("data-content", content);
			$(e.currentTarget).popover("show");
		};

		self.showEditECWTList = function (d, e) {
			if ($(e.currentTarget).attr('data-content').length != 0) {
				$("[data-toggle='popover']").popover('destroy');
				$(e.currentTarget).attr("data-content", "");
				return;
			}

			var invId = self.InvoiceId;
			var itemId = self.ItemId;
			var cwtList = ko.observableArray();
			var content = "";
			loadCwtList(invId, itemId, cwtList, function () {
				content =
						"<table class='table table-condensed table-bordered' style='font-size: 12px; margin-bottom:0;'>" +
						"<thead style='font-weight: bold;'><tr>" +
							"<td class='col-w-b30-2'>INVOICED</td>" +
							"<td class='col-w-b30-2'>RECEIVED</td>" +
							"<td class='col-w-b15-1'></td>" +
						"</tr></thead><tfoot><tr>" +
							"<td><input type='text' style='box-shadow:none; border: 0; background-color: transparent; width:60px; text-align:right;'  /></td>" +
							"<td><input type='text' style='box-shadow:none; border: 0; background-color: transparent; width:60px; text-align:right;'  /></td>" +
							"<td style='text-align: center;'><button class='btn btn-xs btn-warning' onclick=''><span class='glyphicon glyphicon-plus'></span></button></td>" +
						"</tr></tfoot><tbody>";
				for (var i = 0; i < cwtList().length; i++) {
					var it = cwtList()[i];
					content = content +
						"<tr>" +
							"<td style='text-align:right;'>" + formatToFixed0(it.InvoicedCwtItem, 2) + "</td>" +
							"<td><input type='text' style='box-shadow:none; border: 0; background-color: transparent; width:60px; text-align:right;' value=" + formatToFixed0(it.RcdCwtItem(), 2) + " /></td>" +
							"<td class='col-w-b15-1'></td>" +
						"</tr>";
				}
				content = content + "</tbody></table>";
				$(e.currentTarget).attr("data-content", content);
				$(e.currentTarget).popover("show");

			});
			//InvoiceId: "173"
			//InvoicedCwtItem: "19.100000"
			//ItemId: "8338"
			//RcdCwtItem: "19.100000"
			//RecordId: "69"
		};

		self.toggleTableCWTList = function (d, e) {

			if ($('#dropdownCWTList').is(':visible')) {
				fnc.invoicesApp.closeCWTDropdown();
			} else {
				hideAllPopovers();

				fnc.invoicesApp.oneItem(d);
				var invId = self.InvoiceId;
				var itemId = self.ItemId;
				var cwtList = fnc.invoicesApp.oneItemCWTList;
				loadCwtList(invId, itemId, cwtList, function () {
					var x = $(e.currentTarget).position();
					var xTop = x.top + 10;
					var xLeft = x.left;

					$("#dropdownCWTList").css({ "top": xTop + "px", "left": xLeft + "px" });
					$("#dropdownCWTList").show();

					fnc.invoicesApp.validateCWTDialog();
					//setTimeout(function () {
					//	$("#tblCWTList").find("input").first().focus();
					//})					
				})
			}
		};

		self.toggleECWTList = function (d, e) {
			var x = $(e.currentTarget).position();
			var xTop = x.top + 10;
			var xLeft = x.left;

			$(e.currentTarget).siblings('[data-cwt-dropdown]').css({ "top": xTop + "px", "left": xLeft + "px" });
			$(e.currentTarget).siblings('[data-cwt-dropdown]').toggle();
		};

		self.closeECWTList = function (d, e) {
			$(e.currentTarget.parentElement.parentElement).hide();
		};

	};

	var CostCenterGLDistributionItem = function (it) {
		var self = this;
		self.CostCenterId = it.CostCenterId;
		self.CostCenterName = it.CostCenterName;
		self.GLAccNumber = it.GLAccNumber;
		self.GLAccDescription = it.GLAccDescription;
		self.SubTotal = it.SubTotal;
		self.Deposit = '';	//it.Deposit;
		self.Tax = it.Tax;
		self.Freight = it.Freight;
		self.Discount = it.Discount;

		self.Total = ko.computed(function () {
			return Number(Number(self.SubTotal).toFixed(2)) +
				Number(Number(self.Deposit).toFixed(2)) +
				Number(Number(self.Tax).toFixed(2)) +
				Number(Number(self.Freight).toFixed(2)) -
				Number(Number(self.Discount).toFixed(2));
		}, self);
	};

	var ClassGLDistributionItem = function (it) {
		var self = this;
		self.CostCenterId = it.ClassCode;
		self.CostCenterName = it.ClassName;
		self.GLAccNumber = it.GLAccNumber;
		self.GLAccDescription = it.GLAccDescription;
		self.SubTotal = it.SubTotal;
		self.CategoryClassDescription = it.CategoryClassDescription;
		self.Total = ko.computed(function () {
			return Number(Number(self.SubTotal).toFixed(2));
		}, self);
	}

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
			return Number(Number(self.SubTotal).toFixed(2)) +
						Number(Number(self.Deposit).toFixed(2)) +
						Number(Number(self.Tax).toFixed(2)) +
						Number(Number(self.Freight).toFixed(2)) -
						Number(Number(self.Discount).toFixed(2));
		}, self);
	};

	var GLAccountItem = function (it) {
		var self = this;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccID = it.GLAccID;
		self.GLAccNumber = it.GLAccNumber;
		self.OriginalPrcnt = Number(it.Prcnt).toFixed(0);
		self.Prcnt = ko.observable(self.OriginalPrcnt);
		self.Prcnt.subscribe(function () {
			recalculateOneItemGLAccountsTotal();
			self.SubTotal(Number(fnc.invoicesApp.itemOriginalNet()) * Number(self.Prcnt()).toFixed(0) * 0.01);
			recalculateOneItemGLAccountsSubTotal();
		}, self);
		self.SubTotal = ko.observable(Number(it.SubTotal).toFixed(2));
		self.UpdateType = it.updatetype;
	};

	var CostCenterSplitItem = function (it) {
		var self = this;
		//{"@rowid":"1","OrganizationClassId":"13","ClassCode":"c-03","ClassName":"Class 03","InvoiceClassDetailsId":{"@xsi:nil":"true"},"SplitValue":"0.0000000","SplitValueType":"0","SubTotal":"0.0000000"}
		self.OrgId = fnc.invoicesApp.orgId();
		self.InvoiceClassDetailsId = typeof (it.InvoiceClassDetailsId) == 'object' ? 0 : it.InvoiceClassDetailsId; 
		//self.RuleId = it.RuleId;

		self.ClassCode = it.ClassCode;
		self.OrganizationClassId = it.OrganizationClassId;
		self.ClassName = it.ClassName;

		self.SplitValueType = ko.observable(it.SplitValueType > 0   ? it.SplitValueType : '1');	//default - units
		self.SplitValue = ko.observable(it.SplitValue > 0 ? Number(it.SplitValue).toFixed(2) : 0);

		self.GLApplied = it.GLApplied;
		self.ItemApplied = it.ItemApplied;
		self.VendApplied = it.VendApplied;

		self.SubTotal = it.SubTotal;

		self.ItemCostCenterSubTotal = ko.computed(function () {
			if (fnc.invoicesApp.selectedForCostCentersItem() == null) return;
			
			var r = 0;
			//units
			if (fnc.invoicesApp.itemCostCentersSplitTypeValue() == '1') {
				var ccUnits = Number(self.SplitValue());
				var payPrice = Number(fnc.invoicesApp.selectedForCostCentersItem().PayPrice());
				r = ccUnits * payPrice;
			}
			//money
			if (fnc.invoicesApp.itemCostCentersSplitTypeValue() == '2') {
				var ccMoney = Number(self.SplitValue());
				r = ccMoney;
			}
			//percent
			if (fnc.invoicesApp.itemCostCentersSplitTypeValue() == '3') {
				var ccPercent = Number(self.SplitValue());
				var totalMoney = Number(fnc.invoicesApp.selectedForCostCentersItem().Net());
				r = (totalMoney / 100) * ccPercent;
			}
			//
			if (true) {
				var t = getItemCostCentersTotal();
				fnc.invoicesApp.itemCostCentersTotal(t);
			}
			return r;
		}, self);

	}


	var SearchListItem = function (it) {
		var self = this;
		self.Selected = ko.observable(false);
		self.Code = it.VendItemCode;
		self.ItemId = it.ItemId;
		self.Item = it.Description;
		self.Brand = it.Brand;
		self.Unit = it.Unit;
		self.CWT = 1;			//it.CWT;
		self.UOM = it.UOM;

		self.Units = ko.observable();
		self.Price = ko.observable();

		self.Qty = ko.observable();
		self.Units2 = ko.observable();

		self.Status = 'COMPLETE';

		self.glArray = [];

		self.validAddToInvoice = ko.computed(function () {
			return isNumber(self.Units()) && isNumber(self.Price());
		}, self);

		self.addToInvoice = function (d, e) {
			var invId = Number(fnc.invoicesApp.invoiceId());
			var itemId = Number(d.ItemId);
			var unit = d.Unit;
			var units = Number(d.Units());
			var price = Number(d.Price());
			//close popup
			//reset values
			d.Units('');
			d.Price('');
			fnc.invoicesApp.globalSearch('');
			addInvoiceItem(invId, itemId, unit, price, units, function () {


				//show confirmation message
				//$("#alertMsg01").show();
				//window.setTimeout(function () { $("#alertMsg01").hide(); }, 2000);
				loadItems(invId, function () {
					fnc.invoicesApp.scrollRight();
					windowResized();
				});
			})



		};

		self.updateGlobalUnitsCell = function (d, e) {
			d.Units(e.target.textContent);
			e.preventDefault();
		};

		self.updateInvPriceCell = function (d, e) {
			d.Price(e.target.textContent);
			e.preventDefault();
		};

		self.showGLArrayItems = function (d, e) {
			if ($(e.currentTarget).next('div.popover:visible').length) {
				$(e.currentTarget).popover('destroy');
				return;
			}
			$("[data-toggle='popover']").popover('destroy');
			var content = "<table><tbody>";
			for (var i = 0; i < d.glArray.length; i++) {
				content = content + "<tr style='font-size: 12px;'><td>&nbsp;&nbsp;</td><td style='white-space:nowrap;'>" + d.glArray[i].glDescription + "&nbsp;&nbsp;</td><td>(" + d.glArray[i].glCode + ")&nbsp;&nbsp;</td><td>" + d.glArray[i].Prcnt + "%&nbsp;&nbsp;</td>" + "</tr>";
			}
			content = content + "</tbody></table>";
			$(e.currentTarget).attr("data-content", content);
			$(e.currentTarget).popover("show");
		};

		self.selectRow = function (d, e) {
			var rows = $('.cm-global-search-row');
			var tr = e.currentTarget.parentElement.parentElement;
			var arr = fnc.invoicesApp.globalSearchList();

			for (var i = 0; i < arr.length; i++) {
				if (arr[i].ItemId != self.ItemId) {
					arr[i].Selected(false);
					arr[i].Units('');
					arr[i].Price('');
					$(rows[i]).attr('bgColor', 'white');
					//$(rows[i]).find('td.cm-cell-with-input').removeClass('cm-tabindex-box-border');
					$(rows[i]).find('input.cm-inputcell').removeClass('cm-tabindex-box-border');
				}
			}
			self.Selected(true);
			$(tr).attr('bgColor', 'lightyellow');
			//$(tr).find('td.cm-cell-with-input').addClass('cm-tabindex-box-border');
			$(tr).find('input.cm-inputcell').addClass('cm-tabindex-box-border');
			e.preventDefault();
		};

	};

	var glArrayItem = function (it) {
		var self = this;
		self.glCode = it.GLAccNumber;
		self.glDescription = it.GLAccDescription;
		self.Prcnt = Number(it.Prcnt).toFixed(0);
	};

	var POListItem = function (it) {
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = it.AcceptedDT;
		self.Completed = it.Completed;
		self.Deleted = it.Deleted;
		self.Company = it.Vendor;
		self.DeliveryDate = (new Date(it.DelivDate)).format("mm/dd/yyyy");
		self.InvoiceNumber = it.InvoiceNum;
		self.InvoiceId = it.InvoiceId;
		self.IsManual = it.IsManual;
		self.New = it.New;
		self.POTotal = it.OrderTotal;
		self.Location = it.OrgName;
		self.UnitId = it.UnitId;
		self.PONumber = it.VorderNum;
		self.OrgId = it.Orgid;
		self.VendId = it.VendId;

		self.SBVendId = it.SBVendId == undefined ? "0" : it.SBVendId;

		self.Xported = it.Xported;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				fnc.invoicesApp.addPONumberList.push(self.PONumber);
			} else {
				fnc.invoicesApp.addPONumberList.remove(self.PONumber);
			}
		}, self);

	};

	var CWTListItem = function (it) {
		//InvoiceId: "173"
		//InvoicedCwtItem: "19.100000"
		//ItemId: "8338"
		//RcdCwtItem: "19.100000"
		//RecordId: "69"
		var self = this;
		self.InvoiceId = it.InvoiceId;
		self.InvoicedCwtItem = it.InvoicedCwtItem;
		self.ItemId = it.ItemId;
		self.RcdCwtOriginal = formatToFixed0(it.RcdCwtItem, 2);
		self.RcdCwtItem = ko.observable(formatToFixed0(it.RcdCwtItem, 2));
		self.RecordId = it.RecordId;

		self.rcdCwtBlur = function (d, e) {
			if (self.RcdCwtOriginal != self.RcdCwtItem()) {
				var recordId = self.RecordId;
				var cwtValue = self.RcdCwtItem();
				modifyRcdCwt(recordId, cwtValue, function () {
					var invId = self.InvoiceId;
					var itemId = self.ItemId;
					var cwtList = fnc.invoicesApp.oneItemCWTList;
					loadCwtList(invId, itemId, cwtList, function () {
						var units = 0;
						var status = ko.observable("N/A");
						for (var i = 0; i < cwtList().length; i++) {
							units = units + Number(cwtList()[i].RcdCwtItem());
						}
						updateUnits(invId, itemId, units, status, function () {
							fnc.invoicesApp.oneItem().Units2(units);
							fnc.invoicesApp.oneItem().Status(status());
							//var status = 'COMPLETE';
							//if (Number(fnc.invoicesApp.oneItem().Units) > Number(units)) {
							//	status = 'SHORT';
							//}
							//updateItemStatus(invId, itemId, status, function () {
							//	fnc.invoicesApp.oneItem().Status(status);
							//});
						});
					});
				});
			}
		}

	}

	var loadItems = function (invId, callback) {
		var params = {};
		params.InvoiceId = invId;
		self.allItems.removeAll();
		fnc.invoicesApp.includedPOList.removeAll();
		fnc.invoicesApp.invalidPrcntTotal(false);
		//reset common values
		resetInvoiceCommonValues();
		loading(true);
		//LoadOneInvoice(o.Params.InvoiceId)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOneInvoice", params, function (response) {
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
			fnc.invoicesApp.checkedPO(true);
			fnc.invoicesApp.checkedInvoice(true);
			if (obj[0]) {
				obj.forEach(function (it) {
					if (it.RcdFrom != "1") fnc.invoicesApp.checkedPO(false);
					if (it.RcdFrom != "2") fnc.invoicesApp.checkedInvoice(false);
					if (Number(it.PrcntTotal) != 100) fnc.invoicesApp.invalidPrcntTotal(true);
					arr.push(new ReconcileTabItem(it))
				})
			} else {
				if (obj.RcdFrom != "1") fnc.invoicesApp.checkedPO(false);
				if (obj.RcdFrom != "2") fnc.invoicesApp.checkedInvoice(false);
				if (Number(obj.PrcntTotal) != 100) fnc.invoicesApp.invalidPrcntTotal(true);
				arr.push(new ReconcileTabItem(obj))
			}

			//set common values
			fnc.invoicesApp.grossAmount(formatToFixed0(arr[0].Gross, 2))
			fnc.invoicesApp.discAmount(formatToFixed0(arr[0].Discount, 2))
			fnc.invoicesApp.tax(formatToFixed0(arr[0].Tax, 2));
			fnc.invoicesApp.freight(formatToFixed0(arr[0].Freight, 2));
			fnc.invoicesApp.invoiceNumber(arr[0].InvoiceNumber);
			fnc.invoicesApp.invoiceDate((new Date(arr[0].InvoiceDate)).format(strFormat));
			fnc.invoicesApp.invoiceLocked(arr[0].Locked);
			fnc.invoicesApp.invoiceLockedByUserCode(arr[0].LockedByUserCode);
			fnc.invoicesApp.invoiceLockedBy(arr[0].Lockedby);
			fnc.invoicesApp.invoiceAccepted(arr[0].Accepted);
			fnc.invoicesApp.invoiceAcceptedDate(arr[0].AcceptedDT);
			fnc.invoicesApp.invoiceAcceptedBy(arr[0].AcceptedBy);
			fnc.invoicesApp.invoiceXported(arr[0].Xported);
			fnc.invoicesApp.invoiceXportedDate(arr[0].XportedDT);
			fnc.invoicesApp.invoiceXportedBy(arr[0].XportedBy);

			fnc.invoicesApp.dueDate(arr[0].DueDate);
			fnc.invoicesApp.term(arr[0].Term);

			fnc.invoicesApp.includedPOList(arr[0].POList ? arr[0].POList.split(',') : []);
			fnc.invoicesApp.depositOrCredit(arr[0].AdjTotal == undefined ? 0 : Number(arr[0].AdjTotal));

			if (arr[0].EInvoiceId == '0') {
				fnc.invoicesApp.showSection1(false);
			} else {
				fnc.invoicesApp.showSection1(true);
			}

			if (arr[0].InvoiceDetailsId != '0') {
				self.allItems(arr);
			}

			//if (!fnc.invoicesApp.invoiceIsReadOnly()) $('#tblRecBody').editableTableWidget();

			if (callback) callback();
		});
	};

	var loadGLDistribution = function (invId, callback) {

		var params = {};
		params.InvoiceId = invId;


		fnc.invoicesApp.glDistributionList.removeAll();

		fnc.invoicesApp.sumSubTotal('');
		fnc.invoicesApp.sumTax('');
		fnc.invoicesApp.sumFreight('');
		fnc.invoicesApp.sumDiscount('');

		fnc.invoicesApp.sumDeposit('');

		fnc.invoicesApp.sumTotal('');


		//LoadGLDistribution(o.Params.InvoiceId)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadGLDistribution", params, function (response) {
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
			var t8 = 0;

			for (var i = 0; i < arr.length; i++) {
				t2 = t2 + Number(arr[i].SubTotal);
				t3 = t3 + Number(arr[i].Tax);
				t4 = t4 + Number(arr[i].Freight);
				t5 = t5 + Number(arr[i].Discount);

				t8 = t8 + Number(arr[i].Deposit);

				t6 = t6 + Number(arr[i].Total());
			}
			fnc.invoicesApp.glDistributionList(arr);

			fnc.invoicesApp.sumSubTotal(t2);
			fnc.invoicesApp.sumTax(t3);
			fnc.invoicesApp.sumFreight(t4);
			fnc.invoicesApp.sumDiscount(t5);

			fnc.invoicesApp.sumDeposit(t8);

			fnc.invoicesApp.sumTotal(t6);

			if (callback) callback();
		})
	};

	var loadCostCenterGLDistribution = function (invId, callback) {

		var params = {};
		params.InvoiceId = invId;


		fnc.invoicesApp.glDistributionList.removeAll();

		fnc.invoicesApp.sumSubTotal('');
		fnc.invoicesApp.sumTax('');
		fnc.invoicesApp.sumFreight('');
		fnc.invoicesApp.sumDiscount('');

		fnc.invoicesApp.sumDeposit('');

		fnc.invoicesApp.sumTotal('');


		//LoadGLDistribution(o.Params.InvoiceId)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassGLDistributionLoad", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new ClassGLDistributionItem(it)) })
			} else {
				arr.push(new ClassGLDistributionItem(obj))
			}


			function groupBy(arr, f) {
				var groups = {};
				arr.forEach(function (o) {
					var group = JSON.stringify(f(o));
					groups[group] = groups[group] || [];
					groups[group].push(o);
				});
				return Object.keys(groups).map(function (group) {
					return groups[group];
				})
			};

			var arr2 = groupBy(arr, function (it) {
				return [it.CostCenterId]
			});


			var t2 = 0;
			var t3 = 0;
			var t4 = 0;
			var t5 = 0;
			var t6 = 0;
			var t8 = 0;

			for (var i = 0; i < arr.length; i++) {
				t2 = t2 + Number(arr[i].SubTotal);
				t3 = t3 + Number(arr[i].Tax);
				t4 = t4 + Number(arr[i].Freight);
				t5 = t5 + Number(arr[i].Discount);

				t8 = t8 + Number(arr[i].Deposit);

				t6 = t6 + Number(arr[i].Total());
			}
			fnc.invoicesApp.costCentersGlDistributionList(arr2);

			fnc.invoicesApp.sumSubTotal(t2);
			fnc.invoicesApp.sumTax(t3);
			fnc.invoicesApp.sumFreight(t4);
			fnc.invoicesApp.sumDiscount(t5);

			fnc.invoicesApp.sumDeposit(t8);

			fnc.invoicesApp.sumTotal(t6);

			if (callback) callback();
		})
	};

	var loadInvoiceClassGLDistribution = function (invId, callback) {
		//InvoiceClassGLDistributionLoad(o.Params.InvoiceId)
		var params = {};
		params.InvoiceId = invId;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassGLDistributionLoad", params, function (response) {
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

			if (callback) callback(obj);
		});

	}

	var loadItemGLAccounts = function (invId, itemId, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;

		//LoadInvoceItemGLAccounts(o.Params.InvoiceId, o.Params.ItemId.ToString())

		fnc.invoicesApp.itemGLAccountsList.removeAll();

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadInvoceItemGLAccounts", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new GLAccountItem(it)) })
			} else {
				arr.push(new GLAccountItem(obj))
			}

			fnc.invoicesApp.itemGLAccountsList(arr);

			if (callback) callback();
		})
	};

	var loadItemCostCenters = function (invId, itemId, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;

		//Function InvoiceClassDetailsLoadRules(invoiceId As Decimal, itemId As Integer) As String
		fnc.invoicesApp.itemCostCentersList.removeAll();

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassDetailsLoadRules", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new CostCenterSplitItem(it)) })
			} else {
				arr.push(new CostCenterSplitItem(obj))
			}
			if (callback) callback(arr);
		})
	}

	var updateCostSplitRule = function (invId, itemId, saveRule, ruleList, callback) {
		//client.InvoiceClassUpdateItemCostSplit(o.Params.InvoiceId, o.Params.ItemId, o.Params.SaveRule, invoiceClassRuleList, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.SaveRule = saveRule;
		params.invoiceClassRuleList = ruleList;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassUpdateItemCostSplit", params, function (response) {
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
	}

	var updateCostSplitRule_old = function (ruleId, orgId, clsId, vendId, sbVendId, glAccNo, glAccDesc, itemId, splitValType, splitVal, callback) {
		//client.UpdateClassCostSplitRule(o.Params.RuleId, o.Params.OrganizationId, o.Params.OrganizationClassId, o.Params.VendId, o.Params.SBVendId, o.Params.GLAccNumber, o.Params.GLAccDescription, o.Params.ItemId, o.Params.SplitValueType, o.Params.SplitValue, o.uc)
		var params = {};
		params.RuleId = ruleId;
		params.OrganizationId = orgId;
		params.OrganizationClassId = clsId;
		params.VendId = vendId;
		params.SBVendId = sbVendId;
		params.GLAccNumber = glAccNo;
		params.GLAccDescription = glAccDesc;	
		params.ItemId = itemId;
		params.SplitValueType = splitValType;
		params.SplitValue = splitVal;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.ClassSetup.UpdateClassCostSplitRule", params, function (response) {
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
			if (isNumber(r)) {
				r = Number(r);
			} else {
				r = 0;
			}
			if (callback) callback(r);
		})
	}

	var updateItemCostSplit = function (clsDetailsId, invId, ruleId, itemId, classCode, className, splitValue, splitValueType, glDistribId, callback) {
		//InvoiceClassUpdateItemCostSplit(o.Params.InvoiceClassDetailsId, o.Params.InvoiceId, o.Params.RuleId, o.Params.ItemId, o.Params.ClassCode, o.Params.ClassName, o.Params.SplitValue, o.Params.SplitValueType, o.Params.InvoiceGLDistribId, o.uc)
		var params = {};
		params.InvoiceClassDetailsId = clsDetailsId;
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.RuleId = ruleId;
		params.ClassCode = classCode;
		params.ClassName = className;
		params.SplitValue = splitValue;
		params.SplitValueType = splitValueType;
		params.InvoiceGLDistribId = glDistribId;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassUpdateItemCostSplit", params, function (response) {
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


	var getItemCostCentersTotal = function () {
		var gt = 0;
		if (fnc.invoicesApp) {
			fnc.invoicesApp.itemCostCentersList().forEach(function (it) {
				gt = gt + Number(it.ItemCostCenterSubTotal());
			});
		}
		return gt;
	}

	var addInvoiceItem = function (invId, itemId, unit, price, units, callback) {
		//AddInvoiceItem(o.Params.InvoiceId, o.Params.ItemId, o.Params.Unit, o.Params.Price, o.Params.Units, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.Unit = unit;
		params.Price = price;
		params.Units = units;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.AddInvoiceItem", params, function (response) {
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

	var undoApplyOrdered = function (invId, itemId, callback) {
		//UndoApplyOrdered(o.Params.InvoiceId, o.Params.ItemId, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UndoApplyOrdered", params, function (response) {
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
	}

	var updateUnits = function (invId, itemId, units, status, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.Units = units;

		//UpdateUnits(o.Params.InvoiceId, o.Params.ItemId, o.Params.Units, o.uc)
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateUnits", params, function (response) {
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

	var updatePayPrice = function (invId, itemId, price, callback) {
		//UpdatePayPrice(o.Params.InvoiceId, o.Params.ItemId, o.Params.Price, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.Price = price;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdatePayPrice", params, function (response) {
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

	var updateItemStatus = function (invId, itemId, status, callback) {
		//UpdateItemStatus(o.Params.InvoiceId, o.Params.ItemId, o.Params.Status, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.Status = status;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateItemStatus", params, function (response) {
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

	var recalculateOneItemGLAccountsTotal = function () {
		var total = 0;
		for (var i = 0; i < fnc.invoicesApp.itemGLAccountsList().length; i++) {
			total = total + Number(fnc.invoicesApp.itemGLAccountsList()[i].Prcnt());
		}
		fnc.invoicesApp.itemGLAccountsTotal(total);
	};

	var recalculateOneItemGLAccountsSubTotal = function () {
		var total = 0;
		for (var i = 0; i < fnc.invoicesApp.itemGLAccountsList().length; i++) {
			total = total + Number(fnc.invoicesApp.itemGLAccountsList()[i].SubTotal());
		}
		fnc.invoicesApp.itemCalculatedNet(Number(total).toFixed(2));
	};

	var updateInvoiceItemGLAccount = function (invId, itemId, glAcctNo, glAcctDescription, prcnt, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.GLAcctNumber = glAcctNo;
		params.GLAcctDescription = glAcctDescription;
		params.Prcnt = prcnt;

		//UpdateInvoiceItemGLAccount(o.Params.InvoiceId, o.Params.ItemId, o.Params.GLAcctNumber, o.Params.GLAcctDescription, o.Params.Prcnt, o.uc)

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateInvoiceItemGLAccount", params, function (response) {
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

	var updateItemCostSplitSettings = function (invId, itemId, glAccList, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.GLAcctList = glAccList;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateItemCostSplitSettings", params, function (response) {
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

	var removeInvoiceItem = function (invId, itemId, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;

		loading(true);
		//RemoveInvoiceItem(o.Params.InvoiceId, o.Params.ItemId, .uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.RemoveInvoiceItem", params, function (response) {
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

	var loadOneVendorPOList = function (vendId, orgId, callback) {
		var params = {};
		params.RangeBaseOn = 0; // Delivery Date
		params.FromDate = fnc.app.filterDateFrom();
		params.ToDate = fnc.app.filterDateTo();	//poListApp.filterDateTo() defaultDate.format(strFormat)
		params.OrgsIds = orgId;
		params.Vendors = vendId;
		params.Keywords = '';

		//Function LoadPOList(rangeBasedOn As Integer, fromDate As Date, toDate As Date, orgsIds As String, vendors As String, keywords As String) As String

		loading(true);
		self.addPONewItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOneVendorPOList", params, function (response) {
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
					if (it.New == "1") arr.push(new POListItem(it));
				})
			} else {
				if (obj.New == "1") arr.push(new POListItem(obj))
			}
			self.addPONewItems(arr);
			if (callback) callback();
		})
	};

	var addPO = function (invId, poList, callback) {
		//AddPO(o.Params.InvoiceId, o.Params.PONumList, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.PONumList = poList;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.AddPO", params, function (response) {
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

	var removePO = function (invId, poNo, callback) {
		//RemovePO(o.Params.InvoiceId, o.Params.PONumber, .uc)
		var params = {};
		params.InvoiceId = invId;
		params.PONumber = poNo;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.RemovePO", params, function (response) {
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

	var resetInvoiceCommonValues = function () {
		fnc.invoicesApp.grossAmount('')
		fnc.invoicesApp.discAmount('')
		fnc.invoicesApp.tax('');
		fnc.invoicesApp.freight('');
		fnc.invoicesApp.invoiceNumber('');
		fnc.invoicesApp.invoiceDate('');
		fnc.invoicesApp.invoiceLocked('0');
		fnc.invoicesApp.invoiceLockedByUserCode(null);
		fnc.invoicesApp.invoiceLockedBy('');
		fnc.invoicesApp.invoiceAccepted('0');
		fnc.invoicesApp.invoiceAcceptedDate(null);
		fnc.invoicesApp.invoiceAcceptedBy('');
		fnc.invoicesApp.invoiceXported('0');
		fnc.invoicesApp.invoiceXportedDate(null);
		fnc.invoicesApp.invoiceXportedBy('');
		fnc.invoicesApp.dueDate('');
		fnc.invoicesApp.term('');
	}

	var loadCwtList = function (invId, itemId, cwtList, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;

		//LoadCwtList(o.Params.InvoiceId, o.Params.ItemId)
		//loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadCwtList", params, function (response) {
			loading(false);
			if (response.d == '') {
				//empty list
				if (callback) callback();
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
					arr.push(new CWTListItem(it));
				})
			} else {
				arr.push(new CWTListItem(obj))
			}
			cwtList(arr);
			if (callback) callback();
		});
	}

	var modifyRcdCwt = function (recordId, cwtValue, callback) {
		var params = {};
		params.RecordId = recordId;
		params.RcdCwtItem = cwtValue;

		//ModifyRcdCwt(o.Params.RecordId, o.Params.RcdCwtItem, .uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ModifyRcdCwt", params, function (response) {
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
	}

	var addToCwtList = function (invId, itemId, cwtInvoiced, cwtReceived, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = itemId;
		params.InvoicedCwtItem = cwtInvoiced;
		params.RcdCwtItem = cwtReceived;

		//AddToCwtList(o.Params.InvoiceId, o.Params.ItemId, o.Params.InvoicedCwtItem, o.Params.RcdCwtItem, o.uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.AddToCwtList", params, function (response) {
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
			//console.log(r);
			if (callback) callback();
		})
	}



	var loadGLAccounts = function (invId, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.ItemId = 0;	//itemId;

		//LoadInvoceItemGLAccounts(o.Params.InvoiceId, o.Params.ItemId.ToString())

		self.allGLAccounts.removeAll();

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadInvoceItemGLAccounts", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new GLAccountItem(it)) })
			} else {
				arr.push(new GLAccountItem(obj))
			}

			self.allGLAccounts(arr);

			if (callback) callback();
		})
	};

	function loadInvoiceLockStatus(invId, callback) {
		//Function LoadInvoiceLockStatus(InvoiceId As Decimal) As String
		var params = {};
		params.InvoiceId = invId;

		//loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadInvoiceLockStatus", params, function (response) {
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
			//Accepted: "0"
			//AcceptedBy: null
			//AcceptedDT: null
			//Locked: "0"
			//LockedByUserCode: Object
			//Lockedby: null
			//Xported: "0"
			//XportedBy: null
			//XportedDT: null

			self.invoiceAccepted(obj.Accepted);
			self.invoiceAcceptedBy(obj.AcceptedBy);
			self.invoiceAcceptedDate(obj.AcceptedDT);

			if (Number(obj.LockedByUserCode) != fnc.app.uc) {
				self.invoiceLocked(obj.Locked);
				self.invoiceLockedBy(obj.Lockedby);
				self.invoiceLockedByUserCode(typeof (obj.LockedByUserCode) == "object" ? null : obj.LockedByUserCode);
			}

			self.invoiceXported(obj.Xported);
			self.invoiceXportedBy(obj.XportedBy);
			self.invoiceXportedDate(obj.XportedDT);

			self.validateInvoice(callback);
			//if (callback) callback();
		})

	};

	//*********************
	//public
	//*********************
	var self = this;

	self.init = function (vendId, orgId, invId, callback) {
		fnc.invoicesApp.listSearchFilter('');
		getOrgClassList(orgId, function (r) { fnc.invoicesApp.isClassesEnable(r.length > 0); });
		fnc.invoicesApp.vendId(vendId);
		fnc.invoicesApp.orgId(orgId);
		fnc.invoicesApp.invoiceId(invId);
		loadItems(invId, function () {
			//self.showSection0(true);
			//self.showSection1(true);
			self.companyName(fnc.app.hiddenTabs()[0].CompanyName);
			self.orgName(fnc.app.hiddenTabs()[0].OrgName());

			loadGLAccounts(invId, function () {
				fnc.invoiceUnlockTimer = setInterval(loadInvoiceLockStatus, fnc.invoiceUnlockInterval, invId);
			});

			loadDuplicateInvoiceInfo(self.invoiceNumber(), vendId, 0, orgId, invId, function (d) {
				if (d != []) {
					self.isDuplicate(d.IsDuplicate == "1");
					self.duplicateInfo(d);
				} else {
					self.isDuplicate(false);
					self.duplicateInfo(null);
				}
			});

			if (callback) callback();

		});

		fnc.loadInvoiceDocumentList('', '', invId, orgId, function (r) {
			fnc.app.attachedItems(r);
		})
	}
	self.isClassesEnable = ko.observable(false);
	self.vendId = ko.observable();
	self.orgId = ko.observable();

	self.invoiceId = ko.observable();
	self.invoiceNumber = ko.observable();
	self.invoiceDate = ko.observable();

	//duplicate
	self.isDuplicate = ko.observable(false);
	self.duplicateInfo = ko.observable(null);

	//Locked
	self.invoiceLocked = ko.observable();
	self.invoiceLockedBy = ko.observable();
	self.invoiceLockedByUserCode = ko.observable();
	self.showInoiceLocked = ko.computed(function () {
		var r = (self.invoiceLocked() == "1" && self.invoiceLockedByUserCode() != fnc.app.uc);
		return r;
	}, self);
	self.invoiceLockedButtonText = ko.computed(function () {
		var text = '';
		if (self.invoiceLocked() == "1" && self.invoiceLockedByUserCode() == fnc.app.uc) {
			text = 'Done';
		} else if (self.invoiceLocked() == "1" && self.invoiceLockedByUserCode() != fnc.app.uc) {
			text = 'In Use';
		} else {
			text = 'Edit';
		}
		return text;
	}, self);

	//Accepted
	self.invoiceAccepted = ko.observable();
	self.invoiceAcceptedDate = ko.observable();
	self.invoiceAcceptedBy = ko.observable();
	self.showInoiceAccepted = ko.computed(function () {
		return self.invoiceAccepted() == "1";
	}, self);

	////Exported
	self.invoiceXported = ko.observable();
	self.invoiceXportedDate = ko.observable();
	self.invoiceXportedBy = ko.observable();
	self.showInoiceXported = ko.computed(function () {
		return self.invoiceXported() == "1";
	}, self);

	self.term = ko.observable('');
	self.dueDate = ko.observable('');

	self.invoiceIsReadOnly = ko.computed(function () {
		var r = false;
		if (self.invoiceXported() == "1") r = true;
		if (self.invoiceAccepted() == "1") r = true;
		if (self.invoiceLocked() == "0") r = true;
		if (self.invoiceLocked() == "1" && self.invoiceLockedByUserCode() != fnc.app.uc) r = true;
		return r;
	}, self);


	self.tabType = ko.observable('');

	self.listHeaders = [
		{ title: 'VEND.CODE', sortPropertyName: 'Code', asc: ko.observable(true), show: ko.observable(true) },
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

	self.listSearchFilter = ko.observable('');

	self.globalSearch = ko.observable('').extend({ rateLimit: invoiceItemsSearchDelay });

	self.glDistributionList = ko.observableArray();
	self.sumSubTotal = ko.observable('');
	self.sumTax = ko.observable('');
	self.sumFreight = ko.observable('');
	self.sumDiscount = ko.observable('');

	self.sumDeposit = ko.observable('');

	self.sumTotal = ko.observable('');

	self.selectedForDeleteItem = ko.observable(null);
	self.selectedForRemovePO = ko.observable('');
	self.selectedForDeleteDeposit = ko.observable(null);
	self.itemGLAccountsTotal = ko.observable('');
	self.itemGLAccountsPrcntSum = ko.observable('');

	self.itemOriginalNet = ko.observable('');
	self.itemCalculatedNet = ko.observable('');
	self.itemIdOpen4GLManagement = ko.observable('');
	self.itemGLAccountsList = ko.observableArray();
	self.rememberCostSplitSettings = ko.observable(false);

	self.itemGLAccountsHeader = ko.observable('');

	self.invalidPrcntTotal = ko.observable(false);

	//<COST CENTERS>
	self.selectedForCostCentersItem = ko.observable(null);

	self.selectedForCostCentersItemHeader = ko.computed(function () {
		var r = '';
		var it = self.selectedForCostCentersItem();
		if (it) r = it.Item + ' (' + Number(it.Units2()).toFixed(2) + ' units; ' + formatCurrency(it.Net()) + ')';

		return r;
	}, self);

	self.itemCostCentersList = ko.observableArray();

	self.costCentersGlDistributionList = ko.observableArray();

	//unit - 1; money - 2; percent - 3;
	self.itemCostCentersSplitTypeValue = ko.observable('1'); // default

	self.itemCostCentersSplitTypeLabel = ko.computed(function () {
		var r = '';
		if (self.itemCostCentersSplitTypeValue() == '1') r = 'UNITS';
		if (self.itemCostCentersSplitTypeValue() == '2') r = '$';
		if (self.itemCostCentersSplitTypeValue() == '3') r = '%';

		return r;
	}, self);

	self.itemCostCentersTotal = ko.observable(0);

	self.itemRememberCostCenterSplitSettings = ko.observable(false);

	self.isUpdateCostCentersEnable = ko.computed(function () {
		var r = false;
		if (self.selectedForCostCentersItem()) {
			if (Number(fnc.invoicesApp.itemCostCentersTotal()).toFixed(2) == Number(self.selectedForCostCentersItem().Net()).toFixed(2)) {
				r = true;
			}
		}
		return r;
	}, self);

	self.updateCostCenterSplit = function (d, e) {
		//InvoiceClassUpdateItemCostSplit(o.Params.InvoiceClassDetailsId, o.Params.InvoiceId, o.Params.RuleId, o.Params.ItemId, o.Params.ClassCode, o.Params.ClassName, o.Params.SplitValue, o.Params.SplitValueType, o.Params.InvoiceGLDistribId, o.uc)
		var count = 0;
		var length = fnc.invoicesApp.itemCostCentersList().length;

		var orgId = fnc.invoicesApp.orgId();
		var vendId = fnc.invoicesApp.vendId();
		var sbVendId = 0;

		var invId = fnc.invoicesApp.selectedForCostCentersItem().InvoiceId;
		var itemId = fnc.invoicesApp.selectedForCostCentersItem().ItemId;

		var updateRule = fnc.invoicesApp.itemRememberCostCenterSplitSettings();
		var invoiceClassRuleList = [];

		fnc.invoicesApp.itemCostCentersList().forEach(function (it) {
			var obj = {};
			obj.ClassCode = it.ClassCode
			obj.ClassName = it.ClassName
			obj.GLAccDescription = '';//it.GLAccDescription
			obj.GLAccNumber = '';//it.GLAccNumber
			obj.InvoiceId = invId;
			obj.ItemId = itemId;
			obj.SaveRule = updateRule;
			obj.SplitValue = it.SplitValue()
			obj.SplitValueType = fnc.invoicesApp.itemCostCentersSplitTypeValue();
			invoiceClassRuleList.push(obj);
		})

		updateCostSplitRule(invId, itemId, updateRule, invoiceClassRuleList, function () {
			$('#modShowItemCostCenters').modal('hide');
			console.log();

		})

		//fnc.invoicesApp.itemCostCentersList().forEach(function (it) {
		//	var clsDetailsId = it.InvoiceClassDetailsId;
		//	var glDistribId = 0;
		//	var ruleId = '';	//it.RuleId;
		//	var classCode = it.ClassCode;
		//	var className = it.ClassName ;
		//	var splitValue = it.SplitValue(); 
		//	var splitValueType = it.SplitValueType();

		//	if (updateRule) {
				
		//		var classId = it.InvoiceClassDetailsId;
		//		var glAccNo = 0;
		//		var glAccDesc = '';

		//		updateCostSplitRule(ruleId, orgId, classId, vendId, sbVendId, glAccNo, glAccDesc, itemId, splitValueType, splitValue, function (rId) {
		//			ruleId = rId;
		//			updateItemCostSplit(clsDetailsId, invId, ruleId, itemId, classCode, className, splitValue, splitValueType, glDistribId, function () {
		//				count++;
		//				if (count == length) {
		//					loadItemCostCenters(invId, itemId, function (arr) {
		//						fnc.invoicesApp.itemCostCentersList(arr);
		//						if (arr.length) {
		//							fnc.invoicesApp.itemCostCentersSplitTypeValue(arr[0].SplitValueType());
		//						}
		//					})
		//				}
		//			})
		//		})
		//	} else {
		//		updateItemCostSplit(clsDetailsId, invId, ruleId, itemId, classCode, className, splitValue, splitValueType, glDistribId, function () {
		//			count++;
		//			if (count == length) {
		//				loadItemCostCenters(invId, itemId, function (arr) {
		//					fnc.invoicesApp.itemCostCentersList(arr);
		//					if (arr.length) {
		//						fnc.invoicesApp.itemCostCentersSplitTypeValue(arr[0].SplitValueType());
		//					}
		//				})
		//			}
		//		})
		//	}
		//})
	}

	self.getCostCentersGlDistributionColumnSum = function (column, index) {
		var r = 0;
		var arr = self.costCentersGlDistributionList()[Number(index)];
		arr.forEach(function (it) {
			//if (column == 'Total') {
			//	r = r + Number(it.Total());
			//} else {
			//	r = r + Number(it[column]);
			//}
			if (typeof it[column] === "function") {
				r = r + Number(it[column]());
			} else {
				r = r + Number(it[column]);
			}
		})
		return r;
	}
	//</COST CENTERS>

	self.allItems = ko.observableArray();
	self.allGLAccounts = ko.observableArray();

	self.allInvoiceAdjustmentItems = ko.observableArray();
	self.newAdjustmentItemGLAccount = ko.observable(null);
	self.newAdjustmentItemAmount = ko.observable('');
	self.newAdjustmentItemNotes = ko.observable('');
	self.newAdjusmentAddEnable = ko.computed(function () {
		return self.newAdjustmentItemAmount() != '' && self.newAdjustmentItemGLAccount() != null;
	}, self);


	self.oneItem = ko.observable(null);
	self.oneItemCWTList = ko.observableArray();
	self.oneItemCWTInoiced = ko.observable('');
	self.oneItemCWTInoiced.subscribe(function () {
		//if (self.oneItemCWTReceived() == '') {
		self.oneItemCWTReceived(self.oneItemCWTInoiced());
		//}
	}, self);
	self.oneItemCWTReceived = ko.observable('');
	self.oneItemCWTAddEnabled = ko.computed(function () {
		return self.oneItemCWTInoiced().length > 0 && self.oneItemCWTReceived().length > 0;
	}, self)

	self.addPONewItems = ko.observableArray();
	self.addPONumberList = ko.observableArray();

	self.companyName = ko.observable('');
	self.orgName = ko.observable('');

	self.includedPOList = ko.observableArray();

	self.checkedPO = ko.observable(true);
	self.checkedInvoice = ko.observable(true);
	self.checkedDelivery = ko.observable(false);
	 
	self.showSection0 = ko.observable(true);
	self.showSection0.subscribe(function () {
		self.scrollRight()
	}, self);
	self.showSection1 = ko.observable(false);
	self.showSection1.subscribe(function () {
		self.scrollRight()
	}, self);
	self.showSection2 = ko.observable(false);
	self.showSection2.subscribe(function () {
		//self.scrollRight()
	}, self);

	self.showDiscrepancy = ko.observable(false);

	self.globalSearchFocusIn = function (d, e) {
		//e.preventDefault();
		//e.stopPropagation();
		//return false;
	};

	self.globalSearchFocusOut = function (d, e) {
		//e.preventDefault();
		//e.stopPropagation();
		//return false;
	};

	self.tabHeaderFocusIn = function (d, e) {
		self.closeSearch();
		//self.closeCWTDropdown();
		//console.log('tabHeaderFocusIn');
	};

	self.tableCaptionFocusIn = function (d, e) {
		self.closeSearch();
		//self.closeCWTDropdown();
		//console.log('tableCaptionFocusIn');
	}

	self.tableBodyFocusIn = function (d, e) {
		self.closeSearch();
		//self.closeCWTDropdown();
		//console.log('tableBodyFocusIn');
	}

	self.tableCWTFocusIn = function (d, e) {
		e.preventDefault();
		e.stopPropagation();
		//console.log('focusin');
	};

	self.tableCWTFocusOut = function (d, e) {
		e.preventDefault();
		e.stopPropagation();
	};

	self.closeCWTDropdown = function () {
		if ($('#dropdownCWTList').is(':visible')) {
			$("#dropdownCWTList").hide();
			fnc.invoicesApp.oneItemCWTList.removeAll();
			fnc.invoicesApp.oneItem(null);
			fnc.invoicesApp.oneItemCWTInoiced('');
			fnc.invoicesApp.oneItemCWTReceived('');
		}
	}

	self.addCWTItem = function () {
		var invId = self.oneItem().InvoiceId;
		var itemId = self.oneItem().ItemId;
		var cwtInvoiced = self.oneItemCWTInoiced();
		var cwtReceived = self.oneItemCWTReceived();
		var cwtList = self.oneItemCWTList;

		addToCwtList(invId, itemId, cwtInvoiced, cwtReceived, function () {
			self.oneItemCWTInoiced('');
			self.oneItemCWTReceived('');
			loadCwtList(invId, itemId, cwtList, function () {
				var units = 0;
				var status = ko.observable("N/A");
				for (var i = 0; i < cwtList().length; i++) {
					units = units + Number(cwtList()[i].RcdCwtItem());
				}
				updateUnits(invId, itemId, units, status, function () {
					fnc.invoicesApp.oneItem().Units2(units);
					fnc.invoicesApp.oneItem().Status(status());
					//var status = 'COMPLETE';
					//if (Number(fnc.invoicesApp.oneItem().Units) > Number(units)) {
					//	status = 'SHORT';
					//}
					//updateItemStatus(invId, itemId, status, function () {
					//	fnc.invoicesApp.oneItem().Status(status);
					//});
				});
			});
		})
	};

	self.recTableWidth = ko.computed(function () {
		//var r = reconcileTableWidth();
		//if (self.showSection0() || self.showSection1() || self.showSection2()) {
		//	r = reconcileTableWidth();
		//	if (!self.showSection0() & !self.showSection1() & self.showSection2()) {
		//		//r = 1800;
		//	} else if (!self.showSection0() & self.showSection1() & !self.showSection2()) {
		//		//r = 1800;
		//	} else if (!self.showSection0() & self.showSection1() & self.showSection2()) {
		//		r = 1800;
		//	} else if (self.showSection0() & !self.showSection1() & !self.showSection2()) {
		//		//r = 1800;
		//	} else if (self.showSection0() & !self.showSection1() & self.showSection2()) {
		//		r = 1800;
		//	} else if (self.showSection0() & self.showSection1() & !self.showSection2()) {
		//		r = 1800;
		//	} else if (self.showSection0() & self.showSection1() & self.showSection2()) {
		//		r = 2000;
		//	}
		//}
		var r = windowWidth() - scrollBarWidth;
		if (!self.showSection0() & !self.showSection1()) {
			//0-0
			//no selected
			if (r > reconcileTableWidth()) {
				r = reconcileTableWidth();
			}
			if (r < minWidthSection0) {
				//min
				r = minWidthSection0;
			}
		} else if (!self.showSection0() & self.showSection1()) {
			//0-1
			//first selected
			if (r > reconcileTableWidth()) {
				r = reconcileTableWidth();
			}
			if (r < minWidthSection1) {
				//min
				r = minWidthSection1;
			}

		} else if (self.showSection0() & !self.showSection1()) {
			//1-0
			//second selected
			if (r > reconcileTableWidth()) {
				r = reconcileTableWidth();
			}
			if (r < minWidthSection2) {
				//min
				r = minWidthSection2;
			}
		} else if (self.showSection0() & self.showSection1()) {
			//1-1
			//both selected
			if (windowWidth() < maxResizableWidth) {
				r = r + deltaWidth;
				if (r < minResizableWidth) {
					//min
					r = minResizableWidth;
				}

				if (r > maxResizableWidth) {
					//max
					r = maxResizableWidth;
				}
			}
		}

		return r;
	});

	self.reconciledLineQty = ko.observable();

	self.depositOrCredit = ko.observable(0);

	self.grossAmount = ko.observable('');

	self.discAmount = ko.observable('');
	self.discountComputed = ko.computed(function () {
		var sum = Number(self.discAmount());
		return ((sum == 0) || isNaN(sum)) ? 0 : sum.toFixed(2);
	}, self);

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
				var net = Number(self.allItems()[p].Net());
				sum += net;
				if ((self.allItems()[p].Status()) && (self.allItems()[p].PrcntTotal == 100)) qty++;
			}
			self.reconciledLineQty(qty);
			var tx = Number(self.tax());
			var fr = Number(self.freight());
			var ds = Number(self.discAmount());
			var dcr = Number(self.depositOrCredit());
			var rt = sum + dcr + tx + fr - ds;
			return ((rt == 0) || isNaN(rt)) ? '' : rt.toFixed(2);
		},
		write: function (v) {

		},
		owner: self
	});

	self.lineTotal = ko.computed(function () {
		var sum = 0;
		for (var p = 0; p < self.allItems().length; p++) {
			var net = Number(self.allItems()[p].Net());
			sum += net;
		}
		return ((sum == 0) || isNaN(sum)) ? '' : sum.toFixed(2);
	}, self);


	self.selectedItem = ko.observable(null);

	self.showHideColumnClick = function (d, e) {
		d.show(!d.show());
	}

	self.onCheckPOClick = function (d, e) {
		d.checkedPO(!d.checkedPO());
		var v = d.checkedPO();
		var invId = fnc.invoicesApp.invoiceId();
		//for (var i = 0; i < self.allItems().length; i++) {
		//	var it = self.allItems()[i];
		//	it.isCheckedPO(v);
		//	if (it.isCheckedPO()) {
		//		it.isCheckedInvoice(!v);
		//		it.isCheckedDelivery(!v);

		//		it.Units2(Number(it.Units).toFixed(0));
		//		it.UnitsBeforeEdit(Number(it.Units).toFixed());
		//		it.PayPrice(Number(it.Price).toFixed(2));
		//	} else {
		//		it.Units2('');
		//		it.PayPrice('');
		//	}
		//}
		if (v) {
			applyOrdered(invId, -1, function () {
				loadItems(invId, function () {
					self.scrollRight();
					windowResized();
				})
			})
		} else {
			undoApplyOrdered(invId, -1, function () {
				loadItems(invId, function () {
					self.scrollRight();
					windowResized();
				})
			})
		}
		return true;
	};

	self.onCheckInvoiceClick = function (d, e) {
		d.checkedInvoice(!d.checkedInvoice());
		var v = d.checkedInvoice();
		var invId = fnc.invoicesApp.invoiceId();
		//for (var i = 0; i < self.allItems().length; i++) {
		//	var it = self.allItems()[i];
		//	it.isCheckedInvoice(v);
		//	if (it.isCheckedInvoice()) {
		//		it.isCheckedPO(!v);
		//		it.isCheckedDelivery(!v);
		//	}
		//}
		//if (v) {
		//	d.checkedPO(false);
		//	d.checkedDelivery(false);
		//};
		if (v) {
			applyEInvoice(invId, -1, function () {
				loadItems(invId, function () {
					self.scrollRight();
					windowResized();
				})
			})
		} else {
			undoApplyOrdered(invId, -1, function () {
				loadItems(invId, function () {
					self.scrollRight();
					windowResized();
				})
			})
		}

		return true;
	};

	self.onCheckDeliveryClick = function (d, e) {
		d.checkedDelivery(!d.checkedDelivery());
		var v = d.checkedDelivery();
		//for (var i = 0; i < self.allItems().length; i++) {
		//	var it = self.allItems()[i];
		//	it.isCheckedDelivery(v);
		//	if (it.isCheckedDelivery()) {
		//		it.isCheckedPO(!v);
		//		it.isCheckedInvoice(!v);

		//	}
		//}
		//if (v) {
		//	d.checkedPO(false);
		//	d.checkedInvoice(false);
		//};
		return true;
	};

	self.scrollRight = function () {
		var d, d1 = 300
		if (self.showSection1() || self.showSection2()) {
			d = d1;
			if (self.showSection1() && self.showSection2()) {
				d = d1 * 2;
			}
			setTimeout(function () {
				$('#tblReconcileItemListBody').scrollLeft(d);
			}, 10);
		}
	};




	self.doGlobalSearch = function (description, callback) {
		var params = {
			OrganizationId: Number(self.orgId()),
			ChartId: 0,
			VendId: Number(self.vendId()),
			Keywords: description
		};
		//SearchGLItems(o.Params.OrganizationId, o.Params.ChartId, o.Params.VendId, o.Params.Keywords)
		ajaxPost('ChefMod.Financials.UI.Controllers.Invoices.SearchGLItems', params, function (response) {
			if (response.d == '') {
				return [];
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				console.log("Server Error");
				return [];
			}

			//var arrayList = ko.utils.arrayMap(r.result.row, function (listItem) { return new SearchListItem(listItem) });

			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			var arrItem;
			var itemId;

			if (obj[0]) {
				obj.forEach(function (it) {
					if (itemId != it.ItemId) {
						itemId = it.ItemId;
						arrItem = new SearchListItem(it);
						arrItem.glArray.push(new glArrayItem(it));
						arr.push(arrItem);
					} else {
						arr[arr.length - 1].glArray.push(new glArrayItem(it));
					}
				})
			} else {
				arrItem = new SearchListItem(obj);
				arrItem.glArray.push(new glArrayItem(obj));
				arr.push(arrItem);
			}

			self.globalSearchList.removeAll();
			self.globalSearchList(arr);
			if (callback) callback();
		});

	}

	self.globalSearchList = ko.observableArray([]);

	self.globalItems = ko.computed(function () {
		var itemDescription = self.globalSearch().toLowerCase();
		itemDescription = itemDescription.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (itemDescription.length < 3) {
			self.globalSearchList.removeAll();
			$("#globalSearchResult").hide();
		} else {
			self.doGlobalSearch(itemDescription, function () {

				$("#globalSearchResult").show();

				//initialize inline <td> edit for (tabindex = '1') and NOT (.not-editable) 
				$('#tblGlobalSearchBody').editableTableWidget();

				//initialize popover
				$('[data-toggle="popover"]').popover();

				//close popover
				$('body').on('click', function (e) {
					$('[data-toggle="popover"]').each(function () {
						//the 'is' for buttons that trigger popups
						//the 'has' for icons within a button that triggers a popup
						if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
							$(this).popover('hide');
						}
					});
				});

			})
		}
	}, self);


	self.closeSearch = function (d, e) {
		self.globalSearch('');
		self.globalSearchList.removeAll();
		$("#globalSearchResult").hide();
	};

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
	self.filteredItems.subscribe(function () {
		self.validateInvoice();
	}, self);

	self.showTotalDontMatch = ko.computed(function () {
		var r = false;
		var t = Math.round(Number(self.total()));
		var g = Math.round(Number(self.grossAmount()));
		if ((t != g) && (t > 0) && (g > 0)) {
			r = true;
		}
		return r;
	}, self);


	// new public functions
	self.toggleLockInvoice = function (d, e) {
		var invId = self.invoiceId();
		var locked = (fnc.invoicesApp.invoiceLocked() == '0');

		updateLock(invId, locked, function () {
			//loadItems(invId, function () {
			//	self.validateInvoice();
			//	self.scrollRight();
			//	windowResized();
			//});
			load_hiddenTab(function () {
				self.validateInvoice();
				self.scrollRight();
				//if (!fnc.invoicesApp.invoiceIsReadOnly()) $('#tblRecBody').editableTableWidget();
				windowResized();
			});
		})
	};

	self.toggleAcceptInvoice = function (d, e) {
		var invId = self.invoiceId();
		var accepted = (fnc.invoicesApp.invoiceAccepted() == '0');
		var invNo = fnc.invoicesApp.invoiceNumber();
		var vendId = fnc.invoicesApp.vendId();
		var orgId = fnc.invoicesApp.orgId();

		if (accepted) {
			loadDuplicateInvoiceInfo(invNo, vendId, 0, orgId, invId, function (r) {
				if (r != []) {
					if (r.IsDuplicate == "1") {
						$('#modDuplicateWarning').modal('show');
						$("#modDuplicateWarning").on('shown.bs.modal', function (e) {
							$(".modal-body #invoiceNo").text(invNo);
							$(".modal-body #vendName").text(fnc.app.hiddenTabs()[0].CompanyName());
						});

						$('#modDuplicateWarning').on('click', "[data-dismiss='modal']", function (e) {
							$('#modDuplicateWarning').modal('hide');
						});

						$('#modDuplicateWarning').on('click', '#proceedWithDuplicate', function (e) {
							//console.log('invNo=' + invNo + '||vendId=' + vendId);
							$('#modDuplicateWarning').modal('hide');
							_repeatedBlock(invId, accepted, function () {
								fnc.invoicesApp.duplicateInfo(r);
								fnc.invoicesApp.isDuplicate(true);
							});
						});

						$("#modDuplicateWarning").on('hidden.bs.modal', function (e) {
							$(e.currentTarget).unbind();
						});
					} else {
						fnc.invoicesApp.duplicateInfo(null);
						fnc.invoicesApp.isDuplicate(false);
						_repeatedBlock(invId, accepted);
					}
				} else {
					_repeatedBlock(invId, accepted);
				}
			});
		} else {
			_repeatedBlock(invId, accepted);
		}

		function _repeatedBlock(invId, accepted, callback) {
			updateAccepted(invId, accepted, function () {
				//loadItems(invId, function () {
				//	self.validateInvoice();
				//	self.scrollRight();
				//	windowResized();
				//})
				load_hiddenTab(function () {
					self.validateInvoice();
					self.scrollRight();
					windowResized();
				});
			})
			if (callback) callback();
		}
	};

	self.isZeroInvoice = ko.computed(function () {
		var r = false;
		if (self.netAmount() == 0 && self.total() == 0 && self.reconciledLineQty() == self.allItems().length && self.allItems().length > 0) {
			r = true;
		}
		return r;
	}, self);
	self.isZeroInvoice.subscribe(function () {
		fnc.invoicesApp.validateInvoice();
	})

	self.showEqualSign = ko.computed(function () {
		var r = false;
		if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() == self.total()) && self.reconciledLineQty() == self.allItems().length) {
			r = true;
		}
		return r;
	}, self);

	self.showNotEqualSign = ko.computed(function () {
		var r = false;
		if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() != self.total())) {
			r = true;
		}
		return r;
	}, self);
	self.showNotEqualSign.subscribe(function () {
		fnc.invoicesApp.validateInvoice();
	});

	self.showQuestionSign = ko.computed(function () {
		var r = false;
		if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() == self.total()) && self.reconciledLineQty() != self.allItems().length) {
			r = true;
		}
		return r;
	}, self);

	self.showGLDistribution = function (d, e) {
		var invId = self.invoiceId();

		if (fnc.invoicesApp.isClassesEnable()) {
			loadInvoiceClassGLDistribution(invId, function (r) {
				console.log(r);
			})
			loadCostCenterGLDistribution(invId, function () {
				$("#modShowCostCentersGLDistribution").modal('show');
			});
		} else {
			loadGLDistribution(invId, function () {
				$("#modShowGLDistribution").modal('show');
			});
		}
	};

	self.showAddPO = function (d, e) {
		var vendId = fnc.invoicesApp.vendId();
		var orgId = fnc.invoicesApp.orgId();

		loadOneVendorPOList(vendId, orgId, function () {
			$('#modAddPO').modal('show');

			$("#modAddPO").on("hidden.bs.modal", function () {
				fnc.invoicesApp.addPONewItems.removeAll();
				fnc.invoicesApp.addPONumberList.removeAll();
			})
		});

	};

	self.submitAddPO = function (d, e) {
		var invId = fnc.invoicesApp.invoiceId();
		var poNumList = fnc.invoicesApp.addPONumberList().toString();
		$('#modAddPO').modal('hide');
		addPO(invId, poNumList, function () {
			loadItems(invId, function () {
				self.scrollRight();
				windowResized();
			})
		})
	};

	self.removePOFromInvoice = function (d, e) {
		fnc.invoicesApp.selectedForRemovePO(d);

		$('#modConfirmRemovePO').modal('show');

		$("#modConfirmRemovePO").on("hidden.bs.modal", function () {
			fnc.invoicesApp.selectedForRemovePO('');
		})
	};

	self.submitRemovePO = function (d, e) {
		var invId = fnc.invoicesApp.invoiceId();
		var poNo = fnc.invoicesApp.selectedForRemovePO();
		$('#modConfirmRemovePO').modal('hide');
		removePO(invId, poNo, function () {
			loadItems(invId, function () {
				self.scrollRight();
				windowResized();
			})
		})
	}

	self.cancelRemovePO = function (d, e) {
		$('#modConfirmRemovePO').modal('hide');
		fnc.invoicesApp.selectedForRemovePO('');
	};

	//attached docs (images)
	self.showAttachedDocs = function (d, e) {
		//console.log(d);
		var orgId = self.orgId();
		var orgName = decodeText(self.orgName());
		var invId = self.invoiceId();
		var invNum = self.invoiceNumber();
		var invTotal = self.grossAmount();
		var poList = self.includedPOList().join(",");
		var vendId = self.vendId();
		var sbVendId = 0;
		var company = decodeText(self.companyName());
		var attachedDocs = fnc.app.attachedItems; 
		var availableDocs = ko.observableArray();
		var invDate = self.invoiceDate();
		var toDate = getTodayString();
		var fromDate = addDays2(toDate, -29);
		fnc.loadInvoiceDocumentList(fromDate, toDate, 0, orgId, function (r) {
			availableDocs(r);
			//orgId, orgName, invId, invNum, invTotal, poList, vendId, sbVendId, company
			var it = new fnc.AttachmentsClass(orgId, orgName, invId, invNum, invTotal, invDate, poList, vendId, sbVendId, company, attachedDocs, availableDocs);

			loadDocumentTypes(function (r) {
				it.documentTypes(r);
				fnc.app.attachmentsObject(it);
				$('#modAttachments').modal('show');
			})

		});

		$("#modAttachments").on("hidden.bs.modal", function () {
			fnc.app.attachmentsObject(null);
		})
	};

	self.enableSubmitCostSplitButton = ko.computed(function () {
		var dummy = self.invoiceLocked();
		var r = false;
		if (fnc.app.prvSetupChartOfAcctsEnable()) {
			r = true;
			if (self.rememberCostSplitSettings() && self.itemGLAccountsTotal() != 100) r = false;
			if (fnc.invoicesApp.showInoiceLocked() || fnc.invoicesApp.invoiceLockedButtonText() == 'Edit') r = false;
			if (fnc.invoicesApp.showInoiceAccepted() || fnc.invoicesApp.showInoiceXported()) r = false;
		}
		return r;
	}, self);

	self.submitItemCostSplitUpdate = function (d, e) {
		var invId = fnc.invoicesApp.invoiceId();
		var itemId = fnc.invoicesApp.itemIdOpen4GLManagement();

		var n = 0
		var glAcctList = [];
		for (var i = 0; i < self.itemGLAccountsList().length; i++) {
			var it = self.itemGLAccountsList()[i]
			var glAccItem = {};

			if (it.OriginalPrcnt != it.Prcnt()) {
				glAccItem.GLAcctNumber = it.GLAccNumber;
				glAccItem.GLAcctDescription = it.GLAccDescription;
				glAccItem.Prcnt = it.Prcnt();

				glAcctList.push(glAccItem);

				var glAccId = it.GLAccID;
				var prcnt = it.Prcnt();
				var glAcctNo = it.GLAccNumber;
				var glAcctDescription = it.GLAccDescription;

				if (self.rememberCostSplitSettings()) {
					if (it.UpdateType == 1) {
						//insert
						glAccountAddItem(glAccId, itemId, prcnt, function () {
							n++;
						})
					}
					if (it.UpdateType == 2) {
						//update
						glAccountUpdItem(glAccId, itemId, prcnt, function () {
							n++;
						})
					}
				}
			}
		}
		//console.log(n+' items are updated');

		$("#modShowItemGLAccounts").modal("hide");
		loading(true);

		setTimeout(function () {
			updateItemCostSplitSettings(invId, itemId, glAcctList, function () {
				fnc.invoicesApp.rememberCostSplitSettings(false);
				loading(false);
				loadItems(invId, function () {
					windowResized();
				})
			});
		})
	};

	self.deleteInvItem = function (d, e) {
		var invId = fnc.invoicesApp.invoiceId();
		var itemId = fnc.invoicesApp.selectedForDeleteItem().ItemId;
		$('#modConfirmDelInvItem').modal('hide');
		removeInvoiceItem(invId, itemId, function () {
			loadItems(invId, function () {
				self.scrollRight();
				windowResized();
			});
		});
	};

	self.cancelDelInvItem = function (d, e) {
		$('#modConfirmDelInvItem').modal('hide');
		e.preventDefault();
		return;
	};

	self.exportInvoice = function (d, e) {
		var xType = e.currentTarget.getAttribute("data-value");
		var invId = fnc.invoicesApp.invoiceId();
		var exported = true;

		updateExported(invId, exported, function () {
			loadItems(invId, function () {
				self.validateInvoice();
				self.scrollRight();
				windowResized();
			});
		});

	};

	self.updateInvoiceHeader = function (d, e) {
		var invId = self.invoiceId();
		var invNo = self.invoiceNumber();
		var invDate = self.invoiceDate();
		var gross = Number(self.grossAmount());
		var discount = Number(self.discAmount());
		var tax = Number(self.tax());
		var freight = Number(self.freight());

		updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, true, function () {
			loadItems(invId, function () {
				self.scrollRight();
				windowResized();
			});
		})
	};

	self.showDepositCreditModalDialog = function (d, e) {
		var invId = self.invoiceId();
		loadInvoiceAdjustments(invId, self.allInvoiceAdjustmentItems, function () {
			$('#modDepositCreditManagement').modal('show');
			$("#modDepositCreditManagement").on("hidden.bs.modal", function () {
				self.allInvoiceAdjustmentItems.removeAll();
				self.newAdjustmentItemGLAccount(null);
				self.newAdjustmentItemAmount('');
				self.newAdjustmentItemNotes('');
			})
			windowResized();
		});
	};

	self.addDepositCreditLine = function (d, e) {
		var invId = self.invoiceId();
		var glAcctId = self.newAdjustmentItemGLAccount().GLAccID;
		var amount = self.newAdjustmentItemAmount();
		var notes = self.newAdjustmentItemNotes();
		addInvoiceAdjustment(invId, glAcctId, amount, notes, function () {
			loadInvoiceAdjustments(invId, self.allInvoiceAdjustmentItems, function () {
				self.newAdjustmentItemGLAccount(null);
				self.newAdjustmentItemAmount('');
				self.newAdjustmentItemNotes('');
				loadItems(invId, function () {
					windowResized();
				});
			});
		})
	};

	self.deleteInvDeposit = function (d, e) {
		var adjId = self.selectedForDeleteDeposit().AdjustmentId;
		var invId = self.selectedForDeleteDeposit().InvoiceId;
		deleteInvoiceAdjustment(adjId, invId, function () {
			loadInvoiceAdjustments(invId, self.allInvoiceAdjustmentItems, function () {
				$('#modConfirmDelInvDeposit').modal('hide');
				self.selectedForDeleteDeposit(null);
				loadItems(invId, function () {
					windowResized();
				});
			});
		});
	};

	self.cancelDelInvDeposit = function (d, e) {
		$('#modConfirmDelInvDeposit').modal('hide');
		self.selectedForDeleteDeposit(null);
	};

	self.validateInvoice = function (callback) {

		if (self.invoiceLocked() == '1' && !fnc.invoicesApp.showInoiceLocked()) {
			//invoice locked by me
			$('input.validated-field, button.validated-field').removeAttr('disabled');

			if (!self.showEqualSign() && !self.isZeroInvoice()) {
				$('#btnAcceptInvoice').attr('disabled', 'disabled');
			}

			if (fnc.invoicesApp.invalidPrcntTotal()) {
				// at least one item with PrcntTotal != 100
				$('#btnAcceptInvoice').attr('disabled', 'disabled');
			}

			$('#linkExport2XL').addClass('disabled-link');
			$('#linkExport2QB').addClass('disabled-link');

			$('#linkAddPO').removeClass('disabled-link');
		} else if (fnc.invoicesApp.showInoiceLocked()) {
			//invoice locked not by me
			$('input.validated-field, button.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');
		} else if (fnc.invoicesApp.showInoiceAccepted() && !fnc.invoicesApp.showInoiceXported()) {
			//invoice accepted
			$('input.validated-field, button.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');

			$('#btnUnacceptInvoice').removeAttr('disabled');
			$('#linkExport2XL').removeClass('disabled-link');
			$('#linkExport2QB').removeClass('disabled-link');
		} else if (fnc.invoicesApp.showInoiceXported()) {
			//invoice exported
			$('input.validated-field, button.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');

			$('#linkExport2XL').removeClass('disabled-link');
			$('#linkExport2QB').removeClass('disabled-link');
		} else {
			//invoice unlocked and not completed
			$('input.validated-field, button.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');

			if (fnc.app.prvInvoicesReconcileEnable()) {
				$('#btnLockInvoice').removeAttr('disabled');
			}


			if ((self.showEqualSign() || self.isZeroInvoice()) && fnc.app.prvInvoicesAcceptEnable()) {
				$('#btnAcceptInvoice').removeAttr('disabled');
			}

		}
	};

	self.attachBlurFunctions = function (callback) {

		$('#invoiceDateRegularInvoice').on('change', function (e) {
			var inputValue = this.value; //(new Date(this.value)).format(strFormat);	//this.value;
			var d = ko.dataFor(this);
			var originalDate = fnc.invoicesApp.invoiceDate();
			if (inputValue != originalDate) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = inputValue;
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					fnc.invoicesApp.invoiceDate(inputValue);
				});
			}
		});

		$('#invoiceNumber').on('blur', function (e) {
			var inputValue = this.value;
			var d = ko.dataFor(this);
			var originalNo = fnc.invoicesApp.invoiceNumber();
			if (inputValue != originalNo) {
				var invId = self.invoiceId();
				var invNo = inputValue;
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				loadDuplicateInvoiceInfo(invNo, fnc.invoicesApp.vendId(), 0, fnc.invoicesApp.orgId(), invId, function (r) {
					if (r != []) {
						if (r.IsDuplicate == "1") {
							$('#modDuplicateWarning').modal('show');
							$("#modDuplicateWarning").on('shown.bs.modal', function (e) {
								$(".modal-body #invoiceNo").text(invNo);
								$(".modal-body #vendName").text(fnc.app.hiddenTabs()[0].CompanyName());
							});

							$('#modDuplicateWarning').on('click', "[data-dismiss='modal']", function (e) {
								$('#invoiceNumber').val(originalNo);
								$('#modDuplicateWarning').modal('hide');
							});

							$('#modDuplicateWarning').on('click', '#proceedWithDuplicate', function (e) {
								//console.log('invNo=' + invNo + '||vendId=' + fnc.invoicesApp.vendId());
								$('#modDuplicateWarning').modal('hide');
								_repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight, function () {
									$('.modal-backdrop').removeClass();
									fnc.invoicesApp.duplicateInfo(r);
									fnc.invoicesApp.isDuplicate(true);
								});
							});

							$("#modDuplicateWarning").on('hidden.bs.modal', function (e) {
								$(e.currentTarget).unbind();
							});
						} else {
							fnc.invoicesApp.duplicateInfo(null);
							fnc.invoicesApp.isDuplicate(false);
							_repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight);
						}
					} else {
						_repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight);
					}
				});

				function _repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight, callback) {
					updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
						fnc.invoicesApp.invoiceNumber(inputValue);
						fnc.app.hiddenTabs()[0].InvoiceNumber(inputValue);
					});
					if (callback) callback();
				}
			}
		});

		$('#invoiceGross').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalGross = fnc.invoicesApp.grossAmount();
			if (inputValue != originalGross) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(inputValue);
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					fnc.invoicesApp.grossAmount(inputValue);
				});
			}
		});
		$('#invoiceDiscount').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalDiscount = fnc.invoicesApp.discAmount();
			if (inputValue != originalDiscount) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(inputValue);
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					fnc.invoicesApp.discAmount(inputValue);
				});
			}
		});
		$('#invoiceTax').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalTax = fnc.invoicesApp.tax();
			if (inputValue != originalTax) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(inputValue);
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					fnc.invoicesApp.tax(inputValue);
				});
			}
		});
		$('#invoiceFreight').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalFreight = fnc.invoicesApp.grossAmount();
			if (inputValue != originalFreight) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(inputValue);
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					fnc.invoicesApp.freight(inputValue);
				});
			}
		});
	}

	self.validateCWTDialog = function (callback) {
		if (self.invoiceLockedButtonText() == 'Done') {
			$("#tblCWTList").find("input.validated-field").removeAttr('disabled');
		} else {
			$("#tblCWTList").find("input.validated-field").attr('disabled', 'disabled');
		}
		////if (self.invoiceLocked() == '1' && !fnc.invoicesApp.showInoiceLocked()) {
		////	//invoice locked by me
		////	$("#tblCWTList").find("input.validated-field").attr('disabled', 'disabled');
		////} else if (fnc.invoicesApp.showInoiceLocked()) {
		////	//invoice locked not by me
		////	$("#tblCWTList").find("input.validated-field").attr('disabled', 'disabled');
		////} else if (fnc.invoicesApp.showInoiceAccepted() && !fnc.invoicesApp.showInoiceXported()) {
		////	//invoice accepted
		////	$("#tblCWTList").find("input.validated-field").attr('disabled', 'disabled');
		////} else if (fnc.invoicesApp.showInoiceXported()) {
		////	//invoice exported
		////	$("#tblCWTList").find("input.validated-field").attr('disabled', 'disabled');
		////} else {
		////	//invoice unlocked and not completed
		////	$("#tblCWTList").find("input.validated-field").removeAttr('disabled');
		////}
	};




	self.showEInvoice = function (d, e) {
		var invId = self.allItems()[0].EInvoiceId;
		fnc.app.EInvoice(new fnc.EInvoiceItem);
		loadEInvoiceItems(invId, fnc.app.EInvoice(), function () {
			$("#modShowEInvoice").modal('show');
			$("#modShowEInvoice").one("hidden.bs.modal", function () {
				fnc.app.EInvoice(null);
			})
			windowResized();
		});

	};

	self.printEInvoice = function (d, e) {
		//*****************************
		//print using javascript
		//*****************************
		var frame = document.getElementById('printEInvoice');
		var data = frame.innerHTML;
		var style = '<link rel="stylesheet" href="css/bootstrap.min.css" /> <link rel="stylesheet" href="css/rm.application.css" />  <link rel="stylesheet" href="css/einv.print.css" />';

		if (browserName.indexOf('IE') == -1) {
			//all not IE browsers
			var frame1 = document.createElement('iframe');
			frame1.name = "frame1";
			frame1.style.position = "absolute";
			frame1.style.top = "-1000000px";
			document.body.appendChild(frame1);
			var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
			frameDoc.document.open();
			frameDoc.document.write(style);
			frameDoc.document.write('<html><head><title>eInvoice</title>');
			frameDoc.document.write('</head><body>');
			frameDoc.document.write(data);
			frameDoc.document.write('</body></html>');
			frameDoc.document.close();
			setTimeout(function () {
				if (browserName.toLowerCase().indexOf('chrome') > -1) {
					//chrome
					window.PPClose = false;
					window.onbeforeunload = function () {
						if (window.PPClose === false) {
							return 'Leaving this page will block the parent window!\nPlease select "Stay on this Page option" and use the\nCancel button instead to close the Print Preview Window.\n';
						}
					}
					window.frames["frame1"].focus();
					window.frames["frame1"].print();
					document.body.removeChild(frame1);
					window.PPClose = true;
				} else {
					//firefox
					window.frames["frame1"].focus();
					window.frames["frame1"].print();
					document.body.removeChild(frame1);
				}
			}, 500);
		} else {
			//IE browser
			var win = window.open('', '', 'top=100, left=100, width=800, height=600');
			win.document.write(style);
			win.document.write('<html><head><title></title>');
			win.document.write('</head><body>');
			win.document.write(data);
			win.document.write('</body></html>');
			win.document.close();
			setTimeout(function () {
				win.print();
				win.close();
			}, 500);
		}

		return false;

		//*****************************
		// print using css @media print
		//*****************************
		//var w = window;
		//if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
		//	w.PPClose = false;                                     
		//	w.onbeforeunload = function () {                       
		//		if (w.PPClose === false) {                           
		//			return 'Leaving this page will block the parent window!\nPlease select "Stay on this Page option" and use the\nCancel button instead to close the Print Preview Window.\n';
		//		}
		//	}
		//	w.print();                                             
		//	w.PPClose = true;                                      
		//} else {
		//	w.print();
		//}

	};

	self.printInvoiceRPO = function (d, e) {
		//debug
		//$("#modPrintInvoiceRPO").modal('show');
		//return false;
		//print
		var frame = document.getElementById('printRPOInvoice');
		var data = frame.innerHTML;
		var style = '<link rel="stylesheet" href="css/bootstrap.min.css" /> <link rel="stylesheet" href="css/rm.application.css" />  <link rel="stylesheet" href="css/default.css" />';

		if (browserName.indexOf('IE') == -1) {
			//all not IE browsers
			var frame1 = document.createElement('iframe');
			frame1.name = "frame1";
			frame1.style.position = "absolute";
			frame1.style.top = "-1000000px";
			document.body.appendChild(frame1);
			var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
			frameDoc.document.open();
			frameDoc.document.write(style);
			frameDoc.document.write('<html><head><title>Invoice</title>');
			frameDoc.document.write('</head><body>');
			frameDoc.document.write(data);
			frameDoc.document.write('</body></html>');
			frameDoc.document.close();
			setTimeout(function () {
				if (browserName.toLowerCase().indexOf('chrome') > -1) {
					//chrome
					window.PPClose = false;
					window.onbeforeunload = function () {
						if (window.PPClose === false) {
							return 'Leaving this page will block the parent window!\nPlease select "Stay on this Page option" and use the\nCancel button instead to close the Print Preview Window.\n';
						}
					}
					window.frames["frame1"].focus();
					window.frames["frame1"].print();
					document.body.removeChild(frame1);
					window.PPClose = true;
				} else {
					//firefox
					window.frames["frame1"].focus();
					window.frames["frame1"].print();
					document.body.removeChild(frame1);
				}
			}, 500);
		} else {
			//IE browser
			var win = window.open('', '', 'top=100, left=100, width=800, height=600');
			win.document.write(style);
			win.document.write('<html><head><title></title>');
			win.document.write('</head><body>');
			win.document.write(data);
			win.document.write('</body></html>');
			win.document.close();
			setTimeout(function () {
				win.print();
				win.close();
			}, 500);
		}

		return false;

	};

	self.showDuplicateWarning = function (d, e) {
		$('#modDuplicateInvoiceWarning').modal('show');

		$("#modDuplicateInvoiceWarning").on("hidden.bs.modal", function () {
			//
		});
	}

	return self;

})();