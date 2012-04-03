var appko = {};
(function(){

    function loadPkImages() {
      $('.pk-image').each(loadPkImage);
    }

    function loadPkImage(i, pkImage) {
      var $img = $(pkImage).find('img');
      var url = $img.data('url');
      $img.attr('src', url).load(function() {
          var t = new Image();
          t.src = $img.data('url');
          if(t.width < 300 || t.height < 300) {
            // != real width real height
            reloadPkImage($img);
          }
          t=null;
          $img.unbind('load error');
      }).error(function() {
          $img.unbind('load error')
          reloadPkImage($img);
      })
    }

    function reloadPkImage($img) {
      $img.attr('src', '/' + $img.data('id') + '/reload')
      .error(function(){
          $img.unbind('load error')
          removeImage($img);
      })
    }

    function removeImage($img) {
      location.href = '/' + $img.data('id') + '/remove';
    }

    function initTriggers() {
      var $upload = $('#upload');
      var $username = $('#username');

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
    loadPkImages();

})();
