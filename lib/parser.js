var jsdom  = require('jsdom')
  , config = require('../config')
  , request = require('request')

exports.jQueryify = function(html, callback) {
  jsdom.env(html, function(err, window) {
      jsdom.jQueryify(window, 'jquery.js', function(){
          callback(err, window);
      });
      // make sure close
      setTimeout(function() {
          if(window) window.close();
      }, 500);
  })
}

exports.getAllImages = function(html, callback) {
  exports.jQueryify(html, function(err, window) {
      if(err) {return callback(err);}
      var $ = window.$;
      callback(null, $('img'), $)
  })
}
