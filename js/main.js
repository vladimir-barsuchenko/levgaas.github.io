
function computePhotoGrid(elem, onComplete) {
    elem.jPhotoGrid({
        margin: 1,
        //isFirstRowBig: Math.random() < 0.5,
        isFirstRowBig: true,
        isCentred: true,
        isSmallImageStretched: false,
        onComplete: onComplete
    });
}
var $pictures = $(".pictures");

$pictures.each(function () {
    computePhotoGrid($(this));
});

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
//
//(function uploadImages($elem, input) {
//    input.onchange = function () {
//
//        var fileReader = new FileReader();
//        var files = input.files;
//        var filesCount = input.files.length;
//        var i = 0;
//
//        (function recursiveUploadImageFromReader() {
//
//            if (i < filesCount) {
//                fileReader.onloadend = function () {
//                    var img = document.createElement("IMG");
//                    img.setAttribute("src", fileReader.result);
//                    img.style.display = "none";
//                    $elem[0].appendChild(img);
//
//                    i++;
//                    recursiveUploadImageFromReader();
//                };
//
//                fileReader.readAsDataURL(files[i]);
//            } else {
//                computePhotoGrid($elem);
//            }
//        })();
//    }
//})($pictures.first(), $(".pictures-input")[0]);
