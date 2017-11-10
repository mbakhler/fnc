/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.setupApp = new function () {
	//********************************
	//defaults
	//********************************

	//********************************
	//private
	//********************************

	//objects

	var orgDTFRuleItem = function (it) {
		//DiscountGLAccDescription: null
		//DiscountGLAccId: "0"
		//DiscountGLAccNumber: null
		//DiscountRule: "1"
		//DiscountRuleDescr: "Distribute"
		//FreightGLAccDescription: null
		//FreightGLAccId: "0"
		//FreightGLAccNumber: null
		//FreightRule: "1"
		//FreightRuleDescr: "Distribute"
		//OrgId: "238"
		//OrgName: "BRYANT PARK GRILL"
		//TaxGLAccDescription: null
		//TaxGLAccId: "0"
		//TaxGLAccNumber: null
		//TaxRule: "1"
		//TaxRuleDescr: "Distribute"
		var self = this;
		self.DiscountGLAccDescription = it.DiscountGLAccDescription;
		self.DiscountGLAccId = ko.observable(it.DiscountGLAccId);
		self.DiscountGLAccNumber = it.DiscountGLAccNumber;
		self.DiscountRule = it.DiscountRule;
		self.DiscountRuleDescr = it.DiscountRuleDescr;
		self.FreightGLAccDescription = it.FreightGLAccDescription;
		self.FreightGLAccId = ko.observable(it.FreightGLAccId);
		self.FreightGLAccNumber = it.FreightGLAccNumber;
		self.FreightRule = it.FreightRule;
		self.FreightRuleDescr = it.FreightRuleDescr;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.TaxGLAccDescription = it.TaxGLAccDescription;
		self.TaxGLAccId = ko.observable(it.TaxGLAccId);
		self.TaxGLAccNumber = it.TaxGLAccNumber;
		self.TaxRule = it.TaxRule;
		self.TaxRuleDescr = it.TaxRuleDescr;

		self.DiscountRule2 = ko.observable(it.DiscountRule);
		self.FreightRule2 = ko.observable(it.FreightRule);
		self.TaxRule2 = ko.observable(it.TaxRule);

		self.DiscountCellText = ko.computed(function () {
			return self.DiscountRule == 1 ? self.DiscountRuleDescr : '(' + self.DiscountGLAccNumber + ') ' + self.DiscountGLAccDescription;
		}, self);

		self.TaxCellText = ko.computed(function () {
			return self.TaxRule == 1 ? self.TaxRuleDescr : '(' + self.TaxGLAccNumber + ') ' + self.TaxGLAccDescription;
		}, self);

		self.FreightCellText = ko.computed(function () {
			return self.FreightRule == 1 ? self.FreightRuleDescr : '(' + self.FreightGLAccNumber + ') ' + self.FreightGLAccDescription;
		}, self);

		self.enableSubmitButton = ko.computed(function () {
			var r = true;
			if (self.DiscountRule2() == '0' && isNaN(self.DiscountGLAccId())) {
				r = false;
			}
			if (self.TaxRule2() == '0' && isNaN(self.TaxGLAccId())) {
				r = false;
			}
			if (self.FreightRule2() == '0' && isNaN(self.FreightGLAccId())) {
				r = false;
			}
			return r;
		}, self);

		self.showDTFManageDialog = function (d, e) {
			var orgId = d.OrgId;
			getGLAcctListByOrgId(orgId, function () {
				d.DiscountRule2(d.DiscountRule);
				d.TaxRule2(d.TaxRule);
				d.FreightRule2(d.FreightRule);
				fnc.setupApp.selectedOrgDTFRules(d);

				$('#modOrgDTFRules').modal('show');
				setTimeout(function () {
					$('#modOrgDTFRules').find('.modal-header').css('cursor', 'move');
				});
			})
			
		};
	};

	var orgStartDateItem = function (it) {
		var self = this;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;

		
		//var d = null;
		//if (it.StartDate != null && it.StartDate != '') {
		//	d = (new Date(it.StartDate)).format(strFormat);
		//}	
		self.StartDate = ko.observable(it.StartDate);
		self.StartDateOriginal = it.StartDate;
		self.Selected = ko.observable(false);

		self.showDatepicker = function (d, e) {
			var it = $(e.currentTarget.parentNode).find(".start-date-input");
			it.datepicker({
				changeMonth: true,
				changeYear: true,
				showButtonPanel: true,
				numberOfMonths: 1,
				showAnim: ""
			});
			it.datepicker("show");
		};

		self.updateOrgStartDate = function (d, e) {
			if (false) return;
			modifyOrgStartDate(d.OrgId, d.StartDate(), function () {
				return false;
			})
		};
	};

	var chartItem = function (it) {
		//Object {@rowid: "1", OrgId: "718", OrgName: "*CORPORATE ACCOUNT - CROWN GROUP", ChartId: "0", ChartName: null}
		var self = this;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.OriginalChartName = ko.observable(it.ChartName);
		self.ChartId = ko.observable(it.ChartId);
		self.ChartName = ko.observable(it.ChartName);
		self.Selected = ko.observable(false);

		self.updateChartName = function (d, e) {
			if (d.ChartName() != d.OriginalChartName()) {
				modifyGLAcctChart(d.ChartId(), d.ChartName(), function () {
					getGLAcctChartList(function () {
						windowResized();
					})
				})
			}
		};

		self.createChart = function (d, e) {
			var orgId = d.OrgId;
			var chartName = d.OrgName;
			createGLAcctChart(orgId, chartName, d.ChartId, function () {
				if (d.ChartId()) {
					//successfully created with a new ID <> '0' ;
					d.ChartName(chartName);
					modifyGLAcctChart(d.ChartId(), d.ChartName(), function () {
						fnc.setupApp.selectedSetupId('manage-gl-accts-panel');
						fnc.setupApp.selectedChartId(d.ChartId());
						fnc.setupApp.selectedChartId.valueHasMutated();
						$('#tblGLAccounts').editableTableWidget();
						windowResized();
					})
				}
			})
		};

		self.manageChart = function (d, e) {
			fnc.setupApp.selectedSetupId('manage-gl-accts-panel');
			fnc.setupApp.selectedChartId(d.ChartId());
			$('#tblGLAccounts').editableTableWidget();
			windowResized();
		};

		self.chooseChart = function (d, e) {
			$(e.currentTarget.parentNode).on('show.bs.dropdown', function () { d.Selected(true); });
			$(e.currentTarget.parentNode).on('hide.bs.dropdown', function () { d.Selected(false); });
			fnc.setupApp.selectedOrgId(d.OrgId);
			fnc.setupApp.selectedOrgName(d.OrgName);
		};

		self.useChart = function (d, e) {
			var orgId = fnc.setupApp.selectedOrgId();
			var chartId = d.ChartId();
			var chartName = d.ChartName();

			useGLAcctChart(chartId, orgId, function () {
				//update current screen (allGLCharts)
				var arr = fnc.setupApp.allGLCharts();
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].OrgId == orgId) {
						arr[i].ChartId(chartId);
						arr[i].ChartName(chartName);
						break;
					}
				}
			})

		};

		self.copyChart = function (d, e) {
			var orgId = fnc.setupApp.selectedOrgId();
			var orgName = fnc.setupApp.selectedOrgName();
			var chartId = d.ChartId();
			var chartName = d.ChartName();
			var newChartId = ko.observable();
			copyGLAcctChart(chartId, orgId, newChartId, function () {
				//update current screen (allGLCharts)
				var arr = fnc.setupApp.allGLCharts();
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].OrgId == orgId) {
						arr[i].ChartId(newChartId());
						arr[i].ChartName(orgName);
						break;
					}
				}
				//switch to manage-gl-accts-panel		
				fnc.setupApp.selectedSetupId('manage-gl-accts-panel');
				fnc.setupApp.selectedChartId(newChartId());
				$('#tblGLAccounts').editableTableWidget();
				windowResized();
			})

		};

		self.isCreateVisible = ko.computed(function () {
			return self.ChartId() == 0;
		}, self);

		self.isManageVisible = ko.computed(function () {
			return self.ChartId() != 0;
		}, self);
		self.isChooseVisible = ko.computed(function () {
			return self.ChartId() == 0 && fnc.setupApp.uniqueGLCharts().length > 0;
		}, self);

	};

	var glAccountItem2 = function (it) {
		//chartid: "29", glaccid: "8", GLAccNumber: "4", GLAccDescription: "test four"
		var self = this;
		self.ChartId = it.chartid;
		self.GLAccId = it.glaccid;
		self.GLAccNumber = ko.observable(it.GLAccNumber);
		self.GLAccDescription = ko.observable(it.GLAccDescription);
		self.CategoryClassId = ko.observable(it.CategoryClassId);
		self.CategoryClassId.subscribe(function (newValue) {
			var newCatClsId = newValue;
			modifyGLAccount(self.GLAccId, self.ChartId, self.GLAccNumber(), self.GLAccDescription(), newValue, function () {
				//
			})
		}, self);
		//self.Selected = ko.observable(false);

		self.GLAccText = self.GLAccNumber() == null ? self.GLAccDescription() : self.GLAccDescription() + " (" + self.GLAccNumber() + ")"

		self.updateGLAcctNumber = function (d, e) {
			var newAcctNo = e.currentTarget.innerText;
			modifyGLAccount(self.GLAccId, self.ChartId, newAcctNo, self.GLAccDescription(), self.CategoryClassId(), function () {
				self.GLAccNumber(newAcctNo);
			})
			e.preventDefault();
		}

		self.updateGLAcctDescription = function (d, e) {
			var newAcctDesc = e.currentTarget.innerText;
			modifyGLAccount(self.GLAccId, self.ChartId, self.GLAccNumber(), newAcctDesc, self.CategoryClassId(), function () {
				self.GLAccDescription(newAcctDesc);
			})
			e.preventDefault();
		}

		self.delGLAccount = function (d, e) {
			fnc.setupApp.selectedGLAccount(d);
			$('#modConfirmDelGLAcct').modal('show');
			e.preventDefault();
		}

		self.manageGLAccount = function (d, e) {
			fnc.setupApp.selectedSetupId('manage-gl-assignment-panel');
			fnc.setupApp.selectedGLAccount(d);
			fnc.setupApp.selectedGLAccId(d.GLAccId);
			//$('#tblGLAccounts').editableTableWidget();
			windowResized();

		}
	};

	var glAccountItem3 = function (it) {
		var self = this;
		//properties
		self.ItemID = it.ItemId;
		self.Description = it.Description;
		self.Brand = it.Brand;
		self.Model = it.Model;
		self.UOM = it.UOM;
		self.ChartId = it.ChartId;
		self.GLAccId = it.GLAccId;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccNumber = it.GLAccNumber;
		self.Prcnt = Number(it.Prcnt).toFixed(0);
		self.Unit = it.Unit;
		self.CanDelete = ko.observable(it.CanDelete == 1);	//0 or 1

		self.glArray = [];

		//functions
		self.addItem2GLAcct = function (d, e) {
			var itemGLAccId = d.GLAccId;
			var glAcctId = fnc.setupApp.selectedGLAccId();
			var chartId = fnc.setupApp.selectedChartId();
			var itemId = d.ItemID;

			if (itemGLAccId == '0') {
				//no split
				var prcnt = 100;
				glAccountAddItem(glAcctId, itemId, prcnt, function () {
					var chartId = fnc.setupApp.selectedChartId();
					getGLItemList(chartId, glAcctId, function () { fnc.setupApp.globalItemsSearchString(''); });
				});
			} else {
				//split
				fnc.setupApp.selectedGLAcctItem(d);
				loadOneItemGLAccountList(chartId, itemId, function () {
					recalculateOneItemGLAccountsTotal();
					$("#modUpdateSplitItem").modal("show");
				})
			}

		};

		self.deleteItemFromGLAcct = function (d, e) {
			fnc.setupApp.selectedGLAcctItem(d);
			$("#modConfirmDelItemFromGLAcct").modal("show");
		};

		self.updateItem4GLAcct = function (d, e) {
			var selectedGLAccNumber = d.GLAccNumber;
			var glAcctId = fnc.setupApp.selectedGLAccId();
			var chartId = fnc.setupApp.selectedChartId();
			var itemId = d.ItemID;

			fnc.setupApp.selectedGLAcctItem(d);

			loadOneItemGLAccountList(chartId, itemId, function () {
				recalculateOneItemGLAccountsTotal();
				$("#modUpdateSplitItem").modal("show");
				setTimeout(function () {
					$('#modUpdateSplitItem').find('.modal-header').css('cursor', 'move');
				});
			});
		};

		self.showGLArrayItems = function (d, e) {
			if ($(e.currentTarget).next('div.popover:visible').length) {
				$(e.currentTarget).popover('destroy');
				return;
			}
			$("[data-toggle='popover']").popover('destroy');
			var content = "<table><tbody>";
			for (var i = 0; i < d.glArray.length; i++) {
				content = content + "<tr style='font-size: 12px;'><td>&nbsp;&nbsp;</td><td>" + d.glArray[i].glDescription + "&nbsp;&nbsp;</td><td>(" + d.glArray[i].glCode + ")&nbsp;&nbsp;</td><td>" + d.glArray[i].Prcnt + "%&nbsp;&nbsp;</td>" + "</tr>";
			}
			content = content + "</tbody></table>";
			$(e.currentTarget).attr("data-content", content);
			$(e.currentTarget).popover("show");
		};

	}

	var glAccountSplitItem = function (it) {
		var self = this;
		self.ChartId = it.ChartId;
		self.GLAccId = it.GLAccId;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccNumber = it.GLAccNumber;
		self.UpdateType = it.updatetype
		self.OriginalPrcnt = Number(it.Prcnt).toFixed(0);

		self.Prcnt = ko.observable(self.OriginalPrcnt);
		self.Prcnt.subscribe(function () {
			recalculateOneItemGLAccountsTotal();
		}, self);

	}

	var categoryClassItem = function (it) {
		var self = this;
		self.CategoryClassId = it.CategoryClassId;
		self.ClassDescription = it.ClassDescription;
	}

	var glArrayItem = function (it) {
		var self = this;
		self.glCode = it.GLAccNumber == null ? "" : it.GLAccNumber;
		self.glDescription = it.GLAccDescription == null ? "" : it.GLAccDescription;
		self.Prcnt = Number(it.Prcnt).toFixed(0);
		//self.glText = it.GLAccId == 0 ? "N/A" : it.GLAccDescription + " (" + it.GLAccNumber + ")";
		self.glText = function () {
			var r = "";
			if (it.GLAccId == '0') {
				r = "N/A";
			} else {
				if (it.GLAccNumber == null) {
					r = it.GLAccDescription + " ()";
				} else {
					r = it.GLAccDescription + " (" + it.GLAccNumber + ")";
				}
			}
			return r;
		}
	};



	//functions

	var createGLAcctChart = function (orgId, chartName, chartId, callback) {
		var params = {};
		params.OrgId = orgId;
		params.ChartName = chartName;
		//Function CreateGLAccountChart(organizationId As Integer, chartName As String, userCode As Integer) As Integer
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.CreateGLAccountChart", params, function (response) {
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

			chartId(r);
			//var obj = r;

			if (callback) callback();
		});
	};

	var modifyGLAcctChart = function (chartId, chartName, callback) {
		var params = {};
		params.ChartId = chartId;
		params.ChartName = chartName;
		loading(true);
		//Sub ModifyGLAccountChart(chartId As Integer, chartName As String, userCode As Integer) 
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.ModifyGLAccountChart", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}


		});
	};

	var useGLAcctChart = function (chartId, orgId, callback) {
		var params = {};
		params.ChartId = chartId;
		params.OrgId = orgId;
		loading(true);
		//Sub GLAccountChartAssignOrganization(chartId As Integer, organizationId As Integer, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountChartAssignOrganization", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var copyGLAcctChart = function (chartId, orgId, newChartId, callback) {
		var params = {};
		params.ChartId = chartId;
		params.OrgId = orgId;
		loading(true);
		//Function CopyGLAccountChart(chartId As Integer, organizationId As Integer, userCode As Integer) As Integer
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.CopyGLAccountChart", params, function (response) {
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
			newChartId(r);
			if (callback) callback();
		});
	};

	//////var glAccountAddItem = function (glAcctId, itemId, prcnt, callback) {
	//////	var params = {};
	//////	params.GLAcctId = glAcctId;
	//////	params.ItemId = itemId;
	//////	params.Prcnt = prcnt;
	//////	//Sub GLAccountAddItem(glAccId As Integer, itemId As Integer, userCode As Integer, prcnt As Double)
	//////	ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountAddItem", params, function (response) {
	//////		if (response.d == '') {
	//////			//success
	//////			if (callback) callback();
	//////			windowResized();
	//////			return;
	//////		}
	//////		var r = eval('(' + response.d + ')');
	//////		if (r.result == 'error') {

	//////			windowResized();
	//////			return;
	//////		}
	//////	});
	//////};

	var glAccountDelItem = function (glAcctId, itemId, callback) {
		var params = {};
		params.GLAcctId = glAcctId;
		params.ItemId = itemId;
		//Sub GLAccountRemoveItem(glAccId As Integer, itemId As Integer, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountRemoveItem", params, function (response) {
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

	//////var glAccountUpdItem = function (glAcctId, itemId, prcnt, callback) {
	//////	var params = {};
	//////	params.GLAcctId = glAcctId;
	//////	params.ItemId = itemId;
	//////	params.Prcnt = prcnt;
	//////	//Sub GLAccountModifyItem(glAccId As Integer, itemId As Integer, prcnt As Double, userCode As Integer)
	//////	ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountModifyItem", params, function (response) {
	//////		if (response.d == '') {
	//////			//success
	//////			if (callback) callback();
	//////			windowResized();
	//////			return;
	//////		}
	//////		var r = eval('(' + response.d + ')');
	//////		if (r.result == 'error') {

	//////			windowResized();
	//////			return;
	//////		}
	//////	});
	//////};

	var loadOneItemGLAccountList = function (chartId, itemId, callback) {

		//GLAccountLoadOneItemList(o.Params.ChartId, o.Params.ItemId)

		var params = {};
		params.ChartId = chartId;
		params.ItemId = itemId;

		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountLoadOneItemList", params, function (response) {
			if (response.d == '') {
				fnc.setupApp.oneItemGLAccounts.removeAll();
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
				obj.forEach(function (it) { arr.push(new glAccountSplitItem(it)) })
			} else {
				arr.push(new glAccountSplitItem(obj))
			}

			fnc.setupApp.oneItemGLAccounts(arr);

			if (callback) callback();
		});

	};

	var recalculateOneItemGLAccountsTotal = function () {
		var total = 0;
		for (var i = 0; i < fnc.setupApp.oneItemGLAccounts().length; i++) {
			total = total + Number(fnc.setupApp.oneItemGLAccounts()[i].Prcnt());
		}
		fnc.setupApp.oneItemGLAccountsTotal(total);
	};

	var getGLAcctCategoryClassList = function (callback) {
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountLoadCategoryClassList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new categoryClassItem(it)) })
			} else {
				arr.push(new chartItem(obj))
			}

			fnc.setupApp.categoryClassList(arr)

			if (callback) callback();
		});

	};

	var getGLAcctChartList = function (callback) {
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.LoadGLAccountChartList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new chartItem(it)) })
			} else {
				arr.push(new chartItem(obj))
			}

			for (var i = 0; i < arr.length; i++) {
				if (arr[i].ChartId() != "0") fnc.setupApp.initialSetup(false);
			}

			fnc.setupApp.allGLCharts(arr)

			if (callback) callback();
		});
	};

	//******************************
	//******** <sales> *************
	//******************************

	//sales objects

	var salesChartItem = function (it) {
		var self = this;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.OriginalChartName = ko.observable(it.ChartName);
		self.ChartId = ko.observable(it.ChartId);
		self.ChartName = ko.observable(it.ChartName);
		self.Selected = ko.observable(false);

		self.TrackDeposit = ko.observable(it.TrackDeposit == '1');
		self.TrackMealPeriod = ko.observable(it.TrackMealPeriod == '1');

		self.updateChartName = function (d, e) {
			if (d.ChartName() != d.OriginalChartName()) {
				modifySalesChart(d.ChartId(), d.ChartName(), d.TrackDeposit(), d.TrackMealPeriod(), function () {
					getSalesChartList(function () {
						windowResized();
					})
				})
			}
		};

		self.updateChartFlags = function (d, e) {
			if (d.ChartId() != '0') {
				e.stopPropagation();
				e.preventDefault();

				modifySalesChart(d.ChartId(), d.ChartName(), d.TrackDeposit(), d.TrackMealPeriod(), function () {
					getSalesChartList(function () {
						windowResized();
					});
				});
			} else {
				return true;
			}

		};

		self.createChart = function (d, e) {
			var orgId = d.OrgId;
			var chartName = d.OrgName;
			var trackDeposits = self.TrackDeposit();
			var trackMealPeriod = self.TrackMealPeriod();
			createSalesChart(orgId, chartName, d.ChartId, trackDeposits, trackMealPeriod, function () {
				if (d.ChartId()) {
					//successfully created with a new ID <> '0' ;
					d.ChartName(chartName);
					modifySalesChart(d.ChartId(), d.ChartName(), trackDeposits, trackMealPeriod, function () {
						if (trackMealPeriod) {
							fnc.setupApp.selectedSetupId('sales-meal-period-panel');
						} else {
							fnc.setupApp.selectedSetupId('sales-gl-accounts-panel');
						}
						

						fnc.setupApp.selectedSalesChartId(d.ChartId());
						//$('#tblSalesGLAccounts').editableTableWidget();
						windowResized();
					})
				}
			})
		};

		self.manageChart = function (d, e) {
			fnc.setupApp.selectedSetupId('sales-gl-accounts-panel');
			fnc.setupApp.selectedSalesChartId(d.ChartId());
			//$('#tblSalesGLAccounts').editableTableWidget();
			windowResized();
		};

		self.chooseChart = function (d, e) {
			$(e.currentTarget.parentNode).on('show.bs.dropdown', function () { d.Selected(true); });
			$(e.currentTarget.parentNode).on('hide.bs.dropdown', function () { d.Selected(false); });
			fnc.setupApp.selectedOrgId(d.OrgId);
			fnc.setupApp.selectedOrgName(d.OrgName);
		};

		self.useChart = function (d, e) {
			var orgId = fnc.setupApp.selectedOrgId();
			var chartId = d.ChartId();
			var chartName = d.ChartName();
			var trackDeposit = d.TrackDeposit();
			var trackMealPeriod = d.TrackMealPeriod();

			useSalesGLAcctChart(chartId, orgId, function () {
				//update current screen (allSalesCharts)
				var arr = fnc.setupApp.allSalesCharts();
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].OrgId == orgId) {
						arr[i].ChartId(chartId);
						arr[i].ChartName(chartName);
						arr[i].TrackDeposit(trackDeposit);
						arr[i].TrackMealPeriod(trackMealPeriod);
						getSalesChartList(function () {
							windowResized();
						});
						break;
					}
				}
			})
		};

		self.copyChart = function (d, e) {
			var orgId = fnc.setupApp.selectedOrgId();
			var orgName = fnc.setupApp.selectedOrgName();
			var chartId = d.ChartId();
			var chartName = d.ChartName();
			var trackDeposit = d.TrackDeposit();
			var trackMealPeriod = d.TrackMealPeriod();
			var newChartId = ko.observable(null);
			copySalesGLAcctChart(chartId, orgId, newChartId,  function () {
				//update current screen (allSalesCharts)
				var arr = fnc.setupApp.allSalesCharts();
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].OrgId == orgId) {
						arr[i].ChartId(newChartId());
						arr[i].ChartName(orgName);
						arr[i].TrackDeposit(trackDeposit);
						arr[i].TrackMealPeriod(trackMealPeriod);
						getSalesChartList(function () {
							//switch to sales-gl-accounts-panel		
							fnc.setupApp.selectedSetupId('sales-gl-accounts-panel');
							fnc.setupApp.selectedSalesChartId(newChartId());
							fnc.setupApp.selectedSalesChartId.valueHasMutated();
							windowResized();
						})
						break;
					}
				}
			})
		};

		self.isCreateVisible = ko.computed(function () {
			return self.ChartId() == 0;
		}, self);

		self.isManageVisible = ko.computed(function () {
			return self.ChartId() != 0;
		}, self);
		self.isChooseVisible = ko.computed(function () {
			return self.ChartId() == 0 && fnc.setupApp.uniqueGLCharts().length > 0;
		}, self);
	};

	var salesGLAccountItem2 = function (it) {
		var self = this;
		self.ChartId = it.chartid;
		self.GLAccId = it.glaccid;
		self.originalNumber = it.GLAccNumber;
		self.originalDescription = it.GLAccDescription;
		self.GLAccNumber = ko.observable(it.GLAccNumber);
		self.GLAccDescription = ko.observable(it.GLAccDescription);
		self.ClassIds = it.ClassIds;
		self.MealPeriodIds = it.MealPeriodIds;
		self.Taxable = ko.observable(it.Taxable == '1');

		self.ClassNames = ko.computed(function () {
			var str = self.ClassIds;
			var arr = fnc.setupApp.salesCategoryClasses();
			var r = [];
			for (var i = 0; i < arr.length; i++) {
				if (str.indexOf(arr[i].ClassId) != -1) {
					r.push(arr[i].ClassDescription);
				}
			}
			return r.join();
		}, self);

		self.MealPeriodNames = ko.computed(function () {
			var str = self.MealPeriodIds;
			var arr = fnc.setupApp.salesMealPeriods();
			var r = [];
			for (var i = 0; i < arr.length; i++) {
				if (str.indexOf(arr[i].MealPeriodId) != -1) {
					r.push(arr[i].MealPeriodDescription());
				}
			}
			return r.join();
		}, self);

		self.showManageItemDialog = function (d, e) {
			fnc.setupApp.selectedSalesGLAccount(d);
			//
			var str1 = d.ClassIds;
			var arr = fnc.setupApp.salesCategoryClasses();
			for (var i = 0; i < arr.length; i++) {
				if (str1.indexOf(arr[i].ClassId) != -1) {
					arr[i].Selected(true);
				}
			}
			//
			var str2 = d.MealPeriodIds;
			var arr2 = fnc.setupApp.salesMealPeriods();
			for (var i = 0; i < arr2.length; i++) {
				if (str2.indexOf(arr2[i].MealPeriodId) != -1) {
					arr2[i].Selected(true);
				}
			}
			//
			$('#modSalesGLAcct').modal('show');
			$('#modSalesGLAcct').one('hidden.bs.modal', function (e) {

				for (var i = 0; i < fnc.setupApp.salesCategoryClasses().length; i++) {
					fnc.setupApp.salesCategoryClasses()[i].Selected(false);
				}
				for (var i = 0; i < fnc.setupApp.salesMealPeriods().length; i++) {
					fnc.setupApp.salesMealPeriods()[i].Selected(false);
				}
				fnc.setupApp.selectedSalesGLAccount(null);

				//fnc.setupApp.newSalesSelectedClasses.removeAll();
				//fnc.setupApp.newSalesSelectedMealPeriods.removeAll();
			})
		};

		self.showConfirmDeleteItemDialog = function (d, e) {
			fnc.setupApp.selectedSalesGLAccount(d);

			$('#modConfirmDelSalesGLAcct').modal('show');
			$('#modConfirmDelSalesGLAcct').one('hidden.bs.modal', function (e) {
				fnc.setupApp.selectedSalesGLAccount(null);
			});
		};

		self.GLAccText = self.GLAccNumber() == null ? self.GLAccDescription() : self.GLAccDescription() + " (" + self.GLAccNumber() + ")";

	}

	var salesMealPeriodItem = function (it) {
		var self = this;
		self.Assigned = it.Assigned;
		self.DisplayOrder = ko.observable(it.DisplayOrder);
		self.MealPeriodId = it.MealPeriodId;
		self.OriginalMealPeriodDescription = it.MealPeriodDescription;
		self.MealPeriodDescription = ko.observable(it.MealPeriodDescription);

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				fnc.setupApp.newSalesSelectedMealPeriods.push(self.MealPeriodId);
			} else {
				fnc.setupApp.newSalesSelectedMealPeriods.remove(self.MealPeriodId);
			}
		})

		self.updateMealPeriodDescription = function (d, e) {
			if (self.OriginalMealPeriodDescription != self.MealPeriodDescription()) {
				var mealPeriodId = self.MealPeriodId;
				var chartId = fnc.setupApp.selectedSalesChartId();
				var description = self.MealPeriodDescription();

				modifyMealPeriodDescription(mealPeriodId, chartId, description, function () {
					getSalesMealPeriodList(chartId, function () {
						windowResized();
					});
				});
			}
		};

		self.showConfirmDeleteDialog = function (d, e) {
			fnc.setupApp.selectedMealPeriod(d);

			$('#modConfirmDelMealPeriod').modal('show');
			$('#modConfirmDelMealPeriod').one('hidden.bs.modal', function (e) {
				fnc.setupApp.selectedMealPeriod(null);
			});

		};

	};

	var salesCategoryClassItem = function (it) {
		var self = this;
		self.ClassId = it.ClassId;
		self.ClassDescription = it.ClassDescription;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				fnc.setupApp.newSalesSelectedClasses.push(self.ClassId);
			} else {
				fnc.setupApp.newSalesSelectedClasses.remove(self.ClassId);
			}
		})
	};

	var salesLocationItem = function (it) {
		var self = this;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.DepositMethodExists = it.DepositMethodExists;

	};

	var salesDepositMethodItem = function (it) {
		//GLAccNumber: null
		//MethodCode: "2002"
		//MethodDescription: "Master"
		//MethodId: "28"
		//TypeId: "2"
		//TypeName: "Credit Card"
		var self = this;
		self.OriginalGLAccNumber = it.GLAccNumber;
		self.GLAccNumber = ko.observable(it.GLAccNumber);
		self.MethodId = it.MethodId;
		self.OriginalMethodCode = it.MethodCode;
		self.OriginalMethodDescription = it.MethodDescription;
		self.OriginalTypeId = it.TypeId;
		self.TypeId = ko.observable(it.TypeId);
		self.TypeName = it.TypeName == null ? '' : it.TypeName;

		self.MethodCode = ko.observable(it.MethodCode);
		self.MethodDescription = ko.observable(it.MethodDescription);

		self.updateDepositMethodItem = function (d, e) {
			if ((self.OriginalMethodCode != self.MethodCode()) || (self.OriginalMethodDescription != self.MethodDescription()) || (self.OriginalGLAccNumber != self.GLAccNumber())) {
				var methodId = self.MethodId;
				var typeId = self.TypeId();
				var methodCode = self.MethodCode();
				var glAccNo = self.GLAccNumber();
				var methodDescription = self.MethodDescription();

				modifyDepositMethod(methodId, typeId, methodCode, glAccNo, methodDescription, function () {
					loadDepositMethodList(fnc.setupApp.selectedSalesDepositOrgId(), fnc.setupApp.salesDepositMethodList, function () {
						windowResized();
					});
				});
			}
		};



		self.showConfirmDeleteDialog = function (d, e) {
			fnc.setupApp.selectedSalesDepositMethod(d);
			windowResized();
			$('#modConfirmDelDepositMethod').modal('show');
			$('#modConfirmDelDepositMethod').one('hidden.bs.modal', function (e) {
				fnc.setupApp.selectedSalesDepositMethod(null);
			});

		};

	};

	var salesDepositTypeItem = function (it) {
		//TypeId: "1", TypeName: "Cash"
		var self = this;
		self.TypeId = it.TypeId;
		self.TypeName = it.TypeName;

		self.Selected = ko.observable(false);
	};

	//sales functions

	var loadSalesGLTypes = function () { };

	var loadSalesMealTypes = function () { };

	var loadSalesDepositTypes = function () { };

	var loadSalesClassList = function (callback) {
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadClassList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new salesCategoryClassItem(it)) })
			} else {
				arr.push(new salesCategoryClassItem(obj))
			}

			fnc.setupApp.salesCategoryClasses(arr)

			if (callback) callback();
		});

	};

	var getSalesChartList = function (callback) {
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadGLAccountChartList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new salesChartItem(it)) })
			} else {
				arr.push(new salesChartItem(obj))
			}

			//for (var i = 0; i < arr.length; i++) {
			//	if (arr[i].ChartId() != "0") fnc.setupApp.initialSetup(false);
			//}

			fnc.setupApp.allSalesCharts(arr)

			if (callback) callback();
		});
	};

	var createSalesChart = function (orgId, chartName, chartId, trackDeposits, trackMealPeriod, callback) {
		var params = {};
		params.OrgId = orgId;
		params.ChartName = chartName;
		params.TrackDeposit = trackDeposits;
		params.TrackMealPeriod = trackMealPeriod;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.CreateGLAccountChart", params, function (response) {
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

			chartId(r);

			if (callback) callback();
		});
	};

	var modifySalesChart = function (chartId, chartName, trackDeposits, trackMealPeriod, callback) {
		var params = {};
		params.ChartId = chartId;
		params.ChartName = chartName;
		params.TrackDeposit = trackDeposits;
		params.TrackMealPeriod = trackMealPeriod;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.ModifyGLAccountChart", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});

	};

	var getSalesGLAcctListByChartId = function (chartId, orgId, callback) {
		fnc.setupApp.allSalesGLAccounts.removeAll();

		if (chartId == null || chartId == 0) {
			if (callback) callback();
			return;
		}

		var params = {};
		params.ChartId = chartId;
		params.OrgId = orgId;

		loading(true);
		//Function LoadGLAccountList(chartId As Integer) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadGLAccountList", params, function (response) {
			loading(false);
			resetSalesNewGLAcctVM();
			if (response.d == '') {
				//fnc.setupApp.allSalesGLAccounts.removeAll();
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
				obj.forEach(function (it) { arr.push(new salesGLAccountItem2(it)) })
			} else {
				arr.push(new salesGLAccountItem2(obj))
			}

			fnc.setupApp.allSalesGLAccounts(arr);

			if (callback) callback();
		});
	};

	var createSalesGLAccount = function (chartId, acctNo, acctDesc, taxable, glAcctId, mealPeriodIds, clsIds, callback) {
		var params = {};
		params.ChartId = chartId;
		params.GLAcctNumber = acctNo;
		params.GLAcctDescription = acctDesc;
		params.MealPeriodIds = mealPeriodIds;
		params.ClassIds = clsIds;
		params.Taxable = taxable;

		//Function CreateGLAccount(chartId As Integer, glAccountNumber As String, glAccountDescription As String, o.Params.CategoryClassId, userCode As Integer) As Integer
		//CreateGLAccount(o.Params.ChartId, o.Params.GLAcctNumber, o.Params.GLAcctDescription, o.Params.MealPeriodIds, o.Params.ClassIds, o.uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.CreateGLAccount", params, function (response) {
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			//glAcctId(r);
			var obj = r;

			if (callback) callback();
		});
	};

	var getSalesMealPeriodList = function (chartId, callback) {
		fnc.setupApp.salesMealPeriods.removeAll();

		if (chartId == null || chartId == 0) {
			if (callback) callback();
			return;
		}
		var params = {};
		params.ChartId = chartId;

		loading(true);
		//Function LoadGLAccountList(chartId As Integer) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadMealPeriodList", params, function (response) {
			loading(false);
			if (response.d == '') {
				//fnc.setupApp.salesMealPeriods.removeAll();
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
				obj.forEach(function (it) { arr.push(new salesMealPeriodItem(it)) })
			} else {
				arr.push(new salesMealPeriodItem(obj))
			}

			fnc.setupApp.salesMealPeriods(arr);
			
			if (callback) callback();
		});
	};

	var createMealPeriod = function (chartId, mealPeriodDesc, callback) {
		var params = {};
		params.ChartId = chartId;
		params.MealPeriodDescription = mealPeriodDesc;

		//Function CreateMealPeriod(chartId As Integer, mealPeriodDescription As String, userCode As Integer) As Integer
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.CreateMealPeriod", params, function (response) {
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			//glAcctId(r);
			var obj = r;

			if (callback) callback();
		});
	};

	var modifySalesGLAccount = function (glAccId, chartId, glAccNo, glAccDescription, taxable, mealPeriodIds, classIds, callback) {
		var params = {};
		params.GLAcctId = glAccId;
		params.ChartId = chartId;
		params.GLAcctNumber = glAccNo == null ? "" : glAccNo;
		params.GLAcctDescription = glAccDescription;
		params.MealPeriodIds = mealPeriodIds;
		params.ClassIds = classIds;
		params.Taxable = taxable;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.ModifyGLAccount", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var modifyMealPeriodMove = function (mealPeriodId, chartId, moveTo, callback) {
		//ModifyMealPeriod_Move(o.Params.MealPeriodId, o.Params.ChartId, o.Params.MoveTo, o.uc)
		var params = {};
		params.MealPeriodId = mealPeriodId;
		params.ChartId = chartId;
		params.MoveTo = moveTo;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.ModifyMealPeriod_Move", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var modifyMealPeriodDescription = function (mealPeriodId, chartId, description, callback) {
		//ModifyMealPeriod(o.Params.MealPeriodId, o.Params.ChartId, o.Params.MealPeriodDescription, o.uc)
		var params = {};
		params.MealPeriodId = mealPeriodId;
		params.ChartId = chartId;
		params.MealPeriodDescription = description;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.ModifyMealPeriod", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var deleteMealPeriod = function (mealPeriodId, chartId, callback) {
		var params = {};
		params.MealPeriodId = mealPeriodId;
		params.ChartId = chartId;

		//DeleteMealPeriod(o.Params.MealPeriodId, o.Params.ChartId, o.uc)
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.DeleteMealPeriod", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};


	var useSalesGLAcctChart = function (chartId, orgId, callback) {
		var params = {};
		params.ChartId = chartId;
		params.OrgId = orgId;
		loading(true);
		//Sub GLAccountChartAssignOrganization(chartId As Integer, organizationId As Integer, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.GLAccountChartAssignOrganization", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var copySalesGLAcctChart = function (chartId, orgId, newChartId, callback) {
		var params = {};
		params.ChartId = chartId;
		params.OrgId = orgId;
		loading(true);
		//Function CopyGLAccountChart(chartId As Integer, organizationId As Integer, userCode As Integer) As Integer
		//o.Params.ChartId, o.Params.OrgId, o.uc

		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.CopyGLAccountChart", params, function (response) {
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
			newChartId(r);
			if (callback) callback();
		});
	};

	var deleteSalesGLAccount = function (glAccId, chartId, callback) {
		var params = {};
		params.GLAcctId = glAccId;
		params.ChartId = chartId;

		//DeleteGLAccount(o.Params.GLAcctId, o.Params.ChartId, o.uc)
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.DeleteGLAccount", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});		
	};

	var getSalesDepositLocationList = function (depositLocationList, callback) {
		//Public Function LoadDepositMethodLocationList(userCode As Integer) As String
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadDepositMethodLocationList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new salesLocationItem(it)) })
			} else {
				arr.push(new salesLocationItem(obj))
			}

			depositLocationList(arr)

			if (callback) callback();
		});
	};

	var createDepositMethod = function (methodCode, methodDescription, typeId, glAccNumber, orgId, callback) {
		var params = {};
		params.TypeId = typeId;
		params.MethodCode = methodCode;
		params.MethodDescription = methodDescription;
		params.GLAcctNumber = glAccNumber;
		params.OrgId = orgId;		

		//client.CreateDepositMethod(o.Params.MethodCode, o.Params.MethodDescription, o.Params.OrgId, o.uc).ToString
		//CreateDepositMethod(o.Params.TypeId, o.Params.MethodCode, o.Params.MethodDescription, o.Params.OrgId, o.uc).ToString
		//Public Function CreateDepositMethod(typeId As Integer, methodCode As String, methodDescription As String, glAccNumber As String, organizationId As Integer, userCode As Integer) As Integer
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.CreateDepositMethod", params, function (response) {
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			//glAcctId(r);
			var obj = r;

			if (callback) callback();
		});
	};

	var deleteDepositMethod = function (methodId, callback) {
		//Public Sub DeleteDepositMethod(methodId As Integer, userCode As Integer)
		var params = {};
		params.methodId = methodId;

		//DeleteMealPeriod(o.Params.MealPeriodId, o.Params.ChartId, o.uc)
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.DeleteDepositMethod", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};
	
	var loadDepositMethodList = function (orgId, methodList, callback) {
		//Public Function LoadDepositMethodList(organizationId As Integer) As String
		var params = {};
		params.OrgId = orgId;

		methodList.removeAll();

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadDepositMethodList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new salesDepositMethodItem(it)) })
			} else {
				arr.push(new salesDepositMethodItem(obj))
			}

			methodList(arr)

			if (callback) callback();
		});
	};
	
	var copyDepositMethod = function (orgIdFrom, orgIdTo, callback) {
		//CopyDepositMethod(o.Params.OrgIdFrom, o.Params.OrgIdTo, o.uc)
		var params = {};
		params.orgIdFrom = orgIdFrom;
		params.orgIdTo = orgIdTo;

		//DeleteMealPeriod(o.Params.MealPeriodId, o.Params.ChartId, o.uc)
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.CopyDepositMethod", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var modifyDepositMethod = function (methodId, typeId, methodCode, glAccNo, methodDescription, callback) {
		//ModifyDepositMethod(o.Params.MethodId, o.Params.MethodCode, o.Params.MethodDescription, o.uc)
		//Public Sub ModifyDepositMethod(methodId As Integer, tyepId As Integer, methodCode As String, methodDescription As String, userCode As Integer)
		//ModifyDepositMethod(o.Params.MethodId, o.Params.TypeId, o.Params.MethodCode, o.Params.GLAcctNumber, o.Params.MethodDescription, o.uc)
		var params = {};
		params.MethodId = methodId;
		params.TypeId = typeId;
		params.MethodCode = methodCode;
		params.GLAcctNumber = glAccNo;
		params.MethodDescription = methodDescription;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.ModifyDepositMethod", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var loadDepositTypeList = function (typeList, callback) {
		//Public Function LoadDepositTypeList() As String
		var params = {};

		typeList.removeAll();

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadDepositTypeList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new salesDepositTypeItem(it)) })
			} else {
				arr.push(new salesDepositTypeItem(obj))
			}

			typeList(arr)

			if (callback) callback();
		});
	}

	var checkTrackMealPeriod = function (chartId) {
		var r = false;
		arr = fnc.setupApp.uniqueSalesCharts();
		for (var i = 0; i < arr.length; i++ ){
			if (arr[i].ChartId() == chartId && arr[i].TrackMealPeriod() == true) {
				r = true;
			}
		}
		//??? sets selected for 'Not TrackMealPeriod' and meal period 'All Day' ???
		if (fnc.setupApp.salesMealPeriods().length == 1 && r == false) {
			fnc.setupApp.salesMealPeriods()[0].Selected(true);
		}
		return r;
	}

	var resetSalesNewGLAcctVM = function () {
		//fnc.setupApp.newGLAcctCategoryClassId('');
		//fnc.setupApp.newGLAcctDescription('');
		//fnc.setupApp.newGLAcctId(null);
		//fnc.setupApp.newGLAcctNumber('');
	};

	//******************************
	//******** </sales> ************
	//******************************

	var getOrganizationDTFRules = function (callback) {
		//LoadOrganizationStartDate
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOrganizationDTFRules", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new orgDTFRuleItem(it)) })
			} else {
				arr.push(new orgDTFRuleItem(obj))
			}

			fnc.setupApp.allOrgDTFRules(arr);

			if (callback) callback();
		});

	};

	var getGLAcctListByOrgId = function (orgId, callback) {

		var params = {};
		params.OrgId = orgId;

		loading(true);
		//Function LoadGLAccountList(chartId As Integer) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.LoadGLAccountList", params, function (response) {
			loading(false);
			if (response.d == '') {
				fnc.setupApp.selectedOrgGLAccounts.removeAll();
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
				obj.forEach(function (it) { arr.push(new glAccountItem2(it)) })
			} else {
				arr.push(new glAccountItem2(obj))
			}

			fnc.setupApp.selectedOrgGLAccounts(arr);

			if (callback) callback();
		});
	};

	var setDefaultDTFRule = function (orgId, callback) {
		var params = {};
		params.OrganizationId = orgId;

		loading(true);
		//SetDefaultDTFRule(o.Params.OrganizationId, .uc)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.SetDefaultDTFRule", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};







	var getOrganizationStartDate = function (callback) {
		//LoadOrganizationStartDate
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadOrganizationStartDate", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new orgStartDateItem(it)) })
			} else {
				arr.push(new orgStartDateItem(obj))
			}

			fnc.setupApp.allOrgStartDate(arr);

			if (callback) callback();
		});

	};

	var getGLAcctListByChartId = function (chartId, callback) {
		if (chartId == null || chartId == 0) {
			fnc.setupApp.allGLAccounts.removeAll();
			if (callback) callback();
			return;
		}
		var params = {};
		params.ChartId = chartId;
		
		loading(true);
		//Function LoadGLAccountList(chartId As Integer) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.LoadGLAccountList", params, function (response) {
			loading(false);
			resetNewGLAcctVM();
			if (response.d == '') {
				fnc.setupApp.allGLAccounts.removeAll();
				//if (callback) callback();
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
				obj.forEach(function (it) { arr.push(new glAccountItem2(it)) })
			} else {
				arr.push(new glAccountItem2(obj))
			}

			fnc.setupApp.allGLAccounts(arr);

			if (callback) callback();
		});
	};

	var getGLItemList = function (chartId, accId, callback) {
		fnc.setupApp.oneGLAccountItems.removeAll();
		if (chartId == null || chartId == 0) return;
		var params = {};
		params.ChartId = chartId;
		params.GLAcctId = accId;
		loading(true);
		//LoadGLAccountItemList(o.Params.ChartId, o.Params.GLAcctId)
		ajaxPostXML("ChefMod.Financials.UI.Controllers.GLAccounts.LoadGLAccountItemList", params, function (response) {
			loading(false);
			if (response == '') {
				//if (response.d == '') {
				fnc.setupApp.oneGLAccountItems.removeAll();
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
				obj.forEach(function (it) { arr.push(new glAccountItem3(it)) })
			} else {
				arr.push(new glAccountItem3(obj))
			}

			fnc.setupApp.oneGLAccountItems(arr);

			if (callback) callback();
		});

	};

	var createGLAccountsByCategory = function (chartId, callback) {
		var params = {};
		params.ChartId = chartId;
		loading(true);
		//Public Sub CreateGLAccountsByCategory(chartId As Integer, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.CreateGLAccountsByCategory", params, function (response) {
			loading(false);
			if (response.d == '') {
				//success
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var createGLAccount = function (chartId, acctNo, acctDesc, glAcctId, catClsId, callback) {
		var params = {};
		params.ChartId = chartId;
		params.GLAcctNumber = acctNo;
		params.GLAcctDescription = acctDesc;
		params.CategoryClassId = catClsId;

		//Function CreateGLAccount(chartId As Integer, glAccountNumber As String, glAccountDescription As String, o.Params.CategoryClassId, userCode As Integer) As Integer
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.CreateGLAccount", params, function (response) {
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			glAcctId(r);
			//var obj = r;

			if (callback) callback();
		});
	};

	var modifyGLAccount = function (glAcctId, chartId, acctNo, acctDesc, catClsId, callback) {
		//validate
		//if (!acctNo) return;

		var params = {};
		params.GLAcctId = glAcctId;
		params.ChartId = chartId;
		params.GLAcctNumber = acctNo;
		params.GLAcctDescription = acctDesc;
		params.CategoryClassId = catClsId;
		//Sub ModifyGLAccount(glAccId As Integer, chartId As Integer, glAccountNumber As String, glAccountDescription As String, o.Params.CategoryClassId, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.ModifyGLAccount", params, function (response) {
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	};

	var modifyDTFRule = function (orgId, disctRule, disctAccId, taxRule, taxAccId, freightRule, freightAccId, callback) {
		//ModifyDTFRule(o.Params.OrganizationId, o.Params.DiscountRule, o.Params.DiscountAccId, o.Params.TaxRule, o.Params.TaxAccId, o.Params.FreightRule, o.Params.FreightAccId, o.uc)

		var params = {};
		params.OrganizationId = orgId;
		params.DiscountRule = disctRule;
		params.DiscountAccId = disctAccId;
		params.TaxRule = taxRule;
		params.TaxAccId = taxAccId;
		params.FreightRule = freightRule;
		params.FreightAccId = freightAccId;

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ModifyDTFRule", params, function (response) {
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});

	};

	var doGlobalItemsSearch = function (chartId, searchString, callback) {
		var params = {};
		params.ChartId = chartId;
		params.SearchString = searchString;

		//Function GLAccountSearchItems(o.Params.ChartId, o.Params.SearchString) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.GLAccountSearchItems", params, function (response) {

			if (response.d == '') {
				fnc.setupApp.allGLAccountsItems.removeAll();
				//if (callback) callback();
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			//////var obj = JSON.parse(response.d).result.row;
			//////var arr = [];

			//////if (obj[0]) {
			//////	obj.forEach(function (it) { arr.push(new glAccountItem3(it)) })
			//////} else {
			//////	arr.push(new glAccountItem3(obj))
			//////}

			//////fnc.setupApp.allGLAccountsItems(arr);

			//////if (callback) callback();

			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			var arrItem;
			var itemId;

			if (obj[0]) {
				obj.forEach(function (it) {
					if (itemId != it.ItemId) {
						itemId = it.ItemId;
						arrItem = new glAccountItem3(it);
						arrItem.glArray.push(new glArrayItem(it));
						arr.push(arrItem);
					} else {
						arr[arr.length - 1].glArray.push(new glArrayItem(it));
					}
				})
			} else {
				arrItem = new glAccountItem3(obj);
				arrItem.glArray.push(new glArrayItem(obj));
				arr.push(arrItem);
			}

			fnc.setupApp.allGLAccountsItems(arr);

			if (callback) callback();

		});

	};

	var modifyOrgStartDate = function (orgId, startDate, callback) {
		var params = {};
		params.OrgsIds = orgId;
		params.FromDate = startDate;
		loading(true);
		//Sub ModifyOrganizationStartDate(organizationId As Integer, startDate As Date, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.ModifyOrganizationStartDate", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
		});
	}

	var resetNewGLAcctVM = function () {
		fnc.setupApp.newGLAcctCategoryClassId('');
		fnc.setupApp.newGLAcctDescription('');
		fnc.setupApp.newGLAcctId(null);
		fnc.setupApp.newGLAcctNumber('');
	}


	//********************************
	//public
	//********************************
	var self = this;
	self.init = function (callback) {
		//console.log('setup init');
		resetNewGLAcctVM();

		//reset
		fnc.setupApp.searchStartDayFilter('');
		fnc.setupApp.searchGLChartFilter('');
		fnc.setupApp.selectedChartId(null);
		fnc.setupApp.searchGLAccountItemsFilter('');
		fnc.setupApp.searchDTFRulesFilter('');

		fnc.setupApp.searchSalesChartFilter('');
		fnc.setupApp.selectedSalesChartId(null);
		fnc.setupApp.allSalesGLAccounts.removeAll();
		//
		getOrganizationStartDate(function () {
			getGLAcctChartList(function () {
				windowResized();
			});
			getGLAcctCategoryClassList(function () { windowResized(); });
			getOrganizationDTFRules(function () { windowResized(); });

			//sales
			getSalesChartList(function () { windowResized(); });

			getSalesDepositLocationList(self.salesDepositLocationList, function () { windowResized(); });

			loadDepositTypeList(self.salesDepositTypeList, function () { windowResized(); });

			self.selectedSetupId('manage-start-date-panel');
			if (callback) callback();
			windowResized();
		});
		
	}

	self.initialSetup = ko.observable(true);

	self.categoryClassList = ko.observableArray();
	self.selectedCategory = ko.observable();

	self.selectedSetupId = ko.observable(null);
	self.selectedSetupId.subscribe(function () {
		if (self.selectedSetupId() == 'manage-gl-accts-panel') {
			//var chartId = self.selectedChartId();
			//getGLAcctListByChartId(chartId, function () {
				$('#tblGLAccounts').editableTableWidget();
				windowResized();
			//});
		}
		if (self.selectedSetupId() == 'manage-dtf-panel') {
			//console.log('manage-dtf-panel');
		}
	}, self);

	//
	self.selectedOrgId = ko.observable(0);
	self.selectedOrgName = ko.observable(null);

	// DTF
	self.allOrgDTFRules = ko.observableArray();
	self.searchDTFRulesFilter = ko.observable('');
	self.searchDTFRulesFilter.subscribe(function () {
		setTimeout(function () { windowResized(); })
	}, self);
	self.filteredOrgDTFRules = ko.computed(function () {
		var searchDTFRulesFilter = self.searchDTFRulesFilter().toLowerCase();
		searchDTFRulesFilter = searchDTFRulesFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchDTFRulesFilter.length < 3) {
			var r = self.allOrgDTFRules();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allOrgDTFRules(), function (item) {
				var words = searchDTFRulesFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null));
				}
				return found;
			});
		}

	}, self);
	self.selectedOrgDTFRules = ko.observable(null);
	self.selectedOrgGLAccounts = ko.observableArray();

	//org start date
	self.allOrgStartDate = ko.observableArray();
	self.searchStartDayFilter = ko.observable('');
	self.searchStartDayFilter.subscribe(function () {
		setTimeout(function () { windowResized(); });
	}, self);

	self.filteredOrgStartDate = ko.computed(function () {
		var searchStartDayFilter = self.searchStartDayFilter().toLowerCase();
		searchStartDayFilter = searchStartDayFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchStartDayFilter.length < 3) {
			var r = self.allOrgStartDate();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allOrgStartDate(), function (item) {
				var words = searchStartDayFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);

	//gl chart list
	self.allGLCharts = ko.observableArray();
	self.searchGLChartFilter = ko.observable('');
	self.searchGLChartFilter.subscribe(function () {
		setTimeout(function () { windowResized(); });
	}, self);
	self.filteredGLCharts = ko.computed(function () {
		var searchGLChartFilter = self.searchGLChartFilter().toLowerCase();
		searchGLChartFilter = searchGLChartFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchGLChartFilter.length < 3) {
			var r = self.allGLCharts();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allGLCharts(), function (item) {
				var words = searchGLChartFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null) || ((item.ChartName() + '').toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	self.uniqueGLCharts = ko.computed(function () {
		//return ko.utils.arrayFilter(self.allGLCharts(), function (item) {
		//	return item.ChartId() != 0;
		//});
		var charts = self.allGLCharts();
		var o = {};
		var r = [];
		if (charts.length) {
			for (var i = 0; i < charts.length; i++) {
				if (charts[i].ChartId() != 0) {
					o[charts[i].ChartId()] = charts[i];
				}
			}
			for (i in o)
				r.push(o[i]);
		}
		return r;
	}, self);
	self.selectedChartId = ko.observable(null);
	self.selectedChartId.subscribe(function () {
		if (self.selectedSetupId() == 'manage-gl-accts-panel') {
			//self.allGLAccounts.removeAll();
			var chartId = self.selectedChartId();
			getGLAcctListByChartId(chartId, function () {
				$('#tblGLAccounts').editableTableWidget();
				windowResized();
			});
		}
		if (self.selectedSetupId() == 'manage-gl-assignment-panel') {
			var chartId = self.selectedChartId();
			getGLAcctListByChartId(chartId, function () {
				windowResized();
			});
		}
		//console.log(self.selectedChartId());
	}, self);

	//gl account list
	self.allGLAccounts = ko.observableArray();
	self.newGLAcctId = ko.observable(null);
	self.newGLAcctNumber = ko.observable('');
	self.newGLAcctDescription = ko.observable('');
	self.newGLAcctCategoryClassId = ko.observable('');

	self.selectedGLAccount = ko.observable(null);
	self.selectedGLAccId = ko.observable(0);
	self.selectedGLAccId.subscribe(function () {
		if (self.selectedSetupId() == 'manage-gl-assignment-panel') {
			var chartId = self.selectedChartId();
			var accId = self.selectedGLAccId();
			getGLItemList(chartId, accId, function () {
				self.searchGLAccountItemsFilter('');
				self.searchGLAccountItemsCount(20);
				windowResized();
			});
		}
	}, self);

	//gl account items 
	self.oneGLAccountItems = ko.observableArray();
	self.selectedGLAcctItem = ko.observable(null);
	self.searchGLAccountItemsCount = ko.observable(20);
	self.searchGLAccountItemsFilter = ko.observable('');
	self.searchGLAccountItemsFilter.subscribe(function () {
		if (self.searchGLAccountItemsFilter() == '') {
			self.searchGLAccountItemsCount(20);
		}
	}, self);
	self.filteredGLAccountItems = ko.computed(function () {
		var searchGLAccountItemsFilter = self.searchGLAccountItemsFilter().toLowerCase();
		searchGLAccountItemsFilter = searchGLAccountItemsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchGLAccountItemsFilter.length < 3) {
			var r = self.oneGLAccountItems();
			return r;
		} else {
			var n = 0;
			return ko.utils.arrayFilter(self.oneGLAccountItems(), function (item) {
				n++;
				var words = searchGLAccountItemsFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.ItemID.toLowerCase().match(re) != null) || (item.Description.toLowerCase().match(re) != null) || ((item.Brand + '').toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	self.filteredGLAccountItems2 = ko.computed(function () {
		return self.filteredGLAccountItems().slice(0, self.searchGLAccountItemsCount());
	}, self);

	//
	self.oneItemGLAccounts = ko.observableArray();
	self.oneItemGLAccountsTotal = ko.observable(0);

	//global items search
	self.globalItemsSearchString = ko.observable('').extend({ rateLimit: GLItemsSearchDelay });
	self.allGLAccountsItems = ko.observableArray();
	self.globalItemsSearch = ko.computed(function () {
		var itemDescription = self.globalItemsSearchString().toLowerCase();
		itemDescription = itemDescription.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (itemDescription.length < 3) {
			self.allGLAccountsItems.removeAll();
			$("#globalItemsSearchResult").hide();
		} else {
			var chartId = self.selectedChartId();
			doGlobalItemsSearch(chartId, itemDescription, function () {
				//console.log('callback');
				$("#globalItemsSearchResult").show();
				//$('#tblGlobalSearchBody').editableTableWidget();

				//initialize popover
				$('[data-toggle="popover"]').popover();

				//close popover
				//////$('body').on('click', function (e) {
				//////	$('[data-toggle="popover"]').each(function () {
				//////		//the 'is' for buttons that trigger popups
				//////		//the 'has' for icons within a button that triggers a popup
				//////		if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
				//////			$(this).popover('hide');
				//////		}
				//////	});
				//////});

			})
		}
	}, self);

	//********************************
	//*********** SALES **************
	//********************************

	//sales chart list
	self.allSalesCharts = ko.observableArray();
	self.searchSalesChartFilter = ko.observable('');
	self.searchSalesChartFilter.subscribe(function () {
		setTimeout(function () { windowResized(); });
	}, self);
	self.filteredSalesCharts = ko.computed(function () {
		var searchSalesChartFilter = self.searchSalesChartFilter().toLowerCase();
		searchSalesChartFilter = searchSalesChartFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchSalesChartFilter.length < 3) {
			var r = self.allSalesCharts();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allSalesCharts(), function (item) {
				var words = searchSalesChartFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null) || ((item.ChartName() + '').toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	self.uniqueSalesCharts = ko.computed(function () {
		var charts = self.allSalesCharts();
		var o = {};
		var r = [];
		if (charts.length) {
			for (var i = 0; i < charts.length; i++) {
				if (charts[i].ChartId() != 0) {
					o[charts[i].ChartId()] = charts[i];
				}
			}
			for (i in o)
				r.push(o[i]);
		}
		return r;
	}, self);
	self.selectedSalesChartId = ko.observable(null);
	self.selectedSalesChartId.subscribe(function () {
		if (self.selectedSalesChartId() == null) return false;
		if (self.selectedSetupId() == 'sales-gl-accounts-panel') {
			var chartId = self.selectedSalesChartId();
			var orgId = 0;
			loadSalesClassList(function () {
				getSalesMealPeriodList(chartId, function () {
					getSalesGLAcctListByChartId(chartId, orgId, function () {
						self.enableSelectMealPeriod(checkTrackMealPeriod(chartId));
						//$('#tblSalesGLAccounts').editableTableWidget();
						windowResized();
					});
				});
			});
		}
		if (self.selectedSetupId() == 'sales-meal-period-panel') {
			var chartId = self.selectedSalesChartId();
			getSalesMealPeriodList(chartId, function () {
				windowResized();
			})
		}
	});

	//sales gl accounts
	self.allSalesGLAccounts = ko.observableArray();
	self.newSalesGLAcctId = ko.observable(null);
	self.newSalesGLAcctNumber = ko.observable('');
	self.newSalesGLAcctDescription = ko.observable('');


	self.newSalesSelectedClasses = ko.observableArray();
	self.newSalesSelectedMealPeriods = ko.observableArray();
	self.newSalesClassIds = ko.observable('');
	self.newSalesMealPeriodIds = ko.observable('');



	self.selectedSalesGLAccount = ko.observable(null);
	self.selectedSalesGLAccId = ko.observable(0);
	self.selectedSalesGLAccId.subscribe(function () {
	}, self);

	//sales category classes
	self.salesCategoryClasses = ko.observableArray();

	//sales meal periods
	self.salesMealPeriods = ko.observableArray();
	self.newMealPeriodDescription = ko.observable('');
	self.selectedMealPeriod = ko.observable(null);

	//sales deposits
	self.salesDepositLocationList = ko.observableArray();
	self.salesDepositLocationList2 = ko.observableArray();
	self.salesDepositTypeList = ko.observableArray();

	self.selectedSalesDepositOrgName = ko.observable('');
	self.selectedSalesDepositOrgId = ko.observable(0);
	self.selectedSalesDepositOrgId.subscribe(function () {
		var orgId = self.selectedSalesDepositOrgId();

		self.selectedSalesDepositOrgName(self.selectedSalesDepositOrgId() != 0 ? $('#selecSalesDepositLocation option:selected').text() : '');
		
		loadDepositMethodList(orgId, self.salesDepositMethodList, function () {
			windowResized();
		});
	}, self);

	self.selectedSalesDepositMethod = ko.observable(null);

	self.newDepositCode = ko.observable('');
	self.newDepositDescription = ko.observable('');
	self.newDepositTypeId = ko.observable(0);
	self.newDepositGLAccNumber = ko.observable('');

	self.salesDepositMethodList = ko.observableArray();

	self.selectedSalesDepositOrgIdFrom = ko.observable(0);
	self.selectedSalesDepositOrgIdFrom.subscribe(function () {
		var orgId = self.selectedSalesDepositOrgIdFrom();
		loadDepositMethodList(orgId, self.salesDepositMethodListFrom, function () {
			windowResized();
		});
	}, self);
	self.salesDepositMethodListFrom = ko.observableArray();

	self.enableSelectMealPeriod = ko.observable(false);
	//self.enableSelectMealPeriod = ko.computed(function () {
	//	var r = true;
	//	if (self.salesMealPeriods().length > 0) {
	//		if (self.salesMealPeriods().length == 1 && 1) {
	//			r = false;
	//		}
	//	}
	//	return r;
	//}, self);

	self.isValidForSubmit = ko.computed(function () {
		var r = false;
		if (self.selectedSalesGLAccount() != null) {
			if (self.selectedSalesGLAccount().GLAccDescription().length > 0 && self.newSalesSelectedClasses().length > 0 && self.newSalesSelectedMealPeriods().length > 0) {
				r = true;
			}
		}
		return r;
	}, self);

	self.enableAddMealPeriod = ko.computed(function () {
		var r = false;
		if (self.newMealPeriodDescription().length > 0 && self.selectedSalesChartId() != 0) {
			r = true;
		}
		return r;
	}, self);

	self.enableCreateNewSalesGLAccount = ko.computed(function () {
		var r = false;
		if (self.selectedSalesChartId() != null) {
			r = true;
		}
		return r;
	}, self);

	self.enableAddSalesDepositMethod = ko.computed(function () {
		var r = false;
		if (self.newDepositDescription().length > 0 && self.selectedSalesDepositOrgId() != 0 && self.newDepositTypeId() != 0) {
			r = true;
		}
		return r;
	}, self);

	self.enableCopyFromAnotherLocation = ko.computed(function () {
		var r = false;
		if (self.selectedSalesDepositOrgId() != 0 && self.salesDepositLocationList().length > 1) {
			r = true;
		}
		return r;
	}, self);

	//sales functions
	self.addSalesDepositMethod = function (d, e) {
		var methodCode = self.newDepositCode();
		var methodDescription = self.newDepositDescription();
		var typeId = self.newDepositTypeId();
		var orgId = self.selectedSalesDepositOrgId();
		var glAccNumber =self.newDepositGLAccNumber();
		createDepositMethod(methodCode, methodDescription, typeId, glAccNumber, orgId, function () {
			loadDepositMethodList(orgId, self.salesDepositMethodList, function () {
				self.newDepositCode('');
				self.newDepositDescription('');
				self.newDepositTypeId(0);
				self.newDepositGLAccNumber('');
				windowResized();
			});
		});
	};

	self.addMealPeriod = function (d, e) {
		//Function CreateMealPeriod(chartId As Integer, mealPeriodDescription As String, userCode As Integer) As Integer
		var chartId = self.selectedSalesChartId();
		var mealPeriodDesc = self.newMealPeriodDescription();
		createMealPeriod(chartId, mealPeriodDesc, function () {
			fnc.setupApp.salesMealPeriods.valueHasMutated();
			self.newMealPeriodDescription('');
			getSalesMealPeriodList(chartId, function () {
				windowResized();
			});
		});
	};


	self.showCreateNewSalesGLAccountDialog = function (d, e) {
		var it = {};
		it.chartid = self.selectedSalesChartId();
		it.glaccid = '';
		it.GLAccNumber = '';
		it.GLAccDescription = '';
		it.ClassIds = '';
		it.MealPeriodIds = '';
		it.Taxable = '0';

		var newSalesGLAcct = new salesGLAccountItem2(it);
		fnc.setupApp.selectedSalesGLAccount(newSalesGLAcct);
		//
		$('#modSalesGLAcct').modal('show');
		$('#modSalesGLAcct').one('hidden.bs.modal', function (e) {

			for (var i = 0; i < fnc.setupApp.salesCategoryClasses().length; i++) {
				fnc.setupApp.salesCategoryClasses()[i].Selected(false);
			}
			for (var i = 0; i < fnc.setupApp.salesMealPeriods().length; i++) {
				fnc.setupApp.salesMealPeriods()[i].Selected(false);
			}
			fnc.setupApp.selectedSalesGLAccount(null);

			//fnc.setupApp.newSalesSelectedClasses.removeAll();
			//fnc.setupApp.newSalesSelectedMealPeriods.removeAll();
		})
	};

	self.updateSalesGLAccount = function (d, e) {
		var glAccId = fnc.setupApp.selectedSalesGLAccount().GLAccId;
		var chartId = fnc.setupApp.selectedSalesGLAccount().ChartId;
		var glAccNo = fnc.setupApp.selectedSalesGLAccount().GLAccNumber();
		var glAccDescription = fnc.setupApp.selectedSalesGLAccount().GLAccDescription();
		var mealPeriodIds = fnc.setupApp.newSalesSelectedMealPeriods().join();
		var classIds = fnc.setupApp.newSalesSelectedClasses().join();
		var orgId = 0;
		var taxable = fnc.setupApp.selectedSalesGLAccount().Taxable();
		if (glAccId == '') {
			createSalesGLAccount(chartId, glAccNo, glAccDescription, taxable, self.newSalesGLAcctId, mealPeriodIds, classIds, function () {
				$('#modSalesGLAcct').modal('hide');

				getSalesGLAcctListByChartId(chartId, orgId, function () {
					windowResized();
				});
			});
		} else {
			modifySalesGLAccount(glAccId, chartId, glAccNo, glAccDescription, taxable, mealPeriodIds, classIds, function () {
				$('#modSalesGLAcct').modal('hide');

				getSalesGLAcctListByChartId(chartId, orgId, function () {
					windowResized();
				});
			});
		}

	};

	self.cancelUpdateSalesGLAccount = function (d, e) {
		var it = fnc.setupApp.selectedSalesGLAccount();
		it.GLAccNumber(it.originalNumber);
		it.GLAccDescription(it.originalDescription);
		$('#modSalesGLAcct').modal('hide');
	};

	self.deleteSalesGLAcct = function (d, e) {
		var glAccId = fnc.setupApp.selectedSalesGLAccount().GLAccId;
		var chartId = fnc.setupApp.selectedSalesGLAccount().ChartId;
		var orgId = 0;

		deleteSalesGLAccount(glAccId, chartId, function () {
			getSalesGLAcctListByChartId(chartId, orgId, function () {
				$('#modConfirmDelSalesGLAcct').modal('hide');
				windowResized();
			});
		});
	};

	self.cancelDeleteSalesGLAccount = function (d, e) {
		$('#modConfirmDelSalesGLAcct').modal('hide');
	};

	self.deleteSalesMealPeriod = function (d, e) {
		var mealPeriodId = fnc.setupApp.selectedMealPeriod().MealPeriodId;
		var chartId = fnc.setupApp.selectedSalesChartId();

		deleteMealPeriod(mealPeriodId, chartId, function () {
			getSalesMealPeriodList(chartId, function () {
				$('#modConfirmDelMealPeriod').modal('hide');
				windowResized();
			})
		});
	};

	self.cancelDeleteSalesMealPeriod = function (d, e) {
		$('#modConfirmDelMealPeriod').modal('hide');
	};

	self.reorgMealPeriods = function (d, e) {
		//console.log('item=' + d.item.MealPeriodDescription);
		//console.log('from=' + Number(d.sourceIndex + 1));
		//console.log('to=' + Number(d.targetIndex + 1));
		var mealPeriodId = d.item.MealPeriodId;
		var chartId = fnc.setupApp.selectedSalesChartId();
		var moveTo = Number(d.targetIndex + 1);
		
		modifyMealPeriodMove(mealPeriodId, chartId, moveTo, function () {
			//d.item.DisplayOrder(moveTo)
			getSalesMealPeriodList(chartId, function () {
				windowResized();
			})		
		});
	};

	self.deleteSalesDepositMethod = function (d, e) {
		var methodId = fnc.setupApp.selectedSalesDepositMethod().MethodId;
		var orgId = fnc.setupApp.selectedSalesDepositOrgId();
		deleteDepositMethod(methodId, function () {
			$('#modConfirmDelDepositMethod').modal('hide');
			loadDepositMethodList(orgId, self.salesDepositMethodList, function () {			
				windowResized();
			});
		});
	};

	self.cancelDeleteSalesDepositMethod = function (d, e) {
		$('#modConfirmDelDepositMethod').modal('hide');
	};

	self.showSalesGLAccounts = function (d, e) {
		self.selectedSetupId('sales-gl-accounts-panel');
		self.selectedSalesChartId.valueHasMutated();
	};

	self.enableShowSalesGLAccounts = ko.computed(function () {
		var r = false;
		if (self.selectedSalesChartId() != 0) r = true;
		return r;
	}, self);

	self.showCopySalesDepositMethods = function (d, e) {
		getSalesDepositLocationList(self.salesDepositLocationList2, function () {
			 //
		});

		$('#modCopySalesDepositMethods').modal('show');

		$('#modCopySalesDepositMethods').one('hidden.bs.modal', function (e) {
			//clean up
			self.selectedSalesDepositOrgIdFrom(0);
			self.salesDepositMethodListFrom.removeAll();
			self.salesDepositLocationList2.removeAll();
		});
	}

	self.cancelCopySalesDepositMethods = function (d, e) {
		$('#modCopySalesDepositMethods').modal('hide');
	};

	self.submitCopySalesDepositMethods = function (d, e) {
		var orgIdFrom = self.selectedSalesDepositOrgIdFrom();
		var orgIdTo = self.selectedSalesDepositOrgId();

		copyDepositMethod(orgIdFrom, orgIdTo, function () {
			loadDepositMethodList(orgIdTo, self.salesDepositMethodList, function () {
				$('#modCopySalesDepositMethods').modal('hide');
				windowResized();
			});
		});
	};

	//<!--<div class="panel-footer"><pre data-bind="text: ko.toJSON('<'+newSalesGLAcctDescription()+'>;<'+newSalesGLAcctNumber()+'>;<'+newSalesSelectedClasses().join()+'>;<'+newSalesSelectedMealPeriods().join()+'>', null, 2)"></pre></div>-->
	//********************************
	//********** /SALES **************
	//********************************


	//functions
	self.showSelectedPanel = function (d, e) {
		loading(true);
		resetNewGLAcctVM();
		//setTimeout(function () {
			var selectedId = e.currentTarget.getAttribute("href");
			self.selectedSetupId(selectedId);
			//sets height for the scrollable table if $('').length == 1 
			$("#tblCmStartDateBody").height(qbSetupTableHeight);
			$("#tblGLCharts").height(qbSetupTableHeight);
			$("#tblCmDTFBody").height(qbSetupTableHeight);
			windowResized();
		//})
		setTimeout(function () {
			loading(false);
		}, 100)
	};

	self.showSalesSelectedPanel = function (d, e) {
		self.selectedSalesChartId(null);
		var selectedId = e.currentTarget.getAttribute("href");
		self.selectedSetupId(selectedId);
		//self.selectedSalesChartId.valueHasMutated();
		//sets height for the scrollable table if $('').length == 1 
		$("#tblSalesCharts").height(qbSetupTableHeight);
		windowResized();
	};

	self.addGLAccount = function (d, e) {
		var chartId = self.selectedChartId();
		var acctNo = self.newGLAcctNumber();
		var acctDesc = self.newGLAcctDescription();
		var catClsId = self.newGLAcctCategoryClassId();
		createGLAccount(chartId, acctNo, acctDesc, self.newGLAcctId, catClsId, function () {
			//console.log(self.newGLAcctId());
			self.newGLAcctId(null);
			self.newGLAcctNumber('');
			self.newGLAcctDescription('');
			self.newGLAcctCategoryClassId('');
			getGLAcctListByChartId(chartId, function () {
				windowResized();
			})
		});
	};

	self.addGLAccountsByCategory = function (d, e) {
		var chartId = self.selectedChartId();
		if (chartId == 0 || chartId == null) return;
		createGLAccountsByCategory(chartId, function () {
			getGLAcctListByChartId(chartId, function () {
				windowResized();
			})
		});
	};

	self.isCreateGLAcctEnabled = ko.computed(function () {
		return self.newGLAcctNumber().length > 0 && self.newGLAcctDescription().length > 0 && self.newGLAcctCategoryClassId().length > 0;
	}, self);

	self.showMoreGLAccountItems = function (d, e) {
		var n = self.searchGLAccountItemsCount();
		n = n + 20;
		self.searchGLAccountItemsCount(n);
		windowResized();
	};

	self.isMoreGLAccountItemsVisible = ko.computed(function () {
		return self.searchGLAccountItemsCount() < self.filteredGLAccountItems().length;
	}, self);

	self.closeGlobalItemsSearchDropdown = function () {
		self.globalItemsSearchString('');
		self.allGLAccountsItems.removeAll();
		$("#globalItemsSearchResult").hide();
	};

	self.cancelUpdateItem = function (d, e) {
		$("#modUpdateSplitItem").modal("hide");
		self.selectedGLAcctItem(null);
		self.oneItemGLAccounts.removeAll();
	};

	self.submitUpdateItem = function (d, e) {
		var itemId = self.selectedGLAcctItem().ItemID;
		var n = 0;
		for (var i = 0; i < self.oneItemGLAccounts().length; i++) {
			var it = self.oneItemGLAccounts()[i];
			if (it.OriginalPrcnt != it.Prcnt()) {
				var glAccId = it.GLAccId;
				var prcnt = it.Prcnt();
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
		//console.log(n+' items are updated');
		//close dialog
		$("#modUpdateSplitItem").modal("hide");
		self.selectedGLAcctItem(null);
		self.oneItemGLAccounts.removeAll();
		self.globalItemsSearchString('');
		//reload list
		var chartId = self.selectedChartId();
		var accId = self.selectedGLAccId();
		getGLItemList(chartId, accId, function () {
			self.searchGLAccountItemsFilter('');
			self.searchGLAccountItemsCount(20);
			windowResized();
		});

	};


	self.deleteGLAccount = function () {
		var params = {};
		params.GLAcctId = fnc.setupApp.selectedGLAccount().GLAccId;
		params.ChartId = fnc.setupApp.selectedGLAccount().ChartId;

		//Sub DeleteGLAccount(glAccId As Integer, chartId As Integer, userCode As Integer)
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.DeleteGLAccount", params, function (response) {
			if (response.d == '') {
				//success
				fnc.setupApp.allGLAccounts.remove(fnc.setupApp.selectedGLAccount());
				fnc.setupApp.selectedGLAccount(null);
				$('#modConfirmDelGLAcct').modal('hide');
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				fnc.setupApp.selectedGLAccount(null);
				$('#modConfirmDelGLAcct').modal('hide');
				windowResized();
				return;
			}
		});
	};


	self.cancelDeleteGLAccount = function () {
		fnc.setupApp.selectedGLAccount(null);
		$('#modConfirmDelGLAcct').modal('hide');
	};

	self.deleteItemFromGLAccount = function () {
		var it = fnc.setupApp.selectedGLAcctItem();
		var glAcctId = fnc.setupApp.selectedGLAccId();
		var itemId = it.ItemID;
		glAccountDelItem(glAcctId, itemId, function () {
			var chartId = fnc.setupApp.selectedChartId();
			getGLItemList(chartId, glAcctId, function () {
				fnc.setupApp.globalItemsSearchString('');

			});
		});

		fnc.setupApp.selectedGLAcctItem(null);
		$('#modConfirmDelItemFromGLAcct').modal('hide');
	}

	self.cancelDeleteItemFromGLAccount = function () {
		fnc.setupApp.selectedGLAcctItem(null);
		$('#modConfirmDelItemFromGLAcct').modal('hide');
	};


	//
	self.showElements2 = function (tr) {
		$(tr).attr('bgColor', 'lightblue');
		//$(tr).find('td:first input').show();
		$(tr).find('td:last button').show();
	};

	self.hideElements2 = function (tr) {
		//var checkBox = $(tr).find('td:first input');
		//if (checkBox[0].checked) {
		//	return;
		//}
		$(tr).attr('bgColor', 'white');
		//checkBox.hide();
		$(tr).find('td:last button').hide();
	};

	//DTF
	self.cancelModifyDTFRules = function () {
		$('#modOrgDTFRules').modal('hide');
		fnc.setupApp.selectedOrgDTFRules(null);
		fnc.setupApp.selectedOrgGLAccounts.removeAll();
	};

	self.submitModifyDTFRules = function (d, e) {
		var orgId = self.selectedOrgDTFRules().OrgId;
		var disctRule = self.selectedOrgDTFRules().DiscountRule2();
		var disctAccId = self.selectedOrgDTFRules().DiscountGLAccId();
		var taxRule = self.selectedOrgDTFRules().TaxRule2();
		var taxAccId = self.selectedOrgDTFRules().TaxGLAccId();
		var freightRule = self.selectedOrgDTFRules().FreightRule2();
		var freightAccId = self.selectedOrgDTFRules().FreightGLAccId();
		modifyDTFRule(orgId, disctRule, disctAccId, taxRule, taxAccId, freightRule, freightAccId, function () {
			$('#modOrgDTFRules').modal('hide');
			fnc.setupApp.selectedOrgDTFRules(null);
			fnc.setupApp.selectedOrgGLAccounts.removeAll();
			getOrganizationDTFRules(function () {
				windowResized();
			})
		})

	};

	self.resetDefaultDTFRule = function (d, e) {
		var orgId = self.selectedOrgDTFRules().OrgId;
		setDefaultDTFRule(orgId, function () {
			$('#modOrgDTFRules').modal('hide');
			fnc.setupApp.selectedOrgDTFRules(null);
			fnc.setupApp.selectedOrgGLAccounts.removeAll();
			getOrganizationDTFRules(function () {
				windowResized();
			})
		});
	};

	//sales
	self.addSalesGLAccountsByCategory = function (d, e) {
		var chartId = self.selectedSalesChartId();
		//createGLAccountsByCategory(chartId, function () {
		//	getGLAcctListByChartId(chartId, function () {
		//		windowResized();
		//	})
		//});
	};


}