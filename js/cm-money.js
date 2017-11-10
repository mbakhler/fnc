(function () {
	var toTwoDecimals = function (Number) {
		var str = Number.toString();
		var arr = str.split('.');
		var wholeNumber = arr[0];
		var decimalNumber = '00';
		if(arr.length > 1){
			decimalNumber = arr[1].substr(0, 2);
		}
		return wholeNumber + '.' + decimalNumber;
	};

	var format = function (value) {
		var toks = toTwoDecimals(value).replace('-', '').split('.');

		var display = '$' + $.map(toks[0].split('').reverse(), function (elm, i) {
			return [(i % 3 === 0 && i > 0 ? ',' : ''), elm];
		}).reverse().join('') + '.' + toks[1];

		return value < 0 ? '-' + display : display;
	};

	ko.subscribable.fn.money = function () {
		var target = this;

		var writeTarget = function (value) {
			var str = value.toString();
			var arr = str.split('.');
			var wholeNumber = arr[0];
			var decimalNumber = '00';
			if (arr.length > 1) {
				decimalNumber = arr[1].substr(0, 2);
			}
			var trimmed = wholeNumber + '.' + decimalNumber;
			var stripped = trimmed.replace(/[^0-9.-]/g, '');

			target(parseFloat(stripped));
		};

		var result = ko.computed({
			read: function () {
				return target();
			},
			write: writeTarget
		});

		result.formatted = ko.computed({
			read: function () {
				return format(target());
			},
			write: writeTarget
		});

		result.isNegative = ko.computed(function () {
			return target() < 0;
		});

		return result;
	};
})();

