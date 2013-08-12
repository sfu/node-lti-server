var redirectToCanvas = function() {
    var html = encodeURIComponent( [
        '<p>',
        lti.description,
        ' &ndash; <a href="' + lti.courseUrl + '" target=_blank><em>Source: SFU Academic Calendar</em></a></p>'
    ].join('') );
    var endpoint = window.location.protocol + '//' + window.location.host + '/oembed?html=' + html;
    var redirectUrl = lti.launch_presentation_return_url + '?return_type=oembed&endpoint=' + encodeURIComponent(endpoint);
    window.location.href = redirectUrl;

};

document.getElementById('insertDescription').addEventListener('click', redirectToCanvas, false);