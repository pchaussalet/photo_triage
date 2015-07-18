var selectedPictures,
    pictures,
    createListButton = document.getElementById('createList'),
    selectAllNone = document.getElementById('selectAllNone');

$(loadImages);

function loadImages() {
    var list = document.getElementById('images')
    selectedPictures = [];
    createListButton.setAttribute('disabled', 'disabled');
    $.getJSON('/images', function(images) {
        list.innerHTML = '';
        pictures = images;
        if (images.length > 0) {
            var row;
            selectAllNone.classList.remove('hidden');
            for (var i = 0; i < images.length; i++) {
                var image = images[i];
                if (i % 4 == 0) {
                    if (row) {
                        list.appendChild(row);
                    }
                    row = document.createElement('div');
                    row.classList.add('row');
                }
                var entry = document.createElement('div');
                entry.classList.add('thumbnail');
                entry.classList.add('col-sm-3');
                entry.id = image._id;
                entry.onclick = toggleSelection;


                var img = document.createElement("img");
                img.src = image.url;
                entry.appendChild(img);

                row.appendChild(entry);
            }
            if (row) {
                list.appendChild(row);
            }
        } else {
            selectAllNone.classList.add('hidden');
        }
    });
}

function toggleSelection(thumb) {
    thumb = thumb.target ? this : thumb;
    if (thumb.id) {
        var pictureIndex = selectedPictures.indexOf(thumb.id);
        if (pictureIndex == -1) {
            selectedPictures.push(thumb.id);
            thumb.classList.add('selected');
        } else {
            selectedPictures.splice(pictureIndex, 1);
            thumb.classList.remove('selected');
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