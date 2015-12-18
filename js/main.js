$( document ).ready(function() {

    var $pictures = $(".pictures");

    $pictures.each(function () {
        var it = this;
        computePhotoGrid($(it), function(){
            if (it.id === "head_pics") {
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
            }
        }, function (instance, image) {
            if (it.id === "head_pics") {
                NProgress.set(instance.progressedCount / instance.images.length);
            }
        });
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

//$(window).on("resize", function(event){
//
//});

});

function onResizeFunc() {
    computePhotoGrid($("#head_pics"));
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