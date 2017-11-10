/* fnc VIEW MODEL
* ================================== */
var fnc;
fnc = fnc || {};
fnc.app = new function () {

	//privileges codes
	var prvInvoicesViewId = '7_26_198';
	var prvInvoicesCreateManualId = '7_26_196';
	var prvInvoicesReconcileId = '7_26_197';
	var prvInvoicesAcceptId = '7_26_199';
	var prvInvoicesUnAcceptId = '7_26_200';
	var prvInvoicesExportId = '7_26_201';
	var prvInvoicesDeleteId = '7_26_207';
	var prvInvoicesRestoreId = '7_26_208';
	var prvInvoicesUnAcceptExportedId = '7_26_216';

	var prvVendorsViewId = '7_27_202';
	var prvVendorsCreateNewId = '7_27_203';
	var prvVendorsEditId = '7_27_204';
	var prvVendorsDeactivateId = '7_27_205';
	var prvVendorsLocationAssigmentId = '7_27_206';

	var prvSetupViewId = '7_28_209';
	var prvSetupChartOfAcctsId = '7_28_210';
	var prvSetupDtfRulesId = '7_28_211';
	var prvSetupStartDateId = '7_28_215';

	var prvLegacyVouchersViewId = '7_29_212';

	var prvEInvoicesViewId = '7_30_214';
	var prvEInvoicesFixId = '7_30_213';

	var prvSalesSetupChartsId = '7_28_225';
	var prvSalesSetupDepositsId = '7_28_226';

	var prvSalesViewId = '7_31_217';
	var prvSalesManageProjectedId = '7_31_218';
	var prvSalesManageActualId = '7_31_219';
	var prvSalesAcceptId = '7_31_220';
	var prvSalesUnAcceptId = '7_31_221';
	var prvSalesExportId = '7_31_222';
	var prvSalesUnAcceptExportedId = '7_31_223';
	var prvSalesDeleteId = '7_31_224';

	var prvQboConnect = '8_32_227';
	var prvQboDisconnect = '8_32_228';
	var prvQboViewMapping = '8_32_229';
	var prvQboManageMapping = '8_32_230';
	var prvQboExportInvoices = '8_32_231';

	var prvCrossDocApp = '7_33_232';
	var prvCrossDocViewDocument = '7_33_233';
	var prvCrossDocDeleteDocument = '7_33_234';
	var prvCrossDocEditDocument = '7_33_235';
	var prvCrossDocUploadDocument = '7_33_236';
	var prvCrossDocDownloadDocument = '7_33_237';
	var prvCrossDocAttachToInvoice = '7_33_238';
	var prvCrossDocDetachFromInvoice = '7_33_239';

	//@#$
	var defaultDate;
	defaultDate = (new Date());

	var minimumPreviewWidth = 200;

	var xid = getQueryStringValue('xid');

	//@#$

	//private functions
	var checkDateRange = function (dFrom, dTo) {
		//console.log(dFrom);
		//console.log(dTo);
		var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(dTo);
		var secondDate = new Date(dFrom);

		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
		//console.log(diffDays);
		var txt = '';
		switch (diffDays) {
			case 6:
				txt = 'Last 7 Days';
				break;
			case 13:
				txt = 'Last 14 Days';
				break;
			case 29:
				txt = 'Last 30 Days';
				break;
			case 59:
				txt = 'Last 60 Days';
				break;
			case 89:
				txt = 'Last 90 Days';
				break;
			case 182:
				txt = 'Last 6 Months';
				break;
			case 364:
				txt = 'Last 12 Months';
				break;
			default:
		}
		if (txt != '') {
			self.fakeChangeFlag(true);
			self.filterDateRange(txt);
			self.fakeChangeFlag(false);
		}
	}

	function ajaxGetUserData(action, params, callback) {
		var json = {
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
				callback(response);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				callback({ d: "{result:'error'}" });
			}
		});
		//parent.continueSession();
	};

	function getUserData(callback) {
		//.Id, .AppId, .IP, .Domain, .SessionSource
		//getIP();
		var params = {};
		params.id = xid;
		params.appId = fnc.appid;
		params.ip = '';						//'192.168.1.172';		//clientIP();
		params.domain = '';
		params.sessionSource = '';
		loading(true);
		ajaxGetUserData("ChefMod.Financials.UI.Controllers.Security.GetUserData", params, function (response) {
			//console.log('ChefMod.Financials.UI.Controllers.Security.GetUserData');
			loading(false);
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') return;

			fnc.app.sessionId = r.Session.SessionId;
			fnc.app.uc = r.Session.UserCode;
			fnc.app.oid = r.Session.OrganizationId;
			fnc.app.iuc = JSON.parse(r.ImpersonatedUser.UserPersonalData).result.row.UserCode;
			fnc.app.fullName = JSON.parse(r.ImpersonatedUser.UserPersonalData).result.row.FullName;

			var userPrivilegesData = JSON.parse(r.ActualUser.Privileges).result.row;
			for (var n = 0; n < userPrivilegesData.length; n++) {
				var p = userPrivilegesData[n];
				//invoices
				if (p.ID == prvInvoicesViewId) {
					fnc.app.prvInvoicesViewEnable(true);
				}
				if (p.ID == prvInvoicesCreateManualId) {
					fnc.app.prvInvoicesCreateManualEnable(true);
				}
				if (p.ID == prvInvoicesReconcileId) {
					fnc.app.prvInvoicesReconcileEnable(true);
				}
				if (p.ID == prvInvoicesAcceptId) {
					fnc.app.prvInvoicesAcceptEnable(true);
				}
				if (p.ID == prvInvoicesUnAcceptId) {
					fnc.app.prvInvoicesUnAcceptEnable(true);
				}
				if (p.ID == prvInvoicesExportId) {
					fnc.app.prvInvoicesExportEnable(true);
				}
				if (p.ID == prvInvoicesDeleteId) {
					fnc.app.prvInvoicesDeleteEnable(true);
				}
				if (p.ID == prvInvoicesRestoreId) {
					fnc.app.prvInvoicesRestoreEnable(true);
				}
				if (p.ID == prvInvoicesUnAcceptExportedId) {
					fnc.app.prvInvoicesUnAcceptExportedEnable(true);
				}


				//vendors
				if (p.ID == prvVendorsViewId) {
					fnc.app.prvVendorsViewEnable(true);
				}
				if (p.ID == prvVendorsCreateNewId) {
					fnc.app.prvVendorsCreateNewEnable(true);
				}
				if (p.ID == prvVendorsEditId) {
					fnc.app.prvVendorsEditEnable(true);
				}
				if (p.ID == prvVendorsDeactivateId) {
					fnc.app.prvVendorsDeactivateEnable(true);
				}
				if (p.ID == prvVendorsLocationAssigmentId) {
					fnc.app.prvVendorsLocationAssigmentEnable(true);
				}

				//setup
				if (p.ID == prvSetupViewId) {
					fnc.app.prvSetupViewEnable(true);
				}
				if (p.ID == prvSetupChartOfAcctsId) {
					fnc.app.prvSetupChartOfAcctsEnable(true);
				}
				if (p.ID == prvSetupDtfRulesId) {
					fnc.app.prvSetupDtfRulesEnable(true);
				}
				if (p.ID == prvSetupStartDateId) {
					fnc.app.prvSetupStartDateEnable(true);
				}

				//legacy
				if (p.ID == prvLegacyVouchersViewId) {
					fnc.app.prvLegacyVouchersViewEnable(true)
				};

				//eInvoices
				if (p.ID == prvEInvoicesViewId) {
					fnc.app.prvEInvoicesViewEnable(true);
				}
				if (p.ID == prvEInvoicesFixId) {
					fnc.app.prvEInvoicesFixEnable(true);
				}

				//sales
				if (p.ID == prvSalesAcceptId) {
					fnc.app.prvSalesAcceptEnable(true);
				}
				if (p.ID == prvSalesDeleteId) {
					fnc.app.prvSalesDeleteEnable(true);
				}
				if (p.ID == prvSalesExportId) {
					fnc.app.prvSalesExportEnable(true);
				}
				if (p.ID == prvSalesManageActualId) {
					fnc.app.prvSalesManageActualEnable(true);
				}
				if (p.ID == prvSalesManageProjectedId) {
					fnc.app.prvSalesManageProjectedEnable(true);
				}
				if (p.ID == prvSalesUnAcceptId) {
					fnc.app.prvSalesUnAcceptEnable(true);
				}
				if (p.ID == prvSalesUnAcceptExportedId) {
					fnc.app.prvSalesUnAcceptExportedEnable(true);
				}
				if (p.ID == prvSalesViewId) {
					fnc.app.prvSalesViewEnable(true);
				}

				//sales sutup
				if (p.ID == prvSalesSetupChartsId) {
					fnc.app.prvSalesSetupChartsEnable(true);
				}
				if (p.ID == prvSalesSetupDepositsId) {
					fnc.app.prvSalesSetupDepositsEnable(true);
				}

				//QBO
				if (p.ID == prvQboConnect) {
					fnc.app.prvQboConnectEnable(true);
				}
				if (p.ID == prvQboDisconnect) {
					fnc.app.prvQboDisconnectEnable(true);
				}
				if (p.ID == prvQboViewMapping) {
					fnc.app.prvQboViewMappingEnable(true);
				}
				if (p.ID == prvQboManageMapping) {
					fnc.app.prvQboManageMappingEnable(true);
				}
				if (p.ID == prvQboExportInvoices) {
					fnc.app.prvQboExportInvoicesEnable(true);
				}

				//CrossDoc
				if (p.ID == prvCrossDocApp) {
					fnc.app.prvCrossDocAppEnable(true);
				}
				if (p.ID == prvCrossDocAttachToInvoice) {
					fnc.app.prvCrossDocAttachToInvoiceEnable(true);
				}
				if (p.ID == prvCrossDocDeleteDocument) {
					fnc.app.prvCrossDocDeleteDocumentEnable(true);
				}
				if (p.ID == prvCrossDocDetachFromInvoice) {
					fnc.app.prvCrossDocDetachFromInvoiceEnable(true);
				}
				if (p.ID == prvCrossDocDownloadDocument) {
					fnc.app.prvCrossDocDownloadDocumentEnable(true);
				}
				if (p.ID == prvCrossDocEditDocument) {
					fnc.app.prvCrossDocEditDocumentEnable(true);
				}
				if (p.ID == prvCrossDocUploadDocument) {
					fnc.app.prvCrossDocUploadDocumentEnable(true);
				}
				if (p.ID == prvCrossDocViewDocument) {
					fnc.app.prvCrossDocViewDocumentEnable(true);
				}
				//console.log(JSON.stringify(userPrivilegesData[n]));

				//CostCenter (Admin/Jsilverman )
				if (fnc.app.uc == 1021 || fnc.app.uc == 1389) {
					fnc.app.prvClassesManageSetupEnable(true);
				}
			}

			var locations = JSON.parse(r.ImpersonatedUser.OrganizationList).result.row;
			var parentOrgId = r.Session.OrganizationId;

			if (locations[0]) {
				for (var i = 0; i < locations.length; i++) {
					var it = locations[i];
					var o = new fnc.locationItem({ locationId: it.OrgId, locationName: it.OrgName });
					//if (it.IsDefault == '1') o.Selected(true);
					if (it.OrgId == parentOrgId) o.Selected(true);
					fnc.app.filterAvailableLocations.push(o);
				}
				fnc.app.singleLocation(false);
			} else {
				var it = locations;
				var o = new fnc.locationItem({ locationId: it.OrgId, locationName: it.OrgName });
				o.Selected(true);
				fnc.app.filterAvailableLocations.push(o);
			}

			var arr = [];
			for (var i = 0; i < fnc.app.filterAvailableLocations().length; i++) {
				arr.push(fnc.app.filterAvailableLocations()[i].LocationId);
			}
			fnc.app.allOrgString(arr.join(','));

			if (callback) callback();
		});
	};

	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

	function ProgressBar(id) {
		var stages = [new Stage()];
		var currentStage = 0;
		var totalWeight = 1;
		this.progress = ko.observable("0%");
		this.title = ko.observable("Loading...");
		this.displayDownloadLink = ko.observable(false);
		this.currentStage = ko.observable(stages[0]);
		this.allowCancel = ko.observable(false);
		this.update = function (numDone, acceptedLength, description) {
			var progress = 0;
			var currentStage = this.currentStage();
			currentStage.numDone = numDone;
			currentStage.total = acceptedLength;
			if (description) {
				currentStage.description(description);
			}
			for (var i = 0; i < stages.length; i++) {
				var stage = stages[i];
				progress += stage.weight * (stage.numDone / stage.total) / totalWeight;
			}
			this.progress((progress * 100).toFixed(0) + "%");
		};

		this.reset = function (numStages, options) {
			this.allowCancel(false);
			this.progress("0%");
			var newTitle = options && options.title ? options.title : "Loading...";
			this.title(newTitle);
			if (options.displayDownloadLink) {
				this.displayDownloadLink(true);
			}
			if (numStages) {
				stages = [];
				totalWeight = 0;
				for (var i = 0; i < numStages; i++) {
					var weight = options && options.stageWeights && options.stageWeights[i + 1] ? options.stageWeights[i + 1] : 1;
					totalWeight += weight;
					stages.push(new Stage(weight));
				}
			}
			else {
				for (var i = 0; i < stages.length; i++) {
					stages[i].numDone = 0;
				}
			}
			currentStageNum = 0;
		}

		this.setStage = function (stageNum, description) {
			currentStageNum = stageNum - 1;
			var newStage = stages[currentStageNum];
			if (description) {
				newStage.description(description);
			}
			this.currentStage(newStage);
		};
		this.show = function () {
			$('#' + id).modal({
				backdrop: 'static',
				keyboard: false
			});
		}
		this.hide = function () {
			$('#' + id).modal('hide');
		}
		this.isShown = function () {
			return $('#' + id).data('bs.modal').isShown;
		}
		function Stage(weight) {
			this.total = 1;
			this.numDone = 0;
			this.weight = weight ? weight : 1
			this.description = ko.observable("");
		};
	};

	function getQueryStringValue(key) {
		return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
	};

	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	//public
	var self = this;
	// Credentials
	self.oid = null;
	self.uc = null;
	self.iuc = null;

	//credentials
	self.sessionId = null;	//ko.observable();
	self.clientIP = ko.observable();
	//self.uc = ko.observable();

	//loading bar
	self.progressBar = new ProgressBar('modProgress');

	//filter locations
	self.filterAvailableLocations = ko.observableArray();
	self.allOrgString = ko.observable('');
	self.filterSelectedLocations = ko.observableArray();
	self.filterSelectedLocations.subscribe(function () {
		//
		if ($("ul.nav li.active").hasClass("calendar-tab")) {
			if (!massLocationChangeEvent()) {
				load_home();
			}
		}
		else if ($("ul.nav li.active").hasClass("invoices-tab")) {
			if (!massLocationChangeEvent()) {
				//load_polist();
			}
		}
		else if ($("ul.nav li.active").hasClass("legacy-tab")) {
			if (!massLocationChangeEvent()) {
				//load_legacy();
			}
		}
		else if ($("ul.nav li.active").hasClass("sales-tab")) {
			if (!massLocationChangeEvent()) {
				load_sales();
			}
		}
		else if ($("ul.nav li.active").hasClass("crossDoc-tab")) {
			fnc.crossDocApp.showInvoiceDocumentList();
		}
		if (true) {
			var l = self.filterSelectedLocations().join() != "" ? self.filterSelectedLocations().join() : self.allOrgString();
			//console.log(l);
			if (typeof fnc.weatherApp !== 'undefined') {
				fnc.weatherApp.loadCurrentForecast(l, fnc.weatherApp.selectedCity, fnc.weatherApp.selectedState, fnc.weatherApp.currentDaySummary, function () {
					console.log();
				});
			}
		}
	}, self);
	self.clearLocationFilterVisible = ko.observable(false);
	self.searchLocationsFilter = ko.observable('');
	self.filteredLocations = ko.computed(function () {
		var searchLocationsFilter = self.searchLocationsFilter().toLowerCase();
		searchLocationsFilter = searchLocationsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchLocationsFilter.length < 3) {
			var r = self.filterAvailableLocations();
			return r;
		} else {
			return ko.utils.arrayFilter(self.filterAvailableLocations(), function (item) {
				var words = searchLocationsFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.LocationName.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	self.singleLocation = ko.observable(true);

	self.notSelectedLocationsHidden = ko.observable(false);

	//privileges
	self.prvInvoicesViewEnable = ko.observable(false);
	self.prvInvoicesCreateManualEnable = ko.observable(false);
	self.prvInvoicesReconcileEnable = ko.observable(false);
	self.prvInvoicesAcceptEnable = ko.observable(false);
	self.prvInvoicesUnAcceptEnable = ko.observable(false);
	self.prvInvoicesExportEnable = ko.observable(false);
	self.prvInvoicesDeleteEnable = ko.observable(false);
	self.prvInvoicesRestoreEnable = ko.observable(false);
	self.prvInvoicesUnAcceptExportedEnable = ko.observable(false);

	self.prvInoicesEditableFieldsEnable = ko.computed(function () {
		return self.prvInvoicesCreateManualEnable() || self.prvInvoicesReconcileEnable() || self.prvInvoicesAcceptEnable();
		//self.prvInvoicesUnAcceptEnable() && 
		//self.prvInvoicesExportEnable() && 
		//self.prvInvoicesUnAcceptExportedEnable() && 
		//self.prvInvoicesDeleteEnable() && 
		//self.prvInvoicesRestoreEnable()
	}, self);

	self.prvVendorsViewEnable = ko.observable(false);
	self.prvVendorsCreateNewEnable = ko.observable(false);
	self.prvVendorsEditEnable = ko.observable(false);
	self.prvVendorsDeactivateEnable = ko.observable(false);
	self.prvVendorsLocationAssigmentEnable = ko.observable(false);

	self.prvSetupViewEnable = ko.observable(false);
	self.prvSetupChartOfAcctsEnable = ko.observable(false);
	self.prvSetupDtfRulesEnable = ko.observable(false);
	self.prvSetupStartDateEnable = ko.observable(false);

	self.prvLegacyVouchersViewEnable = ko.observable(false);

	self.prvEInvoicesViewEnable = ko.observable(false);
	self.prvEInvoicesFixEnable = ko.observable(false);

	self.prvSalesSetupChartsEnable = ko.observable(false);
	self.prvSalesSetupDepositsEnable = ko.observable(false);

	self.prvSalesViewEnable = ko.observable(false);
	self.prvSalesManageProjectedEnable = ko.observable(false);
	self.prvSalesManageActualEnable = ko.observable(false);
	self.prvSalesAcceptEnable = ko.observable(false);
	self.prvSalesUnAcceptEnable = ko.observable(false);
	self.prvSalesExportEnable = ko.observable(false);
	self.prvSalesUnAcceptExportedEnable = ko.observable(false);
	self.prvSalesDeleteEnable = ko.observable(false);

	self.prvQboConnectEnable = ko.observable(false);
	self.prvQboDisconnectEnable = ko.observable(false);
	self.prvQboViewMappingEnable = ko.observable(false);
	self.prvQboManageMappingEnable = ko.observable(false);
	self.prvQboExportInvoicesEnable = ko.observable(false);

	self.prvCrossDocAppEnable = ko.observable(false);
	self.prvCrossDocViewDocumentEnable = ko.observable(false);
	self.prvCrossDocDeleteDocumentEnable = ko.observable(false);
	self.prvCrossDocEditDocumentEnable = ko.observable(false);
	self.prvCrossDocUploadDocumentEnable = ko.observable(false);
	self.prvCrossDocDownloadDocumentEnable = ko.observable(false);
	self.prvCrossDocAttachToInvoiceEnable = ko.observable(false);
	self.prvCrossDocDetachFromInvoiceEnable = ko.observable(false);

	self.prvClassesManageSetupEnable = ko.observable(false);

	//
	self.filterAvailableDateFields = ko.observableArray([{ Name: 'DELIVERY DATE', Value: 0 }, { Name: 'ACCEPTED DATE', Value: 1 }]);
	self.filterAvailableDateRanges = ko.observableArray(['Custom', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 60 Days', 'Last 90 Days', 'Last 6 Months', 'Last 12 Months']);
	self.fakeChangeFlag = ko.observable(false);
	self.filterCustomDateRange = ko.observable(true);

	self.filterRangeBaseOn = ko.observable("0");
	self.filterRangeBaseOn.subscribe(function () {
		if ($("ul.nav li.active").hasClass("invoices-tab")) {
			//load_polist();
		}
		if ($("ul.nav li.active").hasClass("legacy-tab")) {
			//load_legacy();
		}
	}, self);

	self.filterDateFrom = ko.observable();
	self.filterDateFrom.subscribe(function () {
		if (self.filterCustomDateRange()) {
			self.filterDateRange('Custom');
		}
	});

	self.filterDateTo = ko.observable(defaultDate.format(strFormat));								//ko.observable(defaultDate.toISOString().substring(0, 10));
	self.filterDateTo.subscribe(function () {
		if (self.filterCustomDateRange()) {
			self.filterDateRange('Custom');
		}
	});

	self.filterDateRange = ko.observable();
	self.filterDateRange.subscribe(function (newValue) {
		if (newValue == 'Custom' || self.fakeChangeFlag()) return true;
		self.filterCustomDateRange(false);
		//var dateString;
		//if (browserName == "Chrome") {
		//	var d = self.filterDateTo().split("-");
		//	dateString = d[1] + "/" + d[2] + "/" + d[0];
		//} else {
		//	dateString = self.filterDateTo()
		//}
		//var today = new Date(dateString);
		//var vDate = new Date(today);
		self.filterDateTo(getTodayString());
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

		self.filterCustomDateRange(true);

		if ($("ul.nav li.active").hasClass("invoices-tab")) {
			//load_polist();
		}
		if ($("ul.nav li.active").hasClass("legacy-tab")) {
			//load_legacy();
		}
		if ($("ul.nav li.active").hasClass("sales-tab")) {
			load_sales();
		}
	});
	self.filterDateRange(defaultDateText);

	//
	self.manualDateRange = ko.computed(function () {
		if (self.filterDateRange() == 'Custom') {
			var vDateFrom = Date.parse(self.filterDateFrom());
			var vDateTo = Date.parse(self.filterDateTo());
			if (!isNaN(vDateFrom) && !isNaN(vDateTo)) {
				if (vDateFrom <= vDateTo) {
					//console.log("mRange=" + Number(vDateTo - vDateFrom));
					if ($("ul.nav li.active").hasClass("invoices-tab")) {
						//load_polist(function () {
						//	if (isToday(self.filterDateTo())) {
						//		checkDateRange(vDateFrom, vDateTo);
						//	}
						//});
					}
					if ($("ul.nav li.active").hasClass("legacy-tab")) {
						//load_legacy(function () {
						//	if (isToday(self.filterDateTo())) {
						//		checkDateRange(vDateFrom, vDateTo);
						//	}
						//});
					}
					if ($("ul.nav li.active").hasClass("sales-tab")) {
						load_sales(function () {
							if (isToday(self.filterDateTo())) {
								checkDateRange(vDateFrom, vDateTo);
							}
						});
					}
				}
			}
		}
	}, self);

	//
	self.hiddenTabs = ko.observableArray([]);

	//attachments
	self.attachedItems = ko.observableArray();

	self.attachedDocTypes = ko.observableArray();


	self.attachmentsObject = ko.observable(null);
	self.previewer = ko.observable(new Previewer('modPreview'), minimumPreviewWidth);
	self.downloadFileUrl = ko.observable('');
	self.downloadFile = ko.observable(null);
	self.downloadFileName = ko.observable('');
	self.blobType = ko.observable('');

	//
	self.initialize = function (callback) {
		getUserData(callback);
		PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
	};

	self.EInvoice = ko.observable(null);

	//return self;

}

