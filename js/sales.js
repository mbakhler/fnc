/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.salesApp = new function () {

	// Default variables

	var defaultDateText = 'Last 6 Months';
	var defaultDateNumber = 183;
	var strFormat = 'mm/dd/yyyy';
	var defaultDate;

	//prod
	defaultDate = (new Date());

	//******************
	// private objects
	//******************
	var SalesRawDataItem = function (it, selectedClass) {
		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedBy = it.AcceptedBy;
		self.AcceptedDT = it.AcceptedDT;
		self.BevEnabled = it.BevEnabled;
		self.BevTotal = it.ClassName == null || selectedClass == '' ? it.BevTotal : it.ClassBevTotal;
		self.ClassBevTotal = it.ClassBevTotal;
		self.ClassCode = it.ClassCode;
		self.ClassFoodTotal = it.ClassFoodTotal;
		self.ClassLineTotal = it.ClassLineTotal;
		self.ClassName = it.ClassName;
		self.ClassOtherTotal = it.ClassOtherTotal;
		self.ClassTax = it.ClassTax;
		self.FoodEnabled = it.FoodEnabled;
		self.FoodTotal = it.ClassName == null || selectedClass == '' ? it.FoodTotal : it.ClassFoodTotal;
		self.GLAccDescription = it.GLAccDescription
		self.GLAccNumber = it.GLAccNumber
		self.GratuityAmount = it.GratuityAmount;

		self.GratuityClassAmount = it.GratuityClassAmount
		self.GratuityClassId = it.GratuityClassId;

		self.GratuityId = it.GratuityId;
		self.Locked = it.Locked;
		self.LockedByUserCode = it.LockedByUserCode;
		self.LockedBy = it.LockedBy;
		self.MealPeriodDescription = it.MealPeriodDescription;
		self.MealPeriodDisplayOrder = it.MealPeriodDisplayOrder;
		self.OrgName = it.OrgName;
		self.OrganizationId = it.OrganizationId;
		self.OtherEnabled = it.OtherEnabled;
		self.OtherTotal = it.ClassName == null || selectedClass == '' ? it.OtherTotal : it.ClassOtherTotal;
		self.SalesClassDetailsId = it.SalesClassDetailsId;
		self.SalesDate = it.SalesDate;
		self.SalesDetailsId = it.SalesDetailsId;
		self.SalesId = it.SalesId;
		self.Tax = it.ClassName == null || selectedClass == '' ? it.Tax : it.ClassTax;
		self.Taxable = it.Taxable;
		self.TrackDeposit = it.TrackDeposit;
		self.Total = it.Total;
		self.Xported = it.Xported;
		self.XportedBy = it.XportedBy;
		self.XportedDT = it.XportedDT;
	}

	var SalesEntryClassItem = function (it) {
		var self = this;
		self.ClassName = it.ClassName;
		self.ClassCode = it.ClassCode;
		self.ClassKye = it.ClassCode + '||' + it.ClassName
	}

	var SalesEntrySplitSummaryItem = function (it) {
		var self = this;
		self.ClassName = it.ClassName;
		self.ClassCode = it.ClassCode;
		self.BevTotal = ko.observable(it.BevTotal > 0 ? Number(it.BevTotal).toFixed(2) : 0);
		self.FoodTotal = ko.observable(it.FoodTotal > 0 ? Number(it.FoodTotal).toFixed(2) : 0);
		self.OtherTotal = ko.observable(it.OtherTotal > 0 ? Number(it.OtherTotal).toFixed(2) : 0);
		self.Tax = ko.observable(it.Tax > 0 ? Number(it.Tax).toFixed(2) : 0);
		self.LineTotal = ko.observable(it.LineTotal);

		self.ComputedLineFnB = ko.computed(function () {
			var r = Number(self.FoodTotal()) + Number(self.BevTotal());
			return r;
		}, self);

		self.ComputedLineTotal = ko.computed(function () {
			var r = Number(self.FoodTotal()) + Number(self.BevTotal()) + Number(self.OtherTotal()) + Number(self.Tax());
			return r;
		}, self);

		self.ComputedFoodPercentage = ko.computed(function () {
			var r = 0;
			if (self.ComputedLineFnB() != 0) {
				r = Number(self.FoodTotal()) / self.ComputedLineFnB();
			}
			return r * 100;
		}, self);

		self.ComputedBevPercentage = ko.computed(function () {
			var r = 0;
			if (self.ComputedLineFnB() != 0) {
				r = Number(self.BevTotal()) / self.ComputedLineFnB();
			}
			return r * 100;
		}, self);
	}

	var ForecastItem = function (it) {
		var self = this;
		self.Code = it.code;
		self.Date = it.date;
		self.Day = it.day.toUpperCase();
		self.High = it.high;
		self.Low = it.low;
		self.Text = it.text;

	};

	var DepositItem = function (it) {
		var self = this;
		self.Amount = ko.observable(it.Amount).money();
		self.ClassCode = it.ClassCode;
		self.ClassName = it.ClassName;
		self.DepositId = it.DepositId;
		self.GLAccNumber = it.GLAccNumber;
		self.DepositName = it.Method;
		self.RefNotes = ko.observable(it.RefNotes);
		self.SalesId = it.SalesId;
		self.TypeId = it.TypeId;
		self.TypeName = it.TypeName;

		self.showConfirmDeleteDeposit = function (d, e) {
			fnc.salesApp.selectedForDeleteDeposit(d);
			$('#modConfirmDelDeposit').modal('show');

			$('#modConfirmDelDeposit').one('hidden.bs.modal', function (e) {
				fnc.salesApp.selectedForDeleteDeposit(null);
			})
			//fnc.salesApp.selectedSalesItem().depositList.remove(d);
		};
	};

	var DepositMethodItem = function (it) {
		var self = this;


		self.GLAccNumber = it.GLAccNumber;
		self.MethodId = it.MethodId;
		self.MethodCode = it.MethodCode;
		self.MethodDescription = it.MethodDescription;
		self.TypeId = it.TypeId;
		self.TypeName = it.TypeName;
	};

	var SalesListItem = function (it) {

		var self = this;
		self.Accepted = it.Accepted;
		self.AcceptedDT = typeof (it.AcceptedDT) == "object" ? '' : it.AcceptedDT;
		self.BevTotal = it.BevTotal;
		self.FoodTotal = it.FoodTotal;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.OtherTotal = it.OtherTotal;
		self.SalesDate = it.SalesDate;
		self.SalesId = it.SalesId;
		self.Total = it.Total;

		self.Completed = it.IsSalesComplete;
		self.XPorted = it.XPorted;

		self.Selected = ko.observable(false);
		//self.Selected.subscribe(function () {
		//	if (self.Selected()) {
		//		fnc.salesApp.selectedForExportItems.push(self);
		//	} else {
		//		fnc.salesApp.selectedForExportItems.remove(self);
		//	}
		//}, self);

		self.onItemSelectedChange = function (p, i, d, e) {
			if (d.Selected()) {
				fnc.salesApp.selectedForExportItems.push(self);
			} else {
				fnc.salesApp.selectedForExportItems.remove(self);
			}
			fnc.salesApp.exportSelectedEnable(true);
			fnc.salesApp.exportSelectType('selected');
			return true;
		};

		self.showSalesForm = function (d, e) {
			var orgId = d.OrgId;
			var orgName = d.OrgName; //for single location
			var salesDate = format2Date(d.SalesDate);
			var salesId = d.SalesId;

			var it = {};
			it.orgId = orgId;
			it.orgName = orgName;
			it.salesDate = salesDate;
			it.salesId = salesId;

			var salesForm = new SalesFormItem(it);

			loadSalesEntryClassList(salesId, orgId, function (r) {
				salesForm.isClassesEnable(r.length > 0);
				salesForm.OrganizationClassList(r);
				loadSalesEntry(salesId, salesForm, '', function () {
					fnc.salesApp.computeFormColumnTotal(salesForm, function () {
						loadDeposits(salesId, salesForm.depositList, function () {
							loadDepositTypeList(orgId, salesForm.depositTypes, function () {
								//
								loadProjectedSalesOneDay(salesDate, orgId, function (r) {
									if (r != '') {
										salesForm.projectedFoodTotal(r.TotalFood);
										salesForm.projectedBevTotal(r.TotalBev);
										salesForm.projectedOtherTotal(r.TotalOther);
									}
									fnc.salesApp.selectedSalesItem(salesForm);
									loadSalesEntryLockStatus(salesId, function () {
										fnc.salesApp.salesListIsVisible(false);
										fnc.salesApp.salesFormIsVisible(true);

										fnc.salesApp.attachBlurFunctions(function () {
											windowResized();
											//initDatePickerAllDates();
											initDatePickerPastDates('#salesDateActualSales');
											fnc.salesApp.initLoad = false;
										});
									});
								});
							});
						});
					});
				});
			})
		};

		self.deleteSalesItem = function (d, e) {

			fnc.salesApp.selectedForDeleteSalesItem(d);

			$('#modConfirmDelSalesEntry').modal('show');

			$('#modConfirmDelSalesEntry').one('hidden.bs.modal', function (e) {
				fnc.salesApp.selectedForDeleteSalesItem(null);
			})
		}

		self.onCompletedClick = function (d, e) {
			var salesId = d.SalesId;
			updateAccepted(salesId, true, function () {
				loadSalesLists(function () {
					windowResized();
				})
			})
		};

	};

	var SalesFormItem = function (it) {
		var self = this;
		self.WeatherForecast = ko.observableArray();
		self.LoadWeatherForecat = ko.computed(function () {
			var orgId = it.orgId;
			var salesDate = it.salesDate;
			getForecast(salesDate, orgId, self.WeatherForecast, function () {
				console.log();
			});
		});
		self.SalesId = it.salesId;
		self.isClassesEnable = ko.observable(false);
		self.OrgId = ko.observable(it.orgId);
		self.OrgId.subscribe(function () {
			var orgId = self.OrgId();
			var salesId = self.SalesId;
			modifySalesEntryLocation(salesId, orgId, function () {
				//console.log(self.OrgId());
				windowResized();
			});

		}, self);

		self.OrgName = it.orgName;

		self.SalesDateOld = ko.observable(it.salesDate);
		self.SalesDate = ko.observable(it.salesDate).withPausing();
		self.SalesDate.subscribe(function () {
			var orgId = self.OrgId();
			var salesId = self.SalesId;
			var salesDate = self.SalesDate();
			salesEntryExists(salesDate, orgId, function(r){
				if (r) {
					$('#modSalesExists').modal('show');
					self.SalesDate.sneakyUpdate(self.SalesDateOld());
					$('#salesDateActualSales').val(self.SalesDateOld());
				} else {
					modifySalesEntryDate(salesId, salesDate, function () {
						self.SalesDateOld(self.SalesDate());
						windowResized();
					});
				}
			});
			getForecast(salesDate, orgId, self.WeatherForecast, function () {
				console.log();
			});
		}, self);

		self.Locked = ko.observable();
		self.LockedBy = ko.observable();
		self.LockedByUserCode = ko.observable();
		self.showFormLocked = ko.computed(function () {
			var r = (self.Locked() == "1" && self.LockedByUserCode() != fnc.app.uc);
			return r;
		}, self);
		self.FormEditButtonText = ko.computed(function () {
			var text = '';
			if (self.Locked() == "1" && self.LockedByUserCode() == fnc.app.uc) {
				text = 'Done';
			} else if (self.Locked() == "1" && self.LockedByUserCode() != fnc.app.uc) {
				text = 'In Use';
			} else {
				text = 'Edit';
			}
			return text;
		}, self);

		self.Accepted = ko.observable();
		self.AcceptedBy = ko.observable();
		self.AcceptedDate = ko.observable();
		self.showFormAccepted = ko.computed(function () {
			var r = self.Accepted() == "1"
			return r;
		}, self);
		self.FormAcceptButtonText = ko.computed(function () {
			var text = '';
			if (self.Accepted() == "1") {
				text = 'Unaccept';
			} else {
				text = 'Accept';
			}
			return text;
		}, self);

		self.Xported = ko.observable();
		self.XportedBy = ko.observable();
		self.XportedDate = ko.observable();
		self.showFormXported = ko.computed(function () {
			var r = self.Xported() == "1"
			return r;
		}, self);

		self.DepositEnable = ko.observable(false);

		//sales totals
		self.ComputedFoodTotal = ko.observable(0);
		self.ComputedBeveragesTotal = ko.observable(0);
		self.ComputedFnBTotal = ko.observable(0);
		self.ComputedOtherTotal = ko.observable(0);
		self.ComputedTaxTotal = ko.observable(0);
		self.ComputedGrandTotal = ko.observable(0);

		//print subtotals
		//self.PrintFoodTotal = ko.observable(0);
		//self.PrintBeveragesTotal = ko.observable(0);
		//self.PrintFnBTotal = ko.observable(0);
		//self.PrintOtherTotal = ko.observable(0);
		//self.PrintTaxTotal = ko.observable(0);
		//self.PrintGrandTotal = ko.observable(0);

		//sales arrays
		self.salesDetails = ko.observableArray();
		self.salesGroups = ko.observableArray();
		self.CostCentersList = ko.observableArray();

		//current organization class list
		self.OrganizationClassList = ko.observableArray();
		self.SelectedClassKey = ko.observable('');
		self.SelectedClassKey.subscribe(function () {

			if (fnc.salesApp.initLoad) return;
			fnc.salesApp.initLoad = true;

			var className = '', classCode = '', selectedClass = '';
			if (self.SelectedClassKey()) {
				var arr = self.SelectedClassKey().split('||');
				if (arr[0]) {
					classCode = arr[0];
				}
				if (arr[1]) {
					className = arr[1];
					selectedClass = arr[1];
				}
			}
			//console.log('SelectedClassKey.subscribe()=' + selectedClass);
			var orgId = self.OrgId();
			var orgName = self.OrgName; //for single location
			var salesDate = self.SalesDate();
			var salesId = self.SalesId;
			//
			var it = {};
			it.orgId = orgId;
			it.orgName = orgName;
			it.salesDate = salesDate;
			it.salesId = salesId;
			//
			var salesForm = fnc.salesApp.selectedSalesItem()

			loadSalesEntry(salesId, salesForm, selectedClass, function () {
				fnc.salesApp.computeFormColumnTotal(salesForm, function () {
					loadDeposits(salesId, salesForm.depositList, function () {
						loadDepositTypeList(orgId, salesForm.depositTypes, function () {
							loadProjectedSalesOneDay(salesDate, orgId, function (r) {
								if (r != '') {
									salesForm.projectedFoodTotal(r.TotalFood);
									salesForm.projectedBevTotal(r.TotalBev);
									salesForm.projectedOtherTotal(r.TotalOther);
								}
								loadSalesEntryLockStatus(salesId, function () {
									fnc.salesApp.salesListIsVisible(false);
									fnc.salesApp.salesFormIsVisible(true);
									fnc.salesApp.attachBlurFunctions(function () {
										windowResized();
										initDatePickerPastDates('#salesDateActualSales');
										fnc.salesApp.initLoad = false;
									})
								})
							})
						})
					})
				})
			})

		}, self);


		self.SelectedClassName = ko.computed(function () {
			var r = '';
			if (self.SelectedClassKey()) {
				var arr = self.SelectedClassKey().split('||');
				if (arr[1]) {
					r = arr[1];
				}
			}
			return r;
		}, self);
		self.SelectedClassCode = ko.computed(function () {
			var r = '';
			if (self.SelectedClassKey()) {
				var arr = self.SelectedClassKey().split('||');
				if (arr[0]) {
					r = arr[0];
				}
			}
			return r;
		}, self);

		self.SalesRawDataList = ko.observableArray();

		//Cost Centers columns subtotals
		self.CCFoodTotal = ko.observable(0);
		self.CCBeveragesTotal = ko.observable(0);
		self.CCFnBTotal = ko.observable(0);
		self.CCOtherTotal = ko.observable(0);
		self.CCTaxTotal = ko.observable(0);
		self.CCGrandTotal = ko.observable(0);

		//deposit types
		self.depositTypes = ko.observableArray();
		//deposits array
		self.depositList = ko.observableArray();

		//projected sales
		self.projectedFoodTotal = ko.observable(0);
		self.projectedBevTotal = ko.observable(0);
		self.projectedOtherTotal = ko.observable(0);

		//
		self.depositsTotal = ko.computed(function () {
			var r = 0;
			var arr = self.depositList();
			var t = 0;
			for (var i = 0; i < arr.length ; i++) {
				t += Number(arr[i].Amount());
			}
			r = t;

			return r;
		}, self);

		self.depositsGratuity = ko.observable(0).money();

		self.depositsTotalCash = ko.computed(function () {
			var r = 0;
			var arr = self.depositList();
			var t = 0;
			for (var i = 0; i < arr.length ; i++) {
				if (arr[i].TypeId == 1) {
					t += Number(arr[i].Amount());
				}
			}
			r = t - Number(self.depositsGratuity());

			return r;
		}, self);

		self.depositsTotalWithGratuity = ko.computed(function () {
			var r = 0;
			r = Number(self.ComputedGrandTotal()) + Number(self.depositsGratuity());
			return r;
		}, self);

		self.depositsTotalPayments = ko.observable(0);

		self.salesFnBTotal = ko.computed(function () {
			var r = 0;
			r = Number(self.ComputedFnBTotal());
			return r;
		}, self);

		self.salesGrandTotal = ko.computed(function () {
			var r = 0;
			r = Number(self.ComputedGrandTotal());
			return r;
		}, self);

		//


		self.ReadOnly = ko.computed(function () {
			var r = false;
			if (self.Xported() == "1") r = true;
			if (self.Accepted() == "1") r = true;
			if (self.Locked() == "0") r = true;
			if (self.Locked() == "1" && self.LockedByUserCode() != fnc.app.uc) r = true;
			if (self.isClassesEnable() && self.SelectedClassName() == '') r = true;
			return r;
		});

		self.VisibleEqualSign = ko.computed(function () {
			var r = false;
			if (self.DepositEnable()) {
				if (self.depositsTotalWithGratuity() != 0 && self.depositsTotal() != 0) {
					r = formatCurrency(self.depositsTotalWithGratuity()) == formatCurrency(self.depositsTotal());
				}
			}
			return r;
		});

		self.VisibleNotEqualSign = ko.computed(function () {
			var r = false;
			if (self.DepositEnable()) {
				if ((self.depositsTotalWithGratuity() == 0 || self.depositsTotal() == 0) && (self.depositsTotalWithGratuity() != 0 || self.depositsTotal() != 0)) {
					r = true;
				}
				if (self.depositsTotalWithGratuity() != 0 && self.depositsTotal() != 0) {
					r = formatCurrency(self.depositsTotalWithGratuity()) != formatCurrency(self.depositsTotal());
				}
			}
			return r;
		});

		self.FormEditButtonEnable = ko.computed(function () {
			var r = true;
			if (self.Locked() == "1" && self.LockedByUserCode() != fnc.app.uc) {
				//in use
				r = false;
			}
			if (!fnc.app.prvSalesManageActualEnable()) {
				//manage actuals permission
				r = false;
			}
			if (self.Accepted() == "1") {
				//accepted
				r = false;
			}
			return r;
		});

		self.FormAcceptButtonEnable = ko.computed(function () {
			var r = true;
			if ((self.depositsTotalWithGratuity() == 0 || self.depositsTotal() == 0) && self.DepositEnable()) {
				//total(s) == 0
				r = false;
			}
			if (self.Locked() == "1" && self.LockedByUserCode() != fnc.app.uc) {
				//in use
				r = false;
			}
			if (self.depositsTotalWithGratuity() != 0 && self.depositsTotal() != 0 && self.Accepted() == 0 && (formatCurrency(self.depositsTotalWithGratuity()) != formatCurrency(self.depositsTotal()))) {
				//not equal sign
				r = false;
			}
			if (!fnc.app.prvSalesAcceptEnable() && self.Accepted() == 0) {
				//accept permission
				r = false;
			}
			if (!fnc.app.prvSalesUnAcceptEnable() && self.Accepted() == 1) {
				//unaccept permission
				r = false;
			}
			if (!fnc.app.prvSalesUnAcceptExportedEnable() && self.Accepted() == 1 && self.Xported() == 1) {
				//unaccept exported permission
				r = false;
			}
			return r;
		});

		self.showCostCenterSalesSummary = function (d, e) {
			var orgId = 0;
			var salesId = self.SalesId;

			loadSalesEntryClassSplitSummary(salesId, function (r) {
				//console.log(r);
				fnc.salesApp.selectedSalesItem().CostCentersList(r);
				var foodTotal = 0;
				var bevTotal = 0;
				var FnBTotal = 0;
				var otherTotal = 0;
				var taxTotal = 0;
				var grandTotal = 0;

				r.forEach(function (it) {
					foodTotal = foodTotal + Number(it.FoodTotal());
					bevTotal = bevTotal + Number(it.BevTotal());
					FnBTotal = FnBTotal + Number(it.ComputedLineFnB());
					otherTotal = otherTotal + Number(it.OtherTotal());
					taxTotal = taxTotal + Number(it.Tax());
					grandTotal = grandTotal + Number(it.ComputedLineTotal());
				})

				self.CCFoodTotal(foodTotal);
				self.CCBeveragesTotal(bevTotal);
				self.CCFnBTotal(FnBTotal);
				self.CCOtherTotal(otherTotal);
				self.CCTaxTotal(taxTotal);
				self.CCGrandTotal(grandTotal);


				$('#modCostCenterSalesSummary').modal('show');

				$('#modCostCenterSalesSummary').one('hidden.bs.modal', function (e) {
					fnc.salesApp.selectedSalesItem().CostCentersList.removeAll();

					self.CCFoodTotal(0);
					self.CCBeveragesTotal(0);
					self.CCFnBTotal(0);
					self.CCOtherTotal(0);
					self.CCTaxTotal(0);
					self.CCGrandTotal(0);
				})

			})

		}



	}

	var SalesDetailsItem = function (it) {

		var self = this;
		self.Accepted = it.Accepted
		self.AcceptedBy = it.AcceptedBy
		self.AcceptedDT = it.AcceptedDT
		self.BevEnabled = it.BevEnabled
		self.BevTotal = ko.observable(it.BevTotal).money();
		self.FoodEnabled = it.FoodEnabled
		self.FoodTotal = ko.observable(it.FoodTotal).money();
		self.GLAccDescription = it.GLAccDescription
		self.GLAccNumber = it.GLAccNumber
		self.GratuityAmount = ko.observable(it.GratuityAmount);

		self.GratuityClassAmount = it.GratuityClassAmount
		self.GratuityClassId = it.GratuityClassId;

		self.GratuityId = it.GratuityId;
		self.Locked = it.Locked
		self.LockedByUserCode = it.LockedByUserCode
		self.LockedBy = it.LockedBy
		self.MealPeriodDescription = it.MealPeriodDescription
		self.MealPeriodDisplayOrder = it.MealPeriodDisplayOrder
		self.OrgName = it.OrgName;
		self.OrganizationId = it.OrganizationId;
		self.OtherEnabled = it.OtherEnabled
		self.OtherTotal = ko.observable(it.OtherTotal).money();
		self.SalesClassDetailsId = it.SalesClassDetailsId;
		self.SalesDate = it.SalesDate
		self.SalesDetailsId = it.SalesDetailsId;
		self.SalesId = it.SalesId
		self.Tax = ko.observable(it.Tax).money();
		self.Taxable = it.Taxable
		self.TrackDeposit = it.TrackDeposit;
		self.Total = it.Total
		self.Xported = it.Xported
		self.XportedBy = it.XportedBy
		self.XportedDT = it.XportedDT

		self.CostCentersList = ko.observableArray();

		self.GratuityAmount.subscribe(function () {

		}, self);

		self.BevTotal.subscribe(function () {
			var salesId = self.SalesId;
			var salesDetailsId = self.SalesDetailsId;
			var foodTotal = self.FoodTotal();
			var bevTotal = self.BevTotal();
			var otherTotal = self.OtherTotal();
			var tax = self.Tax();
			var salesClassDetailsId = self.SalesClassDetailsId;
			modifySalesEntryLine(salesClassDetailsId, salesId, salesDetailsId, foodTotal, bevTotal, otherTotal, tax, function () {
				if (fnc.salesApp.selectedSalesItem() != null) {
					fnc.salesApp.computeFormColumnTotal(fnc.salesApp.selectedSalesItem(), function () {
						windowResized();
					});
				} else {
					windowResized();
				}
			});
		}, self);

		self.FoodTotal.subscribe(function () {
			var salesId = self.SalesId;
			var salesDetailsId = self.SalesDetailsId;
			var foodTotal = self.FoodTotal();
			var bevTotal = self.BevTotal();
			var otherTotal = self.OtherTotal();
			var tax = self.Tax();
			var salesClassDetailsId = self.SalesClassDetailsId;
			modifySalesEntryLine(salesClassDetailsId, salesId, salesDetailsId, foodTotal, bevTotal, otherTotal, tax, function () {
				if (fnc.salesApp.selectedSalesItem() != null) {
					fnc.salesApp.computeFormColumnTotal(fnc.salesApp.selectedSalesItem(), function () {
						windowResized();
					});
				} else {
					windowResized();
				}
			});
		}, self);

		self.OtherTotal.subscribe(function () {
			var salesId = self.SalesId;
			var salesDetailsId = self.SalesDetailsId;
			var foodTotal = self.FoodTotal();
			var bevTotal = self.BevTotal();
			var otherTotal = self.OtherTotal();
			var tax = self.Tax();
			var salesClassDetailsId = self.SalesClassDetailsId;
			modifySalesEntryLine(salesClassDetailsId,salesId, salesDetailsId, foodTotal, bevTotal, otherTotal, tax, function () {
				if (fnc.salesApp.selectedSalesItem() != null) {
					fnc.salesApp.computeFormColumnTotal(fnc.salesApp.selectedSalesItem(), function () {
						windowResized();
					});
				} else {
					windowResized();
				}
			});
		}, self);

		self.Tax.subscribe(function () {
			var salesId = self.SalesId;
			var salesDetailsId = self.SalesDetailsId;
			var foodTotal = self.FoodTotal();
			var bevTotal = self.BevTotal();
			var otherTotal = self.OtherTotal();
			var tax = self.Tax();
			var salesClassDetailsId = self.SalesClassDetailsId;
			modifySalesEntryLine(salesClassDetailsId, salesId, salesDetailsId, foodTotal, bevTotal, otherTotal, tax, function () {
				if (fnc.salesApp.selectedSalesItem() != null) {
					fnc.salesApp.computeFormColumnTotal(fnc.salesApp.selectedSalesItem(), function () {
						windowResized();
					});
				} else {
					windowResized();
				}
			});
		}, self);

		self.ComputedLineFnB = ko.computed(function () {
			var r = Number(self.FoodTotal()) + Number(self.BevTotal());
			return r;
		}, self);

		self.ComputedLineTotal = ko.computed(function () {
			var r = Number(self.FoodTotal()) + Number(self.BevTotal()) + Number(self.OtherTotal()) + Number(self.Tax());
			return r;
		}, self);

		self.ComputedFoodPercentage = ko.computed(function () {
			var r = 0;
			if (self.ComputedLineFnB() != 0) {
				r = Number(self.FoodTotal()) / self.ComputedLineFnB();
			}
			return r * 100;
		}, self);

		self.ComputedBevPercentage = ko.computed(function () {
			var r = 0;
			if (self.ComputedLineFnB() != 0) {
				r = Number(self.BevTotal()) / self.ComputedLineFnB();
			}
			return r * 100;
		}, self);

		self.isEnabldeUpdateClassSplit = ko.computed(function () {
			//validate line total == 0
			if (!self.ComputedLineTotal()) return false;
			
			var bevSum = 0;
			var foodSum = 0;
			var otherSum = 0;
			var taxSum = 0;
			self.CostCentersList().forEach(function (it) {
				bevSum = bevSum + Number(it.BevTotal());
				foodSum = foodSum + Number(it.FoodTotal());
				otherSum = otherSum + Number(it.OtherTotal());
				taxSum = taxSum + Number(it.Tax());
			})
			//validate every column total == 0
			if (!(bevSum || foodSum || otherSum || taxSum)) return false;

			//validate category matching
			if ((bevSum != Number(self.BevTotal()) || foodSum != Number(self.FoodTotal()) || otherSum != Number(self.OtherTotal()) || taxSum != Number(self.Tax()))) return false;

			//
			return true;
		}, self);
	}

	var SalesGroupItem = function (id, name) {
		var self = this;
		self.GroupId = id;
		self.GroupName = name;

		//group totals
		self.GroupFoodTotal = ko.observable(0);
		self.GroupBeveragesTotal = ko.observable(0);
		self.GroupFnBTotal = ko.observable(0);
		self.GroupOtherTotal = ko.observable(0);
		self.GroupTaxTotal = ko.observable(0);
		self.GroupGrandTotal = ko.observable(0);

		self.GroupFoodPercent = ko.observable(0);
		self.GroupBevPercent = ko.observable(0);

		self.GroupItems = ko.observableArray();
	}

	var OrgListItem = function (it) {
		var self = this;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.salesApp.allOrganizationsWithChart().length; i++) {
					if ((fnc.salesApp.allOrganizationsWithChart()[i].OrgId != self.OrgId) && fnc.salesApp.allOrganizationsWithChart()[i].Selected()) {
						fnc.salesApp.allOrganizationsWithChart()[i].Selected(false);
					}
				}
				fnc.salesApp.newSalesLocation(self);
			} else {
				fnc.salesApp.newSalesLocation(null);
			}
		})
	};

	//******************
	// private function
	//******************

	var loadSalesEntryClassSplitSummary = function (salesId, callback) {
		//SalesEntryClassLoadSplitSummary(o.Params.SalesId)
		var params = {};
		params.SalesId = salesId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesEntryClassLoadSplitSummary", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new SalesEntrySplitSummaryItem(it)) })
			} else {
				arr.push(new SalesEntrySplitSummaryItem(obj))
			}

			if (callback) return callback(arr);
		})

	}

	var loadSalesEntryClassList = function (salesId, orgId, callback) {
		//SalesEntryClassLoadList(o.Params.SalesId, o.Params.OrgId)

		var params = {};
		params.SalesId = salesId;
		params.OrgId = orgId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesEntryClassLoadList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new SalesEntryClassItem(it)) })
			} else {
				arr.push(new SalesEntryClassItem(obj))
			}

			if (callback) return callback(arr);
		})
	}

	var updateLineClassSplit = function (salesId, salesDetailsId, classSplitList, callback) {
	//SalesEntryLineUpdateClassSplit(o.Params.SalesId, o.Params.SalesDetailsId, classSplitList, o.uc)
		var params = {};
		params.SalesId = salesId;
		params.SalesDetailsId = salesDetailsId;
		params.ClassSplitList = classSplitList;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesEntryLineUpdateClassSplit", params, function (response) {
			loading(false);
			//if (response.d == '') {
			//	//success
			//	if (callback) callback();
			//	return;
			//}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
			if (callback) callback(r);
		});
	}

	var loadSalesEntryLineClassSplit = function (salesId, salesDetailsId, callback) {
		//SalesEnrlyLineLoadClassSplit(o.Params.SalesId, o.Params.SalesDetailsId)

		var params = {};
		params.SalesId = salesId;
		params.SalesDetailsId = salesDetailsId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesEnrlyLineLoadClassSplit", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) return callback({});
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
			//var arr = [];
			//if (obj[0]) {
			//	obj.forEach(function (it) { arr.push(new SalesEntryClassItem(it)) })
			//} else {
			//	arr.push(new SalesEntryClassItem(obj))
			//}

			if (callback) return callback(obj);
		})
	}

	var loadSalesLists = function (callback){
		//Function LoadSalesLists(fromDate As Date, toDate As Date, orgIds As String) As String

		var params = {};
		params.FromDate = fnc.app.filterDateFrom();
		params.ToDate = fnc.app.filterDateTo();
		params.OrgIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();


		fnc.salesApp.allItems.removeAll();

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadSalesLists", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new SalesListItem(it)) })
			} else {
				arr.push(new SalesListItem(obj))
			}

			fnc.salesApp.allItems(arr);

			if (callback) callback();
		});
	}; 

	var createSalesEntry = function (orgId, salesDate, salesId, callback) {
		//Function CreateSalesEntry(organizationId As Integer, SalesDate As Date, userCode As Integer) As Decimal
		var params = {};
		params.OrgId = orgId;
		params.SalesDate = salesDate;
		
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.CreateSalesEntry", params, function (response) {
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

			salesId(r);
			//var obj = r;

			if (callback) callback();
		});
	};

	var loadSalesEntry = function (salesId, salesForm, selectedClass, callback) {
		//Function LoadSalesEntry(salesId As Decimal) As String		 function (salesId, salesDetails, salesGroups, depositEnable, callback) {
		//if (salesForm.SalesRawDataList().length == 0) {
		var params = {};
		params.SalesId = salesId;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadSalesEntry", params, function (response) {
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
			var rawData = JSON.parse(response.d).result.row;
			salesForm.SalesRawDataList(rawData);
			processMe(rawData, salesForm, selectedClass, callback);
		})
		//} else {
		//	var rawData = salesForm.SalesRawDataList();
		//	processMe(rawData, salesForm, selectedClass, callback);
		//}


		function processMe(rawData, salesForm, selectedClass, callback) {
			var rawDataArr = [];
			var uniqueClasses = [];
			if (rawData[0]) {
				if (selectedClass == '') {
					// selectedClass == 'All'
					var uniqueSalesIdArr = [];
					var uniqueClassCodeNameArr = [];
					rawData.forEach(function (it) {
						var id = it.SalesDetailsId;
						var clsCodeName = it.ClassCode + '_' + it.ClassName;
						if (uniqueSalesIdArr.indexOf(id) == -1) {
							uniqueSalesIdArr.push(id);
							rawDataArr.push(new SalesRawDataItem(it, selectedClass))
						}
						if ((uniqueClassCodeNameArr.indexOf(clsCodeName) == -1) && (it.ClassName != null || it.ClassCode != null)) {
							uniqueClassCodeNameArr.push(clsCodeName)
							uniqueClasses.push({ ClassCode: it.ClassCode, ClassName: it.ClassName })
						}
					})
				} else {
					// selectedClass == 'class xyz'
					rawData.forEach(function (it) {
						//rawDataArr.push(new SalesRawDataItem(it, selectedClass));
						if (it.ClassName == null) {
							rawDataArr.push(new SalesRawDataItem(it, selectedClass));
						} else {
							if (it.ClassName == selectedClass) {
								rawDataArr.push(new SalesRawDataItem(it, selectedClass));
							}
						}
					})
				}
			} else {
				rawDataArr.push(new SalesRawDataItem(rawData, ''))
			}

			var obj = rawDataArr;
			var arr = [];
			var groups = [];
			var groupId = 0;
			var gr = null;
			//var depositEnable = false;

			if (obj[0]) {
				//obj.forEach(function (it) { arr.push(new SalesDetailsItem(it)) })
				for (var i = 0; i < obj.length; i++) {
					var it = obj[i];
					if (groupId != it.MealPeriodDisplayOrder) {
						gr = new SalesGroupItem(it.MealPeriodDisplayOrder, it.MealPeriodDescription);
						gr.GroupItems.push(new SalesDetailsItem(it));
						groups.push(gr);
						groupId = it.MealPeriodDisplayOrder;
					} else {
						gr.GroupItems.push(new SalesDetailsItem(it));
					}

					arr.push(new SalesDetailsItem(obj[i]));
				}
			} else {
				var it = obj;
				gr = new SalesGroupItem(it.MealPeriodDisplayOrder, it.MealPeriodDescription);
				gr.GroupItems.push(new SalesDetailsItem(it));
				groups.push(gr);

				arr.push(new SalesDetailsItem(obj))
			}

			if (selectedClass == '') {
				salesForm.depositsGratuity(arr[0].GratuityAmount());
			} else {
				salesForm.depositsGratuity(arr[0].GratuityClassAmount);
			}
			salesForm.DepositEnable(arr[0].TrackDeposit == '1')
			salesForm.salesGroups(groups);
			salesForm.salesDetails(arr);

			if (callback) callback();

		}

	}

	var deleteSalesEntry = function (salesId, callback) {
		//DeleteSalesEntry(o.Params.SalesId, o.uc)
		var params = {};
		params.SalesId = salesId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.DeleteSalesEntry", params, function (response) {
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

	var modifySalesEntryDate = function (salesId, salesDate, callback) {
		//Sub ModifySalesEntryDate(salesId As Decimal, SalesDate As Date, userCode As Integer)
		var params = {};
		params.SalesId = salesId;
		params.SalesDate = salesDate;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ModifySalesEntryDate", params, function (response) {
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

	var modifySalesEntryLine = function (salesClassDetailsId, salesId, salesDetailsId, foodTotal, bevTotal, otherTotal, tax, callback) {
		//Sub ModifySalesEntryLine(salesId As Decimal, salesDetailsId As Decimal, foodTotal As Double, bevTotal As Double, otherTotal As Double, tax As Double, userCode As Integer)
		var params = {};
		params.SalesId = salesId;
		params.SalesDetailsId = salesDetailsId;
		params.FoodTotal = foodTotal;
		params.BevTotal = bevTotal;
		params.OtherTotal = otherTotal;
		params.Tax = tax;


		if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
			var classSplitList = [];
			var obj = {};
			obj.ClassCode = fnc.salesApp.selectedSalesItem().SelectedClassCode(); //it.ClassCode
			obj.ClassName = fnc.salesApp.selectedSalesItem().SelectedClassName();
			obj.BevTotal = bevTotal;
			obj.FoodTotal = foodTotal;
			obj.OtherTotal = otherTotal;
			obj.Tax = tax;
			obj.SalesDetailsId = salesDetailsId;
			obj.SalesId = salesId;
			obj.SalesClassDetailsId = salesClassDetailsId;
			classSplitList.push(obj);

			updateLineClassSplit(salesId, salesDetailsId, classSplitList, function (r) {
				console.log('salesClassDetailsId=' + r);
				fnc.salesApp.initLoad = false;
				fnc.salesApp.selectedSalesItem().SelectedClassKey.valueHasMutated();
				if (callback) callback();
				return;
			})

		} else {
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ModifySalesEntryLine", params, function (response) {
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
		}
	};

	var modifySalesEntryLocation = function (salesId, orgId, callback) {
		//Sub ModifySalesEntryLocation(salesId As Decimal, organizationId As Integer, userCode As Integer)
		var params = {};
		params.SalesId = salesId;
		params.OrgId = orgId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ModifySalesEntryLocation", params, function (response) {
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

	var loadNewSalesFormDetails = function (orgId, arr, callback) {
		//console.log(orgId);

		ajaxPost("ChefMod.Financials.UI.Controllers.SalesDev.LoadList", { keyword: "newsalesform" }, function (response) {
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				console.log("Server Error");
				return;
			}
			var arrayList = ko.utils.arrayMap(r.result.row, function (it) { return new SalesDetailsItem(it) });
			arr(arrayList);
			if (callback) callback();
		});

	};

	var loadDepositTypeList = function (orgId, methodList, callback) {
		var params = {};
		params.OrgId = orgId;

		methodList.removeAll();

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesSetup.LoadDepositMethodList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new DepositMethodItem(it)) })
			} else {
				arr.push(new DepositMethodItem(obj))
			}

			methodList(arr)

			if (callback) callback();
		});

		//ajaxPost("ChefMod.Financials.UI.Controllers.SalesDev.LoadList", { keyword: "depositstype" }, function (response) {
		//	var r = eval('(' + response.d + ')');
		//	if (r.result == 'error') {
		//		console.log("Server Error");
		//		return;
		//	}
		//	var arrayList = ko.utils.arrayMap(r.result.row, function (it) { return new DepositItem(it) });
		//	arr(arrayList);
		//	if (callback) callback();
		//});

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

	var loadDepositsList = function (orgId, arr, callback) {
		//console.log(orgId);

		ajaxPost("ChefMod.Financials.UI.Controllers.SalesDev.LoadList", { keyword: "depositslist" }, function (response) {
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				console.log("Server Error");
				return;
			}
			var arrayList = ko.utils.arrayMap(r.result.row, function (it) { return new DepositItem(it) });
			arr(arrayList);
			if (callback) callback();
		});

	};

	//deposits
	var addDeposit = function (depositId, classCode, className, salesId, methodId, refNotes, amount, callback) {
		//Function AddDeposit(salesId As Decimal, method As String, refNotes As String, amount As Double, userCode As Integer) As Decimal
		//Function AddDeposit(salesId As Decimal, methodId As Integer, refNotes As String, amount As Double, userCode As Integer) As Decimal
		//client.SalesAddClassDeposit(o.Params.SalesId, o.Params.ClassCode, o.Params.ClassName, o.Params.MethodId, o.Params.RefNotes, o.Params.Amount, o.uc).ToString

		var params = {};
		params.SalesId = salesId;
		params.MethodId = methodId;
		params.RefNotes = refNotes;
		params.Amount = amount;
		params.ClassCode = classCode;
		params.ClassName = className;
		loading(true);
		if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesAddClassDeposit", params, function (response) {
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

				depositId(r);
				//var obj = r;

				if (callback) callback();
			});
		} else {
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.AddDeposit", params, function (response) {
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

				depositId(r);
				//var obj = r;

				if (callback) callback();
			});
		}
	};

	var loadDeposits = function (salesId, depositList, callback) {
		//Function LoadDeposits(salesId As Decimal) As String
		var params = {};
		params.SalesId = salesId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadDeposits", params, function (response) {
			loading(false);

			if (response.d == '') {
				depositList.removeAll();
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
					if (fnc.salesApp.selectedSalesItem()) {
						if (fnc.salesApp.selectedSalesItem().SelectedClassName() == it.ClassName) {
							arr.push(new DepositItem(it));
						}
						if (fnc.salesApp.selectedSalesItem().SelectedClassName() == '' && it.ClassName == null) {
							arr.push(new DepositItem(it));
						} 
					} else {
						if (it.ClassName == null) {
							arr.push(new DepositItem(it));
						}
					}
				})
			} else {
				arr.push(new DepositItem(obj))
			}

			depositList(arr);

			if (callback) callback();
		});
	};

	var modifyDeposit = function (depositId, salesId, method, refNotes, amount, callback) {
		//Sub ModifyDeposit(depositid As Decimal, salesId As Decimal, method As String, refNotes As String, amount As Double, userCode As Integer)  

		var params = {};
		params.DepositId = depositId;
		params.SalesId = salesId;
		params.Method = method;
		params.RefNotes = refNotes;
		params.Amount = amount;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ModifyDeposit", params, function (response) {
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

	var removeDeposit = function (depositId, salesId, callback) {
		//Sub RemoveDeposit(depositid As Decimal, salesId As Decimal, userCode As Integer)
		//SalesRemoveClassDeposit(o.Params.DepositClassId, o.Params.SalesId, o.uc)

		var params = {};
		if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
			params.DepositClassId = depositId;
		} else {
			params.DepositId = depositId;
		}
		params.SalesId = salesId;

		loading(true);
		if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesRemoveClassDeposit", params, function (response) {
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
		} else {
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.RemoveDeposit", params, function (response) {
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
		}
	};

	//status
	var loadSalesEntryLockStatus = function (salesId, callback) {
		//Public Function LoadSalesEntryLockStatus(salesId As Decimal) As String
		var params = {};
		params.SalesId = salesId;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadSalesEntryLockStatus", params, function (response) {
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
			//Accepted: "0"
			//AcceptedBy: null
			//AcceptedDT: null
			//Locked: "0"
			//LockedByUserCode: Object
			//LockedBy: null
			//Xported: "0"
			//XportedBy: null
			//XportedDT: null
			var obj = JSON.parse(response.d).result.row;

			fnc.salesApp.selectedSalesItem().Accepted(obj.Accepted);
			fnc.salesApp.selectedSalesItem().AcceptedBy(obj.AcceptedBy);
			fnc.salesApp.selectedSalesItem().AcceptedDate(obj.AcceptedDT);

			//if (Number(obj.LockedByUserCode) != fnc.app.uc) {
				fnc.salesApp.selectedSalesItem().Locked(obj.Locked);
				fnc.salesApp.selectedSalesItem().LockedBy(obj.Lockedby);
				fnc.salesApp.selectedSalesItem().LockedByUserCode(typeof (obj.LockedByUserCode) == "object" ? null : obj.LockedByUserCode);
			//}

			fnc.salesApp.selectedSalesItem().Xported(obj.Xported);
			fnc.salesApp.selectedSalesItem().XportedBy(obj.XportedBy);
			fnc.salesApp.selectedSalesItem().XportedDate(obj.XportedDT);

			fnc.salesApp.selectedSalesItem().Locked.valueHasMutated();

			if (callback) callback();
		});



	};

	var updateAccepted = function (salesId, accepted, callback) {
		//Sub UpdateAccepted(salesId As Decimal, accepted As Boolean, userCode As Integer)

		var params = {};
		params.SalesId = salesId;
		params.Accepted = accepted;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.UpdateAccepted", params, function (response) {
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

	var updateEditLock = function (salesId, locked, callback) {
		//Sub UpdateEditLock(salesId As Decimal, locked As Boolean, userCode As Integer)

		var params = {};
		params.SalesId = salesId;
		params.Locked = locked;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.UpdateEditLock", params, function (response) {
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

	var updateExported = function (salesId, xported, callback) {
		//Sub UpdateExported(salesId As Decimal, xported As Boolean, userCode As Integer)

		var params = {};
		params.SalesId = salesId;
		params.Xported = xported;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.UpdateExported", params, function (response) {
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

	var updateExportedSalesItems = function (items, exported, callback) {
		var params = {};
		params.SalesIdList = items;
		params.Xported = exported;

		//custom vb function
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.UpdateExportedSalesItems", params, function (response) {
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

	//etc.
	var loadExportedData = function (items, exportType, callback) {
		var params = {};
		params.SalesIds = items;
		params.ExportType = exportType;

		if (exportType == 'export-excel') {
			loading(true);
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ExportSales", params, function (response) {
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
											if (key2.toLowerCase().indexOf('@xsi:nil') != -1) { row.push(''); }
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
										if (key2.toLowerCase().indexOf('@xsi:nil') != -1) { row.push(''); }
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
				var encodedUri = encodeURI(csvContent);
				//console.log(encodedUri);
				//browserName.toUpperCase().indexOf('IE') != -1 
				if (browserName == 'IE' || browserName == 'Edge') {
					var fileData = [csvContent];
					var blobObject = new Blob(fileData);
					window.navigator.msSaveOrOpenBlob(blobObject, csvSalesExportFileName);
				} else {
					var a = document.createElement('a');
					a.href = 'data:attachment/csv,' + encodedUri;
					a.target = '_blank';
					a.download = csvSalesExportFileName;
					document.body.appendChild(a);
					a.click();
				}
				if (callback) callback();

			});

			//ExportSales(o.Params.SalesIds)

			////var arr = [], arr1 = [], arr2 = [];
			////arr1.push('col1');
			////arr1.push('col2');
			////arr2.push('11');
			////arr2.push('22');
			////arr.push(arr1);
			////arr.push(arr2);
			////var data = arr.slice(0);
			////var csvContent = "";
			////csvContent = arraysToRows(data);
			////var encodedUri = encodeURI(csvContent);
			//////console.log(encodedUri);
			//////browserName.toUpperCase().indexOf('IE') != -1
			////if (browserName == 'IE' || browserName == 'Edge') {
			////	var fileData = [csvContent];
			////	var blobObject = new Blob(fileData);
			////	window.navigator.msSaveOrOpenBlob(blobObject, csvSalesExportFileName);
			////} else {
			////	var a = document.createElement('a');
			////	a.href = 'data:attachment/csv,' + encodedUri;
			////	a.target = '_blank';
			////	a.download = csvSalesExportFileName;
			////	document.body.appendChild(a);
			////	a.click();
			////}

			////if (callback) callback();
		} else {
			if (callback) callback();
		}

		return;
	};

	var loadOrganizationListWithChart = function (organizationList, callback) {
		//Public Function LoadOrganizationListWithChart(userCode As Integer) As String
		var params = {};

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadOrganizationListWithChart", params, function (response) {
			loading(false);

			if (response.d == '') {
				organizationList.removeAll();
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
				obj.forEach(function (it) { arr.push(new OrgListItem(it)) })
			} else {
				arr.push(new OrgListItem(obj))
			}

			organizationList(arr);

			if (callback) callback();
		});
	};

	var modifySalesEntryGratuity = function (gratuityId, salesId, amount, gratuityClassId, classCode, className, callback) {
		//Public Sub ModifySalesEntryGratuity(gratuityId As Decimal, salesId As Decimal, amount As Double, userCode As Integer) 
		var params = {};
		params.GratuityId = gratuityId;
		params.SalesId = salesId;
		params.Amount = amount;
		if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
			params.GratuityClassId = gratuityClassId;
			params.ClassCode = classCode;
			params.ClassName = className;
		}
		//console.log('modifySalesEntryGratuity' + "||" + Date.now());
		loading(true);

		if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
			//client.SalesEntryClassModifyGratuity(o.Params.GratuityClassId, o.Params.GratuityId, o.Params.SalesId, o.Params.ClassCode, o.Params.ClassName, o.Params.Amount, o.uc).ToString
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesEntryClassModifyGratuity", params, function (response) {
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
		} else {
			ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ModifySalesEntryGratuity", params, function (response) {
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
		}


	};

	var salesEntryExists = function (salesDate, orgId, callback) {
		//SalesEntryExists(o.Params.SalesDate, o.Params.OrgId)
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.SalesEntryExists", params, function (response) {
			loading(false);
			//if (response.d == '') {
			//	//error
			//	//if (callback) callback();
			//	return;
			//}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}

			//ret(r == '1');
			if (callback) { callback(r=='1') };
			return;
		});

	};

	var getForecast = function (forecastDate, orgId, forecastSummary, callback) {
		//forecastDate, orgId, forecastSummary, callback
		//LoadForecast(o.Params.ForecastDate, o.Params.OrgId)
		var params = {};
		params.OrgId = orgId;
		params.ForecastDate = forecastDate;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.WeatherYahoo.LoadForecast", params, function (response) {
			loading(false);

			if (response.d == '') {
				forecastSummary(null);
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
					arr.push(new ForecastItem(it.ForecastData.forecast))
				})
			} else {
				arr.push(new ForecastItem(obj.ForecastData.forecast))
			}

			forecastSummary(arr);

			if (callback) callback();
		});
		
	};

	//Projected Sales
	var loadProjectedSalesOneDay = function (salesDate, orgId, callback) {
		//client.LoadProjectedSalesOneDay(o.Params.SalesDate, o.Params.OrgId)

		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadProjectedSalesOneDay", params, function (response) {
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

			var obj = JSON.parse(response.d).result.row;

			if (callback) callback(obj);
		});
	};

	//******************
	// fnc.salesApp public 
	//******************
	var self = this;

	self.initLoad = true;

	self.salesListIsVisible = ko.observable(false);
	self.salesFormIsVisible = ko.observable(false);
	self.salesFormIsVisible.subscribe(function () {
		if (self.salesFormIsVisible()) {
			var salesId = self.selectedSalesItem().SalesId;
			fnc.salesFormUnlockTimer = setInterval(loadSalesEntryLockStatus, fnc.salesFormUnlockInterval, salesId);
		} else {
			clearInterval(fnc.salesFormUnlockTimer);
		}
	}, self);

	self.filterAvailableDateRanges = ko.observableArray(['Custom', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 60 Days', 'Last 90 Days', 'Last 6 Months', 'Last 12 Months']);
	self.filterDateRange = ko.observable();
	self.filterDateRange.subscribe(function (newValue) {
		if (newValue == 'Custom') return true;
		self.filterCustomDateRange(false);
		var dateString;
		if (browserName == "Chrome") {
			var d = self.filterDateTo().split("-");
			dateString = d[1] + "/" + d[2] + "/" + d[0];
		} else {
			dateString = self.filterDateTo()
		}
		var today = new Date(dateString);
		var vDate = new Date(today);

		switch (newValue) {
			case 'Custom':
				break;
			case 'Last 7 Days':
				self.filterDateFrom(addDays2(self.filterDateTo(), -6));
				break;
			case 'Last 14 Days':
				self.filterDateFrom(addDays2(self.filterDateTo(), -13));
				break;
			case 'Last 30 Days':
				self.filterDateFrom(addDays2(self.filterDateTo(), -29));
				break;
			case 'Last 60 Days':
				self.filterDateFrom(addDays2(self.filterDateTo(), -59));
				break;
			case 'Last 90 Days':
				self.filterDateFrom(addDays2(self.filterDateTo(), -89));
				break;
			case 'Last 6 Months':
				self.filterDateFrom(addDays2(self.filterDateTo(), -182));
				break;
			case 'Last 12 Months':
				self.filterDateFrom(addDays2(self.filterDateTo(), -364));
				break;

			default:
				self.filterDateFrom('');
				self.filterDateTo('');
		}

	});

	self.filterCustomDateRange = ko.observable();
	self.filterDateFrom = ko.observable();
	self.filterDateTo = ko.observable(defaultDate.format(strFormat));

	self.filterSearchSalesList = ko.observable('');

	//all; accepted; not-accepted; not-completed; completed;
	self.showResultOption = ko.observable("all");
	self.showResultOption.subscribe(function () {
		if (self.showResultOption() == 'accepted') {
			//enable export
			self.exportSelectType.valueHasMutated();
		} else {
			//disable export
			self.allItems().forEach(function (it) {
				it.Selected(false);
			});
			self.selectedForExportItems.removeAll();
			self.exportSelectType('all-not-exported');
		}
	}, self);

	self.allItems = ko.observableArray();
	self.filteredSalesItems = ko.computed(function () {
		var r = self.allItems();

		if (self.showResultOption() == "accepted") {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.Accepted == "1";
			})
		}

		if (self.showResultOption() == "not-accepted") {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.Accepted == "0";
			})
		}

		if (self.showResultOption() == "not-completed") {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.Accepted == "0" && item.Completed == "0";
			})
		}

		if (self.showResultOption() == "completed") {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.Accepted == "0" && item.Completed == "1";
			})
		}

		if (self.showResultOption() == "all") {
			r = ko.utils.arrayFilter(r, function (item) {
				return true;
			})
		}

		if (self.filterSearchSalesList().length > 0) {
			var listSearchFilter = self.filterSearchSalesList().toLowerCase();
			listSearchFilter = listSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(self.allItems(), function (item) {
				var words = listSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null) || (item.SalesDate.toLowerCase().match(re) != null));
				}
				return found;
			});
		}

		return r;
	}, self);
	
	self.listHeaders = [
	{ title: 'LOCATION', sortPropertyName: 'OrgName', asc: ko.observable(true) },
	{ title: 'SALES DATE', sortPropertyName: 'SalesDate', asc: ko.observable(false) },
	{ title: 'FOOD TOTAL', sortPropertyName: 'FoodTotal', asc: ko.observable(true) },
	{ title: 'BEV. TOTAL', sortPropertyName: 'BevTotal', asc: ko.observable(true) },
	{ title: 'OTHER TOTAL', sortPropertyName: 'OtherTotal', asc: ko.observable(true) },
	{ title: 'SALES TOTAL', sortPropertyName: 'Total', asc: ko.observable(true) },
	{ title: 'ACCEPTED', sortPropertyName: 'AcceptedDT', asc: ko.observable(true) }
	];
	self.activeSort = ko.observable(self.listHeaders[1]); //set the default sort

	self.selectedSalesItem = ko.observable(null);

	//item-management, item-export
	self.poListMode = ko.observable('item-management');

	self.exportSelectedEnable = ko.observable(false);

	//all, all-not-exported, selected
	self.exportSelectType = ko.observable('all-not-exported');
	self.exportSelectType.subscribe(function () {
		if (self.showResultOption() == 'accepted') {
			//export mode is enabled
			var type = self.exportSelectType();
			if (type != 'selected') {
				self.exportSelectedEnable(false);
				self.selectedForExportItems.removeAll();
			}
			self.allItems().forEach(function (it) {
				switch (type){
					case 'all':
						if (it.Accepted == 1) {
							it.Selected(true);
							self.selectedForExportItems.push(it);
						} else {
							it.Selected(false);
						}
						break;
					case 'all-not-exported':
						if (it.Accepted == 1 && it.XPorted == 0) {
							it.Selected(true);
							self.selectedForExportItems.push(it);
						} else {
							it.Selected(false);
						}
						break;
					default:
						//
				}
			})
		} else {
			//export is disabled
		}
	}, self);

	//export-excel, export-quickbooks
	self.exportType = ko.observable("export-excel");
	self.exportType.subscribe(function () {
		switch (self.exportType()) {
			case 'export-excel':
				$("button[data-value='export-quickbooks']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-excel']").addClass('cm-active-toggle-button');
				break;
			case 'export-quickbooks':
				$("button[data-value='export-excel']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-quickbooks']").addClass('cm-active-toggle-button');
				break;
			default:
				$("button[data-value='export-quickbooks']").removeClass('cm-active-toggle-button');
				$("button[data-value='export-excel']").addClass('cm-active-toggle-button');
		}
	}, self);
	self.setExportType = function (d, e) {
		self.exportType(e.currentTarget.getAttribute('data-value'));
	}

	//selected
	self.selectedItems = ko.observableArray();
	self.selectedForExportItems = ko.observableArray();
	self.selectedForDeleteSalesItem = ko.observable(null);

	//new sales
	self.searchOrgsFilter = ko.observable('');
	self.newSalesLocation = ko.observable(null);
	self.allOrganizationsWithChart = ko.observableArray();
	self.filteredOrganizationsWithChart = ko.computed(function () {
		var searchOrgsFilter = self.searchOrgsFilter().toLowerCase();
		searchOrgsFilter = searchOrgsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchOrgsFilter.length < 3) {
			var r = self.allOrganizationsWithChart();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allOrganizationsWithChart(), function (item) {
				var words = searchOrgsFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);

	//new deposits
	self.newDepositId = ko.observable(null);
	self.newDepositName = ko.observable('');
	self.newDepositRefNotes = ko.observable('');
	self.newDepositAmount = ko.observable(null);

	self.selectedForDeleteDeposit = ko.observable(null);

	self.selectedDepositItem = ko.observable(null);
	self.selectedDepositItem.subscribe(function () {
		if (self.selectedDepositItem() != null) {
			//self.newDepositId(self.selectedDepositItem().DepositId);
			self.newDepositName(self.selectedDepositItem().MethodDescription);
		} else {
			//self.newDepositId(null);
			self.newDepositName('');
		}
	});

	self.enableAddNewDeposit = ko.computed(function () {
		var r = false;
		//if (self.selectedDepositItem()) {
		//	if (self.selectedDepositItem().TypeName == 'Cash') {
		//		r = self.newDepositName() != '' && self.newDepositRefNotes() != '' && self.newDepositAmount();
		//	} else {
		//		r = self.newDepositName() != '' && self.newDepositAmount();
		//	}
		//}
		r = self.newDepositName() != '' && self.newDepositRefNotes() != '' && self.newDepositAmount();
		return r;
	}, self);

	//deposits totals


	//calendar sales day
	self.calendarSalesDay = ko.observable(null);

	//<COST CENTERS>

	self.selectedSalesDetailsItem = ko.observable(null);
	//</COST CENTERS>

	//
	self.init = function (callback) {
		self.salesFormIsVisible(false);
		self.selectedSalesItem(null);
		self.filterDateRange(defaultDateText);
		self.showResultOption("all");
		self.exportSelectType('all-not-exported');
		self.exportType("export-excel");
		loadSalesLists(function () {
			self.salesListIsVisible(true);
			if (callback) callback();

			windowResized();
			//initDatePicker();
		})
	}

	self.showNewSalesForm = function (d, e) {

		loadOrganizationListWithChart(self.allOrganizationsWithChart, function () {
			if (self.allOrganizationsWithChart().length == 0) {
				console.log('No records');
				return;
			}
			if (fnc.app.singleLocation()) {
				var orgId = fnc.app.oid;
				var orgName = '';
				self.enterNewSales(orgId, orgName, null, function () { });
			} else {
				$('#modSelectLocation').modal('show');

				$('#modSelectLocation').one('hidden.bs.modal', function (e) {
					fnc.salesApp.newSalesLocation(null);
				})
			}
		});
	}

	self.backToSalesList = function (d, e) {
		if (self.calendarSalesDay() == null) {
			self.salesFormIsVisible(false);
			self.selectedSalesItem(null);

			loadSalesLists(function () {
				self.salesListIsVisible(true);

				$("#salesListLocation").height(salesListLocationHeight);
				$("#tblSalesListBody").height(salesListTableHeight);
				$("#salesListRightSideBar").height(salesListRighSideBarHeight);

				windowResized();
				initDatePickerAllDates();
			})
		} else {
			load_home(function () {
				$('.nav.nav-pills>li.active').removeClass("active");
				$('.nav.nav-pills>li.calendar-tab').addClass("active");

				$(".tab-pane").removeClass("active");
				$("#home-page").addClass("active");

				var salesDay = self.calendarSalesDay();
				calendarApp.selectedSalesDay(salesDay);

				//if (calendarApp.allOrganizations().length > 1) {
				if(true) {
				calendarApp.showSalesScreen(function () {
						self.calendarSalesDay(null);
					});
				} else {
					self.calendarSalesDay(null);
				}
			});
		}
	}

	self.addNewDeposit = function (d, e) {
		var depositId = self.newDepositId;
		var depositList = fnc.salesApp.selectedSalesItem().depositList;

		var salesId = self.selectedSalesItem().SalesId;
		var methodId = fnc.salesApp.selectedDepositItem().MethodId;
		var refNotes = self.newDepositRefNotes();
		var amount = self.newDepositAmount();
		var classCode = self.selectedSalesItem().SelectedClassCode();
		var className = self.selectedSalesItem().SelectedClassName();

		addDeposit(depositId, classCode, className, salesId, methodId, refNotes, amount, function () {
			loadDeposits(salesId, depositList, function () {
				windowResized();

				self.selectedDepositItem(null);
				self.newDepositRefNotes('');
				self.newDepositAmount(null);

				fnc.salesApp.initLoad = false;

			});
		});

	}

	self.cancelDeleteDeposit = function (d, e) {
		$('#modConfirmDelDeposit').modal('hide');
	}

	self.deleteDeposit = function (d, e) {
		var depositId = self.selectedForDeleteDeposit().DepositId;
		var salesId = self.selectedForDeleteDeposit().SalesId;
		var depositList = self.selectedSalesItem().depositList;
		removeDeposit(depositId, salesId, function () {
			loadDeposits(salesId, depositList, function () {
				$('#modConfirmDelDeposit').modal('hide');
				windowResized();
			});
		});
	};

	self.cancelDeleteSalesEntryItem = function (d, e) {
		$('#modConfirmDelSalesEntry').modal('hide');
	};

	self.deleteSalesEntryItem = function (d, e) {
		var salesId = fnc.salesApp.selectedForDeleteSalesItem().SalesId;

		deleteSalesEntry(salesId, function () {
			loadSalesLists(function () {
				$('#modConfirmDelSalesEntry').modal('hide');
				windowResized();
			})
		})
	};

	self.computeFormColumnTotal = function (form, callback) {
		var t1 = 0, t2 = 0, t3 = 0, t4 = 0;
		//var tp1 = 0, tp2 = 0, tp3 = 0, tp4 = 0;
		var groups = form.salesGroups();
		for (var i = 0; i < groups.length ; i++) {
			var gt1 = 0, gt2 = 0, gt3 = 0, gt4 = 0;
			var groupItems = groups[i].GroupItems();
			for (var j = 0; j < groupItems.length ; j++) {
				var item = groupItems[j];
				gt1 += Number(item.FoodTotal());
				gt2 += Number(item.BevTotal());
				gt3 += Number(item.OtherTotal());
				gt4 += Number(item.Tax());

				t1 += Number(item.FoodTotal());
				t2 += Number(item.BevTotal());
				t3 += Number(item.OtherTotal());
				t4 += Number(item.Tax());

				//if (i < groups.length - 1) {
				//	tp1 += Number(item.FoodTotal());
				//	tp2 += Number(item.BevTotal());
				//	tp3 += Number(item.OtherTotal());
				//	tp4 += Number(item.Tax());
				//}

			}
			//group totals
			groups[i].GroupFoodTotal(gt1);
			groups[i].GroupBeveragesTotal(gt2);
			groups[i].GroupOtherTotal(gt3);
			groups[i].GroupTaxTotal(gt4);
			groups[i].GroupFnBTotal(gt1 + gt2);
			groups[i].GroupGrandTotal(gt1 + gt2 + gt3 + gt4);
			if (groups[i].GroupFnBTotal() != 0) {
				groups[i].GroupFoodPercent((gt1 / (gt1 + gt2)) * 100);
				groups[i].GroupBevPercent((gt2 / (gt1 + gt2)) * 100);
			} else {
				groups[i].GroupFoodPercent(0);
				groups[i].GroupBevPercent(0);
			}
		}
		//form totals
		form.ComputedFoodTotal(t1);
		form.ComputedBeveragesTotal(t2);
		form.ComputedOtherTotal(t3);
		form.ComputedTaxTotal(t4);
		form.ComputedFnBTotal(t1 + t2);
		form.ComputedGrandTotal(t1 + t2 + t3 + t4);

		//print subtotals
		//form.PrintFoodTotal(tp1);
		//form.PrintBeveragesTotal(tp2);
		//form.PrintOtherTotal(tp3);
		//form.PrintTaxTotal(tp4);
		//form.PrintFnBTotal(tp1 + tp2);
		//form.PrintGrandTotal(tp1 + tp2 + tp3 + tp4);

		if (callback) callback();
	};

	self.setFormStatus = function (callback) {
		var form = fnc.salesApp.selectedSalesItem();
		var arr = fnc.salesApp.selectedSalesItem().salesDetails();
		//
		form.Locked(arr[0].Locked);
		form.LockedByUserCode(arr[0].LockedByUserCode);
		form.LockedBy(arr[0].LockedBy);
		form.Accepted(arr[0].Accepted);
		form.AcceptedDate(arr[0].AcceptedDT);
		form.AcceptedBy(arr[0].AcceptedBy);
		form.Xported(arr[0].Xported);
		form.XportedDate(arr[0].XportedDT);
		form.XportedBy(arr[0].XportedBy);

		if (callback) callback();
	};

	self.toggleSalesFormEditStatus = function (d, e) {
		var salesId = self.selectedSalesItem().SalesId;
		var locked = (self.selectedSalesItem().Locked() == '0');

		updateEditLock(salesId, locked, function () {
			loadSalesEntryLockStatus(salesId, function () {
				windowResized();
			});
		})
	};

	self.toggleSalesFormAcceptStatus = function (d, e) {
		var salesId = self.selectedSalesItem().SalesId;
		var accepted = (self.selectedSalesItem().Accepted() == '0');

		updateAccepted(salesId, accepted, function () {
			loadSalesEntryLockStatus(salesId, function () {
				windowResized();
			});
		});
	};

	self.toggleExportMode = function (d, e) {
		self.showResultOption('accepted');
	};

	self.exportSelectedItems = function (d, e) {
		var arrItems = [];
		fnc.salesApp.selectedForExportItems().forEach(function (it) {
			if (arrItems.indexOf(it.SalesId) == -1) {
				arrItems.push(it.SalesId);
			}
		});
		var items = arrItems.toString();
		var exportType = fnc.salesApp.exportType();

		loadExportedData(items, exportType, function () {

			updateExportedSalesItems(items, true, function () {
				loadSalesLists(function () {
					windowResized();
				});
			});
		});

	};

	self.enterNewSales = function (orgId, orgName, sDate, callback) {
		var salesDate;
		if (sDate == null) {
			var d = new Date();
			d.setDate(d.getDate() - 1);
			salesDate = d.format(strFormat);		//.toLocaleDateString();

		} else {
			salesDate = sDate;
		}

		var salesId = ko.observable();

		var it = {};
		it.orgId = orgId;
		it.orgName = orgName;
		it.salesDate = salesDate;

		var salesForm = new SalesFormItem(it);

		createSalesEntry(orgId, salesDate, salesId, function () {
			if (callback) callback();
			if (salesId()) {
				salesForm.SalesId = salesId();
				loadSalesEntryClassList(salesId(), orgId, function (r) {
					salesForm.isClassesEnable(r.length > 0);
					salesForm.OrganizationClassList(r);
					loadSalesEntry(salesId(), salesForm, '', function () {
						loadDepositTypeList(orgId, salesForm.depositTypes, function () {
							loadProjectedSalesOneDay(salesDate, orgId, function (r) {
								if (r != '') {
									salesForm.projectedFoodTotal(r.TotalFood);
									salesForm.projectedBevTotal(r.TotalBev);
									salesForm.projectedOtherTotal(r.TotalOther);
								}
								self.selectedSalesItem(salesForm);
								updateEditLock(salesId(), true, function () {
									loadSalesEntryLockStatus(salesId(), function () {
										self.salesFormIsVisible(true);
										self.salesListIsVisible(false);
										fnc.salesApp.attachBlurFunctions(function () {
											//if (callback) callback();
											windowResized();
											//initDatePickerAllDates();
											initDatePickerPastDates('#salesDateActualSales');
										});
									});
								});
							});
						});
					});
				})				
			}
		});
	};


	self.newSales = function (d, e) {
		var orgId = self.newSalesLocation().OrgId;
		var orgName = self.newSalesLocation().OrgName;
		self.enterNewSales(orgId, orgName, null, function () {
			$('#modSelectLocation').modal('hide');
		});
	};

	self.attachBlurFunctions = function (callback) {
		$('#gratuity').off('change');
		setTimeout(function () {
			$('#gratuity').on('change', function (e) {
				var gratuityId = fnc.salesApp.selectedSalesItem().salesDetails()[0].GratuityId;
				var salesId = fnc.salesApp.selectedSalesItem().SalesId;
				var amount = this.value;				//this.value;			//fnc.salesApp.selectedSalesItem().depositsGratuity();
				var className, classCode, gratuityClassId;

				if (fnc.salesApp.selectedSalesItem().isClassesEnable()) {
					gratuityClassId = fnc.salesApp.selectedSalesItem().salesDetails()[0].GratuityClassId;
					classCode = fnc.salesApp.selectedSalesItem().SelectedClassCode();
					className = fnc.salesApp.selectedSalesItem().SelectedClassName();
				}
				modifySalesEntryGratuity(gratuityId, salesId, amount, gratuityClassId, classCode, className, function () {
					console.log('modifySalesEntryGratuity=' + amount);
					fnc.salesApp.selectedSalesItem().SelectedClassKey.valueHasMutated();
				});

			});
		}, 500); // 0.5 sec delay for rendering
		if (callback) callback();
	};

	self.drilldownToSales = function (orgId, orgName, salesDate, salesId, callback) {
		var it = {};
		it.orgId = orgId;
		it.orgName = orgName;
		it.salesDate = salesDate;
		it.salesId = salesId;

		var salesForm = new SalesFormItem(it);

		loadSalesEntryClassList(salesId, orgId, function (r) {
			salesForm.isClassesEnable(r.length > 0);
			salesForm.OrganizationClassList(r);
			loadSalesEntry(salesId, salesForm, '', function () {
				fnc.salesApp.computeFormColumnTotal(salesForm, function () {
					loadDeposits(salesId, salesForm.depositList, function () {
						loadDepositTypeList(orgId, salesForm.depositTypes, function () {
							loadProjectedSalesOneDay(salesDate, orgId, function (r) {
								if (r != '') {
									salesForm.projectedFoodTotal(r.TotalFood);
									salesForm.projectedBevTotal(r.TotalBev);
									salesForm.projectedOtherTotal(r.TotalOther);
								}
								fnc.salesApp.selectedSalesItem(salesForm);
								loadSalesEntryLockStatus(salesId, function () {
									fnc.salesApp.salesListIsVisible(false);
									fnc.salesApp.salesFormIsVisible(true);
									fnc.salesApp.attachBlurFunctions(function () {
										if (callback) callback();
										windowResized();
										initDatePickerPastDates('#salesDateActualSales');
										fnc.salesApp.initLoad = false;
									});
								});
							});
						});
					});
				});
			});
		})
	};

	self.printOneSales = function (d, e) {
		//debug
		//$('#modPrintOneSales').modal('show');
		//return false;

		//print
		var frame = document.getElementById('prtOneSales');
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
			frameDoc.document.write('<html><head><title>Sales</title>');
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

	self.linkToSetup = function (d, e) {
		load_setup(function () {
			$('.nav.nav-pills>li.active').removeClass("active");
			$('.nav.nav-pills>li.setup-tab').addClass("active");

			$(".tab-pane").removeClass("active");
			$("#setup-page").addClass("active");

			//create virtual element with the same attribute as in the Setup page
			var a = document.createElement("a");
			var h = document.createAttribute("href");
			h.value = "sales-charts-panel";
			a.setAttributeNode(h);

			//call the Setup page method
			var d = {};
			var e = {};
			e.currentTarget = a;

			fnc.setupApp.showSalesSelectedPanel(d, e);
		});
	};

};
