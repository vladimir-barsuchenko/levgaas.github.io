$(document).ready(function () {

    var $pictures = $(".pictures");

    $(window).resize(function () {
        $pictures.each(function () {
            computePhotoGrid($(this));
        });
    });
    $pictures.each(function () {
        var it = this;
        var tabIsInvoked = false;
        if (it.id === "head_pics"
            || it.id === "pictures_divider"
            || it.id === "pictures_divider2"
            || it.id === "pictures_divider3") {
            computePhotoGrid($(it), function () {
                    $(it).animate({
                        opacity: 1
                    }, 500, function () {
                        // Animation complete.
                    });

                    if (!tabIsInvoked) {
                        $(".tab_wrapper").animate({
                            opacity: 1
                        }, 500, function () {
                            // Animation complete.
                        });
                        tabIsInvoked = true;
                    }

                    var $centredBlock = $(it).find(".jPhotoGrid_centred_block");
                    if ($centredBlock) {
                        $(it).parent().height($centredBlock.height());
                        $centredBlock.css("paddingTop", "0px");
                    }
                }
                ,
                function (instance, image) {
                    NProgress.set(instance.progressedCount / instance.images.length);
                }
            )
            ;
        }
        else {
            computePhotoGrid($(it));
        }
    });

    (function onLoad() {
        NProgress.start();
    })();
})
;

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