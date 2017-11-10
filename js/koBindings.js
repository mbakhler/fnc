//allows skipping of bindings on specific sections in order to bind multiple views in the same html
ko.bindingHandlers.stopBindings = {
	init: function () {
		return { controlsDescendantBindings: true };
	}
};

//crossDoc
ko.bindingHandlers.slideVisible = {
	init: function (element, valueAccessor) {
		var value = valueAccessor();
		$(element).toggle(ko.unwrap(value));
	},
	update: function (element, valueAccessor) {
		var value = valueAccessor();
		if ($(element).hasClass('highlighted')) {
			ko.unwrap(value) ? $(element).parent().css('background', 'rgba(0,0,0,0.5)') : $(element).parent().css('background', 'rgba(0,0,0,0,0)');
		}
		if ($(element).hasClass('slide-left')) {
			ko.unwrap(value) ? $(element).show("slide", { direction: "right" }, 600) : $(element).hide("slide", { direction: "right" }, 600);
		}
		else {
			ko.unwrap(value) ? $(element).show("slide", { direction: "left" }, 600) : $(element).hide("slide", { direction: "left" }, 600);
		}
	}
};

//invoices and sales
ko.observable.fn.withPausing = function () {
	this.notifySubscribers = function () {
		if (!this.pauseNotifications) {
			ko.subscribable.fn.notifySubscribers.apply(this, arguments);
		}
	};

	this.sneakyUpdate = function (newValue) {
		this.pauseNotifications = true;
		this(newValue);
		this.pauseNotifications = false;
	};

	return this;
};

