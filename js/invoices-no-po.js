var fnc;
fnc = fnc || {};
fnc.invoicesAppNoPo = (function () {
	//private objects

	var CostCenterItem = function (it) {
		var self = this;
		self.ClassName = it.ClassName;
		self.ClassCode = it.ClassCode;
		self.Notes = it.Notes;
		self.OrganizationClassId = it.OrganizationClassId;
		self.GLAccDescription = fnc.invoicesAppNoPo.selectedForCostCentersItem().GLAccDescription;
		self.GLAccNumber = fnc.invoicesAppNoPo.selectedForCostCentersItem().GLAccNumber;
		self.InvoiceId = fnc.invoicesAppNoPo.invoiceId();
		self.SaveRule = ko.observable(it.SaveRule);
		self.SplitValue = ko.observable(it.SplitValue > 0 ? Number(it.SplitValue).toFixed(2) : 0);
		self.SplitValueType = ko.observable(it.SplitValueType > 0 ? it.SplitValueType : '2');	//default - money

		self.ItemCostCenterSubTotal = ko.computed(function () {
			if (fnc.invoicesAppNoPo.selectedForCostCentersItem() == null) return;

			var r = 0;

			//money
			if (fnc.invoicesAppNoPo.itemCostCentersSplitTypeValue() == '2') {
				var ccMoney = Number(self.SplitValue());
				r = ccMoney;
			}
			//percent
			if (fnc.invoicesAppNoPo.itemCostCentersSplitTypeValue() == '3') {
				var ccPercent = Number(self.SplitValue());
				var totalMoney = Number(fnc.invoicesAppNoPo.selectedForCostCentersItem().Total());
				r = (totalMoney / 100) * ccPercent;
			}
			//
			//if (true) {
				var t = getItemCostCentersTotal();
				fnc.invoicesAppNoPo.itemCostCentersTotal(t);
			//}
			return r;
		}, self);

	}

	var CostCenterSplitItem = function (it) {
		var self = this;
		self.ClassName = it.ClassName;
		self.ClassCode = it.ClassCode;
		self.Notes = it.Notes;
		self.OrganizationClassId = it.OrganizationClassId;
	}

	var ManualInvoiceItem = function (it) {
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = it.AcceptedDT;

		self.AdjTotal = it.AdjTotal;

		self.Discount = it.Discount;
		self.Freight = it.Freight;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccNumber = it.GLAccNumber == null ? "" : it.GLAccNumber;
		self.GLDiscount = it.GLDiscount;
		self.GLFreight = it.GLFreight;
		self.GLTax = it.GLTax;
		self.Gross = it.Gross;
		self.InvoiceDate = it.InvoiceDate;
		self.InvoiceGLDistribId = it.InvoiceGLDistribId;
		self.InvoiceId = it.InvoiceId;
		self.InvoiceNum = it.InvoiceNum;
		self.Locked = it.Locked;
		self.Lockedby = it.Lockedby;
		self.LockedByUserCode = typeof (it.LockedByUserCode) == "object" ? null : it.LockedByUserCode;
		self.SBVendId = it.SBVendId;
		self.SubTotal = ko.observable(Number(it.SubTotal));
		self.Tax = it.Tax;
		self.Xported = it.Xported;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;

		self.DueDate = it.DueDate;
		self.Term = it.Term;

		self.Total = ko.computed(function () {
			var sum = Number(self.SubTotal()) + Number(self.GLTax) + Number(self.GLFreight) - Number(self.GLDiscount);
			return Number(sum);
		}, self);

		self.removeItem = function (d, e) {
			fnc.invoicesAppNoPo.selectedForDeleteItem(d);
			$('#modConfirmDelManualInvItem').modal('show');
			return;
		}

		self.CostCentersArray = ko.observableArray();

		self.showItemCostCenters = function (d, e) {
			//InvoiceClassGLDistributionLoadRules(o.Params.InvoiceId, o.Params.InvoiceGLDistribId)
			var invId = d.InvoiceId;
			var invGlDistribId = d.InvoiceGLDistribId;
			//var glAccNo = d.GLAccNumber;
			//var glAccDesc = d.GLAccDescription;
			var orgId = fnc.invoicesAppNoPo.orgId();

			fnc.invoicesAppNoPo.selectedForCostCentersItem(d);
			fnc.invoicesAppNoPo.selectedForCostCentersItem().CostCentersArray.removeAll();
			loadItemCostCenters(invId, invGlDistribId, function (arr) {
				if (arr.length) {
					//console.log(arr);
					fnc.invoicesAppNoPo.selectedForCostCentersItem().CostCentersArray(arr);
					fnc.invoicesAppNoPo.itemCostCentersSplitTypeValue(arr[0].SplitValueType());
					$('#modShowGLAcctCostCenters').modal('show');
				} else {
					getOrgCostCenters(orgId, function (arr) {
						if (arr.length) {
							//console.log(arr);
							fnc.invoicesAppNoPo.selectedForCostCentersItem().CostCentersArray(arr);
							fnc.invoicesAppNoPo.itemCostCentersSplitTypeValue(arr[0].SplitValueType());
							$('#modShowGLAcctCostCenters').modal('show');
						} else {
							console.log('No cost centers');
							return;
						}
					})
				}
			});
		}

		self.updateCostCenterSplit = function (d, e) {
			var invId = self.InvoiceId;
			var invGlDistribId = self.InvoiceGLDistribId;
			var glAccNo = self.GLAccNumber;
			var glAccDesc = self.GLAccDescription;
			var saveRule = fnc.invoicesAppNoPo.itemRememberCostCenterSplitSettings();
			var ruleList = [];

			self.CostCentersArray().forEach(function (it) {
				var obj = {};
				obj.ClassCode = it.ClassCode
				obj.ClassName = it.ClassName
				obj.GLAccDescription = it.GLAccDescription
				obj.GLAccNumber = it.GLAccNumber
				obj.InvoiceId = invId;
				obj.ItemId = 0;
				obj.SaveRule = saveRule;
				obj.SplitValue = it.SplitValue()
				obj.SplitValueType = fnc.invoicesAppNoPo.itemCostCentersSplitTypeValue();
				ruleList.push(obj);
			})


			updateGLCostSplit(invId, invGlDistribId, glAccNo, glAccDesc, saveRule, ruleList, function () {
				$('#modShowGLAcctCostCenters').modal('hide');
			})
		}


	};

	var GLAccountItem = function (it) {
		var self = this;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccID = it.GLAccID;
		self.GLAccNumber = it.GLAccNumber == null ? "" : it.GLAccNumber;

		//self.newItemPayPrice = ko.observable('');
		//self.addItemToList = function () { };
		//self.enableAddNewItem = ko.computed(function () {
		//	return false;
		//}, self);
	};

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
		self.VendorId = it.VendID;
		self.Zip = it.Zip;

		self.ItemId = self.SBVendId + "-" + self.VendorId;
		self.Address = self.Address1 + ", " + self.City + " " + self.State + " " + self.Zip;
		self.Selected = ko.observable(false);

		self.Enabled = ko.observable(true);
	};

	//private functions
	var updateGLCostSplit = function (invId, invGlDistribId, glAccNo, glAccDesc, saveRule, ruleList, callback) {
		//InvoiceClassUpdateGLCostSplit(o.Params.InvoiceId, o.Params.GLAcctNumber, o.Params.GLAcctDescription, o.Params.SaveRule, invoiceClassRuleList, o.uc)
		//InvoiceClassUpdateGLCostSplit(o.Params.InvoiceId, o.Params.InvoiceGLDistribId, o.Params.GLAcctNumber, o.Params.GLAcctDescription, o.Params.SaveRule, invoiceClassRuleList, o.uc)
		var params = {};
		params.InvoiceId = invId;
		params.InvoiceGLDistribId = invGlDistribId;
		params.GLAcctNumber = glAccNo;	//itemId;
		params.GLAcctDescription = glAccDesc;	//itemId;
		params.SaveRule = saveRule;
		params.InvoiceClassRuleList = ruleList;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassUpdateGLCostSplit", params, function (response) {
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

	var getItemCostCentersTotal = function () {
		var gt = 0;
		if (fnc.invoicesAppNoPo) {
			fnc.invoicesAppNoPo.selectedForCostCentersItem().CostCentersArray().forEach(function (it) {
				gt = gt + Number(it.ItemCostCenterSubTotal());
			});
		}
		return gt;
	}

	var loadItemCostCenters = function (invId, invGlDistribId, callback) {
		//InvoiceClassGLDistributionLoadRules(o.Params.InvoiceId, o.Params.GLAcctNumber, o.Params.GLAcctDescription)
		//InvoiceClassGLDistributionLoadRules(o.Params.InvoiceId, o.Params.InvoiceGLDistribId)
		var params = {};
		params.InvoiceId = invId;
		params.InvoiceGLDistribId = invGlDistribId;
		//params.GLAcctNumber = glAccNo;	//itemId;
		//params.GLAcctDescription = glAccDesc;	//itemId;

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.InvoiceClassGLDistributionLoadRules", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new CostCenterItem(it)) })
			} else {
				arr.push(new CostCenterItem(obj))
			}

			if (callback) callback(arr);
		})
	}

	var getOrgCostCenters = function (orgId, callback) {

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
			//var obj = testCostCenters;

			var arr = [];

			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new CostCenterItem(it)) })
			} else {
				arr.push(new CostCenterItem(obj))
			}

			if (callback) return callback(arr);
		})
	}

	var loadItems = function (invId, callback) {
		var params = {};
		params.InvoiceId = invId;
		self.allItems.removeAll();
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOneManualInvoice", params, function (response) {
			loading(false);
			if (response.d == '') {

				//set common values
				self.invoiceNumber('');
				self.invoiceDate('');
				self.tax('');
				self.grossAmount('');
				self.discAmount('');
				self.freight('');

				self.invoiceLocked('0');
				self.invoiceLockedBy(null);
				self.invoiceLockedByUserCode(null);
				self.invoiceAccepted('0');
				self.invoiceAcceptedDate(null);
				self.invoiceAcceptedBy(null);
				self.invoiceXported('0');
				self.invoiceXportedDate(null);
				self.invoiceXportedBy(null);

				self.dueDate('');
				self.term('');

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

			self.invoiceNumber(arr[0].InvoiceNum);
			self.invoiceDate((new Date(arr[0].InvoiceDate)).format(strFormat));
			self.tax(formatToFixed0(arr[0].Tax, 2));
			self.grossAmount(formatToFixed0(arr[0].Gross, 2));
			self.discAmount(formatToFixed0(arr[0].Discount, 2));
			self.freight(formatToFixed0(arr[0].Freight, 2));

			self.invoiceLocked(arr[0].Locked);
			self.invoiceLockedBy(arr[0].Lockedby);
			self.invoiceLockedByUserCode(arr[0].LockedByUserCode);
			self.invoiceAccepted(arr[0].Accepted);
			self.invoiceAcceptedDate(arr[0].AcceptedDT);
			self.invoiceAcceptedBy(arr[0].AcceptedBy);
			self.invoiceXported(arr[0].Xported);
			self.invoiceXportedDate(arr[0].XportedDT);
			self.invoiceXportedBy(arr[0].XportedBy);

			self.depositOrCredit(arr[0].AdjTotal);

			self.dueDate(arr[0].DueDate);
			self.term(arr[0].Term);

			self.allItems(arr);

			if (callback) callback();
		});
	};

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

	var addItem = function (invId, glAccId, subTotal, callback) {
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

	var removeItem = function (invId, glAccId, callback) {
		var params = {};
		params.InvoiceId = invId;
		params.InvoiceGLDistribId = glAccId;

		loading(true);
		//RemoveInvoiceItemManual(o.Params.InvoiceId, o.Params.InvoiceGLDistribId, .uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.RemoveInvoiceItemManual", params, function (response) {
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

	var loadManualInvoiceVendors = function (orgId, callback) {
		var params = {};
		params.OrganizationId = orgId;

		//Function LoadAllActiveVendors(organizationId As Integer) As String

		loading(true);
		//self.noPORequiredVendors.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadAllActiveVendors", params, function (response) {
			loading(false);
			if (response.d == '') {
				self.noPORequiredVendors.removeAll();
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
			//var it = {};
			//it.Company = 'Choose...'
			//it.RequirePO = '0';
			//it.SBVendId = -1;
			//it.VendId = -1;
			//var vItem = new VendorListItem(it);
			//vItem.Enabled(false);
			//arr.push(vItem);
			if (obj[0]) {
				obj.forEach(function (it) {
					if (it.RequirePO == '0' && it.SBVendId > 0) {
						arr.push(new VendorListItem(it));
					}
				})
			} else {
				if (obj.RequirePO == '0' && it.SBVendId > 0) {
					arr.push(new VendorListItem(obj));
				}
			}
			self.noPORequiredVendors(arr);
			if (callback) callback();
		})
	};

	var validateLocationChange = function (orgId, company, callback) {
		var ret = false;
		var params = {};
		params.OrganizationId = orgId;

		//Function LoadAllActiveVendors(organizationId As Integer) As String

		loading(true);

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
				obj.forEach(function (it) {
					if (it.RequirePO == '0') {
						arr.push(new VendorListItem(it));
					}
				})
			} else {
				if (obj.RequirePO == '0') {
					arr.push(new VendorListItem(obj));
				}
			}
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Company == company) {
					ret = true;
					break;
				}
			}

			if (callback) callback(ret);
		})
	};

	var getVendorIds = function (company, arr, vendId, sbVendId, callback) {
		var vId = 0;
		var sbvId = 0;
		for (var i = 0; i < arr.length; i++) {
			if (company == arr[i].Company) {
				vId = arr[i].VendorId;
				sbvId = arr[i].SBVendId;
			}
		}
		vendId(vId);
		sbVendId(sbvId);
		if (callback) callback();
	};

	var getVendorName = function (arr, sbVendId, callback) {
		var r = "";
		for (var i = 0; i < arr.length; i++) {
			if (sbVendId == arr[i].SBVendId) {
				r = arr[i].Company;
				break;
			}
		}
		if (callback) callback(r);
	}

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

	function findVendorId(vendId) {
		var r = -1;
		var i = 0;
		var arr = self.noPORequiredVendors();
		for (i; i < arr.length; i++) {
			if (vendId == arr[i].SBVendId) {
				r = i;
				break;
			}
		}
		return r;
	}
	//public
	var self = this;

	self.init = function (vendId, orgId, invId, callback) {
		self.orgName(fnc.app.hiddenTabs()[0].OrgName());
		self.orgId.sneakyUpdate(fnc.app.hiddenTabs()[0].OrgId());
		self.invoiceId(invId);
		var company = fnc.app.hiddenTabs()[0].CompanyName();
		self.vendorNotFound(false);

		getOrgClassList(orgId, function (r) { fnc.invoicesAppNoPo.isClassesEnable(r.length > 0) });
		validateLocationChange(orgId, company, function (r) {
			if (r) {
				loadManualInvoiceVendors(orgId, function () {
					self.companyName.sneakyUpdate(company);
					self.companyId.sneakyUpdate(vendId);
					if (findVendorId(vendId) == -1) self.vendorNotFound(true);
					loadGLAccounts(invId, function () {
						loadItems(invId, function () {
							//duplicates check 
							loadDuplicateInvoiceInfo(fnc.invoicesAppNoPo.invoiceNumber(), 0, vendId, orgId, invId, function (d) {
								if (d != []) {
									self.isDuplicate(d.IsDuplicate == "1");
									self.duplicateInfo(d);
								} else {
									self.isDuplicate(false);
									self.duplicateInfo(null);
								}
							});
							fnc.invoiceUnlockTimer = setInterval(loadInvoiceLockStatus, fnc.invoiceUnlockInterval, invId);
							if (callback) callback();
						});
					});
				});
			} else {
				loadManualInvoiceVendors(orgId, function () {
					var obj = {};
					obj.Address1 = "";
					obj.Address2 = "";
					obj.City = "";
					obj.Code = "";
					obj.Company = company;
					obj.RequiredPO = "0";
					obj.SBVendId = vendId;
					obj.State = "";
					obj.VendorId = "";
					obj.Zip = "";
					var disabledItem = new VendorListItem(obj);
					disabledItem.Enabled(false);
					//self.noPORequiredVendors.push(disabledItem);
					self.companyName.sneakyUpdate(company);
					self.companyId.sneakyUpdate(vendId);
					if (findVendorId(vendId) == -1) self.vendorNotFound(true);
					loadGLAccounts(invId, function () {
						loadItems(invId, function () {
							//duplicates check 
							loadDuplicateInvoiceInfo(fnc.invoicesAppNoPo.invoiceNumber(), 0, vendId, orgId, invId, function (d) {
								if (d != []) {
									self.isDuplicate(d.IsDuplicate == "1");
									self.duplicateInfo(d);
								} else {
									self.isDuplicate(false);
									self.duplicateInfo(null);
								}
							});
							fnc.invoiceUnlockTimer = setInterval(loadInvoiceLockStatus, fnc.invoiceUnlockInterval, invId);
							if (callback) callback();
						});
					});
				});
			}
		})

		fnc.loadInvoiceDocumentList('', '', invId, orgId, function (r) {
			fnc.app.attachedItems(r);
		})

	};
	self.isClassesEnable = ko.observable(false);
	self.listHeaders = [
		{ title: 'GL ACCOUNT', sortPropertyName: 'GLAccNumber', asc: ko.observable(true) },
		{ title: 'DESCRIPTION', sortPropertyName: 'GLAccDescription', asc: ko.observable(true) },
		{ title: 'SUB TOTAL', sortPropertyName: 'SubTotalSort', asc: ko.observable(true) },
		{ title: 'TAX', sortPropertyName: 'GLTax', asc: ko.observable(true) },
		{ title: 'FREIGHT', sortPropertyName: 'GLFreight', asc: ko.observable(true) },
		{ title: 'DISCOUNT', sortPropertyName: 'GLDiscount', asc: ko.observable(true) },
		{ title: 'TOTAL', sortPropertyName: 'SubTotalSort', asc: ko.observable(true) }
	];
	self.activeSort = ko.observable(self.listHeaders[0]); //set the default sort

	self.hasChangedHeader = ko.observable(false);

	//LOCATION
	self.orgName = ko.observable('');
	self.orgId = ko.observable().withPausing();
	self.orgId.subscribe(function () {
		if (!fnc.app.singleLocation()) {
			self.validateInvoice();
			var invId = self.invoiceId();
			var orgId = self.orgId();
			var company = self.companyName();
			var vendId = self.companyId();
			validateLocationChange(orgId, company, function (r) {
				if (r) {
					updateInvoiceOrganization(invId, orgId, function () {
						fnc.app.hiddenTabs()[0].OrgId(self.orgId());
						fnc.app.hiddenTabs()[0].OrgName($("#selectAllLocations option:selected").text());
						loadManualInvoiceVendors(orgId, function () {
							self.companyName(company);
							self.companyId(vendId);
							windowResized();
						});
					});
				} else {
					$("#spanOrgName").text($("#selectAllLocations option:selected").text());
					$('#modConfirmManualInvChangeLocation').modal('show');
					//alert('There is not ' + company + ' at ' + self.orgName());
				}
			});
		}
	});

	//COMPANY	(VENDOR)
	self.companyName = ko.observable('').withPausing();
	self.companyName.subscribe(function () {
		//if (self.companyName() != '' && self.companyName() != undefined) {
		//	var invId = self.invoiceId();
		//	var vendId = ko.observable(0);
		//	var sbVendId = ko.observable(0);
		//	getVendorIds(self.companyName(), self.noPORequiredVendors(), vendId, sbVendId, function () {
		//		updateInvoiceVendor(invId, vendId(), sbVendId(), function () {
		//			fnc.app.hiddenTabs()[0].CompanyName(self.companyName());
		//			fnc.app.hiddenTabs()[0].VendId(vendId());
		//			windowResized();
		//		});
		//	});
		//}
	});

	self.companyId = ko.observable().withPausing();
	self.companyId.subscribe(function () {
		self.validateInvoice(function () { });
		if (self.companyId() != undefined && self.companyId() > 0) {
			var invId = self.invoiceId();
			var sbVendId = ko.observable(0);
			updateInvoiceVendor(invId, 0, self.companyId(), function () {
				getVendorName(self.noPORequiredVendors(), self.companyId(), function (r) {
					if (r != "") {
						fnc.app.hiddenTabs()[0].CompanyName(r);
					} else {
						fnc.app.hiddenTabs()[0].CompanyName(self.companyName());
					}
				})
				fnc.app.hiddenTabs()[0].VendId(self.companyId());
				self.vendorNotFound(findVendorId(self.companyId()) == -1)
				windowResized();
			});
		}
	});

	self.vendorNotFound = ko.observable(false);

	self.invoiceNumber = ko.observable();
	self.invoiceNumber.subscribe(function () {
		fnc.app.hiddenTabs()[0].InvoiceNumber(self.invoiceNumber());
	}, self);

	self.invoiceId = ko.observable('');

	self.invoiceDate = ko.observable('');
	self.invoiceDate.subscribe(function () {
		//validateAccountOverlay();
	}, self);

	//duplicate
	self.isDuplicate = ko.observable(false);
	self.duplicateInfo = ko.observable(null);

	self.allItems = ko.observableArray();
	self.allItems.subscribe(function () {
		self.validateInvoice(function () {
			//
		});
	}, self);


	self.allInvoiceAdjustmentItems = ko.observableArray();
	self.newAdjustmentItemGLAccount = ko.observable(null);
	self.newAdjustmentItemAmount = ko.observable('');
	self.newAdjustmentItemNotes = ko.observable('');
	self.newAdjusmentAddEnable = ko.computed(function () {
		return self.newAdjustmentItemAmount() != '' && self.newAdjustmentItemGLAccount() != null;
	}, self);

	self.selectedForDeleteDeposit = ko.observable(null);

	self.noPORequiredVendors = ko.observableArray();

	self.inactiveVendor = ko.computed(function () {
		var r = false;
		var ln = self.noPORequiredVendors().length;
		if (ln > 0) {
			if (!self.noPORequiredVendors()[ln - 1].Enabled() && self.noPORequiredVendors()[ln - 1].Company == self.companyName()) {
				r = true;
			}
		}
		return r;
	}, self);


	//locked
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

	//accepted
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

	//dueDate; term
	self.dueDate = ko.observable('');
	self.term = ko.observable('');

	self.PONumber = ko.observable('');

	self.grossAmount = ko.observable('');
	self.grossAmount.subscribe(function () {
		//validateAccountOverlay();
	}, self);

	self.discAmount = ko.observable('');
	self.discAmount.subscribe(function () {
		loadItems(self.invoiceId(), function () {
			windowResized();
		});
	});
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
	}, self);

	self.tax = ko.observable('');
	self.tax.subscribe(function () {
		loadItems(self.invoiceId(), function () {
			windowResized();
		});
	}, self);

	self.freight = ko.observable('');
	self.freight.subscribe(function () {
		loadItems(self.invoiceId(), function () {
			windowResized();
		});
	});

	self.depositOrCredit = ko.observable(0);

	self.total = ko.computed(function () {
		var sum = 0;
		for (var i = 0; i < self.allItems().length; i++) {
			var net = Number(self.allItems()[i].SubTotal());
			sum += net;
		}
		var tx = Number(self.tax());
		var fr = Number(self.freight());
		var ds = Number(self.discAmount());
		var dcr = Number(self.depositOrCredit());
		var rt = sum + dcr + tx + fr - ds;
		return ((rt == 0) || isNaN(rt)) ? '' : rt.toFixed(2);
	}, self);

	self.lineTotal = ko.computed(function () {
		var sum = 0;
		for (var p = 0; p < self.allItems().length; p++) {
			var net = Number(self.allItems()[p].SubTotal());
			sum += net;
		}
		return ((sum == 0) || isNaN(sum)) ? '' : sum.toFixed(2);
	}, self);

	self.newItemGLAccount = ko.observable(null);
	self.newItemGLAccount.subscribe(function () {
		self.validateAddItemButton();
	});

	self.newItemPayPrice = ko.observable('');
	self.newItemPayPrice.subscribe(function () {
		self.validateAddItemButton();
	});

	self.allGLAccounts = ko.observableArray();
	self.selectedForDeleteItem = ko.observable(null);

	self.sumSubTotal = ko.computed(function () {
		var r = 0;
		if (self.allItems().length > 0) {
			for (var i = 0; i < self.allItems().length; i++) {
				r = r + Number(self.allItems()[i].SubTotal());
			}
		}
		return r;
	}, self)

	self.sumTax = ko.computed(function () {
		var r = 0;
		if (self.allItems().length > 0) {
			for (var i = 0; i < self.allItems().length; i++) {
				r = r + Number(self.allItems()[i].GLTax);
			}
		}
		return r;
	}, self)

	self.sumFreight = ko.computed(function () {
		var r = 0;
		if (self.allItems().length > 0) {
			for (var i = 0; i < self.allItems().length; i++) {
				r = r + Number(self.allItems()[i].GLFreight);
			}
		}
		return r;
	}, self)

	self.sumDiscount = ko.computed(function () {
		var r = 0;
		if (self.allItems().length > 0) {
			for (var i = 0; i < self.allItems().length; i++) {
				r = r + Number(self.allItems()[i].GLDiscount);
			}
		}
		return r;
	}, self)

	self.sumTotal = ko.computed(function () {
		var r = 0;
		if (self.allItems().length > 0) {
			for (var i = 0; i < self.allItems().length; i++) {
				r = r + Number(self.allItems()[i].Total());
			}
		}
		return r;
	}, self)

	//self.percentTax = ko.computed(function () {
	//	var r = 0;
	//	var v = Number(self.tax());
	//	var s = Number(self.sumSubTotal());
	//	if (self.allItems().length > 0 && v > 0) {
	//		r = Number(v / s);
	//	}
	//	return r;
	//}, self)

	//self.percentFreight = ko.computed(function () {
	//	var r = 0;
	//	var v = Number(self.freight());
	//	var s = Number(self.sumSubTotal());
	//	if (self.allItems().length > 0 && v > 0) {
	//		r = Number(v / s);
	//	}
	//	return r;
	//}, self)

	//self.percentDiscount = ko.computed(function () {
	//	var r = 0;
	//	var v = Number(self.discAmount());
	//	var s = Number(self.sumSubTotal());
	//	if (self.allItems().length > 0 && v > 0) {
	//		r = Number(v / s);
	//	}
	//	return r;
	//}, self)

	// <COST CENTER>

	self.itemCostCentersList = ko.observableArray();
	self.itemCostCentersTotal = ko.observable(0);
	self.itemRememberCostCenterSplitSettings = ko.observable(false);

	self.selectedForCostCentersItem = ko.observable(null);
	self.selectedForCostCentersItemHeader = ko.computed(function () {
		var r = '';
		var it = self.selectedForCostCentersItem();
		if (it) r = it.GLAccDescription + ' (' + formatCurrency(it.Total()) + ')';

		return r;
	}, self);

	// dollar - 2; percent - 3
	self.itemCostCentersSplitTypeValue = ko.observable('2');
	self.itemCostCentersSplitTypeLabel = ko.computed(function () {
		var r = '';
		if (self.itemCostCentersSplitTypeValue() == '2') r = '$';
		if (self.itemCostCentersSplitTypeValue() == '3') r = '%';
		return r;
	}, self);

	// </COST CENTER>

	self.enableSection = ko.observable(false);

	self.enableAddNewItem = ko.observable(false);


	self.showEqualSign = ko.computed(function () {
		var r = false;
		if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() == self.total())) {
			r = true;
			self.validateInvoice();
		}
		return r;
	}, self);

	self.showNotEqualSign = ko.computed(function () {
		var r = false;
		if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() != self.total())) {
			r = true;
			self.validateInvoice();
		}
		return r;
	}, self);


	self.showQuestionSign = ko.computed(function () {
		var r = false;
		//if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() == self.total()) && self.reconciledLineQty() != self.allItems().length) {
		//	r = true;
		//}
		return r;
	}, self);

	self.invoiceIsReadOnly = ko.computed(function () {
		var r = false;
		if (self.invoiceXported() == "1") r = true;
		if (self.invoiceAccepted() == "1") r = true;
		if (self.invoiceLocked() == "0") r = true;
		if (self.invoiceLocked() == "1" && self.invoiceLockedByUserCode() != fnc.app.uc) r = true;
		return r;
	}, self);

	self.showDepositCreditModalDialog = function () {
		var invId = self.invoiceId();
		loadInvoiceAdjustments(invId, self.allInvoiceAdjustmentItems, function () {
			$('#modNoPODepositCreditManagement').modal('show');
			$("#modNoPODepositCreditManagement").one("hidden.bs.modal", function () {
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
				$('#modNoPOConfirmDelInvDeposit').modal('hide');
				self.selectedForDeleteDeposit(null);
				loadItems(invId, function () {
					windowResized();
				});
			});
		});
	};

	self.cancelDelInvDeposit = function (d, e) {
		$('#modNoPOConfirmDelInvDeposit').modal('hide');
		self.selectedForDeleteDeposit(null);
	};

	self.addItemToList = function (d, e) {
		//validate
		if (self.isValidNewItem()) {
			//add item
			var invId = fnc.app.hiddenTabs()[0].InvoiceId;
			var glAccId = self.newItemGLAccount().GLAccID;
			var subTotal = self.newItemPayPrice();

			addItem(invId, glAccId, subTotal, function () {
				loadItems(invId, function () {
					//reset
					self.newItemGLAccount(null);
					self.newItemPayPrice('');
					self.validateInvoice();
					windowResized();
				})
			});
		}

	};

	self.isValidNewItem = function () {
		var r = true;

		//if (self.invoiceDate() == '') {
		//	r = false;
		//	$('#tabsAlert').show();
		//}

		return r;
	};

	self.validateAddItemButton = function () {
		var r = false;
		if (self.newItemGLAccount() != null && self.newItemPayPrice() != '') {
			r = true;
		}
		self.enableAddNewItem(r);
	};

	self.showTotalDontMatch = ko.computed(function () {
		var r = false;
		//if (Math.round(Number(self.sumTotal())) != Math.round(Number(self.grossAmount()))) {
		//	r = true;
		//}
		if ((self.netAmount() != '') && (self.total() != '') && (self.netAmount() != self.total())) {
			r = true;
		}
		return r;
	}, self);

	self.enableAccept = ko.computed(function () {
		var r = false;

		if (self.allItems().length > 0 && !self.showTotalDontMatch()) {
			r = true;
		}
		return r;
	}, self);

	self.isEmptyInvoice = ko.computed(function () {
		var r = false;
		if (self.allItems().length == 1) {
			if (self.allItems()[0].GLAccNumber == null) r = true;
		}
		return r;
	}, self);

	self.invalidInvoice = ko.computed(function () {
		var r = false;
		if (self.vendorNotFound()) {
			r = true;
		}
		return r;
	}, self);

	//**********************************************
	//**********************************************
	//**********************************************
	//self.recalculateHasHeaderChanged = ko.computed(function () {
	//	//read from any observable	
	//	self.grossAmount();
	//	self.discAmount();
	//	self.tax();
	//	self.freight();

	//	//if any of the above changed
	//	self.hasChangedHeader(true);
	//}, self)

	self.deleteInvItem = function (d, e) {
		var invId = self.invoiceId();
		var itemId = self.selectedForDeleteItem().InvoiceGLDistribId;
		$('#modConfirmDelManualInvItem').modal('hide');
		removeItem(invId, itemId, function () {
			loadItems(invId, function () {
				self.selectedForDeleteItem(null);
				windowResized();
			});
		});
	};

	self.cancelDelInvItem = function (d, e) {
		$('#modConfirmDelManualInvItem').modal('hide');
		e.preventDefault();
		return;
	};

	//self.validateInvoiceHeader = function (d, e) {
	//	if (self.hasChangedHeader()) {
	//		var invId = self.invoiceId();
	//		var invNo = self.invoiceNumber();
	//		var invDate = self.invoiceDate();
	//		var gross = Number(self.grossAmount());
	//		var discount = Number(self.discAmount());
	//		var tax = Number(self.tax());
	//		var freight = Number(self.freight());

	//		updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, true, function () {
	//			self.hasChangedHeader(false);
	//			loadItems(invId, function () {
	//				windowResized();
	//			});
	//		})
	//	}
	//};

	self.updateInvoiceHeader = function (d, e) {
		var invId = self.invoiceId();
		var invNo = self.invoiceNumber();
		var invDate = self.invoiceDate();
		var gross = Number(self.grossAmount());
		var discount = Number(self.discAmount());
		var tax = Number(self.tax());
		var freight = Number(self.freight());

		updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, true, function () {
			self.hasChangedHeader(false);
			loadItems(invId, function () {
				self.validateInvoice();
				windowResized();
			});
		})
	};


	self.toggleLockInvoice = function (d, e) {
		var invId = self.invoiceId();
		var locked = (self.invoiceLocked() == '0');

		updateLock(invId, locked, function () {

			loadItems(invId, function () {
				self.validateInvoice();
				windowResized();
			})

		})
	};

	self.toggleAcceptInvoice = function (d, e) {
		var invId = self.invoiceId();
		var accepted = (self.invoiceAccepted() == '0');
		var invNo = fnc.invoicesAppNoPo.invoiceNumber();
		var sbVendId = fnc.app.hiddenTabs()[0].VendId();
		var orgId = fnc.invoicesAppNoPo.orgId();
		if (accepted) {
			loadDuplicateInvoiceInfo(invNo, 0, sbVendId, orgId, invId, function (r) {
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
							//console.log('invNo=' + invNo + '||sbVendId=' + sbVendId);
							$('#modDuplicateWarning').modal('hide');
							_repeatedBlock(invId, accepted, function () {
								fnc.invoicesAppNoPo.duplicateInfo(r);
								fnc.invoicesAppNoPo.isDuplicate(true);
							});
						});

						$("#modDuplicateWarning").on('hidden.bs.modal', function (e) {
							$(e.currentTarget).unbind();
						});

					} else {
						fnc.invoicesAppNoPo.duplicateInfo(null);
						fnc.invoicesAppNoPo.isDuplicate(false);
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
				loadItems(invId, function () {
					self.validateInvoice();
					windowResized();
				})
			})

			if (callback) callback();
		}
	};

	self.exportInvoice = function (d, e) {
		var xType = e.currentTarget.getAttribute("data-value");
		var invId = self.invoiceId();
		var exported = true;

		updateExported(invId, exported, function () {
			loadItems(invId, function () {
				self.validateInvoice();
				windowResized();
			});
		});

	};

	self.attachBlurFunctions = function (callback) {

		$('#invoiceDateManualInvoice').on('change', function (e) {
			var inputValue = this.value;
			var d = ko.dataFor(this);
			var originalDate = self.invoiceDate();
			if (inputValue != originalDate) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = inputValue;
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					self.invoiceDate(inputValue);
				});
			}
		});

		$('#invoiceNumber2').on('blur', function (e) {
			var inputValue = this.value;
			var d = ko.dataFor(this);
			var originalNo = self.invoiceNumber();
			if (inputValue != originalNo) {
				var invId = self.invoiceId();
				var invNo = inputValue;
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				loadDuplicateInvoiceInfo(invNo, 0, fnc.invoicesAppNoPo.companyId(), fnc.invoicesAppNoPo.orgId(), invId, function (r) {
					if (r != []) {
						if (r.IsDuplicate == "1") {
							$('#modDuplicateWarning').modal('show');
							$("#modDuplicateWarning").on('shown.bs.modal', function (e) {
								$(".modal-body #invoiceNo").text(invNo);
								$(".modal-body #vendName").text(fnc.app.hiddenTabs()[0].CompanyName());
							});

							$('#modDuplicateWarning').on('click', "[data-dismiss='modal']", function (e) {
								$('#invoiceNumber2').val(originalNo);
								$('#modDuplicateWarning').modal('hide');
							});

							$('#modDuplicateWarning').on('click', '#proceedWithDuplicate', function (e) {
								//console.log('invNo=' + invNo + '||vendId=' + fnc.invoicesApp.vendId());
								$('#modDuplicateWarning').modal('hide');
								_repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight, function () {
									fnc.invoicesAppNoPo.duplicateInfo(r);
									fnc.invoicesAppNoPo.isDuplicate(true);
								});
							});

							$("#modDuplicateWarning").on('hidden.bs.modal', function (e) {
								$(e.currentTarget).unbind();
							});

						} else {
							fnc.invoicesAppNoPo.duplicateInfo(null);
							fnc.invoicesAppNoPo.isDuplicate(false);
							_repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight);
						}
					} else {
						_repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight);
					}
				});
				function _repeatedBlock(invId, invNo, invDate, gross, discount, tax, freight, callback) {
					updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
						self.invoiceNumber(inputValue);
						fnc.app.hiddenTabs()[0].InvoiceNumber(inputValue);
					});
					if (callback) callback();
				};
			}
		});
		$('#invoiceGross2').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalGross = self.grossAmount();
			if (inputValue != originalGross) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(inputValue);
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					self.grossAmount(inputValue);
				});
			}
		});
		$('#invoiceDiscount2').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalDiscount = self.discAmount();
			if (inputValue != originalDiscount) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(inputValue);
				var tax = Number(self.tax());
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					self.discAmount(inputValue);
				});
			}
		});
		$('#invoiceTax2').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalTax = self.tax();
			if (inputValue != originalTax) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(inputValue);
				var freight = Number(self.freight());
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					self.tax(inputValue);
				});
			}
		});
		$('#invoiceFreight2').on('blur', function (e) {
			var inputValue = formatToFixed0(this.value, 2);
			var d = ko.dataFor(this);
			var originalFreight = self.grossAmount();
			if (inputValue != originalFreight) {
				var invId = self.invoiceId();
				var invNo = self.invoiceNumber();
				var invDate = self.invoiceDate();
				var gross = Number(self.grossAmount());
				var discount = Number(self.discAmount());
				var tax = Number(self.tax());
				var freight = Number(inputValue);
				updateInvoiceSummary(invId, invNo, invDate, gross, discount, tax, freight, false, function () {
					self.freight(inputValue);
				});
			}
		});

	};


	self.validateInvoice = function (callback) {

		if (self.invoiceLocked() == '1' && !self.showInoiceLocked()) {
			//invoice locked by me
			$('input.validated-field, button.validated-field, select.validated-field').removeAttr('disabled');

			if (self.isEmptyInvoice() || self.invalidInvoice() || self.showTotalDontMatch() || !self.showEqualSign() || (self.orgId() == undefined) || (self.companyId() == undefined)) {
				$('#btnAcceptInvoice2').attr('disabled', 'disabled');
			}

			$('#linkExport2XL2').addClass('disabled-link');
			$('#linkExport2QB2').addClass('disabled-link');

		} else if (self.showInoiceLocked()) {
			//invoice locked not by me
			$('input.validated-field, button.validated-field, select.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');
		} else if (self.showInoiceAccepted() && !self.showInoiceXported()) {
			//invoice accepted
			$('input.validated-field, button.validated-field, select.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');

			$('#btnUnacceptInvoice2').removeAttr('disabled');
			$('#linkExport2XL2').removeClass('disabled-link');
			$('#linkExport2QB2').removeClass('disabled-link');
		} else if (self.showInoiceXported()) {
			//invoice exported
			$('input.validated-field, button.validated-field, select.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');

			$('#btnUnacceptInvoiceExp').removeAttr('disabled');
			$('#linkExport2XL2').removeClass('disabled-link');
			$('#linkExport2QB2').removeClass('disabled-link');
		} else {
			//invoice unlocked and not completed
			$('input.validated-field, button.validated-field, select.validated-field').attr('disabled', 'disabled');
			$('a.validated-field').addClass('disabled-link');

			$('#btnLockInvoice2').removeAttr('disabled');

			if (self.showEqualSign() && !self.invalidInvoice() && !(self.orgId() == undefined) && !(self.companyId() == undefined)) {
				$('#btnAcceptInvoice2').removeAttr('disabled');
			}

		}
	};

	self.cancelChangeLocation = function (d, e) {
		self.orgId(fnc.app.hiddenTabs()[0].OrgId())
		$("#spanOrgName").text("");
		$('#modConfirmManualInvChangeLocation').modal('hide');
	}

	self.proceedChangeLocation = function (d, e) {
		$("#spanOrgName").text("");
		$('#modConfirmManualInvChangeLocation').modal('hide');

		var orgId = self.orgId();
		var orgName = $("#selectAllLocations option:selected").text();
		var invId = self.invoiceId();
		updateInvoiceOrganization(invId, orgId, function () {
			fnc.app.hiddenTabs()[0].OrgId(orgId);
			fnc.app.hiddenTabs()[0].OrgName(orgName);
			self.orgName(orgName);
			loadManualInvoiceVendors(orgId, function () {
				windowResized();
			})
		})
	}

	self.printInvoiceNRPO = function (d, e) {
		//debug
		//$("#modPrintInvoiceNRPO").modal('show');
		//return false;
		//print
		var frame = document.getElementById('printNRPOInvoice');
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
		$('#modDuplicateInvoiceWarningNoPORequired').modal('show');
	}

	//attached docs (images)
	self.showAttachedDocs = function (d, e) {
		//console.log(d);
		var orgId = self.orgId();
		var orgName = decodeText(self.orgName());
		var invId = self.invoiceId();
		var invNum = self.invoiceNumber();
		var invTotal = self.grossAmount();
		var poList = '';	//self.includedPOList().join(",");
		var vendId = 0;	//self.vendId();
		var sbVendId = self.companyId();
		var company = decodeText(self.companyName());
		var attachedDocs = fnc.app.attachedItems;
		var availableDocs = ko.observableArray();
		var invDate = self.invoiceDate();
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

		});

		$("#modAttachments").one("hidden.bs.modal", function () {
			fnc.app.attachmentsObject(null);
		});

	}

	return self;

}());