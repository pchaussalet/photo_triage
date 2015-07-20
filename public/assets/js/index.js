var selectedPictures,
    uploadButton = document.getElementById('uploadButton'),
    authorInput = document.getElementById('author'),
    selectAllNone = document.getElementById('selectAllNone'),
    archiveType = 'application/zip';

function updateFileList() {
    var list = document.getElementById('selectedFiles'),
        file,
        row,
        entry;
    if (isArchive()) {
        file = document.getElementById('uploadInput').files[0];
        row = document.createElement('div');
        row.classList.add('row');
        entry = document.createElement('div');
        entry.setAttribute('style', 'text-align: center')
        entry.classList.add('col-sm-3');
        entry.id = file.name;
        entry.innerHTML = '<span class="glyphicon glyphicon-file" style="font-size: xx-large" aria-hidden="true"></span><br>'+file.name;
        selectedPictures = [file.name];
        row.appendChild(entry);
        list.appendChild(row);
    } else {
        var files = getImageFiles(),
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
            file = files[i];
            hasImages = true;
            entry = document.createElement('div');
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
    if (!selectedPictures || selectedPictures.length == 0 || !authorInput.value) {
        uploadButton.setAttribute('disabled', 'disabled');
    } else {
        uploadButton.removeAttribute('disabled');
    }
}

function isArchive() {
    var files = document.getElementById('uploadInput').files;
    return files.length == 1 && files[0].type == archiveType;
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
    var files = isArchive() ? document.getElementById('uploadInput').files : getImageFiles(),
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
    var progress = document.createElement('div'),
        progressBar = document.createElement('div'),
        xhr = new XMLHttpRequest();

    console.log('uploading file', file.name, file.type, file.size);

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

    var self = this;
    xhr.upload.addEventListener("progress", function(e) {
        console.log('progress');
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
    xhr.send(file);
}