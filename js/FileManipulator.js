/*
Requirements:
	knockout.js
	pdf.js
*/
var Previewer = function (previewerId, options) {
	var previewerScope = this;
	//remembers the files it has been given and maps them to an id in order to save computation
	var previewFiles = {};
	//current file being previewed
	this.currentFile = ko.observable();
	this.previewHeight = options && options.previewHeight ? ko.observable(options.previewHeight) : ko.observable(window.innerHeight - 300);
	var previewWidth = options && options.previewWidth ? options.previewWidth : window.innerWidth - 125;
	this.previewWidth = ko.observable(previewWidth);
	var minimumImageWidth = options && options.minimumImageWidth ? options.minimumImageWidth : 200;
	this.minimumImageWidth = minimumImageWidth;
	/*object definitions*/

	//if it's a file with multiple pages (like pdf) it will be broken down into multiple preview images
	var PreviewImage = function (url, rotation, width, height) {
		this.url = ko.observable(url);
		this.sideLength = width > height ? ko.observable(width + 10) : ko.observable(height + 10);
		this.width = width ? ko.observable(width) : ko.observable("auto");
		this.height = height ? ko.observable(height) : ko.observable("auto");
		this.rotation = rotation ? ko.observable(rotation) : ko.observable(0);
		this.rotationCSS = ko.computed(function () {
			return "rotate(" + this.rotation() + "deg)";
		}, this);
	};

	//rotates preview image
	PreviewImage.prototype.rotate = function (degree) {
		this.rotation(this.rotation() + degree);
	};
	//file object for previewing
	var PreviewFile = function (name, contentType, blob, arrayBuffer) {
		this.file = blob;
		this.name = name;
		this.arrayBuffer = arrayBuffer ? arrayBuffer : null;
		this.currentWidth = ko.observable(previewWidth);
		this.contentType = contentType;
		this.previewImages = ko.observable([]);
		this.setPreviewImages = function (urls, maintainRotations, sizes) {
			var arr = [];
			for (var i = 0; i < urls.length; i++) {
				if (sizes) {
					var previewImage = maintainRotations ? new PreviewImage(urls[i], this.previewImages()[i].rotation(), sizes[i].width, sizes[i].height) : new PreviewImage(urls[i], 0, sizes[i].width, sizes[i].height);
				}
				else {
					var previewImage = maintainRotations ? new PreviewImage(urls[i], this.previewImages()[i].rotation()) : new PreviewImage(urls[i]);
				}
				arr.push(previewImage);
			}
			this.previewImages(arr);
		};
	};

	//zoom preview
	PreviewFile.prototype.zoom = function (difference) {
		if (difference === "max") {
			previewWidth = zoomedWidth = $('#previewViewport').width() - 25;
			previewerScope.previewWidth(previewWidth);
		}
		else {
			var zoomedWidth = this.currentWidth() + difference;
			if (zoomedWidth < minimumImageWidth) zoomedWidth = minimumImageWidth;
		}
		this.currentWidth(zoomedWidth);
		loading(true);
		var self = this;
		pdf2imageDataURLs(this.arrayBuffer, {
			callback: function (urls, numPages, sizes) {
				loading(false);
				self.setPreviewImages(urls, true, sizes);
			},
			limitingLength: this.currentWidth()
		});
	}

	//download file
	PreviewFile.prototype.download = function () {
		saveAs(this.file, this.name + "." + this.contentType);
	}

	PreviewFile.prototype.saveChanges = function (callback) {
		//TO DO: check the contentType
		if (this.contentType.toLowerCase() === 'pdf') {
			//convert pdf2url without limiting length
			var self = this;
			loading(true);
			pdf2imageDataURLs(this.arrayBuffer, {
				callback: function (dataURLs, numPages, sizes) {
					//create new pdf
					var pdf = new jsPDF('p', 'pt', 'a4');
					//draw each image back onto a new page
					var drawnCount = 0;
					for (var i = 0; i < numPages; i++) {
						var img = new Image();//need to turn into an image element to allow for rotation due to library
						img.index = i;
						img.onload = function () {
							var width = sizes[this.index].width;
							var height = sizes[this.index].height;
							var originalOrientation = width > height ? "landscape" : "portrait";
							var rotation = self.previewImages()[this.index].rotation()
							var newOrientation = rotation % 180 === 0 ? originalOrientation : originalOrientation === "landscape" ? "portrait" : "landscape";
							var newWidth = originalOrientation === newOrientation ? width : height;
							var newHeight = originalOrientation === newOrientation ? height : width;
							pdf.addPage([newWidth, newHeight], newOrientation);
							pdf.addImage({ imageData: this, rotation: rotation, x: 0, y: 0, w: newWidth, h: newHeight, format: "JPG" });
							drawnCount++;
							if (drawnCount === numPages) {
								pdf.deletePage(1);//remove first page that is created automatically at the wrong size
								if (callback && typeof callback === "function") callback(pdf.output('blob'));
								pdf.save();
								loading(false);
							}
						}
						img.src = dataURLs[i];
					}
				},
			//	renderAll: true,
				limitingLength: 1920
			});//assume that maximum screen width is going to be 1920. If images are too blurry after saving changes, this is the culprit.
		}
	}

	//Public functions that handle private variables
	this.addFile = function (name, id, blob, contentType, callback) {
		blob2dataURLs(blob, contentType, function (dataURLs, arrayBuffer, numPages, sizes) {
			var previewFile = previewFiles[id] = new PreviewFile(name, contentType, blob, arrayBuffer);
			previewFile.setPreviewImages(dataURLs, false, sizes);
			if (callback) callback();
		});

	}
	/*Public functions that handle private variables*/
	this.clear = function () {
		previewFiles = {};
	}

	this.setCurrentFile = function (id, name) {
		var file = previewFiles[id];
		if (name && file.name !== name) {
			file.name = name;
		}
		this.currentFile(previewFiles[id]);
	}

	this.hasFile = function (id,file) {
		if (id !== null && id !== '' && previewFiles[id] && previewFiles[id].file === file) return true;
		return false;
	}
	
	this.showPreview = function (callback) {
		var newHeight = $('#appContent')[0] ? $('#appContent').height() - 110: window.innerHeight - 180;
		this.previewHeight(newHeight);
		if (this.currentFile.contentType === 'pdf') {
			if (this.currentFile.currentWidth() === previewWidth) {
				$('#' + previewerId).modal('show');
				$('[data-toggle="tooltip"]').tooltip();
				if (callback) callback();
			}
			//if not then reprocess the arrayBuffer and show it
			else {
				pdf2imageDataURLs(this.currentFile.arrayBuffer, {
					callback: function (urls, numPages, sizes) {
						$('#' + previewerId).modal('show');
						$('[data-toggle="tooltip"]').tooltip();
						if (callback) callback();
					},
					limitingLength: previewWidth
				});
			}
		}
		else {
			$('#' + previewerId).modal('show');
			$('[data-toggle="tooltip"]').tooltip();
			if (callback) callback();
		}
	}
	function blob2dataURLs(blob, contentType, callback) {
		if (contentType.toLowerCase() === "pdf") {
			blob2ArrayBuffer(blob, contentType, function (arrayBuffer) {
				pdf2imageDataURLs(arrayBuffer, {
					callback: function (dataURLs, numPages, sizes) {
						if (callback) callback(dataURLs, arrayBuffer, numPages, sizes);
					},
					limitingLength: previewWidth
				});
			})
		}
		else if (contentType.toLowerCase() === 'png' || contentType.toLowerCase() === 'jpg' || contentType.toLowerCase() === 'jpeg') {
			var url = URL.createObjectURL(blob);
			if (callback) callback([url]);
		}
	}

}
//public functions
Previewer.prototype.preview = function (name, fileId, blob, contentType, callback) {
	if (contentType.toLowerCase() === 'png' || contentType.toLowerCase() === 'jpg' || contentType.toLowerCase() === 'jpeg' || contentType.toLowerCase() === 'pdf') {
		if (this.hasFile(fileId,blob)) {
			this.setCurrentFile(fileId, name);
			this.showPreview(callback);
		}
		else {
			self = this;
			this.addFile(name, fileId, blob, contentType, function () {
				self.setCurrentFile(fileId, name);
				self.showPreview(callback);
			});
		}
	}
	else {
		this.currentFile({ contentType: contentType })
		this.showPreview(callback);
	}
}


