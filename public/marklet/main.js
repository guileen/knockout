(function( window ) {

var html = stage_template({
    title: document.title
});

$(html).appendTo(document.body);

var $container = $('.imgko-container');
var $imgs_stage = $container.find('.imgs-stage');
var $links_stage = $container.find('.links-stage');
var imgs_cache = {};
var links_cache = {};

function loadPageImages() {
  $('img,embed').each(function(i, img) {
      var $img = $(img);
      var t = new Image();
      var src = t.src = $img.attr('src');
      var width = t.width;
      var height = t.height;
      t = null;
      if(width < 300 || height < 300 || imgs_cache[src]) return;
      imgs_cache[src] = $img;

      var tb = tb_template({
          img: {
            src: src
          , width: width
          , height: height
          }
      });
      var $tb = $(tb);
      $tb.appendTo($imgs_stage);
      $tb.live('click', function() {

      });
  });
}

function loadPageLinks() {
  $('a img').each(function(i, img) {
      var $img = $(img);
      var $link = $img.parent('a');

      var href = $link.attr('href');
      if(href.indexOf('#') == 0 || href.indexOf('javascript') == 0) return;
      if(links_cache[href]) return;
      links_cache[href] = $link;

      var $wrap = $link.parent();
      if($wrap.find('a').length > 1) {
        $wrap = null;
      }

      var text = $.trim($link.text())
        || $.trim($link.attr('title'))
        || $.trim($img.attr('title'))
        || ($wrap && $wrap.text())
        ;

      var width = $img.width();
      var height = $img.height();

      var tb = tb_template({
          img: {
            src: $img.attr('src')
          , width: $img.width() 
          , height: $img.height()
          }
        , link: {
            href: href
          , text: text
          }
      });
      var $tb = $(tb);
      $tb.appendTo($links_stage);
      $tb.live('click', function() {

      });
  });
}

window.__IMGKO_MAIN__ = function() {
  $('#imgko-main-dialog').modal();
  loadPageImages();
  loadPageLinks();
}
__IMGKO_MAIN__();

})( window );
