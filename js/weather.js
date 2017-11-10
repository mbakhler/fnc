/// <reference path="default.js" />
var fnc;
fnc = fnc || {};
fnc.weatherApp = new function () {
	// Default variables
	var MSG_FORECAST_NOT_AVAILABLE = 'No weather forecast available';
	//******************
	// private objects
	//******************
	var CurrentItem = function (it) {
		var self = this;
		self.Code = it.code;
		self.Date = it.date;
		self.Temperature = it.temp;
		self.Text = it.text;

	};

	var ForecastItem = function (it) {
		var self = this;
		self.Code = it.code;
		self.Date = it.date;
		self.Day = it.day.toUpperCase();
		self.High = it.high;
		self.Low = it.low;
		self.Text = it.text;

	};

	var LocationItem = function (it) {
		var self = this;
		self.LocationId = it.locationId;
		self.LocationName = it.locationName;
		self.Selected = ko.observable(false);

		self.Visible = ko.computed(function () {
			var r = false;
			if ((fnc.app.filterSelectedLocations().indexOf(self.LocationId) != -1) || (fnc.app.filterSelectedLocations().length == 0)) r = true;
			return r;
		});

		self.selectLocation = function (d, e) {
			//console.log(d);

			//var orgId = self.LocationId;
			//var forecastDate = new Date().format("yyyy-mm-dd");

			//loadCurrent(orgId, fnc.weatherApp.selectedCity, fnc.weatherApp.selectedState, fnc.weatherApp.currentDaySummary, function () {
			//	fnc.weatherApp.selectedLocation(findLocation(orgId, fnc.weatherApp.allAvailableLocations()));
			//	windowResized();
			//})
			//loadForecast(forecastDate, orgId, fnc.weatherApp.nDaysForecast, function () {
			//	windowResized();
			//})

		};
	};
	//******************
	// private function
	//******************
	var loadCurrent = function (orgList, city, state, dailySummary, callback) {
		//LoadCurrent(o.Params.OrgList)
		var params = {};
		params.OrgList = orgList;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.WeatherYahoo.LoadCurrent", params, function (response) {
			//loading(false);
			//console.log(response.d)
			if (response.d == '') {
				city('');
				state('');
				dailySummary(null);
				if (callback) callback();
				windowResized();
				return;
			}

			var r = eval('(' + response.d + ')');
			if (r.result == 'error') {
				city('');
				state('');
				dailySummary(null);
				windowResized();
				return;
			}
			var it = null;
			var obj = JSON.parse(response.d).result.row;
			if (obj.ForecastData['@xsi:nil'] != 'true') {
				it = new CurrentItem(obj.ForecastData.current);
			}

			dailySummary(it);
			city(obj.City);
			state(obj.State);

			if (callback) callback();
		});
	}

	var loadForecast = function (forecastDate, orgId, forecastSummary, callback) {
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
	}

	var copyLocations = function (locations) {
		var arr2 = [];
		if (locations[0]) {
			for (var i = 0; i < locations.length; i++) {
				var it = locations[i];
				var o = new LocationItem({ locationId: it.LocationId, locationName: it.LocationName });
				arr2.push(o);
			}
		} else {
			var it = locations;
			var o = new LocationItem({ locationId: it.LocationId, locationName: it.LocationName });
			arr2.push(o);
		}
		return arr2;
	};

	var findLocation = function (orgId, arr) {
		var r = '';
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].LocationId == orgId) {
				r = arr[i].LocationName;
				break;
			}
		}
		return r;
	};


	//******************
	// fnc.weatherApp public 
	//******************
	var self = this;

	self.allAvailableLocations = ko.observableArray();
	self.selectedLocation = ko.observable('');

	self.selectedCity = ko.observable('');
	self.selectedState = ko.observable('');
	

	self.currentDaySummary = ko.observable(null);
	self.nDaysForecast = ko.observableArray();

	self.isCurrentVisible = ko.computed(function () {
		var r = false;
		if (self.selectedCity() != '' || self.selectedState() != '') r = true;
		return r;
	}, self);
	self.isForecastVisible = ko.observable(false);

	self.init = function (callback) {
		//var orgId = fnc.app.oid;
		//var forecastDate = new Date(1900, 0, 1);		//new Date(1900,0,1)    new Date().format("yyyy-mm-dd");
		//var arr = copyLocations(fnc.app.filterAvailableLocations());
		//self.allAvailableLocations(arr);
		//loadCurrent(orgId, self.selectedCity, self.selectedState, self.currentDaySummary, function () {
		//	//console.log(self.currentDaySummary());
		//	self.selectedLocation(findLocation(orgId, self.allAvailableLocations()));
		//	if (callback) callback();
		//})
		//loadForecast(forecastDate, orgId, self.nDaysForecast, function () {
		//	//console.log(self.currentDaySummary());
		//	//console.log(self.nDaysForecast());
		//	if (callback) callback();
		//})
	};

	self.loadCurrentForecast = function (orgList, city, state, dailySummary, callback) {
		loadCurrent(orgList, city, state, dailySummary, callback);
	};

	self.loadOneDayForecast = function (forecastDate, orgId, forecastSummary, callback) {
		loadForecast(forecastDate, orgId, forecastSummary, callback);
	};
}