function pdf2imageDataURLs(arrayBuffer, options){//, callback, renderFirst, limitingLength) {
	var numPagesRendered = 0;
	var dataURLs = [];
	var typedArray = new Uint8Array(arrayBuffer);
	var sizes = [];
	PDFJS.getDocument(typedArray).then(function (pdf) {
		var numPages = options && options.renderFirst ? 1 : pdf.numPages;
		for (var i = 1; i <= numPages; i++) {
			pdf.getPage(i).then(function (page) {
				var largestSide = page.getViewport(1).width > page.getViewport(1).height ? page.getViewport(1).width : page.getViewport(1).height;
				var scale = options && options.limitingLength ? options.limitingLength / largestSide : 1;
				var viewport = page.getViewport(scale);
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				canvas.height = viewport.height;
				canvas.width = viewport.width;
				var renderContext = {
					canvasContext: ctx,
					viewport: viewport
				};
				page.render(renderContext).then(function () {
					ctx.globalCompositeOperation = "destination-over";
					ctx.fillStyle = "#fff";
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					var url = canvas.toDataURL("image/jpeg");
					numPagesRendered++;
					dataURLs[page.pageIndex] = url;
					sizes[page.pageIndex] = { width: canvas.width, height: canvas.height };
					if (options && options.callback && numPagesRendered == numPages) {
						options.callback(dataURLs, pdf.numPages, sizes);
					}
				});
			});
		}
	}).catch(function (err) {
		if (options && options.callbackError) options.callbackError(err);
	});
};
function pdf2ImageElements(file,options){
	blob2ArrayBuffer(file, document.ContentType, function (arrayBuffer) {
		pdf2imageDataURLs(arrayBuffer, {
			callback: function (dataURLs, numPages, sizes) {
				var imageElements = [];
				var counter = 0;
				for (var i = 0; i < dataURLs.length; i++) {
					var image = new Image();
					imageElements.push(image);
					image.onload = function () {
						counter++;
						if (counter === dataURLs.length) {
							if (options && options.callback) options.callback(imageElements);
						}
					}
					image.src = dataURLs[i];
				}
			},
			callbackError: options.callbackError,
			renderFirst: options && options.renderFirst ? options.renderFirst : false,
			limitingLength: options && options.limitingLength ? options.limitingLength : false
		})
	})
}
function blob2ArrayBuffer(blob, contentType, callback) {
	var reader = new FileReader();
	reader.onloadend = function (e) {
		var arrayBuffer = reader.result;
		if (callback) callback(arrayBuffer);
	}
	reader.readAsArrayBuffer(blob);
}
function dataURL2Blob(dataurl) {
	var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], {type:mime});
}
//function blob2DataURL(blob, contentType, callback) {
//	if (contentType === 'pdf') {
//		blob2ArrayBuffer(blob, contentType, function (arrayBuffer) {
//			pdf2imageDataURLs(arrayBuffer, function (dataURLs, numPages, sizes) {
//				callback(dataURLs, numPages, sizes);
//			},true)
//		});
//	}
//	else {
//		var reader = new FileReader();
//		reader.onloadend = function (onloadend_e) {
//			var result = reader.result; //base 64 encoded file
//			var image = new Image();
//			image.onload = function () {
//				var canvas = document.createElement('canvas');
//				canvas.width = image.width;
//				canvas.height = image.height;
//				var ctx = canvas.getContext("2d");
//				ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
//				canvas.toBlob(function (blob) {
//					var reducedFile = blob;
//					reducedFile.name = file.name;
//					reducedFile.lastModifiedDate = file.lastModified;
//					if (reducedFile.size > desiredSize) reduceImageFileSizeQuality(reducedFile, quality - 0.1, callback);
//					else if (callback) callback(reducedFile);
//				}, "image/jpeg", quality);
//			}
//			image.src = result;
//		}
//		reader.readAsDataURL(file);
//	}
//}
//quality reduction for large image files
function reduceImageFileSizeQuality(file, quality, desiredSize, callback) {
	var reader = new FileReader();
	reader.onloadend = function (onloadend_e) {
		var result = reader.result; //base 64 encoded file
		var image = new Image();
		image.onload = function () {
			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			canvas.toBlob(function (blob) {
				var reducedFile = blob;
				reducedFile.name = file.name;
				reducedFile.lastModifiedDate = file.lastModified;
				if (reducedFile.size > desiredSize) reduceImageFileSizeQuality(reducedFile, quality - 0.1, callback);
				else if (callback) callback(reducedFile);
			}, "image/jpeg", quality);
		}
		image.src = result;
	}
	reader.readAsDataURL(file);
};
function calculateConstrainedDimensions(width, height, containerWidth, containerHeight) {
	if (width > containerWidth || height > containerHeight) {
		if (width > height) {
			var scale = containerWidth / width;
			return { width: containerWidth, height: height * scale };
		}
		else {
			var scale = containerHeight / height;
			return { width: width * scale, height: containerHeight };
		}
	}
	else {
		return { width: width, height: height };
	}
}
//polyfill for canvas.toBlob
if (!HTMLCanvasElement.prototype.toBlob) {
	Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		value: function (callback, type, quality) {

			var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
					len = binStr.length,
					arr = new Uint8Array(len);

			for (var i = 0; i < len; i++) {
				arr[i] = binStr.charCodeAt(i);
			}

			callback(new Blob([arr], { type: type || 'image/png' }));
		}
	});
}

