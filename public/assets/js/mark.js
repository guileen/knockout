var appko = {};
(function(){

    // simple template
    function render(html, ctx) {
      for(var name in ctx) {
        var re = new RegExp('{' + name + '}', 'g');
        html = html.replace(re, ctx[name]);
      }
      return html;
    }

    var html_tb_image = $('#tb-image').html()
      , hotImages;

    $.get('/api/markimages', function(data) {
        hotImages = data;
        loadHotImages(hotImages);
    })

    function loadHotImages(images, callback) {

        var $inspos = $('i.insert-pos')

        async.forEachLimit(images, 4, function(image, _callback) {
            var html = render(html_tb_image, image)
            var $tb_html = $(html);
            var $img = $tb_html.find('img');
            $img.attr('src', image.tbUrl || ('/' + image.id + '/thumbnail')).load(function(){
                var $pos = $inspos;
                var minpos = $pos[0]
                $pos.each(function(){
                    if($(this).offset().top < $(minpos).offset().top) {
                      minpos = this
                    }
                })

                $tb_html.insertBefore(minpos);
                _callback();
            })

        }, callback)
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
    // loadPkImages();

})();
