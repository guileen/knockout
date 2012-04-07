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

var postData = {
  pageImages : {}
, linkImages : {}
};

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
      var banned = width < 400 || height < 400;

      var tb = tb_template({
          img: {
            src: src
          , width: width
          , height: height
          }
        , banned: banned
      });

      var $tb = $(tb);
      var $select = $tb.find('i.select');
      $tb.appendTo($imgs_stage);

      // TODO simple this
      postData.pageImages[src] = {
        text: ''//TODO text
      }

      function updateImage(banned) {
        if(banned) {
          delete postData.pageImages[src];
        } else {
          postData.pageImages[src] = {
            url: src
          , width: width
          , height: height
          , text: $img.attr('title') || $img.attr('alt')
          }
        }
      }
      $tb.on('click', function() {
          $select.toggleClass('icon-ban-circle');
          $select.toggleClass('icon-ok');
          banned == !banned;
          updateImage(banned);
      });

      updateImage(banned);
  });
}

function loadPageLinks() {
  $('a img').each(function(i, img) {
      var $img = $(img);
      console.log($img.parents('.imgko-container'));
      if($img.parents('.imgko-container').length) return;
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

      var text = $.trim($link.text())
        || $.trim($link.attr('title'))
        || $.trim($img.attr('title'))
        || $.trim($wrap && $wrap.text())
        || $.trim(href, 15, 10);

      var tbText = midTrim(text);

      var banned = width < 50 || height < 50 || ! text;

      var tb = tb_template({
          img: {
            src: src
          , width: width
          , height: height
          }
        , link: {
            href: href
          , text:tbText
          }
        , banned: banned
      });
      var $tb = $(tb);
      var $select = $tb.find('i.select');
      $tb.appendTo($links_stage);

      function updateLink(banned) {
          if(banned) {
            delete postData.linkImages[href]
          } else {
            postData.linkImages[href] = {
              href: href // target
            , text: text
            , tbUrl: src
            , tbWidth: width
            , tbHeight: height
            , tbText: tbText
            }
          }
      }

      $tb.on('click', function() {
          $select.toggleClass('icon-ban-circle');
          $select.toggleClass('icon-ok');
          banned = !banned;
          updateLink(banned);
      });

      updateLink(banned);
  });
}

// trim text from middle
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

var $textarea = $container.find('textarea.description');
$container.find('a.submit').on('click', function() {
    var text = $textarea.val();
    console.log(text);
    // TODO fix for IE length > 2048
    var pageImages = []
      , linkImages = []
      ;
    for(var name in postData.pageImages) {
      pageImages.push(postData.pageImages[name])
    }
    for(var name in postData.linkImages) {
      linkImages.push(postData.linkImages[name])
    }
    var data = {
      meta : JSON.stringify({
          text : text
        , link : location.href
        , ua : $.browser
      })
    , pageImages: JSON.stringify(pageImages)
    , linkImages: JSON.stringify(linkImages)
    }
    console.log(data.pageImages.length);
    console.log(data.linkImages.length);
    $.ajax({
        url: '@BASE_URL/jsonp/mark'
      , data: data
      , dataType: 'jsonp'
    });
    $('#imgko-main-dialog').modal('hide');
})

window.__IMGKO_MAIN__ = function() {
  $('#imgko-main-dialog').modal();
  loadPageImages();
  loadPageLinks();
}
__IMGKO_MAIN__();

window.__IMGKO_LOADED__ = true;
})( window );
