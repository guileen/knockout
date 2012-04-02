(function( window ) {
var html = marklet_template();
$(html).appendTo(document.body);

window.__IMGKO_MAIN__ = function() {
  $('#imgko-main-dialog').modal();
}
__IMGKO_MAIN__();
})( window );
