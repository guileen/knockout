var appko = {};
(function(){
    var $upload = $('#upload');
    var $username = $('#username');

    function initTriggers() {

      $upload.popover({
          trigger: 'manual'
        , html: true
        , placement: 'bottom'
        , content: function() {
            return $('#upload-content').html();
          }
      });

      $username.popover({
          trigger: 'manual'
        , html: true
        , placement: 'bottom'
        , content: function() {
            return $('#switch-user').html()
          }
      });

      $upload.live('click', function() {
          $upload.popover('show');
          $('.close-popover').click(function() {
              $upload.popover('hide');
          })
      });

      $username.live('click', function() {
          $username.popover('show');
          $('.close-popover').click(function() {
              $username.popover('hide');
          })
      });

    }

    // main
    initTriggers();

})();
