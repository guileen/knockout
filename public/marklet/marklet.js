/*!
 * Marklet
 *
 * v0.1
 *
 * Sat Apr 14 2012 10:24:41 GMT+0800 (CST)
 */
(function(window, undefined) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var $ = jQuery = jQuery.noConflict();

/* ===================================================
 * bootstrap-transition.js v2.0.2
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function( $ ) {

  $(function () {

    "use strict"

    /* CSS TRANSITION SUPPORT (https://gist.github.com/373874)
     * ======================================================= */

    $.support.transition = (function () {
      var thisBody = document.body || document.documentElement
        , thisStyle = thisBody.style
        , support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined

      return support && {
        end: (function () {
          var transitionEnd = "TransitionEnd"
          if ( $.browser.webkit ) {
          	transitionEnd = "webkitTransitionEnd"
          } else if ( $.browser.mozilla ) {
          	transitionEnd = "transitionend"
          } else if ( $.browser.opera ) {
          	transitionEnd = "oTransitionEnd"
          }
          return transitionEnd
        }())
      }
    })()

  })

}( jQuery );

/* ===========================================================
 * bootstrap-tooltip.js v2.0.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function( $ ) {

  "use strict"

 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function ( element, options ) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function ( type, element, options ) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger != 'manual') {
        eventIn  = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut, this.options.selector, $.proxy(this.leave, this))
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function ( options ) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function ( e ) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) {
        self.show()
      } else {
        self.hoverState = 'in'
        setTimeout(function() {
          if (self.hoverState == 'in') {
            self.show()
          }
        }, self.options.delay.show)
      }
    }

  , leave: function ( e ) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.hide) {
        self.hide()
      } else {
        self.hoverState = 'out'
        setTimeout(function() {
          if (self.hoverState == 'out') {
            self.hide()
          }
        }, self.options.delay.hide)
      }
    }

  , show: function () {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        inside = /in/.test(placement)

        $tip
          .remove()
          .css({ top: 0, left: 0, display: 'block' })
          .appendTo(inside ? this.$element : $('.imgko-container')[0]/* document.body */)

        pos = this.getPosition(inside)

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (inside ? placement.split(' ')[1] : placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        $tip
          .css(tp)
          .addClass(placement)
          .addClass('in')
      }
    }

  , setContent: function () {
      var $tip = this.tip()
      $tip.find('.tooltip-inner').html(this.getTitle())
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).remove()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.remove()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.remove()
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function (inside) {
      return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      title = (title || '').toString().replace(/(^\s*|\s*$)/, "")

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function () {
      this[this.tip().hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , delay: 0
  , selector: false
  , placement: 'top'
  , trigger: 'hover'
  , title: ''
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  }

}( jQuery );

/* ===========================================================
 * bootstrap-popover.js v2.0.2
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function( $ ) {

 "use strict"

  var Popover = function ( element, options ) {
    this.init('popover', element, options)
  }

  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[ $.type(title) == 'object' ? 'append' : 'html' ](title)
      $tip.find('.popover-content > *')[ $.type(content) == 'object' ? 'append' : 'html' ](content)

      $tip.removeClass('fade top bottom left right in')
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent()
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options

      content = $e.attr('data-content')
        || (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)

      content = content.toString().replace(/(^\s*|\s*$)/, "")

      return content
    }

  , tip: function() {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  })


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  $.fn.popover = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
  })

}( jQuery );
/* =========================================================
 * bootstrap-modal.js v2.0.1
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function( $ ){

  "use strict"

 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function ( content, options ) {
    this.options = options
    this.$element = $(content)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this

        if (this.isShown) return

        $('body').addClass('imgko-modal-open')

        this.isShown = true
        this.$element.trigger('show')
        this.$element.removeClass('hide')

        escape.call(this)
        backdrop.call(this, function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          !that.$element.parent().length && that.$element.appendTo(document.body) //don't move modals dom position

          that.$element
            .show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element.addClass('in')

          transition ?
            // that.$element.one($.support.transition.end, function () { that.$element.trigger('shown') }) :
            callbackWithTransition(that.$element, function() { that.$element.trigger('shown') }) :
            that.$element.trigger('shown')

        })
      }

    , hide: function ( e ) {
        e && e.preventDefault()

        if (!this.isShown) return

        var that = this
        this.isShown = false

        $('body').removeClass('imgko-modal-open')

        escape.call(this)

        this.$element
          .trigger('hide')
          .removeClass('in')

        $.support.transition && this.$element.hasClass('fade') ?
          hideWithTransition.call(this) :
          hideModal.call(this)
      }

  }


 /* MODAL PRIVATE METHODS
  * ===================== */

  function hideWithTransition() {
    var that = this
      , timeout = setTimeout(function () {
          that.$element.off($.support.transition.end)
          hideModal.call(that)
        }, 500)

    this.$element.one($.support.transition.end, function () {
      clearTimeout(timeout)
      hideModal.call(that)
    })
  }

  // 防止某些页面 transition.end 事件失败
  function callbackWithTransition($el, callback) {
    function doCallback() {
      if (callback)callback();
      callback = null;
    }
    $el.one($.support.transition.end, doCallback)
    setTimeout(doCallback, 500);
  }

  function hideModal( that ) {
    this.$element
      .hide()
      .trigger('hidden')

    backdrop.call(this)
  }

  function backdrop( callback ) {
    var that = this
      , animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="imgko-modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      if (this.options.backdrop != 'static') {
        this.$backdrop.click($.proxy(this.hide, this))
      }

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      doAnimate ?
        // this.$backdrop.one($.support.transition.end, callback) :
        callbackWithTransition(this.$backdrop, callback) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        // this.$backdrop.one($.support.transition.end, $.proxy(removeBackdrop, this)) :
        callbackWithTransition(this.$backdrop, $.proxy(removeBackdrop, this)) :
        removeBackdrop.call(this)
    } else if (callback) {
      callback()
    }
  }

  function removeBackdrop() {
    this.$backdrop.remove()
    this.$backdrop = null
  }

  function escape() {
    var that = this
    if (this.isShown && this.options.keyboard) {
      $(document).on('keyup.dismiss.modal', function ( e ) {
        e.which == 27 && that.hide()
      })
    } else if (!this.isShown) {
      $(document).off('keyup.dismiss.modal')
    }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  $.fn.modal = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  $.fn.modal.Constructor = Modal


 /* MODAL DATA-API
  * ============== */

  $(function () {
    $('body').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
      var $this = $(this), href
        , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
        , option = $target.data('modal') ? 'toggle' : $.extend({}, $target.data(), $this.data())

      e.preventDefault()
      $target.modal(option)
    })
  })

}( jQuery );


