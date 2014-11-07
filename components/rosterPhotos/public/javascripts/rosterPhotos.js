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
  var spinnerTarget = document.getElementById('spinner');
  var spinner = new Spinner(spinnerOpts).spin(spinnerTarget);
  var courseId = $('body').data('courseid');
  var url = '/rosterPhotos/' + courseId;
  var target = $('.rosterTable tbody');
  $(spinnerTarget).prepend(spinner.el);
  spinnerTarget.appendChild(spinner.el);
  var showTimeoutMessage = function() {
    $('.spinner').append($('#message').html());
  }
  var timer;
  $.ajax({
    url: url,
    beforeSend: function() {
      timer = window.setTimeout(showTimeoutMessage, 4000);
    },
    success: function(html) {
      clearTimeout(timer);
      $('.timeoutMessage').remove();
      spinner.stop();
      target.append(html);
      parent.postMessage(JSON.stringify({subject: 'lti.frameResize', height: $(document).height()+"px"}), '*');
    }
  });

})(jQuery);

