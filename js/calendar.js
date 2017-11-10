/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.calendarApp = new function () {
	//******************
	// default 
	//******************
	var CM_CALENDAR_MIN_YEAR = 2015;

	//******************
	// private 
	//******************
	//objects
	var WeekItem = function (id, days) {
		var self = this;
		self.id = id;
		self.days = days;
	}

	var DayItem = function (date, day, expenses, sales, thisMonth) {
		var self = this;
		self.date = date;
		self.day = ko.observable(day);
		self.expenses = ko.observable(expenses);
		self.sales = ko.observable(sales);
		self.thisMonth = thisMonth;

		self.Flagged = ko.observable(false);

		self.cost = ko.observable('');

		self.showSalesEntryScreen = function (d, e) {
			fnc.calendarApp.searchOrgsFilter('');
			fnc.calendarApp.selectedSalesDay(d);
			fnc.salesApp.calendarSalesDay(fnc.calendarApp.selectedSalesDay());
			fnc.calendarApp.showSalesScreen(function () {
				//				
			});
		}

		self.fxCode = ko.observable(3200);
		self.fxDate = ko.observable('');
		self.fxDay = ko.observable('');
		self.fxHigh = ko.observable('');
		self.fxLow = ko.observable('');
		self.fxText = ko.observable('');

		self.WeekStartDate = ko.observable('');
		self.WeekEndDate = ko.observable('');
		self.WeeklyInvoicesFlag = ko.observable(false);
		self.WeeklySalesCode = ko.observable(3);

		self.SalesCode = ko.observable(3); // 0 - actual; 1 - projected; 2 - mixed; 3 - no sales;
	}
	
	var InvoiceItem = function (it) {
		var self = this;
		self.BevInvAmt = it.BevInvAmt;
		self.BevPurchAmt = it.BevPurchAmt;
		self.Day = it.Day;
		self.FoodInvAmt = it.FoodInvAmt;
		self.FoodPurchAmt = it.FoodPurchAmt;
		self.InvTotal = it.InvTotal;
		self.OtherInvAmt = it.OtherInvAmt;
		self.OtherPurchAmt = it.OtherPurchAmt;
		self.POExists = it.POExists;
		self.POTotal = it.POTotal;
	}

	var CostItem = function (it) {
		//BeveragesSales:"0.0000"
		//Beverages:"0.0000"
		//Day:"2016-05-29"
		//Flagged:"0"
		//Food:"0.0000"
		//FoodSales:"1000.0000"
		//IsProjected:"0" 0 - actuals; 1 - projected; 2 - mixed; 3 - no sales;
		//Other:"0.0000"
		//OtherSales:"0.0000"
		var self = this;
		self.BeveragesSales = it.BeveragesSales;
		self.Beverages = it.Beverages;
		self.Day = it.Day;
		self.Flagged = it.Flagged;
		self.Food = it.Food;
		self.FoodSales = it.FoodSales;
		
		self.fxCode = typeof it.ForecastData.forecast != 'undefined' ? Number(it.ForecastData.forecast.code) : 3200;
		self.fxDate = typeof it.ForecastData.forecast != 'undefined' ? it.ForecastData.forecast.date : '';
		self.fxDay = typeof it.ForecastData.forecast != 'undefined' ? it.ForecastData.forecast.day.toUpperCase() : '';
		self.fxHigh = typeof it.ForecastData.forecast != 'undefined' ? it.ForecastData.forecast.high : '';
		self.fxLow = typeof it.ForecastData.forecast != 'undefined' ? it.ForecastData.forecast.low : '';
		self.fxText = typeof it.ForecastData.forecast != 'undefined' ? it.ForecastData.forecast.text : '';

		self.IsProjected = it.IsProjected;
		self.Other = it.Other;
		self.OtherSales = it.OtherSales;

		self.F_B = Number(self.Beverages) + Number(self.Food);
		self.F_BSales = Number(self.BeveragesSales) + Number(self.FoodSales);

		self.F_O = Number(self.Food) + Number(self.Other);
		self.F_OSales = Number(self.FoodSales) + Number(self.OtherSales);

		self.B_O = Number(self.Beverages) + Number(self.Other);
		self.B_OSales = Number(self.BeveragesSales) + Number(self.OtherSales);

		self.Total = Number(self.Beverages) + Number(self.Food) + Number(self.Other);
		self.TotalSales = Number(self.BeveragesSales) + Number(self.FoodSales) + Number(self.OtherSales);
	}

	var CategoryClassItem = function (it) {
		var self = this;
		self.ClassDescription = it.ClassDescription;
		self.Total = it.total;
	};

	var ProjectedSalesItem = function (it) {
		//TotalFood As Double, TotalBev As Double, TotalOther As Double
		var self = this;
		self.SalesProjectedId = it.SalesProjectedId;
		self.SalesDate = it.SalesDate;
		self.OrgId = it.OrgId;
		self.TotalFood = ko.observable(it.TotalFood).money();
		self.TotalBev = ko.observable(it.TotalBev).money();
		self.TotalOther = ko.observable(it.TotalOther).money();

		//self.isFutureDate = Date.parse(ko.toJSON(self.SalesDate, null, 2)) > Date.parse(ko.toJSON((new Date()).format('yyyy-mm-dd'), null, 2));
		self.isFutureDate = Date.parse(self.SalesDate) >= Date.parse(fnc.calendarApp.today.format('yyyy-mm-dd'));
		self.SalesHistory = ko.observable();

		self.TotalFnB = ko.computed(function () {
			var r = Number(self.TotalFood()) + Number(self.TotalBev());
			if (isNaN(r)) r = 0;
			return r;
		}, self);

		self.GrandTotal = ko.computed(function () {
			var r = Number(self.TotalFood()) + Number(self.TotalBev()) + Number(self.TotalOther());
			if (isNaN(r)) r = 0;
			return r;
		}, self);

		//self.FoodPercentage = ko.computed(function () {
		//	var r = 0;
		//	if (self.TotalFnB() != 0) {
		//		r = (Number(self.TotalFood()) / self.TotalFnB()) * 100;
		//	}
		//	return r;
		//}, self);

		//self.BevPercentage = ko.computed(function () {
		//	var r = 0;
		//	if (self.TotalFnB() != 0) {
		//		r = (Number(self.TotalBev()) / self.TotalFnB()) * 100;
		//	}
		//	return r;
		//}, self);

		self.submitSales = function (d, e) {
			var year = fnc.calendarApp.currentYear();
			var month = fnc.calendarApp.currentMonth();
			var orgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();
			if (fnc.calendarApp.projectedSalesSelectedClass() == undefined){
				if (self.SalesProjectedId == 0) {
					//create
					createProjectedSales(self.SalesDate, self.OrgId, self.TotalFood(), self.TotalBev(), self.TotalOther(), function (r) {
						loadCostCalendar(month, year, orgsIds, function (r) {
							fnc.calendarApp.allItems(r);
							updateDayTotal();
							updateWeekTotal();
							updateMonthTotal();
							validateClasses();
							$('#modProjectedSalesEntry').modal('hide');
							windowResized();
						});
					});
				} else {
					//update
					modifyProjectedSales(self.SalesProjectedId, self.SalesDate, self.OrgId, self.TotalFood(), self.TotalBev(), self.TotalOther(), function () {
						loadCostCalendar(month, year, orgsIds, function (r) {
							fnc.calendarApp.allItems(r);
							updateDayTotal();
							updateWeekTotal();
							updateMonthTotal();
							validateClasses();
							$('#modProjectedSalesEntry').modal('hide');
							windowResized();
						});
					});
				}
			} else {
				//ProjectedSalesClassUpdate(o.Params.SalesDate, o.Params.OrgId, o.Params.ClassCode, o.Params.ClassName, o.Params.FoodTotal, o.Params.BevTotal, o.Params.OtherTotal, o.uc).ToString
				var classCode = fnc.calendarApp.projectedSalesSelectedClass().split('||')[0]
				var className = fnc.calendarApp.projectedSalesSelectedClass().split('||')[1];
				updateClassProjectedSales(self.SalesDate, self.OrgId, classCode, className, self.TotalFood(), self.TotalBev(), self.TotalOther(), function () {
					loadCostClassCalendar(month, year, classCode, className, orgsIds, function (r) {
						fnc.calendarApp.allItems(r);
						updateDayTotal();
						updateWeekTotal();
						updateMonthTotal();
						validateClasses();
						//$('#modProjectedSalesEntry').modal('hide');
						//fnc.calendarApp.selectedOrgClassList().forEach(function (it) {
						//	if (it.ClassKye == fnc.calendarApp.projectedSalesSelectedClass()) {
						//		fnc.calendarApp.selectedClass(it);
						//	}
						//})
						
						windowResized();
					})
				})
			}
		}

		self.goBack = function (d, e) {
			fnc.calendarApp.salesScreenMode('show-sales-locations');
			fnc.calendarApp.selectedProjectedSalesHistory(null);
		}


		self.fxCode = ko.observable(3200);
		self.fxDate = ko.observable('');
		self.fxDay = ko.observable('');
		self.fxHigh = ko.observable('');
		self.fxLow = ko.observable('');
		self.fxText = ko.observable('');

	};

	var SalesHistoryItem = function (it, salesDate) {
		var self = this;

		//******** DAY *******************
		//"SameDayWeek": "2016-05-26",
		//"SameDayLastWeekFood": "0.0000000",
		//"SameDayLastWeekBev": "0.0000000",
		//"SameDayLastWeekOther": "0.0000000",

		//"SameDayMonth": "2016-05-05",
		//"SameDayLastMonthFood": "0.0000000",
		//"SameDayLastMonthBev": "0.0000000",
		//"SameDayLastMonthOther": "0.0000000",

		//"SameDayYear": "2015-06-04",
		//"SameDayLastYearFood": "0.0000000",
		//"SameDayLastYearBev": "0.0000000",
		//"SameDayLastYearOther": "0.0000000",
		self.LastWeekDate = it.SameDayWeek;
		self.LastWeekSDFoodTotal = it.SameDayLastWeekFood;
		self.LastWeekSDBevTotal = it.SameDayLastWeekBev;
		self.LastWeekSDOtherTotal = it.SameDayLastWeekOther;

		self.LastMonthDate = it.SameDayMonth;
		self.LastMonthSDFoodTotal = it.SameDayLastMonthFood;
		self.LastMonthSDBevTotal = it.SameDayLastMonthBev;
		self.LastMonthSDOtherTotal = it.SameDayLastMonthOther;

		self.LastYearDate = it.SameDayYear;
		self.LastYearSDFoodTotal = it.SameDayLastYearFood;
		self.LastYearSDBevTotal = it.SameDayLastYearBev;
		self.LastYearSDOtherTotal = it.SameDayLastYearOther;

		self.Date = salesDate;
		self.Day = getDayOfWeekName(salesDate);

		//******** WEEK *******************
		//"ThisWeekFrom": "2016-05-29",
		//"ThisWeekTo": "2016-06-01",
		//"WTDFood": "0.0000000",
		//"WTDBev": "0.0000000",
		//"WTDOther": "0.0000000",

		//"LastWeekFrom": "2016-05-22",
		//"LastWeekTo": "2016-05-25",
		//"WTDLastWeekFood": "0.0000000",
		//"WTDLastWeekBev": "0.0000000",
		//"WTDLastWeekOther": "800.0000000",

		//"ThisWeekLastMonthFrom": "2016-05-01",
		//"ThisWeekLastMonthTo": "2016-05-04",
		//"WTDLastMonthFood": "0.0000000",
		//"WTDLastMonthBev": "0.0000000",
		//"WTDLastMonthOther": "0.0000000",

		//"ThisWeekLastYearFrom": "2015-05-31",
		//"ThisWeekLastYearTo": "2015-06-03",
		//"WTDLastYearFood": "0.0000000",
		//"WTDLastYearBev": "0.0000000",
		//"WTDLastYearOther": "0.0000000",

		self.ThisWeekDateFrom = it.ThisWeekFrom;
		self.ThisWeekDateTo = it.ThisWeekTo;
		self.ThisWeekWTDFoodTotal = it.WTDFood;
		self.ThisWeekWTDBevTotal = it.WTDBev;
		self.ThisWeekWTDOtherTotal = it.WTDOther;

		self.LastWeekDateFrom = it.LastWeekFrom;
		self.LastWeekDateTo = it.LastWeekTo;
		self.LastWeekWTDFoodTotal = it.WTDLastWeekFood;
		self.LastWeekWTDBevTotal = it.WTDLastWeekBev;
		self.LastWeekWTDOtherTotal = it.WTDLastWeekOther;

		self.LastMonthWeekDateFrom = it.ThisWeekLastMonthFrom;
		self.LastMonthWeekDateTo = it.ThisWeekLastMonthTo;
		self.LastMonthWTDFoodTotal = it.WTDLastMonthFood;
		self.LastMonthWTDBevTotal = it.WTDLastMonthBev;
		self.LastMonthWTDOtherTotal = it.WTDLastMonthOther;

		self.LastYearWeekDateFrom = it.ThisWeekLastYearFrom;
		self.LastYearWeekDateTo = it.ThisWeekLastYearTo;
		self.LastYearWTDFoodTotal = it.WTDLastYearFood;
		self.LastYearWTDBevTotal = it.WTDLastYearBev;
		self.LastYearWTDOtherTotal = it.WTDLastYearOther;


		//******** MONTH *******************
		//"ThisMonthFrom": "2016-06-05",
		//"ThisMonthTo": "2016-06-01",
		//"MTDFood": "0.0000000",
		//"MTDBev": "0.0000000",
		//"MTDOther": "0.0000000",

		//"LastMonthFrom": "2016-05-01",
		//"LastMonthTo": "2016-05-04",
		//"MTDLastMothFood": "0.0000000",
		//"MTDLastMothBev": "0.0000000",
		//"MTDLastMothOther": "0.0000000",

		//"ThisMonthLastYearFrom": "2015-06-07",
		//"ThisMonthLastYearTo": "2015-06-03",
		//"MTDLastYearFood": "0.0000000",
		//"MTDLastYearBev": "0.0000000",
		//"MTDLastYearOther": "0.0000000",

		self.ThisMonthDateFrom = it.ThisMonthFrom;
		self.ThisMonthDateTo = it.ThisMonthTo;
		self.ThisMonthMTDFoodTotal = it.MTDFood;
		self.ThisMonthMTDBevTotal = it.MTDBev;
		self.ThisMonthMTDOtherTotal = it.MTDOther;

		self.LastMonthDateFrom = it.LastMonthFrom;
		self.LastMonthDateTo = it.LastMonthTo;
		self.LastMonthMTDFoodTotal = it.MTDLastMothFood;
		self.LastMonthMTDBevTotal = it.MTDLastMonthBev;
		self.LastMonthMTDOtherTotal = it.MTDLastMonthOther;

		self.LastYearMonthDateFrom = it.ThisMonthLastYearFrom;
		self.LastYearMonthDateTo = it.ThisMonthLastYearTo;
		self.LastYearMTDFoodTotal = it.MTDLastYearFood;
		self.LastYearMTDBevTotal = it.MTDLastYearBev;
		self.LastYearMTDOtherTotal = it.MTDLastYearOther;



		//******** YEAR *******************
		//"ThisYearFrom": "2016-01-03",
		//"ThisYearTo": "2016-06-01",
		//"YTDFood": "0.0000000",
		//"YTDBev": "0.0000000",
		//"YTDOther": "800.0000000",

		//"LastYearFrom": "2015-01-04",
		//"LastYearTo": "2015-06-03",
		//"YTDLastYearFood": "0.0000000",
		//"YTDLastYearBev": "0.0000000",
		//"YTDLastYearOther": "0.0000000",
		self.ThisYearDateFrom = it.ThisYearFrom;
		self.ThisYearDateTo = it.ThisYearTo;
		self.ThisYearYTDFoodTotal = it.YTDFood;
		self.ThisYearYTDBevTotal = it.YTDBev;
		self.ThisYearYTDOtherTotal = it.YTDOther;

		self.LastYearDateFrom = it.LastYearFrom;
		self.LastYearDateTo = it.LastYearTo;
		self.LastYearYTDFoodTotal = it.YTDLastYearFood;
		self.LastYearYTDBevTotal = it.YTDLastYearBev;
		self.LastYearYTDOtherTotal = it.YTDLastYearOther;

		//******** MAX/MIN ***************
		//"MaxFood": "0.0000000",
		//"MaxBev": "0.0000000",
		//"MaxOther": "0.0000000",
		//"MinFood": "0.0000000",
		//"MinBev": "0.0000000",
		//"MinOther": "0.0000000"
		self.MaxFood = it.MaxFood;
		self.MaxBev = it.MaxBev;
		self.MaxOther = it.MaxOther;
		self.MinFood = it.MinFood;
		self.MinBev = it.MinBev;
		self.MinOther = it.MinOther;
		self.AvgFood = (Number(it.MinFood) + Number(it.MaxFood)) / 2;
		self.AvgBev = (Number(it.MinBev) + Number(it.MaxBev)) / 2;
		self.AvgOther = (Number(it.MinOther) + Number(it.MaxOther)) / 2;
	};

	var SalesSummaryItem = function (it) {
		//<OrgId>151</OrgId>
		//<OrgName>ChefMod, LLC.</OrgName>
		//<ActualTotal>4000.0000000</ActualTotal>
		//<ActualAccepted>0</ActualAccepted>
		//<ActualSalesId>19</ActualSalesId>
		//<ProjectedTotal>630.0000000</ProjectedTotal>
		//<ProjectedSalesId>1</ProjectedSalesId>
		var self = this;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.ActualTotal = it.ActualTotal;
		self.ActualAccepted = it.ActualAccepted;
		self.ActualSalesId = it.ActualSalesId;
		self.GLChartExists = it.GLChartExists;
		self.ProjectedTotal = it.ProjectedTotal;
		self.ProjectedSalesId = it.ProjectedSalesId;
		self.SalesDate = it.SalesDate;

		//self.isFutureDate = Date.parse(ko.toJSON(self.SalesDate, null, 2)) > Date.parse(ko.toJSON((new Date()).format('yyyy-mm-dd'), null, 2));
		self.isFutureDate = Date.parse(self.SalesDate) >= Date.parse(fnc.calendarApp.today.format('yyyy-mm-dd'));
		self.ProjectedText = ko.computed(function () {
			var r = '';
			if (self.ProjectedSalesId == '0') {
				if (self.isFutureDate && fnc.app.prvSalesManageProjectedEnable()) {
					r = 'Enter';
				} else {
					r = 'N/A';
				}
			} else {
				r = formatCurrency(self.ProjectedTotal);
			}
			return r;
		});

		self.ActualText = ko.computed(function () {
			var r = '';
			if (self.ActualSalesId == '0') {
				if (fnc.app.prvSalesManageActualEnable() && (self.GLChartExists == '1')) {
					r = 'Enter';
				} else {
					r = 'N/A';
				}
			} else {
				r = formatCurrency(self.ActualTotal);
			}
			return r;
		});

		self.showActualSales = function (d, e) {
			//yyyy-mm-dd
			var nd = new Date(Number(d.SalesDate.substr(0, 4)), Number(d.SalesDate.substr(5, 2)) - 1, Number(d.SalesDate.substr(8, 2)));
			var salesDate = nd.format("mm/dd/yyyy");
			//fnc.salesApp.calendarSalesDay(fnc.calendarApp.selectedSalesDay());
			$('#modProjectedSalesEntry').modal('hide');
			$('#modProjectedSalesEntry').one('hidden.bs.modal', function (e) {
				//clean screen
				$("#home-page").html("");
				windowResized();
				//switch to sales
				var orgId = self.OrgId;
				var orgName = self.OrgName;
				var salesId = self.ActualSalesId;
				resetSalesVariables();
				if (salesId == '0') {
					//new sales
					fnc.salesApp.enterNewSales(orgId, orgName, salesDate, function () {
						$("#sales-page").load("sales.html" + appV + " #slsApp", function () {
							ko.applyBindings(fnc.salesApp, slsApp);

							$('.nav.nav-pills>li.active').removeClass("active");
							$('.nav.nav-pills>li.sales-tab').addClass("active");

							$(".tab-pane").removeClass("active");
							$("#sales-page").addClass("active");

							$("#salesListLocation").height(salesListLocationHeight);
							$("#tblSalesListBody").height(salesListTableHeight);
							$("#salesListRightSideBar").height(salesListRighSideBarHeight);

							windowResized();
							//initDatePickerAllDates();
							initDatePickerPastDates('#salesDateActualSales');
						});
					})
				} else {
					fnc.salesApp.drilldownToSales(orgId, orgName, salesDate, salesId, function () {
						$("#sales-page").load("sales.html" + appV + " #slsApp", function () {
							ko.applyBindings(fnc.salesApp, slsApp);

							fnc.salesApp.selectedSalesItem().SelectedClassKey(fnc.calendarApp.selectedClass() ? fnc.calendarApp.selectedClass().ClassKye : null);

							$('.nav.nav-pills>li.active').removeClass("active");
							$('.nav.nav-pills>li.sales-tab').addClass("active");

							$(".tab-pane").removeClass("active");
							$("#sales-page").addClass("active");

							$("#salesListLocation").height(salesListLocationHeight);
							$("#tblSalesListBody").height(salesListTableHeight);
							$("#salesListRightSideBar").height(salesListRighSideBarHeight);

							windowResized();
							//initDatePickerAllDates();
							initDatePickerPastDates('#salesDateActualSales');
						});
					});
				}

			})
		}

		self.showProjectedSales = function (d, e) {
			var salesDate = fnc.calendarApp.selectedSalesDay().day();
			var orgId = self.OrgId;

			//
			var fromDate = fnc.calendarApp.fromDate1();
			var toDate = fnc.calendarApp.toDate1();
			loadCostCalendarClassList(fromDate, toDate, orgId, function (r) {
				fnc.calendarApp.projectedSalesClassList(r);
				if (fnc.calendarApp.projectedSalesClassList().length) {
					if (fnc.calendarApp.selectedClass() != null) {
						fnc.calendarApp.projectedSalesClassList().forEach(function (it) {
							if (it.ClassName == fnc.calendarApp.selectedClass().ClassName) {
								fnc.calendarApp.projectedSalesSelectedClass(it.ClassCode + '||' + it.ClassName);
							}
						})
					}
				}
			})


			if (fnc.calendarApp.selectedClass() != null) {
				var classCode = fnc.calendarApp.selectedClass().ClassCode;
				var className = fnc.calendarApp.selectedClass().ClassName;
				loadProjectedSalesClassOneDay(salesDate, orgId, classCode, className, function (r) {
					console.log(r);
					var it = {};
					if (r == '') {
						//new
						it.SalesProjectedId = 0;
						it.SalesDate = salesDate;
						it.OrgId = orgId;
						it.TotalFood = 0;
						it.TotalBev = 0;
						it.TotalOther = 0;
					} else {
						//
						it.SalesProjectedId = r.SalesProjectedId;
						it.SalesDate = r.SalesDate;
						it.OrgId = orgId;
						it.TotalFood = r.TotalFood;
						it.TotalBev = r.TotalBev;
						it.TotalOther = r.TotalOther;
					}

					var projSales = new ProjectedSalesItem(it);

					//weather
					var arr = ko.observableArray();
					fnc.weatherApp.loadOneDayForecast(salesDate, orgId, arr, function () {
						if (arr() != null) {
							projSales.fxCode(arr()[0].Code);
							projSales.fxDate(arr()[0].Date);
							projSales.fxDay(arr()[0].Day);
							projSales.fxHigh(arr()[0].High);
							projSales.fxLow(arr()[0].Low);
							projSales.fxText(arr()[0].Text);
							//console.log(ko.toJSON(projSales, null, 2))
						}
					})

					fnc.calendarApp.selectedProjectedSalesItem(projSales);
					fnc.calendarApp.salesScreenMode('show-sales-item');
					//$('#modProjectedSalesEntry').modal('show');
					//$('#modProjectedSalesEntry').one('hidden.bs.modal', function (e) {
					//	resetSalesVariables();
					//})
				})

				loadSalesProjectedClassHistory(salesDate, orgId, classCode, className, function (r) {
					fnc.calendarApp.selectedProjectedSalesHistory(r);
				})

			} else {
				loadProjectedSalesOneDay(salesDate, orgId, function (r) {
					var it = {};
					if (r == '') {
						//new
						it.SalesProjectedId = 0;
						it.SalesDate = salesDate;
						it.OrgId = orgId;
						it.TotalFood = 0;
						it.TotalBev = 0;
						it.TotalOther = 0;
					} else {
						//
						it.SalesProjectedId = r.SalesProjectedId;
						it.SalesDate = r.SalesDate;
						it.OrgId = orgId;
						it.TotalFood = r.TotalFood;
						it.TotalBev = r.TotalBev;
						it.TotalOther = r.TotalOther;
					}

					var projSales = new ProjectedSalesItem(it);

					//weather
					var arr = ko.observableArray();
					fnc.weatherApp.loadOneDayForecast(salesDate, orgId, arr, function () {
						if (arr()[0]) {
							projSales.fxCode(arr()[0].Code);
							projSales.fxDate(arr()[0].Date);
							projSales.fxDay(arr()[0].Day);
							projSales.fxHigh(arr()[0].High);
							projSales.fxLow(arr()[0].Low);
							projSales.fxText(arr()[0].Text);
							//console.log(ko.toJSON(projSales, null, 2))
						}
					})

					fnc.calendarApp.selectedProjectedSalesItem(projSales);
					fnc.calendarApp.salesScreenMode('show-sales-item');
					//$('#modProjectedSalesEntry').modal('show');
					//$('#modProjectedSalesEntry').one('hidden.bs.modal', function (e) {
					//	resetSalesVariables();
					//})
				})

				loadSalesHistory(salesDate, orgId, function (r) {
					fnc.calendarApp.selectedProjectedSalesHistory(r);
				});

			}
		}

	};

	var cmDropdownMonth = function (month, name, abbr) {
		var self = this;
		self.Number = month;
		self.Name = name;
		self.Abbrevation = abbr;

		self.Selected = ko.observable(false);
	};

	var cmDropdownYear = function (year) {
		var self = this;
		self.Year = year;

		self.Selected = ko.observable(false);
	};

	var cmCalendarMonth = function (month, name, abbr) {
		var self = this;
		self.Number = month;
		self.Name = name;
		self.Abbrevation = abbr;

		self.Selected = ko.observable(false);

		self.MonthClick = function (d, e) {
			$('.cm-calendar-toggle').dropdown('toggle');
			var m = self.Number;
			var y = Number(e.currentTarget.getAttribute('data-cm-year'));
			if ((y >= CM_CALENDAR_MIN_YEAR) && (y <= fnc.calendarApp.today.getFullYear() + 1)) {
				fnc.calendarApp.currentYear(y);
				fnc.calendarApp.currentMonth(m);
			}
			
		}
	};

	var cmCalendarYear = function (year) {
		var self = this;
		self.Year = year;

		self.Selected = ko.observable(false);
		self.Visible = ko.observable(false);

		self.YearClick = function () {
			validateCmCalindarYears(self.Year, fnc.calendarApp.cmCalendarYears, function () {
				fnc.calendarApp.selectedCmCalendarYear(self.Year);
			});
		};
	};

	var MonthlyCostItem = function (it) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
		//mid: "1"
		//mname: "January"
		var self = this;

		self.InvBev = it.InvBev;
		self.InvFood = it.InvFood;
		self.InvOther = it.InvOther;
		self.InvTotal = it.InvTotal;

		self.POBev = it.POBev;
		self.POFood = it.POFood;
		self.POOther = it.POOther;
		self.POTotal = it.POTotal;

		self.SalesBev = it.SalesBev;
		self.SalesFood = it.SalesFood;
		self.SalesOther = it.SalesOther;
		self.SalesTotal = it.SalesTotal;

		self.mid = it.mid;
		self.mname = it.mname;

	};

	var CostCenterItem = function (it) {
		var self = this;
		self.ClassCode = it.ClassCode;
		self.ClassName = it.ClassName;
		self.ClassKye = it.ClassCode + '||' + it.ClassName
	};

	//functions
	//cost centers

	var loadCostCalendarClassList = function (fromDate, toDate, orgIds, callback) {
		//CostCalendarLoadClassList(o.Params.FromDate, o.Params.ToDate, o.Params.OrgsIds)
		var params = {};
		params.FromDate = fromDate;
		params.ToDate = toDate;
		params.OrgsIds = orgIds;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.CostCalendarLoadClassList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new CostCenterItem(it)) })
			} else {
				arr.push(new CostCenterItem(obj))
			}

			if (callback) return callback(arr);
		})

	}

	//projection sales
	var resetSalesVariables = function () {
		fnc.calendarApp.selectedSalesDay(null);
		fnc.calendarApp.selectedSalesLocation(null);
		fnc.calendarApp.selectedProjectedSalesItem(null);
		fnc.calendarApp.selectedProjectedSalesHistory(null);

		//fnc.calendarApp.projectedSalesSelectedClass(null);
	};

	var createProjectedSales = function (salesDate, orgId, foodTotal, bevTotal, otherTotal, callback) {
		//client.CreateProjectedSales(o.Params.SalesDate, o.Params.OrgId, o.Params.FoodTotal, o.Params.BevTotal, o.Params.OtherTotal, o.uc).ToString
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;
		params.FoodTotal = foodTotal;
		params.BevTotal = bevTotal;
		params.OtherTotal = otherTotal;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.CreateProjectedSales", params, function (response) {
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

			if (callback) callback(r);
		});
	};

	var loadOneDayOrganizationSummary = function (salesDate, orgIds, callback) {
		//LoadOneDayOrganizationSummary(o.Params.SalesDate, o.Params.OrgIds)

		var params = {};
		params.SalesDate = salesDate;
		params.OrgIds = orgIds;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.LoadOneDayOrganizationSummary", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new SalesSummaryItem(it)) })
			} else {
				arr.push(new SalesSummaryItem(obj))
			}

			if (callback) callback(arr);
		});
	};

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

	var loadProjectedSalesClassOneDay = function (salesDate, orgId, classCode, className, callback) {
		//ProjectedSalesClassLoadOneDay(o.Params.SalesDate, o.Params.OrgId, o.Params.ClassCode, o.Params.ClassName)
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;
		params.ClassCode = classCode;
		params.ClassName = className;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ProjectedSalesClassLoadOneDay", params, function (response) {
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
	}

	var updateProjectedSalesClass = function (salesDate, orgId, classCode, className, foodTotal, bevTotal, otherTotal, callback) {
		//ProjectedSalesClassUpdate(o.Params.SalesDate, o.Params.OrgId, o.Params.ClassCode, o.Params.ClassName, o.Params.FoodTotal, o.Params.BevTotal, o.Params.OtherTotal, o.uc).ToString
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;
		params.ClassCode = classCode;
		params.ClassName = className;
		params.FoodTotal = foodTotal;
		params.BevTotal = bevTotal;
		params.OtherTotal = otherTotal;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ProjectedSalesClassUpdate", params, function (response) {
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


	var modifyProjectedSales = function (salesProjId, salesDate, orgId, foodTotal, bevTotal, otherTotal, callback) {
		//ModifyProjectedSales(o.Params.SalesProjectedId, o.Params.SalesDate, o.Params.OrgId, o.Params.FoodTotal, o.Params.BevTotal, o.Params.OtherTotal, o.uc)
		var params = {};
		params.SalesProjectedId = salesProjId;
		params.SalesDate = salesDate;
		params.OrgId = orgId;
		params.FoodTotal = foodTotal;
		params.BevTotal = bevTotal;
		params.OtherTotal = otherTotal;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ModifyProjectedSales", params, function (response) {
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

	var updateClassProjectedSales = function (salesDate, orgId, classCode, className, foodTotal, bevTotal, otherTotal, callback) {
		//ProjectedSalesClassUpdate(o.Params.SalesDate, o.Params.OrgId, o.Params.ClassCode, o.Params.ClassName, o.Params.FoodTotal, o.Params.BevTotal, o.Params.OtherTotal, o.uc).ToString
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;
		params.ClassCode = classCode;
		params.ClassName = className;
		params.FoodTotal = foodTotal;
		params.BevTotal = bevTotal;
		params.OtherTotal = otherTotal;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.ProjectedSalesClassUpdate", params, function (response) {
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


	var removeProjectedSales = function (salesProjId, callback) {
		//RemoveProjectedSales(o.Params.SalesProjectedId, o.uc)
		var params = {};
		params.SalesProjectedId = salesProjId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.SalesEntries.RemoveProjectedSales", params, function (response) {
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

	var loadSalesProjectedClassHistory = function (salesDate, orgId, classCode, className, callback) {
		//SalesProjectedClassHistory(o.Params.SalesDate, o.Params.ClassCode, o.Params.ClassName, o.Params.OrgId)
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;
		params.ClassCode = classCode;
		params.ClassName = className;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.SalesProjectedClassHistory", params, function (response) {
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
			var it = new SalesHistoryItem(obj, salesDate);
			if (callback) callback(it);
		});
	};

	var loadSalesHistory = function (salesDate, orgId, callback) {
		//SalesProjectedHistory(o.Params.SalesDate, o.Params.OrgId)
		var params = {};
		params.SalesDate = salesDate;
		params.OrgId = orgId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.SalesProjectedHistory", params, function (response) {
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
			var it = new SalesHistoryItem(obj, salesDate);
			if (callback) callback(it);
		});
	};

	var calculateCost = function (expenses, sales) {
		var r = '';
		if (expenses == 0 && sales == 0) {
			r = '';
		} else {
			if (sales == 0) {
				r = '100.00%';
			} else {
				r = (100 * (expenses / sales)).toFixed(2) + '%';
				if (r == '0.00%') r = '';
			}
		}
		return r;
	};
	//
	var loadCalendar = function (year, month, callback) {
		var mLength = new Date(year, month, 1).getDay();
		var mIndex = 1 - mLength;
		var arrDays = [];
		var arrWeeks = [];

		for (var w = 0; w < 6; w++) {
			var weekTotalPurchases = 0;
			var weekTotalExpenses = 0;
			arrDays = [];
			for (var d = 0; d < 7; d++) {
				var t, day, month2, thisMonth;
				t = new Date(year, month, mIndex);
				day = t.getDate().toString();
				month2 = t.getMonth();
				thisMonth = fnc.calendarApp.currentMonth() == month2;
				var item = new DayItem(day, t.format("yyyy-mm-dd"), 0, 0, thisMonth);
				arrDays.push(item);
				mIndex++;
			}
			var item = new DayItem(" ", "", weekTotalExpenses, weekTotalPurchases, false);
			arrDays.push(item);
			var week = new WeekItem(w, arrDays);
			arrWeeks.push(week);
		}

		fnc.calendarApp.calendarWeeks(arrWeeks);

		if (callback) callback();
	}

	var makeCalendarFromArray = function (arr, month, callback) {
		fnc.calendarApp.calendarHeader.removeAll();
		var arrDays = [], arrWeeks = [];
		var d = 0, w = 0;
		for (var i = 0; i < arr.length; i++) {
			var date, day, thisMonth;
			var it = arr[i];
			day = it.Day;
			var parts = day.split("-");
			date = Number(parts[2]);
			thisMonth = ((month + 1) == Number(parts[1]));
			if (d < 7) {
				var item = new DayItem(date, day, 0, 0, thisMonth);
				arrDays.push(item);
				if (w == 0) {
					fnc.calendarApp.calendarHeader.push(getDayOfWeekName(day).substr(0,3));
				}
				d++;
			}
			if (d == 7) {
				var item = new DayItem(" ", "", 0, 0, false);
				arrDays.push(item);
				var week = new WeekItem(w, arrDays);
				arrWeeks.push(week);
				w++;
				arrDays = [];
				d = 0;
			}
		}
		if (callback) callback(arrWeeks);
	}

	var showChart_ReconciliationStats = function (callback) {
		$.ajax({
			url: '//www.google.com/jsapi',
			dataType: 'script',
			cache: true,
			success: function () {
				google.load('visualization', '1', {
					'packages': ['corechart', 'bar', 'gauge', 'table'],
					'callback': drawChart
				});
			}
		});

		function drawChart() {
			var data = google.visualization.arrayToDataTable([
			['Label', 'Value'],
			['%', self.reconciledPercentage()]
			]);

			var options = {
				width: 120, height: 120,
				redFrom: 0, redTo: 25,
				yellowFrom: 25, yellowTo: 75,
				greenFrom: 75, greenTo: 100,
				minorTicks: 5,
				title: 'Reconciled %'
			};

			var chart = new google.visualization.Gauge(document.getElementById('chart_div1'));

			chart.draw(data, options);

			if (callback) callback();
		}

	}

	var showChart_YTDCost = function (callback) {
		$.ajax({
			url: '//www.google.com/jsapi',
			dataType: 'script',
			cache: true,
			success: function () {
				google.load('visualization', '1', {
					'packages': ['corechart', 'bar', 'gauge', 'table'],
					'callback': drawChart
				});
			}
		});
		function drawChart() {
			//var arr = [];
			//arr = copy2DArrayByColumn(self.monthlySummaryItems(), '0,1');
			//var data = google.visualization.arrayToDataTable(arr);

			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Month');
			data.addColumn('number', 'PO+Inv. Total ');
			data.addColumn('number', 'Sales Total');

			data.addRows([
				['Jan', self.ytdChartData()[0][1], self.ytdChartData()[0][2]],
				['Feb', self.ytdChartData()[1][1], self.ytdChartData()[1][2]],
				['Mar', self.ytdChartData()[2][1], self.ytdChartData()[2][2]],
				['Apr', self.ytdChartData()[3][1], self.ytdChartData()[3][2]],
				['May', self.ytdChartData()[4][1], self.ytdChartData()[4][2]],
				['Jun', self.ytdChartData()[5][1], self.ytdChartData()[5][2]],
				['Jul', self.ytdChartData()[6][1], self.ytdChartData()[6][2]],
				['Aug', self.ytdChartData()[7][1], self.ytdChartData()[7][2]],
				['Sep', self.ytdChartData()[8][1], self.ytdChartData()[8][2]],
				['Oct', self.ytdChartData()[9][1], self.ytdChartData()[9][2]],
				['Nov', self.ytdChartData()[10][1], self.ytdChartData()[10][2]],
				['Dec', self.ytdChartData()[11][1], self.ytdChartData()[11][2]]
			]);


			var options = {
				title: null,
				legend: { position: 'none' },
				colors: ['brown', 'green'],
				chartArea: {
					top: 0,
					height: '100%',
					width: '70%',
				},
				//isStacked: true,
			};

			var chart = new google.visualization.BarChart(document.getElementById('chart_div2'));
			chart.draw(data, options);

			if (callback) callback();
		}
	};

	//copy 2D array based on the columns list
	var copy2DArrayByColumn = function (arr, columns) {
		var arr2 = [];
		for (var i = 0; i < arr.length; i++) {
			var row = arr[i];
			var row2 = [];
			for (var j = 0; j < row.length; j++) {
				if (columns.indexOf(j) != -1) {
					row2.push(row[j]);
				}
			}
			arr2.push(row2);
		}
		return arr2;
	};

	var loadCostCalendar = function (month, year, orgsIds, callback) {
		//CostCalendar(o.Params.Month, o.Params.Year, o.Params.OrgsIds)

		var params = {};
		params.Month = month + 1;
		params.Year = year;
		params.OrgsIds = orgsIds;


		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Home.CostCalendar", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback([]);
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
					arr.push(new CostItem(it));
				})
			} else {
				arr.push(new CostItem(obj));
			}

			if (callback) callback(arr);
		})
	};
	

	var loadCostClassCalendar = function (month, year, classCode, className, orgsIds, callback) {
		//CostClassCalendar(o.Params.Month, o.Params.Year, o.Params.ClassCode, o.Params.ClassName, o.Params.OrgsIds)
		var params = {};
		params.Month = month + 1;
		params.Year = year;
		params.ClassCode = classCode;
		params.ClassName = className;
		params.OrgsIds = orgsIds;


		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Home.CostClassCalendar", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback([]);
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
					arr.push(new CostItem(it));
				})
			} else {
				arr.push(new CostItem(obj));
			}

			if (callback) callback(arr);
		})
	}

	var loadInvoiceSumByDay = function (fromDate, toDate, orgsIds, callback) {
		var params = {};
		params.FromDate = fromDate;
		params.ToDate = toDate;
		params.OrgsIds = orgsIds;

		//InvoiceSummaryByDay(o.Params.FromDate, o.Params.ToDate, o.Params.OrgsIds)

		loading(true);
		self.allItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.InvoiceSummaryByDay", params, function (response) {
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
					arr.push(new InvoiceItem(it));
				})
			} else {
				arr.push(new InvoiceItem(obj));
			}
			self.allItems(arr);
			if (callback) callback();
		})

	}

	var loadReconciliationPerfStats = function (fromDate, toDate, orgsIds, callback) {
		var params = {};
		params.FromDate = fromDate;
		params.ToDate = toDate;
		params.OrgsIds = orgsIds;

		//ReconciliationPerfStats(o.Params.FromDate, o.Params.ToDate, o.Params.OrgsIds)
		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.Home.ReconciliationPerfStats", params, function (response) {
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

			self.reconciledQtyForThisPeriod(Number(obj.Reconciled));
			self.noReconciledQtyForThisPeriod(Number(obj.NoReconciled));

			if (callback) callback();
		})

	}

	var loadReconciliationPerfStats2 = function (month, year, orgsIds, callback) {
		var params = {};
		params.Month = month + 1;
		params.Year = year;
		params.OrgsIds = orgsIds;

		//loading(true);
		$('#chart_div1').html('<img src="img/loading.gif" class="center-spin-image" />');

		ajaxPost("ChefMod.Financials.UI.Controllers.Home.ReconciliationPerfStats2", params, function (response) {
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

			self.reconciledQtyForThisPeriod(Number(obj.Reconciled));
			self.noReconciledQtyForThisPeriod(Number(obj.NoReconciled));

			if (callback) callback();
		})

	}

	var loadInvoiceSummaryMTDCategory = function (month, year, orgsIds, callback) {
		var params = {};
		params.Month = month + 1;
		params.Year = year;
		params.OrgsIds = orgsIds;

		//InvoiceSummaryMTDCategoryClass(o.Params.OrgsIds, o.Params.Month, o.Params.Year)

		loading(true);
		self.monthlyCategorySummaryItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.InvoiceSummaryMTDCategoryClass", params, function (response) {
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
				self.MTDBeverageExpences(Number(obj[0].total));
				self.MTDFoodExpences(Number(obj[1].total));
				self.MTDOtherExpences(Number(obj[2].total));
				obj.forEach(function (it) {
					arr.push(new CategoryClassItem(it));
				})
			} else {
				arr.push(new CategoryClassItem(obj));
			}

			self.monthlyCategorySummaryItems(arr);

			if (callback) callback();
		})

	}

	var loadInvoiceSummaryYTDMonthly = function (year, orgsIds, callback) {
		var params = {};
		params.Year = year;
		params.OrgsIds = orgsIds;

		//InvoiceSummaryYTDMonthly(o.Params.Year, o.Params.OrgsIds)

		loading(true);
		self.monthlySummaryItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.InvoiceSummaryYTDMonthly", params, function (response) {
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
			var empty = true;
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push([it.Month, Number(Number(it.Total).toFixed(2))]);
					if (Number(Number(it.Total).toFixed(2)) > 0) empty = false;
				})
			} else {
				arr.push([obj.Month, obj.Total]);
				if (Number(Number(obj.Total).toFixed(2)) > 0) empty = false;
			}

			//if (!empty) {
				self.monthlySummaryItems(arr);
			//}

			if (callback) callback();
		})

	}

	var loadYTDCostMonthly = function (year, orgsIds, callback) {
		var params = {};
		params.Year = year;
		params.OrgsIds = orgsIds;

		//loading(true);
		$('#chart_div2').html('<img src="img/loading.gif" class="center-spin-image" />');

		self.monthlySummaryItems.removeAll();
		self.monthlyCostItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.YTDCostMonthly", params, function (response) {
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
			var empty = true;
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new MonthlyCostItem(it));
				})
			} else {
				arr.push(new MonthlyCostItem(obj));
			}

			self.monthlyCostItems(arr);
			if (callback) callback();
		})
	};

	var loadYTDCostClassMonthly = function (year, classCode, className, orgsIds, callback) {
		//YTDCostClasstMonthly(o.Params.Year, o.Params.ClassCode, o.Params.ClassName, o.Params.OrgsIds)
		var params = {};
		params.Year = year;
		params.ClassCode = classCode;
		params.ClassName = className;
		params.OrgsIds = orgsIds;

		//loading(true);
		$('#chart_div2').html('<img src="img/loading.gif" class="center-spin-image" />');

		self.monthlySummaryItems.removeAll();
		self.monthlyCostItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Home.YTDCostClasstMonthly", params, function (response) {
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
			var empty = true;
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) {
					arr.push(new MonthlyCostItem(it));
				})
			} else {
				arr.push(new MonthlyCostItem(obj));
			}

			self.monthlyCostItems(arr);
			if (callback) callback();
		})
	}

	var updateMTDSummary = function () {
		if (self.monthlyCostItems().length == 0) return;
		self.loadingMTDChart(true);
		setTimeout(function () {
			var i = self.currentMonth();
			var it = self.monthlyCostItems()[i];
			var cT1, cT2, cT3, sT1, sT2, sT3

			//cost
			cT1 = Number(Number(it.InvFood) + Number(it.POFood)).toFixed(2);
			cT2 = Number(Number(it.InvBev) + Number(it.POBev)).toFixed(2);
			cT3 = Number(Number(it.InvOther) + Number(it.POOther)).toFixed(2);
			self.MTDFoodExpences(cT1);
			self.MTDBeverageExpences(cT2);
			self.MTDOtherExpences(cT3);
			self.MTDTotal(Number(Number(it.InvTotal) + Number(it.POTotal)).toFixed(2));
			//sales
			sT1 = Number(it.SalesFood).toFixed(2);
			sT2 = Number(it.SalesBev).toFixed(2);
			sT3 = Number(it.SalesOther).toFixed(2);
			self.MTDFoodSales(sT1);
			self.MTDBeverageSales(sT2);
			self.MTDOtherSales(sT3);
			self.MTDSalesTotal(Number(it.SalesTotal).toFixed(2));
			self.loadingMTDChart(false);
		}, 400);
	}

	var updateDayTotal = function () {
		for (var i = 0; i < self.allItems().length; i++) {
			var itDay = self.allItems()[i].Day;
			for (var w = 0; w < 6; w++) {
				for (var d = 0; d < 7; d++) {
					var clDay = self.calendarWeeks()[w].days[d].day();
					if (itDay == clDay) {
						switch (self.dataSumType()) {
							case 'food_bev':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].F_B);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].F_BSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].F_B, self.allItems()[i].F_BSales));
								break;
							case 'food_other':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].F_O);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].F_OSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].F_O, self.allItems()[i].F_OSales));
								break;
							case 'total':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].Total);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].TotalSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].Total, self.allItems()[i].TotalSales));
								break;
							case 'bev_other':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].B_O);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].B_OSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].B_O, self.allItems()[i].B_OSales));
								break;
							case 'food':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].Food);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].FoodSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].Food, self.allItems()[i].FoodSales));
								break;
							case 'bev':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].Beverages);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].BeveragesSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].Beverages, self.allItems()[i].BeveragesSales));
								break;
							case 'other':
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].Other);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].OtherSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].Other, self.allItems()[i].OtherSales));
								break;
							default:
								self.calendarWeeks()[w].days[d].expenses(self.allItems()[i].Total);
								self.calendarWeeks()[w].days[d].sales(self.allItems()[i].TotalSales);
								self.calendarWeeks()[w].days[d].cost(calculateCost(self.allItems()[i].Total, self.allItems()[i].TotalSales));
						}
						self.calendarWeeks()[w].days[d].Flagged(self.allItems()[i].Flagged == '1');
						self.calendarWeeks()[w].days[d].fxCode(self.allItems()[i].fxCode);
						self.calendarWeeks()[w].days[d].fxDate((new Date(self.allItems()[i].fxDate)).toLocaleDateString());
						self.calendarWeeks()[w].days[d].fxDay(self.allItems()[i].fxDay);
						self.calendarWeeks()[w].days[d].fxHigh(self.allItems()[i].fxHigh);
						self.calendarWeeks()[w].days[d].fxLow(self.allItems()[i].fxLow);
						self.calendarWeeks()[w].days[d].fxText(self.allItems()[i].fxText);

						self.calendarWeeks()[w].days[d].SalesCode(self.allItems()[i].IsProjected);
						//SalesCode
						break;
					}
				}
			}
		}
	}

	var updateWeekTotal = function () {
		for (var w = 0; w < 6; w++) {
			var total = 0;
			var total2 = 0;
			var invoicesFlag = false;
			var salesCode = -1;
			for (var d = 0; d < 7; d++) {
				total += Number(self.calendarWeeks()[w].days[d].expenses());
				total2 += Number(self.calendarWeeks()[w].days[d].sales());
				if (self.calendarWeeks()[w].days[d].Flagged()) invoicesFlag = true;
				if (self.calendarWeeks()[w].days[d].SalesCode() != salesCode) {
					if (salesCode == -1) {
						salesCode = self.calendarWeeks()[w].days[d].SalesCode();
					} else {
						if ((salesCode == 3 && self.calendarWeeks()[w].days[d].SalesCode() == 1) || (salesCode == 1 && self.calendarWeeks()[w].days[d].SalesCode() == 3)) {
							salesCode = 1;
						} else if ((salesCode == 3 && self.calendarWeeks()[w].days[d].SalesCode() == 0) || (salesCode ==0 && self.calendarWeeks()[w].days[d].SalesCode() == 3)) {
							salesCode = 0;
						}
						else {
							salesCode = 2;
						};
					}
				};
			}
			self.calendarWeeks()[w].days[d].WeekStartDate(self.calendarWeeks()[w].days[0].day());
			self.calendarWeeks()[w].days[d].WeekEndDate(self.calendarWeeks()[w].days[6].day());
			if (invoicesFlag) {
				self.calendarWeeks()[w].days[d].WeeklyInvoicesFlag(true);
				invoicesFlag = false;
			}
			self.calendarWeeks()[w].days[d].WeeklySalesCode(salesCode);
			self.calendarWeeks()[w].days[d].expenses(total);
			self.calendarWeeks()[w].days[d].sales(total2);
			self.calendarWeeks()[w].days[d].cost(calculateCost(total, total2));
		}
	}

	var updateMonthTotal = function () {
		if (self.monthlyCostItems().length == 0) return;
		var i = self.currentMonth();
		var it = self.monthlyCostItems()[i];
		var t1, t2;
		var type = self.dataSumType();
		switch (type) {
			case 'food_bev':
				t1 = Number(it.InvFood) + Number(it.InvBev) + Number(it.POFood) + Number(it.POBev);
				t2 = Number(it.SalesFood) + Number(it.SalesBev);
				break;
			case 'food_other':
				t1 = Number(it.InvFood) + Number(it.InvOther) + Number(it.POFood) + Number(it.POOther);
				t2 = Number(it.SalesFood) + Number(it.SalesOther);
				break;
			case 'bev_other':
				t1 = Number(it.InvBev) + Number(it.InvOther) + Number(it.POBev) + Number(it.POOther);
				t2 = Number(it.SalesBev) + Number(it.SalesOther);
				break;
			case 'total':
				t1 = Number(it.InvTotal) + Number(it.POTotal);
				t2 = Number(it.SalesTotal);
				break;
			case 'food':
				t1 = Number(it.InvFood) + Number(it.POFood);
				t2 = Number(it.SalesFood);
				break;
			case 'bev':
				t1 = Number(it.InvBev) + Number(it.POBev);
				t2 = Number(it.SalesBev);
				break;
			case 'other':
				t1 = Number(it.InvOther) + Number(it.POOther);
				t2 = Number(it.SalesOther);
				break;
			default:
				t1 = Number(it.InvTotal) + Number(it.POTotal);
				t2 = Number(it.SalesTotal);
		}
		self.currentMonthCost(calculateCost(t1, t2));
	}

	var updateTotalLabels = function () {
		var type = self.dataSumType();
		switch (type) {
			case 'food_bev':
				self.totalLabel3('Food & Bev. Expences:');
				break;
			case 'food_other':
				self.totalLabel3('Food & Other Expences:');
				break;
			case 'bev_other':
				self.totalLabel3('Bev. & Other Expences:');
				break;
			case 'total':
				self.totalLabel3('Total Expences:');
				break;
			case 'food':
				self.totalLabel3('Food Expence:');
				break;
			case 'bev':
				self.totalLabel3('Beverages Expence:');
				break;
			case 'other':
				self.totalLabel3('Other Expence:');
				break;
			default:
				self.totalLabel3('Total Expences:');
		}
	};

	var updateYTDChartData = function (callback) {
		var type = self.dataSumType();
		var l = self.monthlyCostItems().length;
		var arr = [];
		for (var i = 0; i < l; i++) {
			var it = self.monthlyCostItems()[i];
			switch (type) {
				case 'total':
					arr.push([it.mname, Number(Number(Number(it.POTotal) + Number(it.InvTotal)).toFixed(0)), Number(Number(it.SalesTotal).toFixed(0))]);
					break;
				case 'food':
					arr.push([it.mname, Number(Number(Number(it.POFood) + Number(it.InvFood)).toFixed(0)), Number(Number(it.SalesFood).toFixed(0))]);
					break;
				case 'beverage':
					arr.push([it.mname, Number(Number(Number(it.POBev) + Number(it.InvBev)).toFixed(0)), Number(Number(it.SalesBev).toFixed(0))]);
					break;
				default:
					arr.push([it.mname, Number(Number(Number(it.POTotal) + Number(it.InvTotal)).toFixed(0)), Number(Number(it.SalesTotal).toFixed(0))]);
			}
		}
		self.ytdChartData(arr);
		if (callback) callback();
	};

	var loadCmDropdownMonths = function (currentMonth, months, callback) {
		var arr = [];
		arr.push(new cmDropdownMonth(0, 'January', 'Jan'));
		arr.push(new cmDropdownMonth(1, 'February', 'Feb'));
		arr.push(new cmDropdownMonth(2, 'March', 'Mar'));
		arr.push(new cmDropdownMonth(3, 'April', 'Apr'));
		arr.push(new cmDropdownMonth(4, 'May', 'May'));
		arr.push(new cmDropdownMonth(5, 'June', 'Jun'));
		arr.push(new cmDropdownMonth(6, 'July', 'Jul'));
		arr.push(new cmDropdownMonth(7, 'August', 'Aug'));
		arr.push(new cmDropdownMonth(8, 'September', 'Sep'));
		arr.push(new cmDropdownMonth(9, 'October', 'Oct'));
		arr.push(new cmDropdownMonth(10, 'November', 'Nov'));
		arr.push(new cmDropdownMonth(11, 'December', 'Dec'));
		
		if (months) months(arr);
		if (callback) callback();

		return;
	};

	var loadCmDropdownYears = function (currentYear, years, callback) {
		var arr = [];
		var i = CM_CALENDAR_MIN_YEAR;		//currentYear - 20;
		for (i; i < currentYear + 2; i++) {
			var it = new cmDropdownYear(i);
			arr.push(it);
		}
		if (years) years(arr);
		if (callback) callback();
		return;
	}

	var loadCmCalendarMonths = function (currentMonth, months, callback) {
		var arr = [];
		arr.push(new cmCalendarMonth(0, 'January', 'Jan'));
		arr.push(new cmCalendarMonth(1, 'February', 'Feb'));
		arr.push(new cmCalendarMonth(2, 'March', 'Mar'));
		arr.push(new cmCalendarMonth(3, 'April', 'Apr'));
		arr.push(new cmCalendarMonth(4, 'May', 'May'));
		arr.push(new cmCalendarMonth(5, 'June', 'Jun'));
		arr.push(new cmCalendarMonth(6, 'July', 'Jul'));
		arr.push(new cmCalendarMonth(7, 'August', 'Aug'));
		arr.push(new cmCalendarMonth(8, 'September', 'Sep'));
		arr.push(new cmCalendarMonth(9, 'October', 'Oct'));
		arr.push(new cmCalendarMonth(10, 'November', 'Nov'));
		arr.push(new cmCalendarMonth(11, 'December', 'Dec'));

		if (months) months(arr);
		if (callback) callback();

		return;
	};

	var loadCmCalendarYears = function (currentYear, years, callback) {
		var arr = [];
		var i = CM_CALENDAR_MIN_YEAR;		//currentYear - 20;
		for (i; i < currentYear + 2; i++) {
			var it = new cmCalendarYear(i);
			arr.push(it);
		}
		if (years) years(arr);
		if (callback) callback();
		return;
	}

	var validateCmCalindarYears = function (currentYear, years, callback) {
		for (var i = 0; i < years().length; i++) {
			var it = years()[i];
			if (it.Year == currentYear) {
				it.Selected(true);
			} else {
				it.Selected(false);
			}
				
			if (it.Year > currentYear - 2 && it.Year < currentYear + 2) {
				it.Visible(true);
			} else {
				it.Visible(false);
			}
				
		}
		if (callback) callback();
		return;
	}

	validateCmCalindarMonths = function (currentMonth, months, callback) {
		for (var i = 0; i < months().length; i++) {
			var it = months()[i];
			if (it.Number == currentMonth) {
				it.Selected(true);
			} else {
				it.Selected(false);
			}
		}
		if (callback) callback();
		return;
	}

	var validateClasses = function () {
		var r = true;
		//fnc.calendarApp.selectedOrgClassList.removeAll();
		if (fnc.app.filterSelectedLocations().length != 1) {
			r = false;
			fnc.calendarApp.isClassesEnable(r);
		} else {
			var orgId = fnc.app.filterSelectedLocations().join();
			getOrgClassList(orgId, function (arr) {
				r = arr.length > 0;
				//if (r) {
				//	arr.forEach(function (it) {
				//		fnc.calendarApp.selectedOrgClassList().push(new CostCenterItem(it));
				//	});				
				//}
				fnc.calendarApp.isClassesEnable(r);
			})
		}
	}

	//******************
	// public 
	//******************
	var self = this;
	
	self.init = function (callback) {
		var year = self.currentYear();
		var month = self.currentMonth();
		var orgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();
		self.dataSumType('food_bev');
		loadCostCalendar(month, year, orgsIds, function (r) {
			self.allItems(r);
			validateClasses();
			makeCalendarFromArray(self.allItems(), month, function (c) {
				self.calendarWeeks(c)
				updateDayTotal();
				updateWeekTotal();
				//updateMonthTotal();
				windowResized();
				
				loadReconciliationPerfStats2(month, year, orgsIds, function () {
					showChart_ReconciliationStats();
					windowResized();
				})

				loadYTDCostMonthly(year, orgsIds, function () {
					updateMonthTotal();
					updateYTDChartData(function () {
						showChart_YTDCost(function () {
							windowResized();
						})
					});
					updateMTDSummary();
				});

				loadCmCalendarYears(self.currentYear(), self.cmCalendarYears, function () {
					validateCmCalindarYears(self.currentYear(), self.cmCalendarYears, function () {
						$('.cm-dropdown-monthpicker').click(function (event) {
							event.stopPropagation();
						})
						$('#cmCalendarDropdown').on('show.bs.dropdown', function () {
							validateCmCalindarMonths(self.currentMonth(), self.cmCalendarMonths, function () {
								self.selectedCmCalendarMonth(self.currentMonth());
								self.selectedCmCalendarYear(self.currentYear());
								validateCmCalindarYears(self.currentYear(), self.cmCalendarYears);
							});
						})
					});
				});

				loadCmCalendarMonths(self.currentMonth(), self.cmCalendarMonths, function () {
					validateCmCalindarMonths(self.currentMonth(), self.cmCalendarMonths, function () {
						//
					});
				});
				
			});
		})
	}
	self.isClassesEnable = ko.observable(false);
	self.isClassesEnable.subscribe(function () {
		if (self.isClassesEnable()) {
			var fromDate = self.fromDate1();
			var toDate = self.toDate1();
			var orgIds = fnc.app.filterSelectedLocations().join();
			loadCostCalendarClassList(fromDate, toDate, orgIds, function (r) {
				//if (r.length > 0 && self.selectedClass() != null) {
				//	r.forEach(function (it) {
				//		if (it.ClassName == self.selectedClass().ClassName) {
				//			it.Selected(true);
				//		}
				//	})
				//}
				self.selectedOrgClassList(r);
			});
		} else {
			self.selectedOrgClassList.removeAll();
		}
	}, self);

	self.showSalesScreen = function (callback) {
		var salesDate = self.selectedSalesDay().day();
		var orgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();

		loadOneDayOrganizationSummary(salesDate, orgsIds, function (r) {
			self.allOrganizations(r);
			//multiple locations
			self.salesScreenMode('show-sales-locations');
			$('#modProjectedSalesEntry').modal('show');
			$('#modProjectedSalesEntry').one('hidden.bs.modal', function (e) {
				//

				if (fnc.calendarApp.salesScreenMode() == 'show-sales-item') {
					var found = false;
					fnc.calendarApp.selectedOrgClassList().forEach(function (it) {
						if (it.ClassKye == fnc.calendarApp.projectedSalesSelectedClass()) {
							fnc.calendarApp.selectedClass(it);
							found = true;
						}
					});
					if (!found) {
						fnc.calendarApp.selectedClass(null);
					}
				}
				resetSalesVariables();
			})

			if (callback) callback();
		});
	};

	self.today = new Date();
	self.currentYear = ko.observable(self.today.getFullYear());
	self.currentMonth = ko.observable(self.today.getMonth());
	self.currentMonthFirstDay = ko.computed(function () {
		return new Date(self.currentYear(), self.currentMonth(), 1).getDay();
	}, self);
	self.currentDate = ko.observable(self.today.getDate());
	self.currentDay = ko.observable(self.today.getDay());

	self.calendarTitle = ko.computed(function () {
		return new Date(self.currentYear(), self.currentMonth()).format("mmmm yyyy");
	}, self);
	self.calendarTitle.subscribe(function () {
		var year = self.currentYear();
		var month = self.currentMonth();
		var orgsIds = fnc.app.filterSelectedLocations().join() != "" ? fnc.app.filterSelectedLocations().join() : fnc.app.allOrgString();

		loadCostCalendar(month, year, orgsIds, function (r) {
			self.allItems(r);
			validateClasses();
			makeCalendarFromArray(self.allItems(), month, function (c) {
				self.calendarWeeks(c)
				updateDayTotal();
				updateWeekTotal();
				updateMonthTotal();
				windowResized();

				loadReconciliationPerfStats2(month, year, orgsIds, function () {
					showChart_ReconciliationStats();
					windowResized();
				})

				loadYTDCostMonthly(year, orgsIds, function () {
					updateYTDChartData(function () {
						showChart_YTDCost(function () {
							windowResized();
						})
					});
					updateMTDSummary();
				});

			});
		})

	}, self);

	self.calendarHeader = ko.observableArray();

	//food; beverage; total;
	self.dataSumType = ko.observable('food_bev');
	self.dataSumType.subscribe(function () {
		self.getData();
	}, self);

	//food; bev; other; food_bev; food_other; bev_other; total 
	//self.dataSumType = ko.observable('food_bev');

	//cost centers
	self.selectedOrgClassList = ko.observableArray();
	self.selectedClass = ko.observable(null);
	self.selectedClass.subscribe(function (newValue) {
		if (newValue == undefined) {
			if (self.selectedOrgClassList().length == 0) {
				//initial load
				return;
			} else {
				//back to All Classes
				self.init();
			}
		} else {
			self.reloadCalendarForSelectedClass();
		}
	}, self);

	self.projectedSalesClassList = ko.observableArray();
	self.projectedSalesSelectedClass = ko.observable(null);
	self.projectedSalesSelectedClass.subscribe(function () {
		if (fnc.calendarApp.selectedSalesDay() == null) return;
		var classCode = '';
		var className = '';
		var salesDate = fnc.calendarApp.selectedSalesDay().day();
		var orgId = fnc.app.filterSelectedLocations().join();
		var cls = self.projectedSalesSelectedClass();
		if (cls == undefined) {
			//all
			loadProjectedSalesOneDay(salesDate, orgId, function (r) {
				var it = {};
				if (r == '') {
					//new
					it.SalesProjectedId = 0;
					it.SalesDate = salesDate;
					it.OrgId = orgId;
					it.TotalFood = 0;
					it.TotalBev = 0;
					it.TotalOther = 0;
				} else {
					//
					it.SalesProjectedId = r.SalesProjectedId;
					it.SalesDate = r.SalesDate;
					it.OrgId = orgId;
					it.TotalFood = r.TotalFood;
					it.TotalBev = r.TotalBev;
					it.TotalOther = r.TotalOther;
				}

				var projSales = new ProjectedSalesItem(it);
				fnc.calendarApp.selectedProjectedSalesItem(projSales);

				loadSalesHistory(salesDate, orgId, function (r) {
					fnc.calendarApp.selectedProjectedSalesHistory(r);
				});

			})
		} else {
			//one class
			classCode = cls.split('||')[0];
			className = cls.split('||')[1];

			loadProjectedSalesClassOneDay(salesDate, orgId, classCode, className, function (r) {
				//console.log(r);
				var it = {};
				if (r == '') {
					//new
					it.SalesProjectedId = 0;
					it.SalesDate = salesDate;
					it.OrgId = orgId;
					it.TotalFood = 0;
					it.TotalBev = 0;
					it.TotalOther = 0;
				} else {
					//
					it.SalesProjectedId = r.SalesProjectedId;
					it.SalesDate = r.SalesDate;
					it.OrgId = orgId;
					it.TotalFood = r.TotalFood;
					it.TotalBev = r.TotalBev;
					it.TotalOther = r.TotalOther;
				}

				var projSales = new ProjectedSalesItem(it);
				fnc.calendarApp.selectedProjectedSalesItem(projSales);

				loadSalesProjectedClassHistory(salesDate, orgId, classCode, className, function (r) {
					fnc.calendarApp.selectedProjectedSalesHistory(r);
				})

			})
		}
		//console.log(classCode);
	}, self);

	self.isFoodSelected = ko.observable(true);
	self.isFoodSelected.subscribe(function () {
		//console.log('isFoodSelected=' + self.isFoodSelected());
		//console.log(getDataSumType());
		self.dataSumType(getDataSumType())
	}, self);

	self.isBevSelected = ko.observable(true);
	self.isBevSelected.subscribe(function () {
		//console.log('isBevSelected=' + self.isBevSelected());
		//console.log(getDataSumType());
		self.dataSumType(getDataSumType())
	}, self);

	self.isOtherSelected = ko.observable(false);
	self.isOtherSelected.subscribe(function () {
		//console.log('isOtherSelected=' + self.isOtherSelected());
		//console.log(getDataSumType());
		self.dataSumType(getDataSumType())
	}, self);

	function getDataSumType() {
		var r = '';

		if (self.isFoodSelected() && !self.isBevSelected() && !self.isOtherSelected()) r = 'food';
		if (self.isFoodSelected() && self.isBevSelected() && !self.isOtherSelected()) r = 'food_bev';
		if (self.isFoodSelected() && !self.isBevSelected() && self.isOtherSelected()) r = 'food_other';
		if (self.isFoodSelected() && self.isBevSelected() && self.isOtherSelected()) r = 'total';
		if (!self.isFoodSelected() && self.isBevSelected() && !self.isOtherSelected()) r = 'bev';
		if (!self.isFoodSelected() && self.isBevSelected() && self.isOtherSelected()) r = 'bev_other';
		if (!self.isFoodSelected() && !self.isBevSelected() && self.isOtherSelected()) r = 'other';

		if (r == '') r = 'food_bev';

		return r;
	}


	self.changeDataType = function (d, e) {
		var item = e.currentTarget;
		var dType = item.getAttribute('data-type')

		switch (dType) {
			case 'beverage':
				if ($(item).hasClass('active')) {
					if (!self.isFoodSelected() && !self.isOtherSelected()) {
						e.stopPropagation();
						return;
					}
					self.isBevSelected(false);
				} else {
					self.isBevSelected(true);
				}
				break;
			case 'food':
				if ($(item).hasClass('active')) {
					if (!self.isBevSelected() && !self.isOtherSelected()) {
						e.stopPropagation();
						return;
					}
					self.isFoodSelected(false);
				} else {
					self.isFoodSelected(true);
				}
				break;
			case 'other':
				if ($(item).hasClass('active')) {
					if (!self.isFoodSelected() && !self.isBevSelected()) {
						e.stopPropagation();
						return;
					}
					self.isOtherSelected(false);
				} else {
					self.isOtherSelected(true);
				}
				break;
			default:
				return;
				break;
		}

		
	}

	self.totalLabel1 = ko.observable('Invoices:');
	self.totalLabel2 = ko.observable('Sales:');
	self.totalLabel3 = ko.observable('Food & Bev. Expences:');


	self.calendarWeeks = ko.observableArray();
	self.calendarWeeks2 = ko.observableArray();

	self.fromDate1 = ko.computed(function () {
		var r = "";
		if (self.calendarWeeks().length > 0) {
			var firstDate = self.calendarWeeks()[0].days[0].date;
			var thisMonth = self.calendarWeeks()[0].days[0].thisMonth;
			if (thisMonth) {
				r = new Date(self.currentYear(), self.currentMonth(), Number(firstDate)).format("yyyy-mm-dd");
			} else {
				if (self.currentMonth() > 0) {
					r = new Date(self.currentYear(), self.currentMonth() - 1, Number(firstDate)).format("yyyy-mm-dd");
				} else {
					r = new Date(self.currentYear() - 1, 11, Number(firstDate)).format("yyyy-mm-dd");
				}
			}
		}
		return r;
	}, self);

	self.toDate1 = ko.computed(function () {
		var r = "";
		if (self.calendarWeeks().length > 0) {
			var ln = self.calendarWeeks().length;
			var lastDate = self.calendarWeeks()[ln - 1].days[6].date
			var thisMonth = self.calendarWeeks()[ln - 1].days[6].thisMonth;
			if (thisMonth) {
				r = new Date(self.currentYear(), self.currentMonth(), Number(lastDate)).format("yyyy-mm-dd");
			} else {
				if (self.currentMonth() < 11) {
					r = new Date(self.currentYear(), self.currentMonth() + 1, Number(lastDate)).format("yyyy-mm-dd");
				} else {
					r = new Date(self.currentYear() + 1, 0, Number(lastDate)).format("yyyy-mm-dd");
				}
			}
		}
		return r;
	}, self);

	self.fromDate2 = ko.computed(function () {
		return new Date(self.currentYear(), self.currentMonth(), 1).format("yyyy-mm-dd");
	}, self);
	self.toDate2 = ko.computed(function () {
		return new Date(self.currentYear(), self.currentMonth() +1 , 0).format("yyyy-mm-dd");
	}, self);

	self.allItems = ko.observableArray();

	self.monthlySummaryItems = ko.observableArray();

	self.monthlyCostItems = ko.observableArray();
	self.ytdChartData = ko.observableArray();

	self.monthlyCategorySummaryItems = ko.observableArray();

	self.MTDFoodExpences = ko.observable(0);
	self.MTDBeverageExpences = ko.observable(0);
	self.MTDOtherExpences = ko.observable(0);
	//self.MTDTotal = ko.computed(function () {
	//	return self.MTDBeverageExpences() + self.MTDFoodExpences() + self.MTDOtherExpences();
	//});
	self.MTDTotal = ko.observable(0);

	self.MTDFoodSales = ko.observable(0);
	self.MTDBeverageSales = ko.observable(0);
	self.MTDOtherSales = ko.observable(0);

	self.MTDSalesTotal = ko.observable(0);

	self.currentMonthTotal = ko.observable(0);
	self.currentMonthCost = ko.observable(0);

	self.reconciledQtyForThisPeriod = ko.observable(0);
	self.noReconciledQtyForThisPeriod = ko.observable(0);
	self.reconciledPercentage = ko.computed(function () {
		var r = 0;
		var rcQty = Number(self.reconciledQtyForThisPeriod());
		if (rcQty > 0) {
			var nrcQty = Number(self.noReconciledQtyForThisPeriod());
			r = 100 * ((rcQty) / (rcQty + nrcQty)).toFixed(2);
		}
		return r;
	}, self);

	//projected sales
	self.searchOrgsFilter = ko.observable('');
	self.allOrganizations = ko.observableArray();
	self.filteredOrganizations = ko.computed(function () {
		var searchOrgsFilter = self.searchOrgsFilter().toLowerCase();
		searchOrgsFilter = searchOrgsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchOrgsFilter.length < 3) {
			var r = self.allOrganizations();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allOrganizations(), function (item) {
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

	//show-sales-locations; show-sales-item
	self.salesScreenMode = ko.observable('');

	self.selectedSalesLocation = ko.observable(null);
	self.selectedSalesDay = ko.observable(null);
	self.selectedProjectedSalesItem = ko.observable(null);
	self.selectedProjectedSalesHistory = ko.observable(null);

	self.selectedSalesHistoryDay = ko.observable(null);
	self.selectedSalesHistoryWeek = ko.observable(null);
	self.selectedSalesHistoryMonth = ko.observable(null);
	self.selectedSalesHistoryYear = ko.observable(null);


	self.enableActualSalesLink = ko.computed(function () {
		var r = false;
		if (self.selectedSalesDay()) {
			//r = Date.parse(ko.toJSON(self.selectedSalesDay().day, null, 2)) < Date.parse(ko.toJSON(self.today.format('yyyy-mm-dd'), null, 2));
			r = Date.parse(self.selectedSalesDay().day()) < Date.parse(fnc.calendarApp.today.format('yyyy-mm-dd'));
		}
		return r;
	})

	self.enableProjectedSalesLink = ko.computed(function () {
		var r = false;
		if (self.selectedSalesDay()) {
			//r = Date.parse(ko.toJSON(self.selectedSalesDay().SalesDate, null, 2)) >= Date.parse(ko.toJSON(self.today.format('yyyy-mm-dd'), null, 2));
			Date.parse(self.selectedSalesDay().day()) >= Date.parse(fnc.calendarApp.today.format('yyyy-mm-dd'));
		}
		return r;
	})

	//cm-calendar-monthpicker					
	self.selectedCmCalendarMonth = ko.observable();
	self.selectedCmCalendarYear = ko.observable();
	self.cmCalendarMonths = ko.observableArray();
	self.cmCalendarYears = ko.observableArray();


	//MTD Summary loadin flag
	self.loadingMTDChart = ko.observable(true);

	//functions
	self.goToToday = function () {
		self.currentYear(self.today.getFullYear());
		self.currentMonth(self.today.getMonth());
	}

	self.nextMonth = function () {
		//fnc.calendarApp.calendarHeader.removeAll();
		var oid = fnc.app.oid;
		var m = fnc.calendarApp.currentMonth();
		var y = fnc.calendarApp.currentYear();

		if (m < 11) {
			m = m + 1;
		} else {
			m = 0;
			y = y + 1;
			fnc.calendarApp.currentYear(y);
		}
		fnc.calendarApp.currentMonth(m);
	}

	self.previousMonth = function () {
		//fnc.calendarApp.calendarHeader.removeAll();
		var oid = fnc.app.oid;
		var m = fnc.calendarApp.currentMonth();
		var y = fnc.calendarApp.currentYear();
		if (m > 0) {
			m = m - 1;
		} else {
			m = 11;
			y = y - 1;
			fnc.calendarApp.currentYear(y);
		}
		fnc.calendarApp.currentMonth(m);
	}

	self.drilldownToInvoices = function (d, e) {
		var dateRange = e.currentTarget.getAttribute('data-date-range');
		var viewFilter = e.currentTarget.getAttribute('data-view-filter');

		//clean screen
		$("#home-page").html("");
		windowResized();
		fnc.poListApp.filterAvailableVendors.removeAll();

		//Accepted Date
		var date, day, month, year;
		day = d.day().toString();
		year = day.substring(0, 4);
		month = day.substring(5, 7);
		date = day.substring(8);

		fnc.app.filterRangeBaseOn(dateRange);
		fnc.app.filterDateFrom(month+"/"+date+"/"+year);
		fnc.app.filterDateTo(month + "/" + date + "/" + year);
		fnc.poListApp.showResultOption(viewFilter);
		//switch to POList
		fnc.poListApp.drillDown(function () {

			$("#po-list").load("polist.html #poLst", function () {
				ko.applyBindings(fnc.poListApp, poLst);

				$('.nav.nav-pills>li.active').removeClass("active");
				$('.nav.nav-pills>li.invoices-tab').addClass("active");

				$(".tab-pane").removeClass("active");
				$("#po-list").addClass("active");

				$("#poLst").show();

				$("#tblPOListBody").height(poListTableHeight);
				scrollPOList();
				$("#poListLocation").height(poListLocationHeight);
				$("#poListVendor").height(poListVendorHeight);
				//$(".cm-layout-section").height(poListSectionHeigh);
				windowResized();
				initDatePickerAllDates();
				initDatePickerPastDates('#rcnPOListInvoiceDate');
			});
		});
	};

	self.drilldownToWeeklyInvoices = function (d, e) {
		var dateRange = e.currentTarget.getAttribute('data-date-range');
		var viewFilter = e.currentTarget.getAttribute('data-view-filter');

		//clean screen
		$("#home-page").html("");
		windowResized();
		fnc.poListApp.filterAvailableVendors.removeAll();

		//Accepted Date
		var dateFrom, dateTo, day, month, year;
		//fromDate
		day = d.WeekStartDate().toString();
		year = day.substring(0, 4);
		month = day.substring(5, 7);
		date = day.substring(8);
		dateFrom = month + "/" + date + "/" + year;
		//toDate
		day = d.WeekEndDate().toString();
		year = day.substring(0, 4);
		month = day.substring(5, 7);
		date = day.substring(8);
		dateTo = month + "/" + date + "/" + year;

		fnc.app.filterRangeBaseOn(dateRange);
		fnc.app.filterDateFrom(dateFrom);
		fnc.app.filterDateTo(dateTo);
		fnc.poListApp.showResultOption(viewFilter);
		//switch to POList
		fnc.poListApp.drillDown(function () {

			$("#po-list").load("polist.html #poLst", function () {
				ko.applyBindings(fnc.poListApp, poLst);

				$('.nav.nav-pills>li.active').removeClass("active");
				$('.nav.nav-pills>li.invoices-tab').addClass("active");

				$(".tab-pane").removeClass("active");
				$("#po-list").addClass("active");

				$("#poLst").show();

				$("#tblPOListBody").height(poListTableHeight);
				scrollPOList();
				$("#poListLocation").height(poListLocationHeight);
				$("#poListVendor").height(poListVendorHeight);
				//$(".cm-layout-section").height(poListSectionHeigh);
				windowResized();
				initDatePickerAllDates();
				initDatePickerPastDates('#rcnPOListInvoiceDate');
			});
		});
	};

	self.getData = function (d, e) {
		//food; beverage; total;
		//var dataType = e.currentTarget.getAttribute('data-type');
		//self.dataType(dataType);

		//self.init(function () {
		//	console.log(dataType);
		//})

		updateDayTotal();
		updateWeekTotal();
		updateMonthTotal();
		updateTotalLabels();
		windowResized();

		updateYTDChartData(function () {
			showChart_YTDCost(function () {
				windowResized();
			})
		});
	}

	self.reloadCalendarForSelectedClass = function () {
		var month = self.currentMonth();
		var year = self.currentYear();
		var orgsIds = self.selectedLocation().LocationId;
		var classCode = self.selectedClass().ClassCode;
		var className = self.selectedClass().ClassName;

		loadCostClassCalendar(month, year, classCode, className, orgsIds, function (r) {
			fnc.calendarApp.allItems(r);
			updateDayTotal();
			updateWeekTotal();
			updateMonthTotal();
			validateClasses();

			loadYTDCostClassMonthly(year, classCode, className, orgsIds, function () {
				updateYTDChartData(function () {
					showChart_YTDCost(function () {
						windowResized();
					})
				});
				updateMTDSummary();
			})
			windowResized();
		});
	}

	self.cmCalendarPreviousYearClick = function (d, e) {
		var y = fnc.calendarApp.selectedCmCalendarYear();
		y = y - 1;
		if (y <= CM_CALENDAR_MIN_YEAR) return;
		validateCmCalindarYears(y, self.cmCalendarYears, function () {
			fnc.calendarApp.selectedCmCalendarYear(y);
		})

		
	};

	self.cmCalendarNextYearClick = function (d, e) {
		var y = fnc.calendarApp.selectedCmCalendarYear();
		y = y + 1;
		if (y > self.today.getFullYear()) return;
		validateCmCalindarYears(y, self.cmCalendarYears, function () {
			fnc.calendarApp.selectedCmCalendarYear(y);
		})

	};

	self.showForecast = function (d, e) {
		//console.log(ko.toJSON(d, null, 2));
		var test = ko.toJSON(d, null, 2);
		if ($(e.currentTarget).next('div.popover:visible').length) {
			$(e.currentTarget).popover('destroy');
			return;
		}
		$("[data-toggle='popover']").popover('destroy');
		var content = "<table><tbody style='font-size: 12px;'>";

		//content = content + "<tr><td colspan='2' style='text-align:center;'>" + d.fxDate() + "</td></tr>";
		content = content + "<tr><td rowspan='2' style='text-align:right;width:50%;'><img height='40' widht='40' src='img/weather/" + d.fxCode() + ".png' /></td><td>" + formatTemperature(d.fxHigh()) + "</td></tr>";
		content = content + "<tr><td style='font-size: 10px;'>" + formatTemperature(d.fxLow()) + "</td></tr>";
		content = content + "<tr><td colspan='2' style='text-align:center;font-weight:bold;'>" + d.fxText() + "</td></tr>";

		content = content + "</tbody></table>";
		$(e.currentTarget).attr("data-content", content);
		$(e.currentTarget).popover("show");
		setTimeout(function () {
			if ($(e.currentTarget).next('div.popover:visible').length) {
				$(e.currentTarget).popover('destroy');
			}
		}, 5000);
	};

	self.selectedLocation = ko.computed(function () {
		var r = {};
		if (fnc.app.filterSelectedLocations().length == 1) {
			fnc.app.filterAvailableLocations().forEach(function (it) {
				if (it.Selected()) {
					r = it;
				}
			})
		}	
		return r;
	}, self);


};