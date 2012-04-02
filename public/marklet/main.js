(function( window ) {

var html = stage_template({
    title: document.title
});

$(html).appendTo(document.body);

var $container = $('.imgko-container');
var $stage = $container.find('.ko-stage');
var cache = {};

function getOriginalWidthOfImg($img) {
    return t.width;
}

window.__IMGKO_MAIN__ = function() {
  $('#imgko-main-dialog').modal();
  $('img,embed').each(function(i, img) {
      var $img = $(img);
      var t = new Image();
      var src = t.src = $img.attr('src');
      var width = t.width;
      var height = t.height;
      t = null;
      if(width < 300 || height < 300 || cache[src]) return;
      cache[src] = $img;

      var tb = tb_template({
          img: {
            src: src
          , width: width
          , height: height
          }
      });
      var $tb = $(tb);
      $tb.appendTo($stage);
      $tb.live('click', function() {

      });
  });
}
__IMGKO_MAIN__();

})( window );