var jade = (function(exports){
/*!
 * Jade - runtime
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Lame Array.isArray() polyfill for now.
 */

if (!Array.isArray) {
  Array.isArray = function(arr){
    return '[object Array]' == Object.prototype.toString.call(arr);
  };
}

/**
 * Lame Object.keys() polyfill for now.
 */

if (!Object.keys) {
  Object.keys = function(obj){
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  } 
}

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

exports.attrs = function attrs(obj){
  var buf = []
    , terse = obj.terse;
  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;
  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];
      if ('boolean' == typeof val || null == val) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else if ('class' == key && Array.isArray(val)) {
        buf.push(key + '="' + exports.escape(val.join(' ')) + '"');
      } else {
        buf.push(key + '="' + exports.escape(val) + '"');
      }
    }
  }
  return buf.join(' ');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno){
  if (!filename) throw err;

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno 
    + '\n\n' + err.message;
  throw err;
};

exports.templates = {};

  return exports;

})({});

var stage_template = function(locals){ var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(' class="imgko-container"')
buf.push('><!-- #myModal.modal.fade.hide--><!--   .modal-header--><!--     h1 ffff--><!--     a.close(data-dismiss=\'modal\')x--><!--   .modal-body--><!--     p on fine body--><!--   .modal-footer--><!--     a.btn.btn-primary 采集--><div');
buf.push(' id="imgko-main-dialog" class="modal hide fade"')
buf.push('><div');
buf.push(' class="modal-header"')
buf.push('><div');
buf.push(' data-dismiss="modal" class="close"')
buf.push('>&times;</div><h3>采集图片</h3><div');
buf.push(' class="btn-group"')
buf.push('><a');
buf.push(' class="btn dropdown"')
buf.push('>全选</a><a');
buf.push(' class="btn"')
buf.push('>全不选</a></div></div><div');
buf.push(' class="modal-body"')
buf.push('><h4>本页图片</h4><div');
buf.push(' class="imgs-stage"')
buf.push('></div><hr');
buf.push('')
buf.push('/><h4>链接</h4><div');
buf.push(' class="links-stage"')
buf.push('></div><!-- h4 Text in a modal--><!-- p Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem.--><!-- <hr>--><!-- h4 Overflowing text to show optional scrollbar--><!-- p We set a fixed <code>max-height</code> on the <code>.modal-body</code>. Watch it overflow with all this extra lorem ipsum text we\'ve included.--></div><div');
buf.push(' class="modal-footer"')
buf.push('><div');
buf.push(' class="row"')
buf.push('><label>nextPage</label><input');
buf.push(attrs({ 'name':('nextlink'), 'value':(nextLink) }));
buf.push('/></div><!-- form--><div');
buf.push(' class="row"')
buf.push('><textarea');
buf.push(' name="description" class="description"')
buf.push('>' + escape((interp = title) == null ? '' : interp) + '</textarea></div><div');
buf.push(' class="btn-toolbar"')
buf.push('><div');
buf.push(' class="btn-group"')
buf.push('><a');
buf.push(' href="#" data-dismiss="modal" class="btn btn-danger"')
buf.push('>Close</a></div><div');
buf.push(' class="btn-group"')
buf.push('><a');
buf.push(' href="#" data-dismiss="modal" class="submit btn btn-primary"')
buf.push('>Save changes</a></div></div></div></div></div>');
}
return buf.join("");}

var tb_template = function(locals){ var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<a');
buf.push(' href="#" class="imgfoo"')
buf.push('><img');
buf.push(attrs({ 'src':(img.src), "class": ('thumbnail') + ' ' + ('thumbnail-small') }));
buf.push('/>');
if ((banned))
{
buf.push('<i');
buf.push(' class="select icon-ban-circle"')
buf.push('></i>');
}
else
{
buf.push('<i');
buf.push(' class="select icon-ok"')
buf.push('></i>');
}
if ((locals.link))
{
buf.push('<span>' + escape((interp = link.text || link.href) == null ? '' : interp) + '</span>');
}
else
{
buf.push('<span>' + escape((interp = img.width) == null ? '' : interp) + ' x ' + escape((interp = img.height) == null ? '' : interp) + '</span>');
}
buf.push('</a>');
}
return buf.join("");}



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
        url: 'http://dev:3000/jsonp/mark'
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


})(window/*, undefined*/);
