/// <reference path="default.js" />
/// <reference path="setup.js" />
var fnc;
fnc = fnc || {};
fnc.setupQb = new function () {
	//********************************
	//defaults
	//********************************

	//********************************
	//private objects
	//********************************
	var QBOLocationItem = function (it) {
		//ConnectedCompId: null
		//ConnectedCompName: null
		//ConnectedDate: null
		//ConnectionBy: null
		//Expiration: null
		//IntuitGroupId
		//OrgId: "718"
		//OrgName: "*CORPORATE ACCOUNT - CROWN GROUP"
		//Status: "-1"

		var self = this;
		self.ConnectedCompId = it.ConnectedCompId;
		self.ConnectedCompName = it.ConnectedCompName;
		self.ConnectedDate = it.ConnectedDate;
		self.ConnectionBy = it.ConnectionBy;
		self.Expiration = it.Expiration;
		self.IntuitGroupId = it.IntuitGroupId;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;
		self.Status = it.Status;

		self.AcctionText = ko.computed(function () {
			var r = "";
			if (self.Status == -1) r = "Connect";
			if (self.Status == 0) r = "In progress";
			if (self.Status == 1) r = "In progress";
			if (self.Status == 2) r = "Disconnect";		//"Reconnect";
			if (self.Status == 3) r = "?";
			return r;
		}, self);

		self.isConnectButtonEnable = ko.computed(function () {
			var r = false;
			if ((self.Status == -1 || self.Status == 3) & fnc.app.prvQboConnectEnable()) r = true;
			if (self.Status == 2 & fnc.app.prvQboDisconnectEnable()) r = true;
			return r;
		}, self);

		self.isViewMappingButtonEnable = ko.computed(function () {
			var r = false;
			if (self.Status == 2 & fnc.app.prvQboViewMappingEnable()) r = true;
			if (self.Status == 2 & fnc.app.prvQboManageMappingEnable()) r = true;
			return r;
		}, self);

		self.doAction = function (d, e) {
			fnc.setupQb.selectedCmLocation(d);

			var orgId = self.OrgId;
			var qbSessionId = '';
			var status = d.Status;
			if (status == 2) {
				//disconnect
				intuitOrganizationGroupLoadList(orgId, function () {
					$("#modConfirmQBDisconnect").modal("show");
				});

				$('#modConfirmQBDisconnect').one('hidden.bs.modal', function (e) {
					fnc.setupQb.selectedCmLocation(null);
					fnc.setupQb.allGroupItems.removeAll();
				});
			} else if (status == 3) {
				//reconnect
				startAuthProcess(orgId, function (qbSessionId) {
					if (qbSessionId != '') {
						var d = {};
						d.sessionId = fnc.app.sessionId;
						d.uc = fnc.app.uc;
						d.iuc = fnc.app.iuc;

						d.oid = self.OrgId;
						d.qbSessionId = qbSessionId;

						saveLocal("qbSessionData", d);

						intuit.ipp.anywhere.controller.onConnectToIntuitClicked();

					} else {
						console.log();
					}
				});
			} else {
				//connect
				//var x = screenAvailWidth / 2 - 50;
				//var y = screenAvailHeight / 2 - 50;
				//var specs = "width=400,height=100,left=" + x + ",top=" + y;
				//var popup = window.open("qbo/PopupChecker.html", "", specs);
				//if (popup) {
				//	setTimeout(function () {
				//		popup.close();
				//		startAuthProcess(orgId, function (qbSessionId) {
				//			if (qbSessionId != '') {
				//				var d = {};
				//				d.sessionId = fnc.app.sessionId;
				//				d.uc = fnc.app.uc;
				//				d.iuc = fnc.app.iuc;

				//				d.oid = self.OrgId;
				//				d.qbSessionId = qbSessionId;

				//				saveLocal("qbSessionData", d);

				//				intuit.ipp.anywhere.controller.onConnectToIntuitClicked();

				//			} else {
				//				console.log();
				//			}
				//		});
				//	}, 2000);
				//} else {
				//	alert("blocked");
				//}

				if (fnc.setupQb.activeConnections() ) {
					getDistinctConnections(function () {
						$("#modConfirmQBConnect").modal("show");
					});

					$('#modConfirmQBConnect').one('hidden.bs.modal', function (e) {

					});
				} else {
					startAuthProcess(orgId, function (qbSessionId) {
						if (qbSessionId != '') {
							var d = {};
							d.sessionId = fnc.app.sessionId;
							d.uc = fnc.app.uc;
							d.iuc = fnc.app.iuc;

							d.oid = self.OrgId;
							d.qbSessionId = qbSessionId;

							saveLocal("qbSessionData", d);

							intuit.ipp.anywhere.controller.onConnectToIntuitClicked();

						} else {
							console.log();
						}
					});
				}

			}

		};

		self.doMapping = function (d, e) {
			fnc.setupQb.selectedCmLocation(d);

			$("#tblQBLocationListBody").height(qbSetupLocationTableHeight);

			intuitOrganizationGroupLoadList(d.OrgId, function () {
				loadDepartments(d.OrgId, function () {
					//
				})
			});

			loadCmActiveVendors(d.OrgId, function () {

				$("#tblQBVendorListBody").height(qbSetupVendorTableHeight);

				$("#modQbMapping").modal("show");
				
				loadQbVendors(d.OrgId, function (r) {
					fnc.setupQb.qboAllVendors(r);
					//sortArray(fnc.setupQb.qboAllVendors, "DisplayName");
				})
			});

			getGLAcctListByOrgId(d.OrgId, function () {
				$("#tblQBAccountListBody").height(qbSetupAccountTableHeight);
				loadQbGLAccounts(d.OrgId, function (r) {
					fnc.setupQb.qboAllGLAccounts(r);
				});
			});

			$('#modQbMapping').one('hidden.bs.modal', function (e) {
				fnc.setupQb.selectedCmLocation(null);
				fnc.setupQb.qboAllVendors.removeAll();
				fnc.setupQb.qboSelectedVendor(null);
				fnc.setupQb.allGroupItems.removeAll();
				fnc.setupQb.mappingTab('');
			});
		};

	}

	var QBOVendorItem = function (it) {
		var self = this;
		self.BillAddr = it.BillAddr;
		self.CompanyName = it.CompanyName;
		self.DisplayName = it.DisplayName;
		self.Id = it.Id;
		self.PrintOnCheckName = it.PrintOnCheckName;

		self.ComputedName = ko.computed(function () {
			var r = "";
			if (self.CompanyName) {
				r = self.CompanyName;
			} else {
				if (self.DisplayName) {
					r = self.DisplayName;
				} else {
					if (self.PrintOnCheckName) r = self.PrintOnCheckName;
				}
			}
			return r;
		}, self);

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.setupQb.qboAllVendors().length; i++) {
					if (fnc.setupQb.qboAllVendors()[i] != self) {
						fnc.setupQb.qboAllVendors()[i].Selected(false);
					}
				}
				fnc.setupQb.qboSelectedVendor(self);
			} else {
				fnc.setupQb.qboSelectedVendor(null);
			}
		});

	};

	var QBOGLAccountItem = function (it) {
		var self = this;
		self.AccNum = it.AccNum;
		self.AccountDescription = it.AccountDescription;
		self.Id = it.Id;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.setupQb.qboAllGLAccounts().length; i++) {
					if (fnc.setupQb.qboAllGLAccounts()[i] != self) {
						fnc.setupQb.qboAllGLAccounts()[i].Selected(false);
					}
				}
				fnc.setupQb.qboSelectedGLAccount(self);
			} else {
				fnc.setupQb.qboSelectedGLAccount(null);
			}
		});
	};

	var VendorListItem = function (it) {
		var self = this;
		self.Address1 = it.Address1;
		self.Address2 = it.Address2;
		self.City = it.City;
		self.Code = it.Code;
		self.Company = it.Company;

		self.CustomVendCode = ko.observable(it.CustomVendCode);
		self.CustomVendCompany = ko.observable(it.CustomVendCompany);

		self.RequiredPO = it.RequirePO;
		self.SBVendId = it.SBVendId;
		self.State = it.State;
		self.VendorId = it.VendID;
		self.Zip = it.Zip;

		self.Address = self.Address1 + ", " + self.City + " " + self.State + " " + self.Zip;
		self.qbVendors = ko.observableArray([]);
		self.qbVendorSearch = ko.observable('');
		self.qbFilteredVendors = ko.computed(function () {
			var vendorSearchFilter = self.qbVendorSearch().toLowerCase();
			vendorSearchFilter = vendorSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (vendorSearchFilter.length < 3) {
				var r = self.qbVendors();
				return r;
			} else {
				return ko.utils.arrayFilter(self.qbVendors(), function (item) {
					var words = vendorSearchFilter.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.DisplayName.toLowerCase().match(re) != null));
					}
					return found;
				});
			}
		}, self);

		self.CustomVendName = ko.computed(function () {
			var r = "";
			var customVendCode = self.CustomVendCode();
			r = getCustomVendName(customVendCode);
			return r;
		}, self);

		self.cssLinkStatus = ko.computed(function () {
			var r = 'btn-danger';
			var vendCode = self.CustomVendCode();
			var arr = fnc.setupQb.qboAllVendors();
			//'btn-success': CustomVendCode(), 'btn-danger': !CustomVendCode()
			for (var i = 0; i < arr.length; i++){
				if (vendCode == arr[i].Id) {
					r = 'btn-success';
					break;
				}
			}
			return r;
		}, self);


		self.Selected = ko.observable(false);
		//self.SelectedRowClass = ko.computed(function () {
		//	$("tr").removeClass("qb-background");
		//	return self.Selected() ? 'qb-background' : 'cm-hover';
		//}, self);

		self.toggleDropdown = function (d, e) {
			var y = e.pageY;																//y position for 'dropup' or 'dropdown'	margin setting
			var link = e.currentTarget;											//<a data-toggle="dropdown"> element
			var dropdown = $(link).next()[0];								//<div class="dropdown-menu"> element
			if (dropdown.style.display == "none") {
				$(".cm-qb-vendor-dropdown").hide();
				

				if (y > 440) {
					$(dropdown).css("margin", "-260px 0 0");		//'dropup'
				} else {
					$(dropdown).css("margin", "5px 0 0");				//'dropdown'
				}
				self.qbVendors(fnc.setupQb.qboAllVendors());
				var arr = fnc.setupQb.qboAllVendors();
				var id = d.CustomVendCode();
				var p = 0;
				for (var i = 0; i < arr.length; i++) {
					var it = arr[i];
					if (id == it.Id) {
						it.Selected(true);
						p = 24 * (i);															// lineheight(24) * line index
					} else {
						//console.log(i);
						it.Selected(false);
					}
				}

				$(dropdown).show();
				self.Selected(true);
				sortArray(fnc.setupQb.qboAllVendors, "DisplayName");

				$(dropdown).find("tbody").scrollTop(p);			 // scroll to 'Selected' line
			} else {
				$(".cm-qb-vendor-dropdown").hide();
				self.qbVendors([]);
				self.qbVendorSearch('');
				self.Selected(false);
			}
		};

		self.submitUpdate = function (d, e) {
			//
			var orgId = fnc.setupQb.selectedCmLocation().OrgId;
			var customVendCode = "";
			var customVendCompany = "";
			if (fnc.setupQb.qboSelectedVendor()) {
				customVendCode = fnc.setupQb.qboSelectedVendor().Id;
				customVendCompany = fnc.setupQb.qboSelectedVendor().DisplayName;
			}

			if (self.SBVendId > 0) {
				updateSandBoxVendorCode(orgId, self.SBVendId, customVendCode, customVendCompany, function () {
					self.CustomVendCode(customVendCode);
					self.CustomVendCompany(customVendCompany);
					$(".cm-qb-vendor-dropdown").hide();
					fnc.setupQb.qboSelectedVendor(null);
					self.qbVendors([]);
					self.qbVendorSearch('');
					self.Selected(false);
				});
			} else {
				updateManagedVendorCodeOneOrganization(self.VendorId, orgId, customVendCode, customVendCompany, function () {
					self.CustomVendCode(customVendCode);
					self.CustomVendCompany(customVendCompany);
					$(".cm-qb-vendor-dropdown").hide();
					fnc.setupQb.qboSelectedVendor(null);
					self.qbVendors([]);
					self.qbVendorSearch('');
					self.Selected(false);
				})
			}


		};

		self.closeDropdown = function (d, e) {
			$(".cm-qb-vendor-dropdown").hide();
			fnc.setupQb.qboSelectedVendor(null);
			self.qbVendors([]);
			self.qbVendorSearch('');
			self.Selected(false);
		};

	}

	var GLAccountItem = function (it) {
		//chartid: "29", glaccid: "8", GLAccNumber: "4", GLAccDescription: "test four"
		var self = this;
		self.ChartId = it.chartid;
		self.GLAccId = it.glaccid;
		self.GLAccNumber = ko.observable(it.GLAccNumber);
		self.GLAccDescription = ko.observable(it.GLAccDescription);
		self.CategoryClassId = ko.observable(it.CategoryClassId);

		self.Selected = ko.observable(false);

		self.CustomGLAccDescription = ko.observable(it.CustomGLAccDescription);
		self.CustomGLAccId = ko.observable(it.CustomGLAccId);
		self.CustomGLAccNumber = ko.observable(it.CustomGLAccNumber);

		self.CustomAccText = ko.computed(function () {
			var r = "";
			r = self.CustomGLAccNumber() == null ? self.CustomGLAccDescription() : self.CustomGLAccDescription() + " (" + self.CustomGLAccNumber() + ")";
			return r;
		}, self);

		self.GLAccText = self.GLAccNumber() == null ? self.GLAccDescription() : self.GLAccDescription() + " (" + self.GLAccNumber() + ")"

		self.ClassText = ko.computed(function () {
			var r = "OTHER";
			if (self.CategoryClassId() == 1) r = "FOOD";
			if (self.CategoryClassId() == 2) r = "BEVERAGES";
			return r;
		}, self);

		self.QbAccountId = 0;

		self.qbAccounts = ko.observableArray([]);
		self.qbAccountSearch = ko.observable('');
		self.qbFilteredAccounts = ko.computed(function () {
			var accountSearchFilter = self.qbAccountSearch().toLowerCase();
			accountSearchFilter = accountSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (accountSearchFilter.length < 3) {
				var r = self.qbAccounts();
				return r;
			} else {
				return ko.utils.arrayFilter(self.qbAccounts(), function (item) {
					var words = accountSearchFilter.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.AccountDescription.toLowerCase().match(re) != null));
					}
					return found;
				});
			}
		}, self);

		self.toggleDropdown = function (d, e) {
			var y = e.pageY;																//y position for 'dropup' or 'dropdown'	margin setting
			var link = e.currentTarget;											//<a data-toggle="dropdown"> element
			var dropdown = $(link).next()[0];								//<div class="dropdown-menu"> element
			if (dropdown.style.display == "none") {
				$(".cm-qb-glaccount-dropdown").hide();
				if (y > 440) {
					$(dropdown).css("margin", "-260px 0 0");		//'dropup'
				} else {
					$(dropdown).css("margin", "5px 0 0");				//'dropdown'
				}
				self.qbAccounts(fnc.setupQb.qboAllGLAccounts());
				var arr = fnc.setupQb.qboAllGLAccounts();
				var id = d.CustomGLAccId();
				var p = 0;
				for (var i = 0; i < arr.length; i++) {
					var it = arr[i];
					if (id == it.Id) {
						it.Selected(true);
						p = 24 * (i);															// lineheight(24) * line index
					} else {
						it.Selected(false);
					}
				}
				
				$(dropdown).show();
				self.Selected(true);

				sortArray(self.qbAccounts, "AccountDescription");

				$(dropdown).find("tbody").scrollTop(p);			 // scroll to 'Selected' line
			} else {
				$(".cm-qb-glaccount-dropdown").hide();
				self.qbAccounts([]);
				self.qbAccountSearch('');
				self.Selected(false);
			}

		};

		self.closeDropdown = function (d, e) {
			$(".cm-qb-glaccount-dropdown").hide();
			fnc.setupQb.qboSelectedGLAccount(null);
			self.qbAccounts([]);
			self.qbAccountSearch('');
			self.Selected(false);
		};

		self.submitUpdate = function (d, e) {
			var orgId = fnc.setupQb.selectedCmLocation().OrgId;
			var glAcctId = self.GLAccId;
			var glAcctNum = self.GLAccNumber();
			var glAcctDesc = self.GLAccDescription();

			if (fnc.setupQb.qboSelectedGLAccount()) {
				var customGlAcctId = fnc.setupQb.qboSelectedGLAccount().Id;
				var customGlAcctNum = fnc.setupQb.qboSelectedGLAccount().AccNum;
				var customGlAcctDesc = fnc.setupQb.qboSelectedGLAccount().AccountDescription;

				updateGLAcctCustomMap(orgId, glAcctId, glAcctNum, glAcctDesc, customGlAcctId, customGlAcctNum, customGlAcctDesc, function () {
					self.CustomGLAccId(customGlAcctId);
					self.CustomGLAccDescription(customGlAcctDesc);
					self.CustomGLAccNumber(customGlAcctNum)
					$(".cm-qb-glaccount-dropdown").hide();
					fnc.setupQb.qboSelectedGLAccount(null);
					self.qbAccounts([]);
					self.qbAccountSearch('');
					self.Selected(false);
					return;
				});
			} else {
				deleteGLAcctCustomMap(orgId, glAcctId, glAcctNum, glAcctDesc, function () {
					self.CustomGLAccId(null);
					self.CustomGLAccDescription(null);
					self.CustomGLAccNumber(null)
					$(".cm-qb-glaccount-dropdown").hide();
					fnc.setupQb.qboSelectedGLAccount(null);
					self.qbAccounts([]);
					self.qbAccountSearch('');
					self.Selected(false);
					return;
				});
			}
		};
	};

	var OrganizationGroupItem = function (it) {
		//CustomOrgCode: null
		//CustomOrgName: null
		//IntuitGroupId: "2"
		//OrgId: "610"
		//OrgName: "ALISON EIGHTEEN"
		var self = this;
		self.CustomOrgCode = ko.observable(it.CustomOrgCode);
		self.CustomOrgName = ko.observable(it.CustomOrgName != null ? it.CustomOrgName : '');
		self.IntuitGroupId = it.IntuitGroupId;
		self.OrgId = it.OrgId;
		self.OrgName = it.OrgName;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.setupQb.allGroupItems().length; i++) {
					if (fnc.setupQb.allGroupItems()[i] != self) {
						fnc.setupQb.allGroupItems()[i].Selected(false);
					}
				}
				fnc.setupQb.copyFromOrgId(self.OrgId);
			} else {
				fnc.setupQb.copyFromOrgId(null);
			}
		});

		self.qbLocations = ko.observableArray([]);
		self.qbLocationSearch = ko.observable('');

		self.qbFilteredLocations = ko.computed(function () {
			var qbLocationSearch = self.qbLocationSearch().toLowerCase();
			qbLocationSearch = qbLocationSearch.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (qbLocationSearch.length < 3) {
				var r = self.qbLocations();
				return r;
			} else {
				return ko.utils.arrayFilter(self.qbLocations(), function (item) {
					var words = qbLocationSearch.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.Name.toLowerCase().match(re) != null));
					}
					return found;
				});
			}
		}, self);

		self.isAddToGroupEnable = ko.computed(function () {
			var r = false;
			if (fnc.app.prvQboConnectEnable()) {
				r = fnc.setupQb.addToGroupOrgId();
			}
			return r;
		}, self);

		self.isRemoveFromGroupEnable = ko.computed(function () {
			var r = false;
			if (fnc.app.prvQboDisconnectEnable() && fnc.setupQb.selectedCmLocation()) {
				r = fnc.setupQb.allGroupItems().length > 1 && fnc.setupQb.selectedCmLocation().OrgId != self.OrgId;
			}
			return r;
		}, self);


		self.toggleDropdown = function (d, e) {
			var y = e.pageY;																//y position for 'dropup' or 'dropdown'	margin setting
			var link = e.currentTarget;											//<a data-toggle="dropdown"> element
			var dropdown = $(link).next()[0];								//<div class="dropdown-menu"> element
			if (dropdown.style.display == "none") {
				$(".cm-qb-location-dropdown").hide();


				if (y > 440) {
					$(dropdown).css("margin", "-260px 0 0");		//'dropup'
				} else {
					$(dropdown).css("margin", "5px 0 0");				//'dropdown'
				}
				self.qbLocations(fnc.setupQb.qboAllLocations());
				var arr = fnc.setupQb.qboAllLocations();
				var id = d.CustomOrgCode();
				var p = 0;
				for (var i = 0; i < arr.length; i++) {
					var it = arr[i];
					if (id == it.Id) {
						it.Selected(true);
						p = 24 * (i);															// lineheight(24) * line index
					} else {
						//console.log(i);
						it.Selected(false);
					}
				}

				$(dropdown).show();
				self.Selected(true);
				////sortArray(fnc.setupQb.qboAllLocations, "DisplayName");

				$(dropdown).find("tbody").scrollTop(p);			 // scroll to 'Selected' line
			} else {
				$(".cm-qb-location-dropdown").hide();
				self.qbLocations([]);
				self.qbLocationSearch('');
				self.Selected(false);
			}
		};

		self.closeDropdown = function (d, e) {
			$(".cm-qb-location-dropdown").hide();
			fnc.setupQb.qboSelectedLocation(null);
			self.qbLocations([]);
			self.qbLocationSearch('');
			self.Selected(false);
		};

		self.submitUpdate = function (d, e) {
			var orgId = self.OrgId;

			if (fnc.setupQb.qboSelectedLocation()) {
				var custOrgCode = fnc.setupQb.qboSelectedLocation().Id;
				var custOrgName = fnc.setupQb.qboSelectedLocation().Name;
				updateOrganizationCustomMap(orgId, custOrgCode, custOrgName, function () {
					self.CustomOrgCode(custOrgCode);
					self.CustomOrgName(custOrgName);
					$(".cm-qb-location-dropdown").hide();
					fnc.setupQb.qboSelectedLocation(null);
					self.qbLocations([]);
					self.qbLocationSearch('');
					self.Selected(false);
				})
			} else {
				deleteOrganizationCustomMap(orgId, function () {
					self.CustomOrgCode("");
					self.CustomOrgName("");
					$(".cm-qb-location-dropdown").hide();
					fnc.setupQb.qboSelectedLocation(null);
					self.qbLocations([]);
					self.qbLocationSearch('');
					self.Selected(false);
				})
			}

		};

		self.removeFromGroup = function (d, e) {
			fnc.setupQb.selectedForRemoveItem(d);

			$("#modConfirmRemoveFromGroup").modal("show");

			$('#modConfirmRemoveFromGroup').one('hidden.bs.modal', function (e) {
				fnc.setupQb.selectedForRemoveItem(null);
			});
		};

	}

	var QBODepartmentItem = function (it) {
		var self = this;
		self.Id = it.Id;
		self.Name = it.Name;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.setupQb.qboAllLocations().length; i++) {
					if (fnc.setupQb.qboAllLocations()[i] != self) {
						fnc.setupQb.qboAllLocations()[i].Selected(false);
					}
				}
				fnc.setupQb.qboSelectedLocation(self);
			} else {
				fnc.setupQb.qboSelectedLocation(null);
			}
		});
	};
	//********************************
	//private functions
	//********************************

	var loadOrganizationList = function (callback) {
		var params = {};
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.ConnectionOrganizationList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new QBOLocationItem(it)) })
			} else {
				arr.push(new QBOLocationItem(obj))
			}

			fnc.setupQb.allCmLocations(arr);

			if (callback) callback();
		});
	};

	var loadDepartments = function (orgId, callback) {
		//LoadDepartments(o.Params.OrganizationId)

		var params = {};
		params.OrganizationId = orgId;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.LoadDepartments", params, function (response) {
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

			if (r.departmentlist == null) {
				fnc.setupQb.qboAllLocations([]);
				if (callback) callback();
				return;
			}

			var obj = JSON.parse(response.d).departmentlist.department;
			var arr = [];

			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new QBODepartmentItem(it)) })
			} else {
				arr.push(new QBODepartmentItem(obj))
			}

			fnc.setupQb.qboAllLocations(arr);

			if (callback) callback();
		});

	}

	var intuitOrganizationGroupLoadList = function (orgId, callback) {
		//IntuitOrganizationGroupLoadList(o.Params.OrganizationId)
		var params = {};
		params.OrganizationId = orgId;
		//loading(true);
		//fnc.setupQb.allGroupItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.IntuitOrganizationGroupLoadList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new OrganizationGroupItem(it)) })
			} else {
				arr.push(new OrganizationGroupItem(obj))
			}

			fnc.setupQb.allGroupItems(arr);

			if (callback) callback();
		});

	}

	var intuitGroupAddOrganization = function (groupId, groupName, orgId, callback) {
		//IntuitGroupAddOrganization(o.Params.GroupId, o.Params.GroupName, o.Params.OrganizationId, o.uc)
		var params = {};
		params.GroupId = groupId;
		params.GroupName = groupName;
		params.OrganizationId = orgId;
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.IntuitGroupAddOrganization", params, function (response) {
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

	var intuitGroupDeleteOrganization = function (groupId, orgId, callback) {
		//IntuitGroupDeleteOrganization(o.Params.GroupId, o.Params.OrganizationId, o.uc)
		var params = {};
		params.GroupId = groupId;
		params.OrganizationId = orgId;
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.IntuitGroupDeleteOrganization", params, function (response) {
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

	var updateOrganizationCustomMap = function (orgId, custOrgCode, custOrgName, callback) {
		//UpdateOrganizationCustomMap(o.Params.OrganizationId, o.Params.CustomOrgCode, o.Params.CustomOrgName, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		params.CustomOrgCode = custOrgCode;
		params.CustomOrgName = custOrgName;

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.UpdateOrganizationCustomMap", params, function (response) {
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

	var deleteOrganizationCustomMap = function (orgId, callback) {
		//DeleteOrganizationCustomMap(o.Params.OrganizationId, o.uc)
		var params = {};
		params.OrganizationId = orgId;

		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.DeleteOrganizationCustomMap", params, function (response) {
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

	var createAuthorization = function (sessionId, callback) {
		//CreateAuthorization(o.Params.SessionId, o.uc)
		var params = {};
		params.SessionId = sessionId;
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.CreateAuthorization", params, function (response) {
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

			if (callback) callback();
		});

	};

	var startAuthProcess = function (orgId, callback) {
		//StartAuthProcess(o.Params.OrganizationId, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.StartAuthProcess", params, function (response) {
			if (response.d == '') {
				windowResized();
				return;
			}
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				windowResized();
				return;
			}
			
			if (callback) callback(r.result);
		});
	};

	var loadCmActiveVendors = function (orgId, callback) {
		var params = {};
		params.OrganizationId = orgId;

		//Function LoadAllActiveVendors(organizationId As Integer) As String

		loading(true);
		self.allActiveVendors.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.LoadAllActiveVendors", params, function (response) {
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
			var obj = JSON.parse(response.d).result.row;
			var arr = [];
			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new VendorListItem(it)) })
			} else {
				arr.push(new VendorListItem(obj))
			}
			self.allActiveVendors(arr);
			if (callback) callback();
		})
	};

	var loadQbVendors = function (orgId, callback) {
		//LoadVendors(o.Params.OrganizationId)

		var params = {};
		params.OrganizationId = orgId;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.LoadVendors", params, function (response) {
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

			var obj = JSON.parse(response.d).vendorlist.vendor;
			var arr = [];

			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new QBOVendorItem(it)) })
			} else {
				arr.push(new QBOVendorItem(obj))
			}

			if (callback) callback(arr);
		});
	};

	var updateSandBoxVendorCode = function (orgId, sbVendId, customVendCode, customVendCompany, callback) {
		//UpdateSandBoxVendorCode(o.Params.sbVendId, o.Params.OrgId, o.Params.CustomVendCode, o.uc)
		var params = {};
		params.OrgId = orgId;
		params.sbVendId = sbVendId;
		params.CustomVendCode = customVendCode;
		params.CustomVendCompany = customVendCompany;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.UpdateSandBoxVendorCode", params, function (response) {
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

	var updateManagedVendorCodeOneOrganization = function (vendId, orgId, customVendCode, customVendCompany, callback) {
		//UpdateManagedVendorCodeOneOrganization(o.Params.VendId, o.Params.OrgId, o.Params.CustomVendCode, o.uc)
		var params = {};
		params.VendId = vendId;
		params.OrgId = orgId;
		params.CustomVendCode = customVendCode;
		params.CustomVendCompany = customVendCompany;
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.UpdateManagedVendorCodeOneOrganization", params, function (response) {
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

	var getGLAcctListByOrgId = function (orgId, callback) {

		var params = {};
		params.OrgId = orgId;

		//loading(true);
		//Function LoadGLAccountList(chartId As Integer) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.LoadGLAccountList", params, function (response) {
			loading(false);
			if (response.d == '') {
				fnc.setupQb.allGLAccounts.removeAll();
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

			fnc.setupQb.allGLAccounts(arr);

			if (callback) callback();
		});
	};

	var loadQbGLAccounts = function (orgId, callback) {
		//LoadGLAccounts(o.Params.OrganizationId)

		var params = {};
		params.OrganizationId = orgId;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.LoadGLAccounts", params, function (response) {
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

			var obj = JSON.parse(response.d).accountlist.account;
			var arr = [];

			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new QBOGLAccountItem(it)) })
			} else {
				arr.push(new QBOGLAccountItem(obj))
			}


			if (callback) callback(arr);
		});
	}

	var updateGLAcctCustomMap = function (orgId, glAcctId, glAcctNum, glAcctDesc, customGlAcctId, customGlAcctNum, customGlAcctDesc, callback) {
		//GLAccountCustomMapUpdate(o.Params.OrganizationId, o.Params.GLAcctId, o.Params.GLAcctNumber, o.Params.GLAcctDescription, o.Params.CustomGLAcctId, o.Params.CustomGLAcctNumber, o.Params.CustomGLAcctDescription, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		params.GLAcctId = glAcctId;
		params.GLAcctNumber = glAcctNum == null ? "" : glAcctNum;
		params.GLAcctDescription = glAcctDesc == null ? "" : glAcctDesc;
		params.CustomGLAcctId = customGlAcctId;
		params.CustomGLAcctNumber = customGlAcctNum;
		params.CustomGLAcctDescription = customGlAcctDesc;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.GLAccountCustomMapUpdate", params, function (response) {
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

	var deleteGLAcctCustomMap = function (orgId, glAcctId, glAcctNum, glAcctDesc, callback) {
		//GLAccountCustomMapDelete(o.Params.OrganizationId, o.Params.GLAcctId, o.Params.GLAcctNumber, o.Params.GLAcctDescription, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		params.GLAcctId = glAcctId;
		params.GLAcctNumber = glAcctNum;
		params.GLAcctDescription = glAcctDesc;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.GLAccountCustomMapDelete", params, function (response) {
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

	var disconnect = function (orgId, realmId, callback) {
		//Disconnect(o.Params.OrganizationId, o.Params.RealmId, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		params.RealmId = realmId;
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.QBOHelper.QboDisconnect", params, function (response) {
			loading(false);
			if (response.d == '') {
				if (callback) callback();
				return;
			}
			//error
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				return;
			}
		});

	};

	var getCustomVendName = function (customVendCode) {
		var r = "";
		if (customVendCode != null && self.qboAllVendors().length > 0)
		for (var i = 0; i < self.qboAllVendors().length; i++) {
			var it = self.qboAllVendors()[i];
			if (it.Id == customVendCode) {
				r = it.DisplayName;
				break;
			}
		}
		return r;
	};

	var checkForSiblings = function (callback) {
		if (callback) callback();
	};

	var vendorCustomMapCopy = function (orgIdFrom, orgIdTo, callback) {
		//VendorCustomMapCopy(o.Params.OrganizationIdFrom, o.Params.OrganizationIdTo, o.uc)
		var params = {};
		params.OrganizationIdFrom = orgIdFrom;
		params.OrganizationIdTo = orgIdTo;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.VendorCustomMapCopy", params, function (response) {
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

	var glAccountCustomMapCopy = function (orgIdFrom, orgIdTo, callback) {
		//GLAccountCustomMapCopy(o.Params.OrganizationIdFrom, o.Params.OrganizationIdTo, o.uc)
		var params = {};
		params.OrganizationIdFrom = orgIdFrom;
		params.OrganizationIdTo = orgIdTo;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Invoices.GLAccountCustomMapCopy", params, function (response) {
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

	var getDistinctConnections = function (callback) {
		var arr = self.allCmLocations();
		var distinct = [];
		self.distinctConnections.removeAll();
		for (var i = 0; i < arr.length; i++) {
			var it = arr[i];
			if (it.Status == 2 && distinct.indexOf(it.IntuitGroupId) == -1) {
				distinct.push(it.IntuitGroupId);
				self.distinctConnections.push(it);
			}
		}
		if (distinct.length > 0) {
			var it = {};
			it.ConnectedCompId = -1;
			it.ConnectedCompName = 'Other company';
			it.ConnectedDate = null;
			it.ConnectedBy = null;
			it.Expiration = null;
			it.IntuitGroupId = -1;
			it.OrgId = fnc.setupQb.selectedCmLocation().OrgId;
			it.OrgName = fnc.setupQb.selectedCmLocation().OrgName;
			it.Status = -1;
			self.distinctConnections.push(new QBOLocationItem(it));
		}
		if (callback) callback();
		return;
	}
	//
	//********************************
	//public model
	//********************************
	var self = this;

	self.allCmLocations = ko.observableArray();

	self.selectedCmLocation = ko.observable(null);

	self.activeConnections = ko.computed(function () {
		var r = false;
		var arr = self.allCmLocations();
		for (var i = 0; i < arr.length; i++) {
			var it = arr[i];
			if (it.Status == 2) {
				r = true;
				break;
			}
		}
		return r;
	}, self);

	self.distinctConnections = ko.observableArray();
	self.selectedConnection = ko.observable(null);

	self.searchQbAuthenticationFilter = ko.observable('');

	self.filteredCmLocations = ko.computed(function () {
		var searchQbAuthenticationFilter = self.searchQbAuthenticationFilter().toLowerCase();
		searchQbAuthenticationFilter = searchQbAuthenticationFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchQbAuthenticationFilter.length < 3) {
			var r = self.allCmLocations();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allCmLocations(), function (item) {
				var words = searchQbAuthenticationFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);

	self.notConnectedCmLocations = ko.computed(function () {
		return ko.utils.arrayFilter(self.allCmLocations(), function (item) {
			return item.Status == -1;
		});
	}, self);

	self.addToGroupOrgId = ko.observable();

	//
	self.mappingTab = ko.observable('');

	//
	self.groupItemSearchFilter = ko.observable('');

	//Group List
	self.allGroupItems = ko.observableArray();
	self.filteredGroupItems = ko.computed(function () {
		var groupItemSearchFilter = self.groupItemSearchFilter().toLowerCase();
		groupItemSearchFilter = groupItemSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (groupItemSearchFilter.length < 3) {
			var r = self.allGroupItems();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allGroupItems(), function (item) {
				var words = groupItemSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.OrgName.toLowerCase().match(re) != null) || (item.CustomOrgName().toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	self.selectedForRemoveItem = ko.observable(null);

	self.qboAllLocations = ko.observableArray();
	self.qboSelectedLocation = ko.observable(null);

	//Vendors
	self.vendorSearchFilter = ko.observable('');
	self.allActiveVendors = ko.observableArray();
	self.filteredActiveVendors = ko.computed(function () {
		var vendorSearchFilter = self.vendorSearchFilter().toLowerCase();
		vendorSearchFilter = vendorSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (vendorSearchFilter.length < 3) {
			var r = self.allActiveVendors();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allActiveVendors(), function (item) {
				var words = vendorSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Company.toLowerCase().match(re) != null) || (item.Code.toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);

	//GL Accounts
	self.glAcctSearchFilter = ko.observable('');
	self.allGLAccounts = ko.observableArray();
	self.filteredGLAccounts = ko.computed(function () {
		var glAcctSearchFilter = self.glAcctSearchFilter().toLowerCase();
		glAcctSearchFilter = glAcctSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (glAcctSearchFilter.length < 3) {
			var r = self.allGLAccounts();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allGLAccounts(), function (item) {
				var words = glAcctSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.GLAccDescription().toLowerCase().match(re) != null) || (item.GLAccNumber().toLowerCase().match(re) != null));
				}
				return found;
			});
		}
	}, self);
	//QBO
	self.qboAllVendors = ko.observableArray();
	self.qboSelectedVendor = ko.observable(null);

	self.qboAllGLAccounts = ko.observableArray();
	self.qboSelectedGLAccount = ko.observable(null);

	self.copyFromOrgId = ko.observable(null);
	self.copyToOrgId = ko.observable(null);

	//********************************
	//public functions
	//********************************
	self.init = function (callback) {
		loadOrganizationList(function () {
			if (callback) callback();
		})
		
	};

	self.showQbSelectedPanel = function (d, e) {

		getQBOGrantURL(function (qbGrantURL) {
			intuit.ipp.anywhere.setup({
				grantUrl: qbGrantURL,
				datasources: {
					quickbooks: true,
					payments: true
				},
				paymentOptions: {
					intuitReferred: true
				}
			});
			intuit.ipp.anywhere.service.openExternalPopupWindow = function (wind) {
				var parameters = "location=1";
				if (wind.height == null && wind.width == null) {
					wind.height = 650;
					wind.width = 800;
				}
				parameters += ",width=" + wind.width + ",height=" + wind.height;
				if (wind.centered) {
					parameters += ",left=" + (screen.width - wind.width) / 2 + ",top=" + (screen.height - wind.height) / 2;
				}
				//window.open(wind.url, "ippPopupWindow", parameters);
				var w = window.open("qbo/PopupChecker.html", "ippPopupWindow", parameters);
				setTimeout(function () {
					if (!w)
						$("#modQBPopup").modal("show");
				}, 1);
				fnc.intuitURL = wind.url;
			}
		});


		self.selectedCmLocation(null);
		var selectedId = e.currentTarget.getAttribute("href");
		fnc.setupApp.selectedSetupId(selectedId);
		$("#tblCmLocationListBody").height(qbSetupTableHeight);
		windowResized();
	};

	self.clickMappingTab = function (it) {
		var id = it.getAttribute("href");
		fnc.setupQb.mappingTab(id);
		switch(id){
			case "#cmLocationList":
				$(".cm-qb-vendor-dropdown").hide();
				fnc.setupQb.qboSelectedVendor(null);

				$(".cm-qb-glaccount-dropdown").hide();
				fnc.setupQb.qboSelectedGLAccount(null);
				break;
			case "#cmVendorList":
				$(".cm-qb-glaccount-dropdown").hide();
				fnc.setupQb.qboSelectedGLAccount(null);
				break;
			case "#cmGLAcctList":
				$(".cm-qb-vendor-dropdown").hide();
				fnc.setupQb.qboSelectedVendor(null);
				break;
		}
	};

	self.cancelDisconnectQB = function (d, e) {
		$("#modConfirmQBDisconnect").modal("hide");
	};

	self.disconnectQB = function (d, e) {
		var orgId = self.selectedCmLocation().OrgId;
		disconnect
		disconnect(orgId, '', function () {
			$("#modConfirmQBDisconnect").modal("hide");
			loadOrganizationList(function () {
				windowResized();
			})
		})

		//var arr = self.allGroupItems();
		//for (var i = 0; i < arr.length; ) {
		//	var orgId = arr[i].OrgId;	//fnc.setupQb.selectedCmLocation().OrgId;
		//	disconnect(orgId, '', function () {
		//		i++;
		//		if (i == arr.length) {
		//			$("#modConfirmQBDisconnect").modal("hide");
		//			loadOrganizationList(function () {
		//				windowResized();
		//				return;
		//			})
		//		}
		//	})
		//}

		//var arr = self.allGroupItems();
		//var i = 0;
		//function f2(i, callback){
		//	if (callback) callback();
		//}
		//function f1(i) {
		//	var orgId = arr[i].OrgId;
		//	disconnect(orgId, '', function () {
		//		f2(i, function () {
		//			if (i == arr.length - 1) {
		//				$("#modConfirmQBDisconnect").modal("hide");
		//				loadOrganizationList(function () {
		//					windowResized();
		//				})
		//				return;
		//			}
		//			i++;
		//			setTimeout(function () {
		//				f1(i)
		//			}, 50);
		//		})

		//	});
		//}

		//f1(i);
	};

	self.addToGroup = function (d, e) {
		if (self.allGroupItems().length > 0) {
			var groupId = self.allGroupItems()[0].IntuitGroupId;
			var groupName = "";
			var orgId = self.addToGroupOrgId();
			intuitGroupAddOrganization(groupId, groupName, orgId, function () {
				intuitOrganizationGroupLoadList(orgId, function () {
					loadOrganizationList(function () {
						self.addToGroupOrgId(null);
						windowResized();
					});
				});
			});
		}
	};

	self.doRemoveFromGroup = function (d, e) {
		var groupId = self.selectedForRemoveItem().IntuitGroupId; //self.IntuitGroupId;
		var orgId = self.selectedForRemoveItem().OrgId;	//self.OrgId;
		intuitGroupDeleteOrganization(groupId, orgId, function () {
			$("#modConfirmRemoveFromGroup").modal("hide");
			var selectedLocationId = self.selectedCmLocation().OrgId;
			intuitOrganizationGroupLoadList(selectedLocationId, function () {
				loadOrganizationList(function () {
					windowResized();
				})
			});
		});
	};

	self.cancelRemoveFromGroup = function (d, e) {
		$("#modConfirmRemoveFromGroup").modal("hide");
	};

	self.showQBGroupLocations = function (d, e) {
		fnc.setupQb.copyToOrgId(fnc.setupQb.selectedCmLocation().OrgId);

		$("#modQBGroupLocations").modal("show");

		$('#modQBGroupLocations').one('hidden.bs.modal', function (e) {
			fnc.setupQb.copyFromOrgId(null);
			fnc.setupQb.copyToOrgId(null);
			var arr = fnc.setupQb.allGroupItems();
			for (var i = 0; i < arr.length; i++) {
				arr[i].Selected(false);
			}
		});
	};

	self.copyMapping = function (d, e) {
		var orgIdFrom = fnc.setupQb.copyFromOrgId();
		var orgIdTo = fnc.setupQb.copyToOrgId()
		if ($("#cmVendorList").hasClass("active")) {
			vendorCustomMapCopy(orgIdFrom, orgIdTo, function () {
				$("#modQBGroupLocations").modal("hide");
				loadCmActiveVendors(orgIdTo, function () {
					windowResized();
				});
			});
		}

		if ($("#cmGLAcctList").hasClass("active")) {
			glAccountCustomMapCopy(orgIdFrom, orgIdTo, function () {
				$("#modQBGroupLocations").modal("hide");
				getGLAcctListByOrgId(orgIdTo, function () {
					windowResized();
				});
			});
		}
	};

	self.cancelCopyMapping = function (d, e) {
		$("#modQBGroupLocations").modal("hide");
	};

	self.connectToQbCompany = function (d, e) {
		if (self.selectedConnection()) {
			$("#modConfirmQBConnect").modal("hide");
			var it = self.selectedConnection();
			var orgId = fnc.setupQb.selectedCmLocation().OrgId;
			if (it.IntuitGroupId == -1) {
				//connect to qb
				//$("#modConfirmQBConnect").modal("hide");
				startAuthProcess(orgId, function (qbSessionId) {
					if (qbSessionId != '') {
						var d = {};
						d.sessionId = fnc.app.sessionId;
						d.uc = fnc.app.uc;
						d.iuc = fnc.app.iuc;

						d.oid = orgId;
						d.qbSessionId = qbSessionId;

						saveLocal("qbSessionData", d);

						intuit.ipp.anywhere.controller.onConnectToIntuitClicked();

					} else {
						console.log();
					}
				});
			} else {
				//add to Intuit Group
				var groupId = it.IntuitGroupId;
				var groupName = "";
				//$("#modConfirmQBConnect").modal("hide");
				intuitGroupAddOrganization(groupId, groupName, orgId, function () {
					intuitOrganizationGroupLoadList(orgId, function () {
						loadOrganizationList(function () {
							windowResized();
						});
					});
				});
			}
		} else {
			$("#modConfirmQBConnect").modal("hide");
		}

		
	};

	self.cancelConnectToQbCompany = function (d, e) {
		$("#modConfirmQBConnect").modal("hide");
	};

	self.remoteLog = function (str, callback) {
		console.log(str);
		if (callback) callback();
	};
}