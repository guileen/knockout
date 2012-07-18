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

/*
 * Readability. An Arc90 Lab Experiment. 
 * Website: http://lab.arc90.com/experiments/readability
 * Source:  http://code.google.com/p/arc90labs-readability
 *
 * "Readability" is a trademark of Arc90 Inc and may not be used without explicit permission. 
 *
 * Copyright (c) 2010 Arc90 Inc
 * Readability is licensed under the Apache License, Version 2.0.
 **/
var readability = {
  version:                '1.7.1',
  emailSrc:               'http://lab.arc90.com/experiments/readability/email.php',
  iframeLoads:             0,
  convertLinksToFootnotes: false,
  reversePageScroll:       false, /* If they hold shift and hit space, scroll up */
  frameHack:               false, /**
   * The frame hack is to workaround a firefox bug where if you
   * pull content out of a frame and stick it into the parent element, the scrollbar won't appear.
   * So we fake a scrollbar in the wrapping div.
   **/
  biggestFrame:            false,
  bodyCache:               null,   /* Cache the body HTML in case we need to re-use it later */
  flags:                   0x1 | 0x2 | 0x4,   /* Start with all flags set. */

  /* constants */
  FLAG_STRIP_UNLIKELYS:     0x1,
  FLAG_WEIGHT_CLASSES:      0x2,
  FLAG_CLEAN_CONDITIONALLY: 0x4,

  maxPages:    30, /* The maximum number of pages to loop through before we call it quits and just show a link. */
  parsedPages: {}, /* The list of pages we've parsed in this call of readability, for autopaging. As a key store for easier searching. */
  pageETags:   {}, /* A list of the ETag headers of pages we've parsed, in case they happen to match, we'll know it's a duplicate. */

  /**
   * All of the regular expressions in use within readability.
   * Defined up here so we don't instantiate them repeatedly in loops.
   **/
  regexps: {
    unlikelyCandidates:    /combx|comment|community|disqus|extra|foot|header|menu|remark|rss|shoutbox|sidebar|sponsor|ad-break|agegate|pagination|pager|popup|tweet|twitter/i,
    okMaybeItsACandidate:  /and|article|body|column|main|shadow/i,
    positive:              /article|body|content|entry|hentry|main|page|pagination|post|text|blog|story/i,
    negative:              /combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|shopping|tags|tool|widget/i,
    extraneous:            /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single/i,
    divToPElements:        /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
    replaceBrs:            /(<br[^>]*>[ \n\r\t]*){2,}/gi,
    replaceFonts:          /<(\/?)font[^>]*>/gi,
    trim:                  /^\s+|\s+$/g,
    normalize:             /\s{2,}/g,
    killBreaks:            /(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,
    videos:                /http:\/\/(www\.)?(youtube|vimeo)\.com/i,
    skipFootnoteLink:      /^\s*(\[?[a-z0-9]{1,2}\]?|^|edit|citation needed)\s*$/i,
    nextLink:              /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i, // Match: next, continue, >, >>, » but not >|, »| as those usually mean last.
    prevLink:              /(prev|earl|old|new|<|«)/i
  },


    /**
     * Get the inner text of a node - cross browser compatibly.
     * This also strips out any excess whitespace to be found.
     *
     * @param Element
     * @return string
    **/
    getInnerText: function (e, normalizeSpaces) {
        var textContent    = "";

        if(typeof(e.textContent) === "undefined" && typeof(e.innerText) === "undefined") {
            return "";
        }

        normalizeSpaces = (typeof normalizeSpaces === 'undefined') ? true : normalizeSpaces;

        if (navigator.appName === "Microsoft Internet Explorer") {
            textContent = e.innerText.replace( readability.regexps.trim, "" ); }
        else {
            textContent = e.textContent.replace( readability.regexps.trim, "" ); }

        if(normalizeSpaces) {
            return textContent.replace( readability.regexps.normalize, " "); }
        else {
            return textContent; }
    },
}

/**
 * Find a cleaned up version of the current URL, to use for comparing links for possible next-pageyness.
 *
 * @author Dan Lacy
 * @return string the base url
 **/
function findBaseUrl () {
  var noUrlParams     = window.location.pathname.split("?")[0],
      urlSlashes      = noUrlParams.split("/").reverse(),
      cleanedSegments = [],
      possibleType    = "";

  for (var i = 0, slashLen = urlSlashes.length; i < slashLen; i+=1) {
    var segment = urlSlashes[i];

    // Split off and save anything that looks like a file type.
    if (segment.indexOf(".") !== -1) {
      possibleType = segment.split(".")[1];

      /* If the type isn't alpha-only, it's probably not actually a file extension. */
      if(!possibleType.match(/[^a-zA-Z]/)) {
        segment = segment.split(".")[0];                    
      }
    }

    /**
     * EW-CMS specific segment replacement. Ugly.
     * Example: http://www.ew.com/ew/article/0,,20313460_20369436,00.html
     **/
    if(segment.indexOf(',00') !== -1) {
      segment = segment.replace(',00', '');
    }

    // If our first or second segment has anything looking like a page number, remove it.
    if (segment.match(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i) && ((i === 1) || (i === 0))) {
      segment = segment.replace(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i, "");
    }


    var del = false;

    /* If this is purely a number, and it's the first or second segment, it's probably a page number. Remove it. */
    if (i < 2 && segment.match(/^\d{1,2}$/)) {
      del = true;
    }

    /* If this is the first segment and it's just "index", remove it. */
    if(i === 0 && segment.toLowerCase() === "index") {
      del = true;
    }

    /* If our first or second segment is smaller than 3 characters, and the first segment was purely alphas, remove it. */
    if(i < 2 && segment.length < 3 && !urlSlashes[0].match(/[a-z]/i)) {
      del = true;
    }

    /* If it's not marked for deletion, push it to cleanedSegments. */
    if (!del) {
      cleanedSegments.push(segment);
    }
  }

  // This is our final, cleaned, base article URL.
  return window.location.protocol + "//" + window.location.host + cleanedSegments.reverse().join("/");
}

/**
 * Look for any paging links that may occur within the document.
 * 
 * @param body
 * @return object (array)
 **/
function findNextPageLink (elem) {
  var possiblePages = {},
      allLinks = elem.getElementsByTagName('a'),
      articleBaseUrl = findBaseUrl();

  /**
   * Loop through all links, looking for hints that they may be next-page links.
   * Things like having "page" in their textContent, className or id, or being a child
   * of a node with a page-y className or id.
   *
   * Also possible: levenshtein distance? longest common subsequence?
   *
   * After we do that, assign each page a score, and 
   **/
  for(var i = 0, il = allLinks.length; i < il; i+=1) {
    var link     = allLinks[i],
        linkHref = allLinks[i].href.replace(/#.*$/, '').replace(/\/$/, '');

    /* If we've already seen this page, ignore it */
    if(linkHref === "" || linkHref === articleBaseUrl || linkHref === window.location.href || linkHref in readability.parsedPages) {
      continue;
    }

    /* If it's on a different domain, skip it. */
    if(window.location.host !== linkHref.split(/\/+/g)[1]) {
      continue;
    }

    var linkText = readability.getInnerText(link);

    /* If the linkText looks like it's not the next page, skip it. */
    if(linkText.match(readability.regexps.extraneous) || linkText.length > 25) {
      continue;
    }

    /* If the leftovers of the URL after removing the base URL don't contain any digits, it's certainly not a next page link. */
    var linkHrefLeftover = linkHref.replace(articleBaseUrl, '');
    if(!linkHrefLeftover.match(/\d/)) {
      continue;
    }

    if(!(linkHref in possiblePages)) {
      possiblePages[linkHref] = {"score": 0, "linkText": linkText, "href": linkHref};             
    } else {
      possiblePages[linkHref].linkText += ' | ' + linkText;
    }

    var linkObj = possiblePages[linkHref];

    /**
     * If the articleBaseUrl isn't part of this URL, penalize this link. It could still be the link, but the odds are lower.
     * Example: http://www.actionscript.org/resources/articles/745/1/JavaScript-and-VBScript-Injection-in-ActionScript-3/Page1.html
     **/
    if(linkHref.indexOf(articleBaseUrl) !== 0) {
      linkObj.score -= 25;
    }

    var linkData = linkText + ' ' + link.className + ' ' + link.id;
    if(linkData.match(readability.regexps.nextLink)) {
      linkObj.score += 50;
    }
    if(linkData.match(/pag(e|ing|inat)/i)) {
      linkObj.score += 25;
    }
    if(linkData.match(/(first|last)/i)) { // -65 is enough to negate any bonuses gotten from a > or » in the text, 
      /* If we already matched on "next", last is probably fine. If we didn't, then it's bad. Penalize. */
      if(!linkObj.linkText.match(readability.regexps.nextLink)) {
        linkObj.score -= 65;
      }
    }
    if(linkData.match(readability.regexps.negative) || linkData.match(readability.regexps.extraneous)) {
      linkObj.score -= 50;
    }
    if(linkData.match(readability.regexps.prevLink)) {
      linkObj.score -= 200;
    }

    /* If a parentNode contains page or paging or paginat */
    var parentNode = link.parentNode,
        positiveNodeMatch = false,
        negativeNodeMatch = false;
    while(parentNode) {
      var parentNodeClassAndId = parentNode.className + ' ' + parentNode.id;
      if(!positiveNodeMatch && parentNodeClassAndId && parentNodeClassAndId.match(/pag(e|ing|inat)/i)) {
        positiveNodeMatch = true;
        linkObj.score += 25;
      }
      if(!negativeNodeMatch && parentNodeClassAndId && parentNodeClassAndId.match(readability.regexps.negative)) {
        /* If this is just something like "footer", give it a negative. If it's something like "body-and-footer", leave it be. */
        if(!parentNodeClassAndId.match(readability.regexps.positive)) {
          linkObj.score -= 25;
          negativeNodeMatch = true;                       
        }
      }

      parentNode = parentNode.parentNode;
    }

    /**
     * If the URL looks like it has paging in it, add to the score.
     * Things like /page/2/, /pagenum/2, ?p=3, ?page=11, ?pagination=34
     **/
    if (linkHref.match(/p(a|g|ag)?(e|ing|ination)?(=|\/)[0-9]{1,2}/i) || linkHref.match(/(page|paging)/i)) {
      linkObj.score += 25;
    }

    /* If the URL contains negative values, give a slight decrease. */
    if (linkHref.match(readability.regexps.extraneous)) {
      linkObj.score -= 15;
    }

    /**
     * Minor punishment to anything that doesn't match our current URL.
     * NOTE: I'm finding this to cause more harm than good where something is exactly 50 points.
     *       Dan, can you show me a counterexample where this is necessary?
     * if (linkHref.indexOf(window.location.href) !== 0) {
     *    linkObj.score -= 1;
     * }
     **/

    /**
     * If the link text can be parsed as a number, give it a minor bonus, with a slight
     * bias towards lower numbered pages. This is so that pages that might not have 'next'
     * in their text can still get scored, and sorted properly by score.
     **/
    var linkTextAsNumber = parseInt(linkText, 10);
    if(linkTextAsNumber) {
      // Punish 1 since we're either already there, or it's probably before what we want anyways.
      if (linkTextAsNumber === 1) {
        linkObj.score -= 10;
      }
      else {
        // Todo: Describe this better
        linkObj.score += Math.max(0, 10 - linkTextAsNumber);
      }
    }
  }

  /**
   * Loop thrugh all of our possible pages from above and find our top candidate for the next page URL.
   * Require at least a score of 50, which is a relatively high confidence that this page is the next link.
   **/
  var topPage = null;
  for(var page in possiblePages) {
    if(possiblePages.hasOwnProperty(page)) {
      if(possiblePages[page].score >= 50 && (!topPage || topPage.score < possiblePages[page].score)) {
        topPage = possiblePages[page];
      }
    }
  }

  if(topPage) {
    var nextHref = topPage.href.replace(/\/$/,'');

    console.log('NEXT PAGE IS ' + nextHref);
    readability.parsedPages[nextHref] = true;
    return nextHref;            
  }
  else {
    return null;
  }
}
// ---- end Readability ----

var nextLink = findNextPageLink(document.body);
console.log(nextLink);

var html = stage_template({
    title: document.title
  , nextLink: nextLink
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
          , text: $img.attr('title') || $img.attr('alt') || ''
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
      if(href == src) return;
      if(href.indexOf('#') == 0 || href.indexOf('javascript') == 0) {
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

function loadNextPage() {
  // TODO move to serverside to find next page link
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
