var appko = {};
(function(){
    var popover_template = $('#tb-popover').html();

    // simple template
    appko.render = function(html, ctx) {
      for(var name in ctx) {
        var re = new RegExp('{' + name + '}', 'g');
        html = html.replace(re, ctx[name]);
      }
      return html;
    }

    appko.popoverImage = function(image) {
      $('.tb-popover-container').remove();
      var html = appko.render(popover_template, image)
      var $html = $(html);
      var $modal = $html.find('.modal');
      var $load = $modal.find('img.load');
      var $loading = $modal.find('img.loading');
      var $mainimg = $modal.find('img.main');

      var screenHeight = $(window).height();
      var screenWidth = $(window).width();
      var baseTop = 250;
      var baseLeft = 280;

      $html.appendTo(document.body);

      $modal.modal('show');

      function loadBigImage(src, onError) {

        $load.load(function(){
            $mainimg.attr('src', src);

            $loading.hide();

            var originW = $load.width()
              , originH = $load.height()
              , width = originW
              , height = originH
              ;

            var hpaddings = 150;

            var maxHeight = screenHeight - hpaddings;

            if(height > maxHeight) {
              width = width * maxHeight / height
              height = maxHeight;
            }

            function resizeModal() {

              var w = isMax ? originW * 1.5 : width
                , h = isMax ? originH * 1.5 : height
                ;

              h = Math.min(h, maxHeight);

              $modal.css({
                  left: baseLeft + (screenWidth - w) / 2
                , top: baseTop + (screenHeight - h - hpaddings) / 2
                , width: w + 30
              })

              $modal.find('.modal-body').css({
                  height: h + 30
                , maxHeight: h + 30
                , padding: '0 15px'
              })

            }

            var isMax = false;
            resizeModal();

            $modal.find('a.btn.max, .modal-body').bind('click', function(){
                isMax = ! isMax;
                resizeModal();
            })

        });

        if(onError) $load.error(onError);

        $load.attr('src', src);
      }

      loadBigImage($load.data('url'), function(err) {
          loadBigImage('/' + image.id + '/reload');
      })

    }
})()
