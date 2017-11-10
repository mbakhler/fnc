var fnc;
fnc = fnc || {};
fnc.vendorsApp = new function () {
	//*********************
	//private
	//*********************
	var pageSize = 100;

	//objects
	var SBVendorListItem = function (it) {
		//Active: "1"
		//Address1: "123 Main Street"
		//Address2: "Second Floor"
		//City: "New York"
		//Code: "68978RG-012-F78"
		//Company: "company one test"
		//SBVendId: "3"
		//State: "NY"
		//Zip: "10003"
		var self = this;
		self.Active = it.Active;
		self.Address1 = it.Address1;
		self.Address2 = it.Address2;
		self.City = it.City;
		self.Code = it.Code;
		self.Company = it.Company;
		self.CustomCode = it.CustomCode;
		self.RequirePO = it.RequirePO;
		self.SBVendId = it.SBVendId;
		self.State = it.State;
		self.VendId = it.VendId;
		self.Zip = it.Zip;

		self.Address = self.Address1 + (self.Address2 != null ? ' ' + self.Address2 : '') + ", " + self.City + " " + self.State + " " + self.Zip;
		self.ActiveSign = self.Active == '1' ? 'x' : '';

		self.showEditVendorDialog = function (d, e) {
			var it = new SBVendorItem();
			it.ActiveField(d.Active == 1);
			it.Address1Field(d.Address1);
			it.Address2Field(d.Address2);
			it.CityField(d.City);
			it.CodeField(d.Code);
			it.CompanyField(d.Company);
			it.CustomCodeField(d.CustomCode);
			it.RequirePOField(d.RequirePO);
			it.SBVendIdField(d.SBVendId);
			it.StateField(d.State);
			it.VendIdField(d.VendId);
			it.ZipField(d.Zip);

			var arr = fnc.vendorsApp.copyLocations(fnc.app.filterAvailableLocations());
			it.allAvailableLocations(arr);

			fnc.vendorsApp.selectedSBVendorItem(it);

			loadSBVendorAssinments(d.SBVendId, d.VendId, d.RequirePO, it.allVendorAssignments, function () {
				for (var i = 0; i < arr.length; i++) {
					var loc = arr[i];
					for (var j = 0; j < it.allVendorAssignments().length; j++) {
						var ass = it.allVendorAssignments()[j];
						if (loc.LocationId == ass.OrganizationId) {
							loc.Selected(true);

							//loc.CustomVendCode(ass.CustomVendCode());
							//loc.CustomVendName(ass.CustomVendName());
							loc.OriginalCustomVendCode(ass.CustomVendCode());
							loc.OriginalCustomVendName(ass.CustomVendName());

							loc.DefaultRecordId(ass.DefaultRecordId);
							loc.GLAccDescription(ass.GLAccDescription);
							loc.GLAccId(ass.GLAccId);
							loc.GLAccNumber(ass.GLAccNumber);
							if (ass.VendTermId() > 0) {
								loc.PayTermId(ass.PayTermId());
								loc.VendTermId(ass.VendTermId());
								loc.PayTermDesciption(getTermDescription(ass.PayTermId()));
							} else {
								loc.PayTermId(0);
								loc.VendTermId(0);
								loc.PayTermDesciption('');
							}
						}
					}
				}

				//if (fnc.vendorsApp.selectedSBVendorItem().allAvailableLocations().length > 0) {
				//	fnc.vendorsApp.selectedSBVendorItem().selectedLocationsFilter(true);
				//}

				it.originalLocationsString(it.selectedLocations().toString());

				$('#modSBVendor').modal({ backdrop: 'static', keyboard: false });
				$('#modSBVendor').modal('show');

				$("#modSBVendor").one("shown.bs.modal", function () {
					fnc.vendorsApp.selectedSBVendorCachedValues(fnc.vendorsApp.selectedSBVendorItem().getCachedValuesJson());
				});

				//prevent closing from keyboard/click/etc. 
				//$("#modSBVendor").on("hide.bs.modal", function () {
				//	e.preventDefault();
				//	e.stopImmediatePropagation();
				//	return false; 
				//});

				// close modal window  
				$("#modSBVendor").one("hidden.bs.modal", function () {
					fnc.vendorsApp.selectedSBVendorItem(null);
					fnc.vendorsApp.selectedSBVendorCachedValues(null);
				});

				// set cursor 'move' for the header
				setTimeout(function () {
					$('#modSBVendor').find('.modal-header').css('cursor', 'move');
				});
			});
		}
	}

	var SBVendorItem = function (it) {
		var self = this;
		self.ActiveField = ko.observable();
		self.Address1Field = ko.observable();
		self.Address2Field = ko.observable();
		self.CityField = ko.observable();
		self.CodeField = ko.observable();
		self.CompanyField = ko.observable();
		self.CustomCodeField = ko.observable();
		self.RequirePOField = ko.observable();
		self.SBVendIdField = ko.observable();
		self.StateField = ko.observable();
		self.VendIdField = ko.observable();
		self.ZipField = ko.observable();

		self.allVendorAssignments = ko.observableArray();
		self.allAvailableLocations = ko.observableArray();
		self.selectedLocations = ko.observableArray();
		self.searchLocationsFilter = ko.observable('');
		self.searchLocationsFilter2 = ko.observable('');
		self.selectedLocationsFilter = ko.observable(true);

		self.filteredLocationsWithCustomCode = ko.computed(function () {
			var r = self.allVendorAssignments();
			var searchLocationsFilter = self.searchLocationsFilter2().toLowerCase();
			searchLocationsFilter = searchLocationsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			if (searchLocationsFilter.length < 3) {
				return r;
			} else {
				return ko.utils.arrayFilter(r, function (item) {
					var words = searchLocationsFilter.split(" ");
					var found = true;
					for (var i = 0; i < words.length; i++) {
						var re = new RegExp("\\b" + words[i], "gi");
						found = found && ((item.OrgName.toLowerCase().match(re) != null));
					}
					return found;
				});
			}
		}, self);

		self.filteredLocations = ko.computed(function () {
			if (self.selectedLocationsFilter()) {
				return ko.utils.arrayFilter(self.allAvailableLocations(), function (item) {
					return item.Selected();
				});
			} else {
				var searchLocationsFilter = self.searchLocationsFilter().toLowerCase();
				searchLocationsFilter = searchLocationsFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
				if (searchLocationsFilter.length < 3) {
					var r = self.allAvailableLocations();
					return r;
				} else {
					return ko.utils.arrayFilter(self.allAvailableLocations(), function (item) {
						var words = searchLocationsFilter.split(" ");
						var found = true;
						for (var i = 0; i < words.length; i++) {
							var re = new RegExp("\\b" + words[i], "gi");
							found = found && ((item.LocationName.toLowerCase().match(re) != null));
						}
						return found;
					});
				}
			}
		}, self);

		self.enableSaveChangesButton = ko.computed(function () {
			var r = false;

			var assigned = false;
			self.filteredLocations().forEach(function (it) {
				if (it.Selected()) {
					assigned = true;
				}
			})

			//if (self.RequirePOField()) {
			//	if (self.CustomCodeField()) {
			//		r = self.CustomCodeField().length > 0;
			//	}
			//} else {
				if (self.CodeField() && self.CompanyField() && self.Address1Field() && self.CityField() && self.StateField() && self.ZipField()) {
					var l1 = self.CodeField().length > 0;
					var l2 = self.CompanyField().length > 0;
					var l3 = self.Address1Field().length > 0;
					var l4 = self.CityField().length > 0;
					var l5 = self.StateField().length > 0;
					var l6 = self.ZipField().length > 0;

					r = l1 & l2 & l3 & l4 & l5 & l6
				}
			//}

			//return self.CodeField.length && self.CompanyField.length && self.Address1Field.length && self.CityField.length && self.StateField.length && self.ZipField.length;
			return r & assigned;
		}, self);

		self.getCachedValuesJson = function () {
			var r = {};
			r.address = '';
			r.locations = [];

			r.address = self.ActiveField() + '||' + self.CodeField() + '||' + self.CompanyField() + '||' + self.Address1Field() + '||' + self.Address2Field() + '||' + self.CityField() + '||' + self.StateField() + '||' + self.ZipField();
			self.filteredLocations().forEach(function (it) {
				if (it.Selected()) {
					r.locations.push(it.LocationId + '||' + it.LocationName + '||' + it.OriginalCustomVendCode() + '||' + it.OriginalCustomVendName() + '||' + it.GLAccDescription() + '||' + it.PayTermDesciption());
				}
			})

			return ko.toJSON(r);
		}

		self.saveChanges = function (d, e) {
			//validation
			var isValid = true;
			for (var i = 0; i < self.filteredLocations().length; i++) {
				var it = self.filteredLocations()[i];
				if (it.Selected() && it.PayTermId() == 0) {
					isValid = false;
					$('#modAddDefaults').modal('show');
					break;
				}
			}
			//submit changes
			if (isValid) {
				self.submitChanges(d, e);
				//console.log(isValid);
			}
		}

		self.addDefaultTermFn = function (d, e) {
			var btnType = e.currentTarget.getAttribute('data-btn-type');
			switch (btnType) {
				case 'type-yes':
					var ln = self.selectedLocations().length;
					$('#modAddDefaults').modal('hide');
					if (ln == 1) {
						var id = self.selectedLocations()[0];
						var org = null;
						for (var i = 0; i < self.allAvailableLocations().length; i++) {
							if (id == self.allAvailableLocations()[i].LocationId) {
								org = self.allAvailableLocations()[i];
								break;
							}
						}
						if (org != null) {
							org.showOrgGLAccounts(org);
						}
					} 
					break;
				case 'type-no':
					$('#modAddDefaults').modal('hide');
					self.submitChanges(d, e);
					break;
				default:
					$('#modAddDefaults').modal('hide');
			}
		}

		self.submitChanges = function (d, e) {

			//call stack
			var callArray = [];
			var pushFn = function () {
				callArray.push(1);
				//console.log('arrSize=' + callArray.length);
			}
			var popFn = function () {
				try {
					callArray.pop();
					//console.log('arrSize=' + callArray.length);
					if (callArray.length == 0) {
						$('#modSBVendor').modal('hide');
						loadSBVendorList(false, function () {
							windowResized();
							return;
						});
					}
				} catch (e) {
					console.log(e);
					return;
				}
			} 

			//custom vendors
			var active = self.ActiveField();
			var addr1 = self.Address1Field();
			var addr2 = self.Address2Field();
			var city = self.CityField();
			var code = self.CodeField();
			var company = self.CompanyField();
			var sbVendId = self.SBVendIdField();
			var state = self.StateField();
			var vendId;
			var zip = self.ZipField();
			var orgIds = self.selectedLocations().toString();	//fnc.app.oid;

			if (sbVendId == '') {
				//create a new vendor
				addSBVendor(active, addr1, addr2, city, code, company, sbVendId, state, vendId, zip, orgIds, function (id) {
					//console.log('SBVendor "' + id + '" added');
					fnc.vendorsApp.selectedSBVendorItem().SBVendIdField(id);
					sbVendId = id;
					self.filteredLocations().forEach(function (it, index) {
						if (it.Selected()) {
							var locId = it.LocationId;
							var glAccId = it.GLAccId();
							//add assigned locations
							pushFn();
							assignSBVendor(sbVendId, locId, function () {
								//console.log('Location "' + it.LocationName + '" assigned');
								popFn();
								if (it.GLAccId() != 0) {
									//add default gl
									pushFn();
									assignDefaultGLAccount(locId, sbVendId, glAccId, function () {
										//console.log('GLAccount "' + it.GLAccDescription() + '" added');
										popFn();
									});
								}
								if (it.PayTermId() != 0) {
									// add default terms
									var payTermId = it.PayTermId();
									var vendTermId = it.VendTermId();
									vendId = 0;
									pushFn();
									updateVendorDeafaultTerm(vendTermId, vendId, sbVendId, locId, payTermId, function (id) {
										//console.log('Term "' + it.PayTermDescription + '" added');
										it.VendTermId(id);
										popFn();
									});
								}
								if (it.CustomVendCode() != '' || it.CustomVendName() != '') {
									// add custom code/name
									var customVendCode = it.CustomVendCode();
									var customVendName = it.CustomVendName();
									pushFn();
									updateSandBoxVendorCode(locId, sbVendId, customVendCode, customVendName, function () {
										//console.log('Custom Code/Name "' + it.CustomVendCode() + "||" + it.CustomVendName() + '" added');
										it.OriginalCustomVendCode(it.CustomVendCode());
										it.OriginalCustomVendName(it.CustomVendName());
										popFn();
									});
								}
							});
						}
					});
				});

			} else {
				//modify vendor
				if (!fnc.app.singleLocation()) {
					//delete unassigned locations
					for (var i = 0; i < self.allVendorAssignments().length; i++) {
						var it = self.allVendorAssignments()[i];
						if (orgIds.indexOf(it.OrganizationId) == -1) {
							pushFn();
							unAssignSBVendor(it.SBVendId, it.OrganizationId, function () {
								//console.log('OrgId "' + it.OrganizationId + '" unassigned');
								popFn();
							})
						}
					}
				}
				//add assigned locations
				self.filteredLocations().forEach(function (it) {
					if (it.Selected()) {
						var locId = it.LocationId;
						var glAccId = it.GLAccId();
						var notFound = true;
						for (var i = 0; i < self.allVendorAssignments().length; i++) {
							var assId = self.allVendorAssignments()[i].OrganizationId;
							if (locId == assId) {
								notFound = false;
							}
						}
						if (notFound) {
							pushFn();
							assignSBVendor(sbVendId, locId, function () {
								//console.log('Location "' + it.LocationName + '" assigned');
								popFn();
								if (it.GLAccId() != 0) {
									//add default gl
									pushFn();
									assignDefaultGLAccount(locId, sbVendId, glAccId, function () {
										//console.log('GLAccount "' + it.GLAccDescription() + '" added');
										popFn();
									});
								}
								if (it.PayTermId() != 0) {
									// add default terms
									var payTermId = it.PayTermId();
									var vendTermId = it.VendTermId();
									vendId = 0;
									pushFn();
									updateVendorDeafaultTerm(vendTermId, vendId, sbVendId, locId, payTermId, function (id) {
										//console.log('Term "' + it.PayTermDescription + '" added');
										it.VendTermId(id);
										popFn();
									});
								}
								if (it.CustomVendCode() != '' || it.CustomVendName() != '') {
									// add custom code/name
									var customVendCode = it.CustomVendCode();
									var customVendName = it.CustomVendName();
									pushFn();
									updateSandBoxVendorCode(locId, sbVendId, customVendCode, customVendName, function () {
										//console.log('Custom Code/Name "' + it.CustomVendCode() + "||" + it.CustomVendName() + '" added');
										it.OriginalCustomVendCode(it.CustomVendCode());
										it.OriginalCustomVendName(it.CustomVendName());
										popFn();
									});
								}
							})
						} else {
							if (true) {
								//add default gl
								pushFn();
								assignDefaultGLAccount(locId, sbVendId, glAccId, function () {
									//console.log('GLAccount "' + it.GLAccDescription() + '" modified');
									popFn();
								});
							}
							if (true) {
								// update default terms
								var payTermId = it.PayTermId();
								var vendTermId = it.VendTermId();
								vendId = 0;
								pushFn();
								updateVendorDeafaultTerm(vendTermId, vendId, sbVendId, locId, payTermId, function (id) {
									//console.log('Term id "' + id + '" updated');
									it.VendTermId(id);
									popFn();
								});
							}
							if (true) {
								// update custom code/name
								var customVendCode = it.OriginalCustomVendCode() || '';
								var customVendName = it.OriginalCustomVendName() || '';
								pushFn();
								updateSandBoxVendorCode(locId, sbVendId, customVendCode, customVendName, function () {
									//console.log('Custom Code/Name "' + it.CustomVendCode() + "||" + it.CustomVendName() + '" updated');
									it.OriginalCustomVendCode(customVendCode);
									it.OriginalCustomVendName(customVendName);
									popFn();
								});
							}
						}
					}
				});

				//modify name/address/acctive status
				pushFn();
				modifySBVendor(active, addr1, addr2, city, code, company, sbVendId, state, vendId, zip, orgIds, function () {
					//console.log('Vendor "' + company + '" modified');
					popFn();
				});


			}
			//setTimeout(function () {
			//	if ($('#modSBVendor').is(':visible')) {
			//		$('#modSBVendor').modal('hide');
			//		loadSBVendorList(false, function () {
			//			windowResized();
			//			return;
			//		})
			//	}
			//}, 5000)
		}
		
		self.originalLocationsString = ko.observable('');

		self.toggleSelectAll = function (d, e) {
			var selectedValue = e.currentTarget.getAttribute('data-cm-action') == 'select-all';
			self.allAvailableLocations().forEach(function (it) { it.Selected(selectedValue); });

			//for (var i = 0; i < self.allAvailableLocations().length; i++) {
			//	self.allAvailableLocations()[i].Selected(selectedValue)
			//}
			//for (var i = 0; i < self.filteredLocations().length; i++) {
			//	self.filteredLocations()[i].Selected(selectedValue)
			//}
			//
		};

		self.resetOriginal = function (d, e) {
			self.selectedLocations.removeAll();
			var arr = fnc.vendorsApp.copyLocations(fnc.app.filterAvailableLocations());
			self.allAvailableLocations(arr);
			
			loadSBVendorAssinments(self.SBVendIdField(), null, '0', self.allVendorAssignments, function () {
				for (var i = 0; i < arr.length; i++) {
					var loc = arr[i];
					for (var j = 0; j < self.allVendorAssignments().length; j++) {
						var ass = self.allVendorAssignments()[j];
						if (loc.LocationId == ass.OrganizationId) {
							loc.Selected(true);
						}
					}
				}

				self.originalLocationsString(self.selectedLocations().toString());
			});
		};

		self.enableSelectAllButton = ko.computed(function () {
			return self.selectedLocations().length < self.allAvailableLocations().length;
		}, self);

		self.enableUnSelectAllButton = ko.computed(function () {
			return self.selectedLocations().length > 0;
		}, self);

		self.enableResetButton = ko.computed(function () {
			return self.originalLocationsString() != self.selectedLocations().toString();
		}, self);

		self.closeEditVendorDialog = function (d, e) {
			//console.log(e.currentTarget.getAttribute('class'));
			if (fnc.vendorsApp.selectedSBVendorItem().getCachedValuesJson() !== fnc.vendorsApp.selectedSBVendorCachedValues()) {
				//console.log('dirty');
				if (fnc.vendorsApp.selectedSBVendorItem().enableSaveChangesButton()) {
					$('#modUnSavedChanges').modal('show');
				} else {
					//$("#modSBVendor").off("hide.bs.modal");
					$("#modSBVendor").modal('hide');
				}
			} else {
				//console.log('clean');
				//$("#modSBVendor").off("hide.bs.modal");
				$("#modSBVendor").modal('hide');
			}
		}

		self.unsavedChangesFn = function (d, e) {
			var btnType = e.currentTarget.getAttribute('data-btn-type');
			switch (btnType) {
				case 'type-yes':
					$('#modUnSavedChanges').modal('hide');
					break;
				case 'type-no':
					$('#modUnSavedChanges').modal('hide');
					$("#modSBVendor").modal('hide');
					break;
				default:
					$('#modUnSavedChanges').modal('hide');
					$("#modSBVendor").modal('hide');
			}
		}
	}

	var SBVendorAssignmentItem = function (it) {
		//CustomVendCode: null
		//CustomVendCompany
		//DefaultRecordId: 10
		//GLAccDescription: null
		//GLAccId: "0"
		//GLAccNumber: null
		//OrgaName: "BRYANT PARK GRILL"
		//OrganizationId: "238"
		//SBVendId: "751"

		var self = this;
		if (it.VendId == undefined) {
			//not require PO vendor
			self.SBVendId = it.SBVendId;
			self.OrganizationId = it.OrganizationId;
			self.OrgaName = it.OrgaName;

			self.PayTermId = ko.observable(it.PayTermId);
			self.VendTermId = ko.observable(it.VendTermId);

			self.CustomVendCode = ko.observable(it.CustomVendCode || '');
			self.CustomVendName = ko.observable(it.CustomVendCompany || '');

			self.DefaultRecordId = it.DefaultRecordId;
			self.GLAccDescription = it.GLAccDescription;
			self.GLAccId = it.GLAccId;
			self.GLAccNumber = it.GLAccNumber;

			
		}	else{
			//require PO vendor
			self.VendId = it.VendId;
			self.OrganizationId = it.OrganizationId;
			self.OrgName = it.OrgName;

			self.PayTermId = ko.observable(it.PayTermId);
			self.VendTermId = ko.observable(it.VendTermId);

			self.PayTermDesciption = ko.computed(function () {
				var r = '';
				var id = Number(self.PayTermId());
				if ( id > 0) {
					r = getTermDescription(id);
				}
				return r;
			}, self);

			self.OriginalCustomVendCode = ko.observable(it.CustomVendCode || '');
			self.CustomVendCode = ko.observable(it.CustomVendCode || '');

			self.OriginalCustomVendName = ko.observable(it.CustomVendCompany || '');
			self.CustomVendName = ko.observable(it.CustomVendCompany || '');

			//self.updateCustomCode = function (d, e) {
			//	if (d.CustomVendCode() != d.OriginalCustomVendCode()) {
			//		var vendId = d.VendId;
			//		var orgId = d.OrganizationId;
			//		var customVendCode = d.CustomVendCode();
			//		var customVendName = d.CustomVendName();
			//		updateManagedVendorCodeOneOrganization(vendId, orgId, customVendCode, customVendName, function () {
			//			windowResized();
			//		})
			//	}
			//};

			//self.updateCustomName = function (d, e) {
			//	if (d.CustomVendName() != d.OriginalCustomVendName()) {
			//		var vendId = d.VendId;
			//		var orgId = d.OrganizationId;
			//		var customVendCode = d.CustomVendCode();
			//		var customVendName = d.CustomVendName();
			//		updateManagedVendorCodeOneOrganization(vendId, orgId, customVendCode, customVendName, function () {
			//			windowResized();
			//		})
			//	}
			//};

			self.openTermsDialog = function (d, e) {
				//console.log(d);
				if (d.VendTermId()) {
					setSelectedTerm(d.PayTermId())
				}

				self.CustomVendCode(self.OriginalCustomVendCode());
				self.CustomVendName(self.OriginalCustomVendName());

				fnc.vendorsApp.selectedOrganization(d);

				$('#modTermsDialog').modal('show');

				// close modal window
				$("#modTermsDialog").one("hidden.bs.modal", function () {
					fnc.vendorsApp.selectedOrganization(null);
					resetAvailableTerms();
				});
			}

			self.updatePayTerm = function (d, e) {
				if (fnc.vendorsApp.selectedPayTerm()) {
					//update Pay Term
					var spt = fnc.vendorsApp.selectedPayTerm();
					var vendTermId = self.VendTermId();
					var payTermId = spt.PayTermId;
					var vendId = self.VendId;
					var sbVendId = 0;
					var orgId = self.OrganizationId;
					updateVendorDeafaultTerm(vendTermId, vendId, sbVendId, orgId, payTermId, function (id) {
						self.PayTermId(spt.PayTermId);
						self.VendTermId(id);
					})
				}

				if (self.CustomVendName() !== self.OriginalCustomVendName() || self.CustomVendCode() !== self.OriginalCustomVendCode()) {
					//update Custom Vendor Name/Code
					var vendId = self.VendId;
					var orgId = self.OrganizationId;
					var customVendCode = self.CustomVendCode() || '';
					var customVendName = self.CustomVendName() || '';
					updateManagedVendorCodeOneOrganization(vendId, orgId, customVendCode, customVendName, function () {
						self.OriginalCustomVendCode(self.CustomVendCode());
						self.OriginalCustomVendName(self.CustomVendName());
					})
				}

				$('#modTermsDialog').modal('hide');
				
			}
		}
	}

	var LocationItem = function (it) {
		//GLAccDescription: null
		//GLAccId: "0"
		//GLAccNumber: null
		var self = this;
		self.LocationId = it.locationId;
		self.LocationName = it.locationName;
		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				fnc.vendorsApp.selectedSBVendorItem().selectedLocations.push(self.LocationId);
			} else {
				fnc.vendorsApp.selectedSBVendorItem().selectedLocations.remove(self.LocationId);
			}			
		}, self)

		self.CustomVendCode = ko.observable('');
		self.CustomVendName = ko.observable('');
		self.OriginalCustomVendCode = ko.observable('');
		self.OriginalCustomVendName = ko.observable('');

		self.DefaultRecordId = ko.observable(0);
		self.GLAccDescription = ko.observable('');
		self.GLAccId = ko.observable(0);
		self.GLAccNumber = ko.observable('');

		self.PayTermItem = ko.observable(null);
		self.PayTermDesciption = ko.observable('');
		self.PayTermId = ko.observable(0);

		self.VendTermId = ko.observable(0);

		self.showOrgGLAccounts = function (d, e) {
			if (d.VendTermId()) {
				setSelectedTerm(d.PayTermId())
			}

			self.CustomVendCode(self.OriginalCustomVendCode());
			self.CustomVendName(self.OriginalCustomVendName());

			fnc.vendorsApp.selectedOrganization(d);
			var orgId = self.LocationId;
			getGLAcctListByOrgId(orgId, function () {

				//select default
				var arr = fnc.vendorsApp.orgGLAccountsList();
				//if (arr.length == 0) {
				//	$('#modNoGLAccounts').modal('show');
				//	return false;
				//}
				for (var i = 0; i < arr.length; i++) {
					var it = arr[i];
					if (it.GLAccId == d.GLAccId()) {
						it.Selected(true);
					}
				}
				//
				
				$("#modOrgGLAccounts").one("shown.bs.modal", function (e) {
					var elementId = '#GLAccId_' + d.GLAccId();
					if ($(elementId).length > 0) {
						var h = 200;	//$('#orgGLAccList').height();
						var t = $(elementId).offset().top;
						$('#orgGLAccList').scrollTop(t - h);
					}
				})

				$('#modOrgGLAccounts').modal('show');

				// set cursor 'move' for the header
				setTimeout(function () {


					$('#modOrgGLAccounts').find('.modal-header').css('cursor', 'move');
				});

			})
			

			$("#modOrgGLAccounts").one("hidden.bs.modal", function () {
				fnc.vendorsApp.selectedGLAccount(null);
				fnc.vendorsApp.selectedOrganization(null);
				fnc.vendorsApp.orgGLAccountsList.removeAll();
				fnc.vendorsApp.glAccountFilter('');
				resetAvailableTerms();
			});
		}

		self.updateDefaultGLAccount = function (d, e) {
			var orgId = self.LocationId;
			var sbVendId = fnc.vendorsApp.selectedSBVendorItem().SBVendIdField()
			var vendId = fnc.vendorsApp.selectedSBVendorItem().VendIdField();

			if (fnc.vendorsApp.selectedGLAccount()) {
				//update GL Account
				//if (sbVendId != 0) {
				//	var glAccId = fnc.vendorsApp.selectedGLAccount().GLAccId;
				//	assignDefaultGLAccount(orgId, sbVendId, glAccId, function () {
				//		self.GLAccId(fnc.vendorsApp.selectedGLAccount().GLAccId);
				//		self.GLAccDescription(fnc.vendorsApp.selectedGLAccount().GLAccDescription);
				//		self.GLAccNumber(fnc.vendorsApp.selectedGLAccount().GLAccNumber);
				//	})
				//} else {
				//	self.GLAccId(fnc.vendorsApp.selectedGLAccount().GLAccId);
				//	self.GLAccDescription(fnc.vendorsApp.selectedGLAccount().GLAccDescription);
				//	self.GLAccNumber(fnc.vendorsApp.selectedGLAccount().GLAccNumber);
				//}
				self.GLAccId(fnc.vendorsApp.selectedGLAccount().GLAccId);
				self.GLAccDescription(fnc.vendorsApp.selectedGLAccount().GLAccDescription);
				self.GLAccNumber(fnc.vendorsApp.selectedGLAccount().GLAccNumber);
			} else {
				self.GLAccId(0);
				self.GLAccDescription('');
				self.GLAccNumber('');
			}

			if (fnc.vendorsApp.selectedPayTerm()) {
				//update Pay Term
				//if (sbVendId != 0) {
				//	var vendTermId = self.VendTermId();
				//	var payTermId = fnc.vendorsApp.selectedPayTerm().PayTermId;
				//	updateVendorDeafaultTerm(vendTermId, vendId, sbVendId, orgId, payTermId, function (id) {
				//		self.PayTermDesciption(fnc.vendorsApp.selectedPayTerm().Description);
				//		self.PayTermId(fnc.vendorsApp.selectedPayTerm().PayTermId);
				//		self.PayTermItem(fnc.vendorsApp.selectedPayTerm());
				//		self.VendTermId(id);
				//	})
				//} else {
				//	self.PayTermDesciption(fnc.vendorsApp.selectedPayTerm().Description);
				//	self.PayTermId(fnc.vendorsApp.selectedPayTerm().PayTermId);
				//	self.PayTermItem(fnc.vendorsApp.selectedPayTerm());
				//}
				self.PayTermDesciption(fnc.vendorsApp.selectedPayTerm().Description);
				self.PayTermId(fnc.vendorsApp.selectedPayTerm().PayTermId);
				self.PayTermItem(fnc.vendorsApp.selectedPayTerm());
			} else {
				self.PayTermDesciption('');
				self.PayTermId(0);
				self.PayTermItem(null);
			}

			if ((self.OriginalCustomVendCode() !== self.CustomVendCode()) || (self.OriginalCustomVendName() !== self.CustomVendName())) {
				//update Custom Vendor Code/Name
				//if (sbVendId != 0) {
				//	var customVendCode = self.CustomVendCode();
				//	var customVendName = self.CustomVendName();
				//	updateSandBoxVendorCode(orgId, sbVendId, customVendCode, customVendName, function () {
				//		self.OriginalCustomVendCode(self.CustomVendCode());
				//		self.OriginalCustomVendName(self.CustomVendName());
				//	});
				//} else {
				//	self.OriginalCustomVendCode(self.CustomVendCode());
				//	self.OriginalCustomVendName(self.CustomVendName());
				//}
				self.OriginalCustomVendCode(self.CustomVendCode());
				self.OriginalCustomVendName(self.CustomVendName());
			}
			
			$('#modOrgGLAccounts').modal('hide');

		}
	};

	var GLAccountItem = function (it) {
		//CategoryClassId: "1"
		//CustomGLAccDescription: null
		//CustomGLAccId: null
		//CustomGLAccNumber: null
		//GLAccDescription: "MEAT"
		//GLAccNumber: "."
		//chartid: "33"
		//glaccid: "579"
		var self = this;
		self.CategoryClassId = it.CategoryClassId;
		self.CustomGLAccDescription = it.CustomGLAccDescription;
		self.CustomGLAccId = it.CustomGLAccId;
		self.CustomGLAccNumber = it.CustomGLAccNumber;
		self.GLAccDescription = it.GLAccDescription;
		self.GLAccNumber = it.GLAccNumber;
		self.GLAccId = it.glaccid;
		self.ChartId = it.chartid;

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {			
				for (var i = 0; i < fnc.vendorsApp.orgGLAccountsList().length; i++) {
					if (fnc.vendorsApp.orgGLAccountsList()[i] != self) {
						fnc.vendorsApp.orgGLAccountsList()[i].Selected(false);
					}
				}
				fnc.vendorsApp.selectedGLAccount(self);
			} else {
				fnc.vendorsApp.selectedGLAccount(null);
			}
		});
	}

	var PayTermItem = function (it) {
		//Description; "COD"
		//Formula; "COD"
		//PayTermId; "1"
		var self = this;
		self.Description = it.Description;
		self.Formula = it.Formula;
		self.PayTermId = it.PayTermId;
		

		self.Selected = ko.observable(false);
		self.Selected.subscribe(function () {
			if (self.Selected()) {
				for (var i = 0; i < fnc.vendorsApp.AllAvailableTerms().length; i++) {
					if (fnc.vendorsApp.AllAvailableTerms()[i] != self) {
						fnc.vendorsApp.AllAvailableTerms()[i].Selected(false);
					}
				}
				fnc.vendorsApp.selectedPayTerm(self);
			} else {
				fnc.vendorsApp.selectedPayTerm(null);
			}
		});
	}
	//functions

	var assignDefaultGLAccount = function (orgId, sbVendId, glAccId, callback) {
		var params = {};
		params.OrgIds = orgId;
		params.sbVendId = sbVendId;
		params.GLAccId = glAccId;

		//AssignDefaultGLAccount(o.Params.OrgIds, o.Params.sbVendId, o.Params.GLAccId, o.uc)
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.AssignDefaultGLAccount", params, function (response) {
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

	var unAssignDefaultGLAccount = function (recordId, callback) {
		var params = {};
		params.RecordId = recordId;

		// UnAssignDefaultGLAccount(o.Params.RecordId, o.uc)
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.UnAssignDefaultGLAccount", params, function (response) {
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

	var getGLAcctListByOrgId = function (orgId, callback) {

		var params = {};
		params.OrgId = orgId;

		//loading(true);
		//Function LoadGLAccountList(chartId As Integer) As String
		ajaxPost("ChefMod.Financials.UI.Controllers.GLAccounts.LoadGLAccountList", params, function (response) {
			loading(false);
			if (response.d == '') {
				fnc.vendorsApp.orgGLAccountsList.removeAll();
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

			fnc.vendorsApp.orgGLAccountsList(arr);

			if (callback) callback();
		});
	};

	var addSBVendor = function (active, addr1, addr2, city, code, company, sbVendId, state, vendId, zip, orgIds, callback) {
		//Private ActiveField As Boolean
		//Private Address1Field As String
		//Private Address2Field As String
		//Private CityField As String
		//Private CodeField As String
		//Private CompanyField As String
		//Private SBVendIdField As Long
		//Private StateField As String
		//Private VendIdField As Integer
		//Private ZipField As String
		var sbVend = {};
		sbVend.ActiveField = active;
		sbVend.Address1Field = addr1;
		sbVend.Address2Field = addr2;
		sbVend.CityField = city;
		sbVend.CodeField = code;
		sbVend.CompanyField = company;
		sbVend.SBVendIdField = sbVendId;
		sbVend.StateField = state;
		sbVend.VendIdField = vendId;
		sbVend.ZipField = zip;

		var params = {};
		params.sbVendor = sbVend;
		params.OrgIds = orgIds;

		var rId;

		//AddSBVendor(o.Params.sbVendor, o.Params.OrgIds, o.uc)
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.AddSBVendor", params, function (response) {
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

			rId = Number(r);

			if (callback) callback(rId);
		});

	};

	var assignSBVendor = function (vendId, orgId, callback) {
		var params = {};
		params.sbVendId = vendId;
		params.OrgId = orgId;

		//AssignSBVendor(o.Params.sbVendId, o.Params.OrgId, o.uc)
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.AssignSBVendor", params, function (response) {
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

	var unAssignSBVendor = function (vendId, orgId, callback) {
		var params = {};
		params.sbVendId = vendId;
		params.OrgId = orgId;

		//UnAssignSBVendor(o.Params.sbVendId, o.Params.OrgId, o.uc)
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.UnAssignSBVendor", params, function (response) {
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

	var loadSBVendorList = function (activeOnly, callback) {
		var params = {};
		params.ActiveOnly = activeOnly;

		//LoadSBVendorList(o.uc, o.Params.ActiveOnly)

		loading(true);
		self.allItems.removeAll();
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.LoadSBVendorList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new SBVendorListItem(it)) })
			} else {
				arr.push(new SBVendorListItem(obj))
			}
			self.allItems(arr);
			if (callback) callback();
		})
	}

	var modifySBVendor = function (active, addr1, addr2, city, code, company, sbVendId, state, vendId, zip, orgIds, callback) {
		var sbVend = {};
		sbVend.ActiveField = active;
		sbVend.Address1Field = addr1;
		sbVend.Address2Field = addr2;
		sbVend.CityField = city;
		sbVend.CodeField = code;
		sbVend.CompanyField = company;
		sbVend.SBVendIdField = sbVendId;
		sbVend.StateField = state;
		sbVend.VendIdField = vendId;
		sbVend.ZipField = zip;

		var params = {};
		params.sbVendor = sbVend;

		//ModifySBVendor(v, o.uc)
		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.ModifySBVendor", params, function (response) {
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
			
		})
	}

	var loadSBVendorAssinments = function (sbVendId, vendId, requirePO, allItems, callback) {
		var params = {};
		var methodName = '';

		if (requirePO == '0') {
			params.sbVendId = sbVendId;
			methodName = 'ChefMod.Financials.UI.Controllers.Vendors.LoadSBVendorAssinments';
		} else {
			params.VendId = vendId;
			methodName = 'ChefMod.Financials.UI.Controllers.Vendors.LoadManagedVendorAssignments';
		}
		

		//Public Function LoadSBVendorAssinments(sbVendId As Long) As String

		//loading(true);
		allItems.removeAll();
		ajaxPost(methodName, params, function (response) {
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
				obj.forEach(function (it) { arr.push(new SBVendorAssignmentItem(it)) })
			} else {
				arr.push(new SBVendorAssignmentItem(obj))
			}
			allItems(arr);
			if (callback) callback();
		})
	}

	var updateManagedVendorCode = function (vendId, customVendCode, callback) {
		//Public Sub UpdateManagedVendorCode(Vendid As Integer, CustomVendCode As String, ImpersonatedUserCode As Integer, UserCode As Integer)
		var params = {};
		params.VendId = vendId;
		params.CustomVendCode = customVendCode;

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.Vendors.UpdateManagedVendorCode", params, function (response) {
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

	var updateManagedVendorCodeOneOrganization = function (vendId, orgId, customVendCode, customVendName, callback) {
		//UpdateManagedVendorCodeOneOrganization(o.Params.VendId, o.Params.OrgId, o.Params.CustomVendCode, o.uc)
		var params = {};
		params.VendId = vendId;
		params.OrgId = orgId;
		params.CustomVendCode = customVendCode || '';
		params.CustomVendCompany = customVendName || '';

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

	var updateSandBoxVendorCode = function (orgId, sbVendId, customVendCode, customVendCompany, callback) {
		//UpdateSandBoxVendorCode(o.Params.sbVendId, o.Params.OrgId, o.Params.CustomVendCode, o.uc)
		var params = {};
		params.OrgId = orgId;
		params.sbVendId = sbVendId;
		params.CustomVendCode = customVendCode || '';
		params.CustomVendCompany = customVendCompany || '';

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


	var loadPayTermList = function (callback) {
		//VendorPayTerms = client.LoadPayTremList()
		var params = {};

		loading(true);

		ajaxPost("ChefMod.Financials.UI.Controllers.VendorPayTerms.LoadPayTermList", params, function (response) {
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
				obj.forEach(function (it) { arr.push(new PayTermItem(it)) })
			} else {
				arr.push(new PayTermItem(obj))
			}

			if (callback) callback(arr);
		})
	
	}

	var updateVendorDeafaultTerm = function (vendTermId, vendId, sbVendId, orgId, payTermId, callback) {
		var params = {};
		params.VendTermId = vendTermId;
		params.VendId = vendId;
		params.SBVendId = sbVendId;
		params.OrganizationId = orgId;
		params.PayTermId = payTermId;

		//client.UpdateVendorDeafaultTerm(o.Params.VendTermId, o.Params.VendId, o.Params.SBVendId, o.Params.OrganizationId, o.Params.PayTermId, o.uc)

		//loading(true);
		ajaxPost("ChefMod.Financials.UI.Controllers.VendorPayTerms.UpdateVendorDeafaultTerm", params, function (response) {
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
			rId = Number(r);
			if (callback) callback(rId);
		});
	}

	var getTermDescription = function (id) {
		var r = '';
		if (id) {
			fnc.vendorsApp.AllAvailableTerms().forEach(function (it) {
				if (id == it.PayTermId) {
					r = it.Description;
				}
			})
		}
		return r;
	}

	var setSelectedTerm = function (id) {
		if (id) {
			fnc.vendorsApp.AllAvailableTerms().forEach(function (it) {
				if (id == it.PayTermId) {
					it.Selected(true);
				}
			})
		}
	}

	var resetAvailableTerms = function () {
		fnc.vendorsApp.AllAvailableTerms().forEach(function (it) {
			it.Selected(false);
		})
	}

	//*********************
	//public
	//*********************
	var self = this;

	self.filterActiveOnly = ko.observable(false);

	self.filterPoRequiredVednors = ko.observable(true);
	self.filterNoPoRequiredVednors = ko.observable(true);
	self.filterActiveVednors = ko.observable(true);
	self.filterInactiveVednors = ko.observable(false);

	self.listSearchFilter = ko.observable('');
	self.allItems = ko.observableArray();
	self.selectedSBVendorItem = ko.observable(null);
	self.selectedSBVendorCachedValues = ko.observable(null);

	self.filteredItems = ko.computed(function () {
		var r = self.allItems();
		if (!self.filterPoRequiredVednors()) {
			r = ko.utils.arrayFilter(self.allItems(), function (item) {
				return item.RequirePO == '0';
			})
		}
		if (!self.filterNoPoRequiredVednors()) {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.RequirePO == '1';
			})
		}
		if (!self.filterActiveVednors()) {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.Active == '0';
			})
		}
		if (!self.filterInactiveVednors()) {
			r = ko.utils.arrayFilter(r, function (item) {
				return item.Active == '1';
			})
		}
		if (self.listSearchFilter().length > 2) {
			var listSearchFilter = self.listSearchFilter().toLowerCase();
			listSearchFilter = listSearchFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(r, function (item) {
				var words = listSearchFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.Company.toLowerCase().match(re) != null) || (item.Address.toLowerCase().match(re) != null) || (item.Code.toLowerCase().match(re) != null));
				}
				return found;
			})
		}
		return r;

	}, self);
	self.filteredItems.subscribe(function () {
		self.pageNumber(0);
	}, self);


	self.orgGLAccountsList = ko.observableArray();
	self.glAccountFilter = ko.observable('');
	self.filteredGLAccounts = ko.computed(function () {
		var r = self.orgGLAccountsList();
		if (self.glAccountFilter().length > 2) {
			var glAccountFilter = self.glAccountFilter().toLowerCase();
			glAccountFilter = glAccountFilter.replace(/[\n\r\t\*\+\(\)]/g, "");
			r = ko.utils.arrayFilter(r, function (item) {
				var words = glAccountFilter.split(" ");
				var found = true;
				for (var i = 0; i < words.length; i++) {
					var re = new RegExp("\\b" + words[i], "gi");
					found = found && ((item.GLAccDescription.toLowerCase().match(re) != null) || (item.GLAccNumber.toLowerCase().match(re) != null));
				}
				return found;
			})
		}
		return r;
	}, self)

	self.selectedOrganization = ko.observable(null);
	self.selectedGLAccount = ko.observable(null);

	self.AllAvailableTerms = ko.observableArray();
	self.selectedPayTerm = ko.observable(null);

	//'ok'; 'cancel';
	self.addDefaultTermGLAcctMsg = ko.observable('');

	//function
	self.init = function (callback) {
		var activeOnly = self.filterActiveOnly();
		loadSBVendorList(activeOnly, function () {
			loadPayTermList(function (r) {
				self.AllAvailableTerms(r);
				windowResized();
				if (callback) callback();
			})
		})
	};

	self.showAddVendorDialog = function (d, e) {
		var it = new SBVendorItem();
		it.ActiveField(true);
		it.Address1Field('');
		it.Address2Field('');
		it.CityField('');
		it.CodeField('');
		it.CompanyField('');
		it.RequirePOField('0');
		it.SBVendIdField(0);
		it.StateField('');
		it.VendIdField(0);
		it.ZipField('');

		var arr = self.copyLocations(fnc.app.filterAvailableLocations());
		it.allAvailableLocations(arr);
		it.allVendorAssignments([]);
		it.selectedLocationsFilter(false);

		self.selectedSBVendorItem(it);

		if (fnc.app.singleLocation()) {
			it.allAvailableLocations()[0].Selected(true);
		}

		$('#modSBVendor').modal({ backdrop: 'static', keyboard: false });
		$('#modSBVendor').modal('show');

		// close modal window
		$("#modSBVendor").one("hidden.bs.modal", function () {
			self.selectedSBVendorItem(null);
		});

		// set cursor 'move' for the header
		setTimeout(function () {
			$('#modSBVendor').find('.modal-header').css('cursor', 'move');
		});

	}


	self.copyLocations = function (locations) {
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
	}

	//pagination
	self.pageNumber = ko.observable(0);
	self.nbPerPage = ko.observable(pageSize);

	self.totalPagesHolder = ko.observableArray();
	self.totalPages = ko.computed(function () {
		var div = Math.floor(self.filteredItems().length / self.nbPerPage());
		div += self.filteredItems().length % self.nbPerPage() > 0 ? 1 : 0;

		var pages = div - 1;
		self.totalPagesHolder.removeAll();
		for (var i = 0; i < pages + 1; i++) {
			self.totalPagesHolder.push(i + 1);
		}

		return div - 1;
	});
	self.pageController = function (targetPage) {
		return self.pageNumber(targetPage - 1);
	}
	self.paginated = ko.computed(function () {
		var first = self.pageNumber() * self.nbPerPage();
		return self.filteredItems().slice(first, first + self.nbPerPage());
	});
	self.hasPrevious = ko.computed(function () {
		return self.pageNumber() !== 0;
	});
	self.hasNext = ko.computed(function () {
		return self.pageNumber() !== self.totalPages();
	});
	self.next = function () {
		if (self.pageNumber() < self.totalPages()) {
			self.pageNumber(self.pageNumber() + 1);
		}
	}
	self.previous = function () {
		if (self.pageNumber() != 0) {
			self.pageNumber(self.pageNumber() - 1);
		}
	}

	self.originalPageNumber = ko.observable(0);

}