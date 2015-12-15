var button = document.querySelector(".add-pictures");
var input = document.querySelector(".pictures-input");

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

$(".pictures").each(function () {
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
