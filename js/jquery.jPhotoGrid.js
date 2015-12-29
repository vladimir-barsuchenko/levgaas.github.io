;

(function ($, window, document, undefined) {
    "use strict";
    var pluginName = "jPhotoGrid";
    var defaults = {
        itemsType: "img", // Type of elements in the selector
        margin: 0, // Space between elements
        isFirstRowBig: false, // First row - largest
        isCentred: true, // Center content if overall height less than wrapper height
        isSmallImageStretched: false, // Stretch image if it has dimensions smaller than wrapper's one
        minRelation: 0.4, // Min row relation = Height / Width
        onComplete: function () {    // Fires after all computations have completed
        },
        onProgress: function (instance, image) {  // Fires when image is uploaded
        }
    };

    function Plugin(element, options) {
        this.element = element;
        this._defaults = defaults;
        this._name = pluginName;
        this.options = $.extend({}, defaults, options);
        this.action = typeof options === "string" ? options : "default";

        this.init();

    }

    Plugin.prototype.init = function () {
        switch (this.action) {
            case "clear":
                return this.clear();
                break;
            default:
                return this.waitForImageLoaded();

        }
    };

    Plugin.prototype.waitForImageLoaded = function () {
        var it = this;
        // By default the plugin will wait until all of the images are loaded to setup the styles

        var hasDimensions = true;

        // Loops through all of the images in the photoset
        // if the height and width exists for all images set waitForImagesLoaded to false
        $(it.element).find(it.options.itemsType).each(function () {
            hasDimensions = hasDimensions & ( !!$(this).attr('height') & !!$(this).attr('width') );
        });

        var waitForImagesLoaded = !hasDimensions;

        // Only use imagesLoaded() if waitForImagesLoaded
        if (waitForImagesLoaded) {
            $(it.element)
                .imagesLoaded()
                .done(function () {
                    it.start();
                })
                .progress(function (instance, image) {
                    it.options.onProgress && it.options.onProgress(instance, image);
                });
        } else {
            it.start();
        }
    };

    Plugin.prototype.start = function () {
        var it = this;
        var numRow = 0;
        var classWidth = 0;

        this.clear();
        var $images = $(it.element).find(it.options.itemsType);

        var isImageLessThanElement = function () {
            return $images[0].naturalWidth < it.getWidth($(it.element)) &&
                $images[0].naturalHeight < it.getHeight($(it.element));
        };

        if (!it.options.isSmallImageStretched && $images.length === 1 && isImageLessThanElement()) {

            // If you use that plugin repeatedly on delete at the end you will have 1 picture with changed size.
            // Because previous iteration has changed img size. So to set it to previous state width -> naturalWidth
            $images.width($images[0].naturalWidth);
            $images.height($images[0].naturalHeight);

            it.displayItems();
            $(it.element).append("<div class='jPhotoGrid-clear'></div>");
            return;
        }

        it.options.minRowHeight = (function computeMinRowHeight($images) {
            var reqWidth = Math.sqrt(it.getHeight($(it.element)) * it.getWidth($(it.element)) / $images.length);
            var minRowHeight = Infinity;

            $images.each(function () {
                //natural Sizes are used because during the program image.width and image.height are changing
                //So if we need to upload files more than 1 time. We need to know the origin size of image
                var temp = this.naturalHeight / this.naturalWidth * reqWidth;
                if (temp < minRowHeight) {
                    minRowHeight = temp;
                }
            });

            minRowHeight += 2 * $images.length / 3;

            return minRowHeight;
        })($images);

        if (it.options.isFirstRowBig) {
            it.reverseItems();
        }

        $(it.element).addClass("jPhotoGrid-selector");

        var $elements = $(it.element).find(it.options.itemsType);
        var rowHeightArray = [];

        var copyElements = [];

        $elements.each(function (i) {

            $(this).addClass("jPhotoGrid-item");

            var newWidth = it.itemNewWidth(this, it.options.minRowHeight);

            $(this).css({
                "margin": it.options.margin + "px"
            });

            var elementOuterWidth = newWidth + 2 * it.options.margin;

            if (i == 0 || classWidth + elementOuterWidth <= it.getWidth($(it.element))) {
                classWidth += elementOuterWidth;
            }
            else {
                rowHeightArray.push(it.stretchingRow(".jPhotoGrid-row_" + numRow, classWidth, copyElements));
                classWidth = elementOuterWidth;
                numRow++;
            }

            copyElements.push({
                className: ".jPhotoGrid-row_" + numRow,
                width: newWidth,
                height: it.options.minRowHeight
            });

            $(this).addClass("jPhotoGrid-row_" + numRow);
            if (i == $elements.length - 1) {
                rowHeightArray.push(it.stretchingRow(".jPhotoGrid-row_" + numRow, classWidth, copyElements));
            }
        });

        if (it.options.isFirstRowBig) {
            it.reverseItems();
            rowHeightArray.reverse();
            copyElements.reverse();
        }

        var rowsHeightSum = 0;
        for (var i = 0; i < rowHeightArray.length; i++) {
            rowsHeightSum += rowHeightArray[i];
        }

        if (rowsHeightSum > it.getHeight($(it.element))) {
            this.wrapImages(rowsHeightSum, rowHeightArray, $, it);
        }

        it.displayItems();

        $(it.element).append("<div class='jPhotoGrid-clear'></div>");
    };


    Plugin.prototype.itemNewWidth = function (item, newHeight) {
        var width = typeof($(item).attr("width")) != 'undefined' ? $(item).attr("width") : this.getWidth($(item));
        var height = typeof($(item).attr("height")) != 'undefined' ? $(item).attr("height") : this.getHeight($(item));
        var prop = width / height;

        var newWidth = newHeight * prop;

        return Math.round(newWidth);
    };

    Plugin.prototype.stretchingRow = function (className, classWidth, copyElements) {
        var it = this;
        var row = $(it.element).find(className);
        var rowElementsArray = $.grep(copyElements, function (e) {
            return e.className == className.toString()
        });
        var classHeight = Math.round(rowElementsArray[0].height) + 2 * it.options.margin;
        var requiredWidth = it.getWidth($(it.element));
        /* scrollbar fix (for relative selector width) */
        var requiredHeight = classHeight / classWidth * requiredWidth;
        var resultWidth = 0;

        row.each(function (i) {
            $(this).width(it.itemNewWidth(rowElementsArray[i], (requiredHeight - it.options.margin * 2)));
            resultWidth += it.getWidth($(this)) + 2 * it.options.margin;
        });

        row.height(requiredHeight - it.options.margin * 2);

        var lastElementWidth = it.getWidth(row.last()) + 2 * it.options.margin + (requiredWidth - resultWidth) - it.options.margin * 2;
        row.last().width(lastElementWidth);

        return requiredHeight;
    };


    Plugin.prototype.wrapImages = function (rowsHeightSum, rowHeightArray, $, it) {

        // TODO  rename function method
        // TODO refactor
        (function computeRowHeight() {
            var biggestRelationElement = -Infinity;
            var indexOfBiggestRelElem;

            for (var j = 0; j < rowHeightArray.length; j++) {
                rowHeightArray[j] /= rowsHeightSum;
                if (rowHeightArray[j] >= biggestRelationElement) {
                    indexOfBiggestRelElem = j;
                    biggestRelationElement = rowHeightArray[j];
                }
            }

            var relationsArray = [];

            for (var k = 0; k < rowHeightArray.length; k++) {

                var $rowElements = $(it.element).find(".jPhotoGrid-row_"
                    + (it.options.isFirstRowBig ? rowHeightArray.length - k - 1 : k ));
                var smallestRelationInRow = {
                    width: 0,
                    rel: Infinity
                };

                $rowElements.each(function () {
                    var width = it.getWidth($(this));
                    var height = (rowHeightArray[k] * it.getHeight($(it.element)) - 2 * it.options.margin);
                    var rel = height / width;

                    if (rel < smallestRelationInRow.rel) {
                        smallestRelationInRow.rel = rel;
                        smallestRelationInRow.width = width;
                    }
                });

                relationsArray.push(smallestRelationInRow);
            }

            var biggestRowCanGive = relationsArray[indexOfBiggestRelElem].width *
                (relationsArray[indexOfBiggestRelElem].rel - it.options.minRelation);


            if (biggestRowCanGive > 0) {
                for (var i = 0; i < relationsArray.length; i++) {
                    if (i === indexOfBiggestRelElem) {
                        continue;
                    }
                    if (relationsArray[i].rel < it.options.minRelation) {
                        var thisNeeded = (it.options.minRelation - relationsArray[i].rel) * relationsArray[i].width;
                        var taken;
                        if (biggestRowCanGive < thisNeeded) {
                            taken = biggestRowCanGive;
                        } else {
                            taken = thisNeeded;
                            biggestRowCanGive = biggestRowCanGive - taken;
                        }
                        var takenRel = taken / it.getHeight($(it.element));
                        rowHeightArray[i] += takenRel;
                        rowHeightArray[indexOfBiggestRelElem] -= takenRel;
                    }
                }
            }
        })();

        var wrapElementWithDiv = function (counter, margin_top) {
            $(this).wrap("<div class='jPhotoGrid_image_wrapper' style='overflow: hidden; height: "
                + (rowHeightArray[counter] * it.getHeight($(it.element)) - 2 * it.options.margin)
                + "px; width: " + (it.getWidth($(this)) + 2 * it.options.margin)
                + "px; float:left; margin-top: " + margin_top + "px;'></div>");
        };

        for (var k = 0; k < rowHeightArray.length; k++) {
            var $rowElements = $(it.element).find(".jPhotoGrid-row_"
                + (it.options.isFirstRowBig ? rowHeightArray.length - k - 1 : k ));

            $rowElements.each(function () {
                if (k === 0) {
                    wrapElementWithDiv.call(this, k, it.options.margin);

                } else {
                    wrapElementWithDiv.call(this, k, 2 * it.options.margin);
                }

                $(this).css({
                    "margin-top": (-(it.getHeight($(this)) - rowHeightArray[k] * it.getHeight($(it.element))) / 2 - it.options.margin)
                    + "px"
                });
            })
        }
    };

// Analog to jQuery.width() but rounded to 2 digit
    Plugin.prototype.getWidth = function ($elem) {
        var item = $elem[0];
        if (item == undefined) {
            return undefined;
        }
        var res;
        if (item.getBoundingClientRect().width !== 0) {
            res = item.getBoundingClientRect().width;
        } else {
            var width = item.style.width.replace("px", '');
            if (width !== "" && parseFloat(width) !== 0) {
                res = parseFloat(width);
            } else {
                res = Math.max(item.scrollWidth, item.offsetWidth, item.clientWidth, item.naturalWidth);
            }
        }
        return Math.round((res + 0.00001) * 100) / 100;
    };

    // Analog to jQuery.height() but rounded to 2 digit
    Plugin.prototype.getHeight = function ($elem) {
        var item = $elem[0];
        if (item == undefined) {
            return undefined;
        }
        var res;
        if (item.getBoundingClientRect().height !== 0) {
            res = item.getBoundingClientRect().height;
        } else {
            var height = item.style.height.replace("px", '');
            if (height !== "" && parseFloat(height) !== 0) {
                res = parseFloat(height);
            } else {
                res = Math.max(item.scrollHeight, item.offsetHeight, item.clientHeight, item.naturalHeight);
            }
        }

        return Math.round((res + 0.00001) * 100) / 100;
    };

    Plugin.prototype.reverseItems = function () {
        var it = this;
        var items = $.makeArray($(it.element).find(it.options.itemsType));
        items.reverse();
        $(it.element).html(items);
    };

    Plugin.prototype.displayItems = function () {
        var it = this;
        var $images = $(it.element).find(this.options.itemsType);
        $images.each(function () {
            $(this).removeAttr("display").css({
                "display": "inline",
                "float": "left"
            });
        });

        if (it.options.isCentred) {
            var $wrappers = $(it.element).find(".jPhotoGrid_image_wrapper");
            if ($wrappers.length != 0) {
                $wrappers.wrapAll("<div class='jPhotoGrid_centred_block' style='display: inline-block;'></div>");
            } else {
                $images.wrapAll("<div class='jPhotoGrid_centred_block' style='display: inline-block;'></div>");
            }

            var $elem = $(it.element).find(".jPhotoGrid_centred_block");
            $elem.last().append("<div style='clear: both;'></div>");
            $elem.removeAttr("margin").css({
                "padding-top": ((it.getHeight($(it.element)) - it.getHeight($elem)) / 2 - it.options.margin) + "px",
                "padding-left": ((it.getWidth($(it.element)) - it.getWidth($elem)) / 2) + "px"
            });
        }

        it.options.onComplete();
    };

    Plugin.prototype.clear = function () {
        var it = this;
        $(it.element).find(".jPhotoGrid-item").each(function () {
            $(this)[0].className = $(this)[0].className.replace(/\bjPhotoGrid-row_.*?\b/g, '');
        });
        $(it.element).find(".jPhotoGrid-item").removeClass("jPhotoGrid-item");
        $(it.element).find(".jPhotoGrid-clear").remove();
        $(it.element).removeClass("jPhotoGrid-selector");
        it.deepClear();

    };

    /**
     * Leaves in wrapper block only items you are working on. Nothing else.
     */
    Plugin.prototype.deepClear = function () {
        var it = this;
        var items = $(it.element).find(it.options.itemsType);
        $(it.element).html(items);
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
        });
    };

})(jQuery, window, document);
