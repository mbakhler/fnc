/// <reference path="default.js" />
/// <reference path="setup.js" />
var fnc;
fnc = fnc || {};
fnc.setupCC = new function () {
	//********************************
	//defaults
	//********************************

	//********************************
	//private objects
	//********************************
	var CostCenterOrgItem = function (it) {
		var self = this;
		self.LocationId = it.OrgId;
		self.LocationName = it.Location;
		self.Count = it.Count;
		
		self.CostCentersCount = ko.observable(it.Count);
		self.CostCenters = ko.observableArray();

		self.NewCostCenterCode = ko.observable('');
		self.NewCostCenterName = ko.observable('');
		self.NewCostCenterNotes = ko.observable('');

		self.showCostCenterManageDialog = function (d, e) {
			getOrgCostCenters(d.LocationId, function (r) {
				d.CostCenters(r);
				fnc.setupCC.selectedCostCenterOrg(d);
			})

			$('#modOrgCostCenters').modal('show');

			$('#modOrgCostCenters').one('hidden.bs.modal', function (e) {
				fnc.setupCC.selectedCostCenterOrg(null);
			});
		}

		self.addCostCenterButtonClick = function (d, e) {
			var orgId = self.LocationId;
			var clsCode = self.NewCostCenterCode();
			var clsName = self.NewCostCenterName();
			var notes = self.NewCostCenterNotes();

			addCostCenter(orgId, clsCode, clsName, notes, function (r) {
				if (r) {
					self.CostCenters.removeAll();
					getOrgCostCenters(orgId, function (r) {
						self.CostCenters(r);
						self.CostCentersCount(self.CostCenters().length);
					})
				}
			});

			self.NewCostCenterCode('');
			self.NewCostCenterName('');
			self.NewCostCenterNotes('');

		}

		self.isAddCostCenterBtnEnable = ko.computed(function () {
			var r = false;

			if (self.NewCostCenterName() !== '') r = true;

			return r;
		}, self)
	}

	var CostCenterItem = function (it) {
		var self = this;

		self.ClassName = it.ClassName;
		self.ClassCode = it.ClassCode;
		self.Notes = it.Notes;

		self.CostCenterId = it.OrganizationClassId;
		self.CostCenterName = ko.observable(it.ClassName);
		self.CostCenterCode = ko.observable(it.ClassCode);
		self.CostCenterNotes = ko.observable(it.Notes);

		self.deleteCostCenterButtonClick = function (d, e) {
			fnc.setupCC.selectedCostCenterItem(d);

			$('#modConfirmDeleteCostCenter').modal('show');

			$('#modConfirmDeleteCostCenter').one('hidden.bs.modal', function (e) {
				fnc.setupCC.selectedCostCenterItem(null);
			});
		}

		self.updateCostCenter = function (d, e) {
			var type = e.currentTarget.getAttribute('data-type');
			var dirtyFlag = false;
			if (self.ClassName !== self.CostCenterName() || self.ClassCode !== self.CostCenterCode() || self.Notes !== self.CostCenterNotes()) dirtyFlag = true;
			if (dirtyFlag) {
				var orgId = fnc.setupCC.selectedCostCenterOrg().LocationId;
				var clsId = self.CostCenterId;
				var clsName = self.CostCenterName() || '';
				var clsCode = self.CostCenterCode() || '';
				var notes = self.CostCenterNotes() || '';

				updCostCenter(clsId, orgId, clsName, clsCode, notes, function () {
					fnc.setupCC.selectedCostCenterOrg().CostCenters.removeAll();
					getOrgCostCenters(orgId, function (r) {
						fnc.setupCC.selectedCostCenterOrg().CostCenters(r);
						fnc.setupCC.selectedCostCenterOrg().CostCentersCount(fnc.setupCC.selectedCostCenterOrg().CostCenters().length);
					})
				})
			}
			
		}

	}
	//********************************
	//private functions
	//********************************
	var getAllOrgsCostCenterList = function (callback) {
		
		var params = {};
		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.ClassSetup.LoadClassAssignmentList", params, function (response) {
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
			//var obj = fnc.app.filterAvailableLocations();
			var arr = [];

			if (obj[0]) {
				obj.forEach(function (it) { arr.push(new CostCenterOrgItem(it)) })
			} else {
				arr.push(new CostCenterOrgItem(obj))
			}

			fnc.setupCC.allOrgsCostCenterList(arr);

			if (callback) callback();
		});

	};

	var addCostCenter = function (orgId, clsCode, clsName, notes, callback) {
		//client.AddClass(o.Params.OrganizationId, o.Params.ClassCode, o.Params.ClassName, o.Params.Notes, o.uc).ToString
		var params = {};
		params.OrganizationId = orgId;
		params.ClassCode = clsCode;
		params.ClassName = clsName;
		params.Notes = notes;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.ClassSetup.AddClass", params, function (response) {
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
		});
	};

	var delCostCenter = function (clsId, orgId, callback) {
		//RemoveClass(o.Params.OrganizationClassId, o.Params.OrganizationId, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		params.OrganizationClassId = clsId;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.ClassSetup.RemoveClass", params, function (response) {
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

	var updCostCenter = function (clsId, orgId, clsName, clsCode, notes, callback) {
	//ModifyClass(o.Params.OrganizationClassId, o.Params.OrganizationId, o.Params.ClassCode, o.Params.ClassName, o.Params.Notes, o.uc)
		var params = {};
		params.OrganizationId = orgId;
		params.OrganizationClassId = clsId;
		params.ClassCode = clsCode;
		params.ClassName = clsName;
		params.Notes = notes;

		loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.ClassSetup.ModifyClass", params, function (response) {
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
	//********************************
	//public model
	//********************************
	var self = this;

	self.allOrgsCostCenterList = ko.observableArray();
	self.searchOrgsCostCenterFilter = ko.observable('');
	self.filteredOrgsCostCenterList = ko.computed(function () {
		var searchOrgsCostCenterFilter = self.searchOrgsCostCenterFilter().toLowerCase();
		searchOrgsCostCenterFilter = searchOrgsCostCenterFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
		if (searchOrgsCostCenterFilter.length < 3) {
			var r = self.allOrgsCostCenterList();
			return r;
		} else {
			return ko.utils.arrayFilter(self.allOrgsCostCenterList(), function (item) {
				var words = searchOrgsCostCenterFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.LocationName.toLowerCase().match(re) !== null));
				}
				return found;
			});
		}
	}, self);

	

	self.selectedCostCenterOrg = ko.observable(null);

	self.selectedCostCenterItem = ko.observable(null);

	//********************************
	//public functions
	//********************************
	self.init = function (callback) {
		getAllOrgsCostCenterList(function () {
			console.log();
		})
	}

	self.showCostCentersPanel = function (d, e) {
		getAllOrgsCostCenterList(function () {
			var selectedId = e.currentTarget.getAttribute("href");
			fnc.setupApp.selectedSetupId(selectedId);
			$("#tblCmOrgsCostCenterListBody").height(qbSetupTableHeight);
			windowResized();
		})
		//var selectedId = e.currentTarget.getAttribute("href");
		//fnc.setupApp.selectedSetupId(selectedId);
	}

	self.removeCostCenter = function (d, e) {
		var orgId = self.selectedCostCenterOrg().LocationId;
		var clsId = self.selectedCostCenterItem().CostCenterId;

		delCostCenter(clsId, orgId, function () {

			$('#modConfirmDeleteCostCenter').modal('hide');
			self.selectedCostCenterOrg().CostCenters.removeAll();
			getOrgCostCenters(orgId, function (r) {
				self.selectedCostCenterOrg().CostCenters(r);
				self.selectedCostCenterOrg().CostCentersCount(self.selectedCostCenterOrg().CostCenters().length);
			})

		})
	}

}