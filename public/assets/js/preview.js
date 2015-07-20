var pictures;

$(loadImages);

var createEntry = function (image, rowPos) {
    var entry = document.createElement('div');
    entry.classList.add('thumbnail');
    entry.classList.add('col-sm-3');
    entry.id = image._id;
    entry.classList.add('selected');


    var img = document.createElement("img");
    img.setAttribute('_src', image.url);
    if (rowPos < 5) {
        img.src = image.url;
    }
    entry.appendChild(img);
    return entry;
};

function loadImages() {
    var list = document.getElementById('images');
    $.getJSON('/images', function(images) {
        list.innerHTML = '';
        var row,
            rowPos = -1,
            imagesCount = 0;
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            if (image.selected) {
                if (imagesCount++ % 4 == 0) {
                    if (row) {
                        list.appendChild(row);
                    }
                    row = document.createElement('div');
                    row.classList.add('row');
                    rowPos++;
                }
                row.appendChild(createEntry(image, rowPos));
            }

        }
        if (row) {
            list.appendChild(row);
        }
        $(document).on('scroll', loadDisplayedImages);
    });
}

function loadDisplayedImages() {
    var list = document.getElementById('images');
    for (var i = 0; i < list.childNodes.length; i++) {
        var row = list.childNodes[i];
        for (var j = 0; j < row.childNodes.length; j++) {
            var entry = row.childNodes[j];
            if (i < 2) {
                entry.firstElementChild.src = entry.firstElementChild.getAttribute('_src');
            } else {
                if (entry.getBoundingClientRect().top-100 < window.scrollY + window.innerHeight)
                    entry.firstElementChild.src = entry.firstElementChild.getAttribute('_src');
            }
        }
    }
}
