(function($) {

  var spinnerOpts = {
    lines: 13,
    length: 40,
    width: 30,
    radius: 0,
    corners: 1,
    rotate: 0,
    direction: 1,
    color: ['#2b1395', '#2b1395', '#920c3c', '#791276', '#a11a24', '#d3ac26', '#387a20'],
    speed: 1,
    trail: 45,
    shadow: false,
    hwaccel: true,
    className: 'spinner',
    zIndex: 2e9,
    top: '50%',
    left: '50%'
  };
  var spinner = new Spinner(spinnerOpts).spin();
  var spinnerTarget = document.getElementById('spinner');
  var courseId = $('body').data('courseid');
  var url = '/rosterPhotos/' + courseId;
  var target = $('.rosterTable tbody');
  $(spinnerTarget).prepend(spinner.el);
  $.ajax({
    url: url,
    beforeSend: function() {
      spinnerTarget.appendChild(spinner.el);
    },
    success: function(html) {
      spinner.stop();
      target.append(html);
    }
  });

})(jQuery);

