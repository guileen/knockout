var appko = appko || {};
(function(){

    // simple template
    function render(html, ctx) {
      for(var name in ctx) {
        var re = new RegExp('{' + name + '}', 'g');
        html = html.replace(re, ctx[name]);
      }
      return html;
    }

    function joinImageId(images, exclude) {
      return images.filter(function(i) {
          return i != exclude;
      }).map(function(i) {
          return i.id;
      }).join('--');
    }

    var html_pk_image = $('#pk-image').html()
      , html_tb_image = $('#tb-image').html()
      , pkImages
      , hotImages;

    $.get('/api/pkimages', function(data) {
        pkImages = data.pkImages
        hotImages = data.hotImages
        if(data.foundPair) {
          async.forEach(pkImages, loadPkImage, function(err){
              loadHotImages(hotImages);
          })
        }

    })

    function loadHotImages(images, callback) {

        var $inspos = $('i.insert-pos')
        var $winspos = $('i.winsert-pos')

        async.forEachLimit(images, 4, function(image, _callback) {
            var html = render(html_tb_image, image)
            var $tb_html = $(html);
            var $img = $tb_html.find('img');
            $img.attr('src', image.tbUrl || ('/' + image.id + '/thumbnail')).load(function(){
                var $pos = (image.tbWidth > 130 && image.width > image.height) ? $winspos : $inspos;
                var minpos = $pos[0]
                $pos.each(function(){
                    if($(this).offset().top < $(minpos).offset().top) {
                      minpos = this
                    }
                })

                $tb_html.insertBefore(minpos);
                $tb_html.bind('click', function(){
                    appko.popoverImage(image);
                })
                _callback();
            })

        }, callback)
    }

    var imgpk_pos = 0;
    function loadPkImage(image, callback) {

      image.others = joinImageId(pkImages, image);
      var $pkImage = $(render(html_pk_image, image));
      var $img = $pkImage.find('img');
      var url = $img.data('url');

      function load() {
        $img.unbind('load', load);

        var $imgpk_pos = '.imgpk-pos-' + imgpk_pos % 2;
        $pkImage.insertBefore($('.imgpk-pos-' + imgpk_pos % 2));
        imgpk_pos ++;
        t=null;
        callback()

        var t = new Image();
        t.src = $img.data('url');
        if(t.width < 300 || t.height < 300) {
          // != real width real height
          reloadPkImage($img);
        }
      }

      function error(err) {
          $img.unbind('error')
          reloadPkImage($img, callback);
      }

      $img.attr('src', url).bind('load', load);
      $img.bind('error', error);
    }

    function reloadPkImage($img, callback) {
      console.log('reload:' + $img.data('url'))
      var newsrc = $img.data('newurl') || ( '/' + $img.data('id') + '/reload');
      $img.attr('src', newsrc)
      .error(function(){
          $img.unbind('load error')
          removeImage($img);
      }).load(function(event){
          callback()
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
    // loadPkImages();

})();
