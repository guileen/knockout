(function( window ) {

// from nothing.js
// this function is use to strip url not validation
function parseUrl (url) {
  var r = /^(\w+):\/\/([^\/\?#]+)(\/[^\?#]*)?(\?[^#]*)?(#.*)?$/i.exec(url);
  return r && {
    schema : r[1]
  , domain : r[2]
  , root : r[1] + '://' + r[2]
  , path : r[3]
  , querystring : r[4]
  , anchor : r[5]
  };
}

// QueryString
function parseQueryString(queryString) {
  var result = {};
  if (!queryString) queryString = location.search.replace(/^\?|#.*$/g, '');

  for (var i = 0, pairs = queryString.split('&'), pair; i < pairs.length; i++) {
    pair = pairs[i].split('=');
    result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return result;
}

function buildQueryString(obj) {
  var qs = [], name;
  for (name in obj) {
    qs.push(encodeURIComponent(name) + '=' + encodeURIComponent(obj[name]));
  }
  return qs.join('&');
}
// ------- end nothing.js

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
      // width = img.natureWidth; // is not works on IE
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
      var width = $img.width();
      var height = $img.height();
      if(width < 50 || height < 50) return;
      var src = $img.attr('src');

      var $link = $img.parent('a');
      var href = $link.attr('href');

      if(href.indexOf('#') == 0 || href == src || href.indexOf('javascript') == 0) {
        // weibo
        var action_data = $link.attr('action-data');
        if(action_data) {
          var weibo_qs = parseQueryString(action_data);
          if(weibo_qs) {
            href = weibo_qs.mlink;
          }
        }
        if(!href) return;
      }

      if(links_cache[href]) return;
      links_cache[href] = $link;

      var $wrap = $link.parent();
      if($wrap.find('a').length > 1) {
        $wrap = null;
      }

      var text = midTrim($link.text())
        || midTrim($link.attr('title'))
        || midTrim($img.attr('title'))
        || midTrim($wrap && $wrap.text())
        || midTrim(href, 15, 10);
        ;


      var tb = tb_template({
          img: {
            src: src
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

function midTrim(text, nleft, nright) {
  if(!text) return;
  var text = $.trim(text).replace(/https?:\/\/(www.)?/, '');
  if(nleft == undefined) {
    nleft = 4;
  }
  if(nright == undefined) {
    nright = 4;
  }
  max = nleft + nright + 2;
  if(text.length < max) return text;
  var nleft = nright = max/2 - 2;
  var left = text.substring(0, nleft);
  var right = text.substring(text.length - nright);
  return left + '...' + right;
}

window.__IMGKO_MAIN__ = function() {
  $('#imgko-main-dialog').modal();
  loadPageImages();
  loadPageLinks();
}
__IMGKO_MAIN__();

window.__IMGKO_LOADED__ = true;
})( window );
