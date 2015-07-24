$(loadImages);

function loadImages() {
    var i,
        list = $('#images');
    $.getJSON('/images', function(images) {
        images.sort(imageSorter);
        list.empty();
        if (images.length > 0) {
            var row,
                rowPos = -1;
            for (i = 0; i < images.length; i++) {
                var image = images[i];
                if (i % 4 == 0) {
                    if (row) {
                        list.append(row);
                    }
                    row = $('<div>')
                        .addClass('row')
                        .attr('id', 'row' + ++rowPos);
                }
                var entry = $('<div>')
                    .addClass('pictureCell')
                    .addClass('col-sm-3')
                    .attr('id', image._id);

                entry.append($('<img>')
                    .attr('_src', image.url)
                    .addClass('thumbnail')
                    .addClass('selected')
                );

                var toolbar = $('<div>')
                    .addClass('toolbar')
                    .addClass('form-inline');

                var fullSizeUrl = getFullSizeUrl(image);
                toolbar.append($('<a>')
                    .attr('href', fullSizeUrl)
                    .attr('download', fullSizeUrl.substr(1))
                    .attr('target', '_blank')
                    .attr('title', 'Télécharger l\'originale')
                    .addClass('btn')
                    .addClass('btn-default')
                    .append($('<span>')
                        .addClass('glyphicon')
                        .addClass('glyphicon-download')
                    )
                );

                toolbar.append($('<button>')
                    .addClass('btn')
                    .addClass('btn-default')
                    .click(likePicture)
                    .attr('title', 'Voter pour cette photo')
                    .append($('<span>')
                        .attr('id', 'selectIcon-' + image._id)
                        .addClass('glyphicon')
                        .addClass('glyphicon-thumbs-up')
                    )
                );

                toolbar.append($('<input>')
                    .attr('type', 'text')
                    .attr('id', 'likes-' + image._id)
                    .val(image.likes || 0)
                    .addClass('form-control')
                    .addClass('likesCounter')
                    .attr('readonly', '')
                    .attr('maxlength', 2)
                );

                entry.append(toolbar);

                row.append(entry);
            }
            if (row) {
                list.append(row);
            }
            for (i = 0; i < 5; i++) {
                loadRowImages(list.find('#row' + i));
            }
            $(document).scroll(loadDisplayedImages);
        }
    });
}

function getFullSizeUrl(image) {
    return image.fullSize || image.url.replace('/t_', '/');
}

function loadRowImages(row) {
    var rowImages = row.find('img');
    rowImages.each(function () {
        var image = $(this);
        image.attr('src', image.attr('_src'));
    });
    return rowImages;
}

function loadDisplayedImages() {
    $('.row').each(function(index, row) {
        if (index >= 5) {
            if (row.getBoundingClientRect().top - window.innerHeight <= window.innerHeight / 4) {
                loadRowImages($(row));
            }
        }
    });
}

function likePicture() {
    var likeIcon = $(this),
        pictureId = likeIcon.parents('.pictureCell').first().attr('id');
    $.ajax('/like/' + pictureId, {
        type: 'POST',
        contentType: 'application/json',
        success: function() {
            increaseLikes(pictureId);
        }
    });
}

function increaseLikes(pictureId) {
    var likes = $('#likes-' + pictureId);
    likes.val(parseInt(likes.val(), 10) + 1);
    $('#selectIcon-' + pictureId)
        .removeClass('glyphicon-thumbs-up')
        .addClass('glyphicon-ok')
        .parent()
            .attr('disabled', '');
}

function imageSorter(imageA, imageB) {
    if (imageA.timestamp == imageB.timestamp) {
        if (imageA._id == imageB._id) {
            return 0;
        }
        return imageA._id > imageB._id ? 1 : -1;
    }
    return imageA.timestamp > imageB.timestamp ? 1 : -1;
}