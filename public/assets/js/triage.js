var selectedPictures,
    pictures,
    createListButton = document.getElementById('createList'),
    selectAllNone = document.getElementById('selectAllNone');

$(loadImages);

function loadImages() {
    var list = document.getElementById('images');
    selectedPictures = [];
    createListButton.setAttribute('disabled', 'disabled');
    $.getJSON('/images', function(images) {
        list.innerHTML = '';
        pictures = images;
        if (images.length > 0) {
            var row,
                rowPos = -1;
            selectAllNone.classList.remove('hidden');
            for (var i = 0; i < images.length; i++) {
                var image = images[i];
                if (i % 4 == 0) {
                    if (row) {
                        list.appendChild(row);
                    }
                    row = document.createElement('div');
                    row.classList.add('row');
                    rowPos++;
                }
                var entry = document.createElement('div');
                entry.classList.add('thumbnail');
                entry.classList.add('col-sm-3');
                entry.id = image._id;

                var img = document.createElement("img");
                img.setAttribute('_src', image.url);
                if (rowPos < 5) {
                    img.src = image.url;
                }
                img.onclick = toggleSelection;
                if (image.selected) {
                    img.classList.add('selected');
                    selectedPictures.push(image._id);
                }
                entry.appendChild(img);

                var toolbar = document.createElement('div');
                toolbar.classList.add('toolbar');

                var download = document.createElement('a');
                download.setAttribute('href', image.fullSize || image.url.replace('/t_', '/'));
                download.setAttribute('alt', 'Télécharger');
                download.setAttribute('target', '_blank');
                var downloadIcon = document.createElement('span');
                downloadIcon.classList.add('glyphicon');
                downloadIcon.classList.add('glyphicon-download');
                download.appendChild(downloadIcon);
                toolbar.appendChild(download);

                var select = document.createElement('a');
                select.setAttribute('href', '#');
                var selectIcon = document.createElement('span');
                selectIcon.id = 'icon' + image._id;
                selectIcon.classList.add('glyphicon');
                selectIcon.classList.add(image.selected ? 'glyphicon-check' : 'glyphicon-unchecked');
                select.appendChild(selectIcon);
                select.onclick = (function(thumb) {
                    return function() {
                        toggleSelection(thumb);
                    }
                })(entry);
                toolbar.appendChild(select);

                entry.appendChild(toolbar);

                row.appendChild(entry);
            }
            if (row) {
                list.appendChild(row);
            }
            $(document).on('scroll', loadDisplayedImages);
        } else {
            selectAllNone.classList.add('hidden');
        }
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

function toggleSelection(thumb) {
    thumb = thumb.target ? this.parentElement : thumb;
    var picture = thumb.firstElementChild,
        icon = document.getElementById('icon' + thumb.id);
    if (thumb.id) {
        var pictureIndex = selectedPictures.indexOf(thumb.id);
        if (pictureIndex == -1) {
            selectedPictures.push(thumb.id);
            picture.classList.add('selected');
            icon.classList.remove('glyphicon-unchecked');
            icon.classList.add('glyphicon-check');
        } else {
            selectedPictures.splice(pictureIndex, 1);
            picture.classList.remove('selected');
            icon.classList.remove('glyphicon-check');
            icon.classList.add('glyphicon-unchecked');
        }
    }
    validateForm();
}

function selectAll() {
    for (var i = 0; i < pictures.length; i++) {
        var image = pictures[i],
            elementId = image._id,
            thumb = document.getElementById(elementId);
        if (selectedPictures.indexOf(elementId) == -1) {
            toggleSelection(thumb);
        }
    }
}

function selectNone() {
    for (var i = 0; i < pictures.length; i++) {
        var image = pictures[i],
            elementId = image._id,
            thumb = document.getElementById(elementId);
        if (selectedPictures.indexOf(elementId) != -1) {
            toggleSelection(thumb);
        }
    }
}

function validateForm() {
    if (selectedPictures.length == 0) {
        createListButton.setAttribute('disabled', 'disabled');
    } else {
        createListButton.removeAttribute('disabled');
    }
}

function selectPictures() {
    $.ajax('/selection', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(selectedPictures)
    })
}