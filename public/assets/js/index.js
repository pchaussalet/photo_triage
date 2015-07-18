var selectedPictures,
    uploadButton = document.getElementById('uploadButton'),
    authorInput = document.getElementById('author'),
    selectAllNone = document.getElementById('selectAllNone');

function updateFileList() {
    var files = getImageFiles(),
        list = document.getElementById('selectedFiles'),
        row,
        hasImages = false;
    list.innerHTML = '';
    selectedPictures = [];
    uploadButton.setAttribute('disabled', 'disabled');
    selectAllNone.classList.add('hidden');
    for (var i = 0; i < files.length; i++) {
        if (i % 4 == 0) {
            if (row) {
                list.appendChild(row);
            }
            row = document.createElement('div');
            row.classList.add('row');
        }
        var file = files[i];
        hasImages = true;
        var entry = document.createElement('div');
        entry.classList.add('thumbnail');
        entry.classList.add('col-sm-3');
        entry.id = file.name;

        var img = document.createElement("img");
        entry.appendChild(img);

        var reader = new FileReader();
        reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        reader.readAsDataURL(file);

        entry.onclick = toggleSelection;
        row.appendChild(entry);
    }
    if (row) {
        list.appendChild(row);
    }
    if (hasImages) {
        selectAllNone.classList.remove('hidden')
    }
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
    var files = getImageFiles();
    for (var i = 0; i < files.length; i++) {
        var file = files[i],
            thumb = document.getElementById(file.name);
        if (selectedPictures.indexOf(file.name) == -1) {
            toggleSelection(thumb);
        }
    }
}

function selectNone() {
    var files = getImageFiles();
    for (var i = 0; i < files.length; i++) {
        var file = files[i],
            thumb = document.getElementById(file.name);
        if (selectedPictures.indexOf(file.name) != -1) {
            toggleSelection(thumb);
        }
    }
}

function validateForm() {
    if (selectedPictures.length == 0 || !authorInput.value) {
        uploadButton.setAttribute('disabled', 'disabled');
    } else {
        uploadButton.removeAttribute('disabled');
    }
}

function getImageFiles() {
    var imageType = /^image\//,
        files = document.getElementById('uploadInput').files,
        imageFiles = [];

    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        if (!imageType.test(file.type)) {
            continue;
        }

        imageFiles.push(file);
    }
    return imageFiles;
}

function uploadPictures() {
    var files = getImageFiles(),
        author = authorInput.value;

    for (var i = 0; i < files.length; i++) {
        var file = files[i],
            thumb = document.getElementById(file.name);
        if (selectedPictures.indexOf(file.name) != -1) {
            new FileUpload(thumb, file, author);
        }
    }
}

function FileUpload(thumb, file, author) {
    var reader = new FileReader(),
        progress = document.createElement('div'),
        progressBar = document.createElement('div'),
        xhr = new XMLHttpRequest();

    progress.classList.add('progress');
    progressBar.classList.add('progress-bar');
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-valuenow', '0');
    progressBar.setProgress = function(progress) {
        this.setAttribute('aria-valuenow', progress);
        this.setAttribute('style', 'width: ' + progress + '%');
    };
    progress.appendChild(progressBar);
    thumb.appendChild(progress);

    this.progressBar = progressBar;
    this.xhr = xhr;

    var self = this;
    this.xhr.upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded * 100) / e.total);
            self.progressBar.setProgress(percentage);
        }
    }, false);

    xhr.upload.addEventListener("load", function(e){
        self.progressBar.setProgress(100);
    }, false);
    xhr.open("POST", "/upload/" + author + "/" + file.name);
    xhr.setRequestHeader('content-type', file.type);
    reader.onload = function(evt) {
        xhr.send(evt.target.result);
    };
    reader.readAsArrayBuffer(file);
}