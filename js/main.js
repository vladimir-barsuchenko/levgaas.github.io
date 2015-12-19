$(document).ready(function () {

    var $pictures = $(".pictures");

    $(window).resize(function () {
        $pictures.each(function(){
            computePhotoGrid($(this));
        });
        //computePhotoGrid($("#head_pics"));
        //computePhotoGrid($("#pictures_divider"));
        //computePhotoGrid($("#pictures_divider2"));

    });
    $pictures.each(function () {
        var it = this;
        if (it.id === "head_pics" || it.id === "pictures_divider" || it.id === "pictures_divider2") {
            computePhotoGrid($(it), function () {
                $(it).animate({
                    opacity: 1
                }, 500, function () {
                    // Animation complete.
                });
                $(".tab_wrapper").animate({
                    opacity: 1
                }, 500, function () {
                    // Animation complete.
                });

                var $centredBlock = $(it).find(".jPhotoGrid_centred_block");
                if ($centredBlock) {
                    $(it).parent().height($centredBlock.height());
                    $centredBlock.css("paddingTop", "0px");
                }

            }, function (instance, image) {
                NProgress.set(instance.progressedCount / instance.images.length);
            });
        } else {
            computePhotoGrid($(it));
        }


    });

    (function onLoad() {
        NProgress.start();
    })();


    (function uploadImages($elem, input) {
        input.onchange = function () {

            var fileReader = new FileReader();
            var files = input.files;
            var filesCount = input.files.length;
            var i = 0;

            (function recursiveUploadImageFromReader() {

                if (i < filesCount) {
                    fileReader.onloadend = function () {
                        var img = document.createElement("IMG");
                        img.setAttribute("src", fileReader.result);
                        img.style.display = "none";
                        $elem[0].appendChild(img);

                        i++;
                        recursiveUploadImageFromReader();
                    };

                    fileReader.readAsDataURL(files[i]);
                } else {
                    computePhotoGrid($elem);
                }
            })();
        }
    })($pictures.first(), $(".pictures-input")[0]);
});

function onResizeFunc(elem) {
    computePhotoGrid($("#head_pics"));
    //var $centredBlock = $(".jPhotoGrid_centred_block");
    //$(".pic_wrap").height($centredBlock.height());
    //$centredBlock.css("paddingTop", "0px");
}

function deleteElem() {
    var target = event.target;
    if (target.nodeName !== "IMG") {
        return;
    }
    var par = $(target).closest(".pictures");
    var parentDeepCopy = par.clone();
    parentDeepCopy.removeAttr("z-index").css({
        "z-index": 10
    });
    parentDeepCopy.insertAfter(par);

    target.remove();
    computePhotoGrid(par, function () {
        parentDeepCopy.animate({
            opacity: 0
        }, 50, function () {
            parentDeepCopy.remove();
        })
    });
}
function computePhotoGrid(elem, onComplete, onProgress) {
    elem.jPhotoGrid({
        margin: 1,
        //isFirstRowBig: Math.random() < 0.5,
        isFirstRowBig: true,
        isCentred: true,
        isSmallImageStretched: false,
        onComplete: onComplete,
        onProgress: onProgress
    });
}