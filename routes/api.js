var exports = module.exports = function(app) {

  var redis = require('redis').createClient()
    , config = require('../config')
    , request = require('request')
    , fs = require('fs')
    , myconsole = require('myconsole')
    , crypto = require('crypto')
    , async = require('async')
    , service = require('../lib')

  function isCompared(imagei, imagej) {
    return (imagei.ko && imagei.ko.indexOf(imagej.id) >= 0) ||
           (imagej.ko && imagej.ko.indexOf(imagei.id) >= 0);
  }

  function joinImageId(images, exclude) {
    return images.filter(function(i) {
        return i != exclude;
    }).map(function(i) {
        return i.id;
    }).join('--');
  }

  app.get('/api/topimages', function(req, res) {

  });

  app.get('/api/markimages', function(req, res) {
      var user = req.session.username;
      service.getMarkImages(user, function(err, data) {
          if(err) {return next(err);}
          res.json(data);
      })
  })

  app.get('/api/pkimages', function(req, res) {
      var user = req.session.username;
      service.getPkImages(user, function(err, data) {
          if(err) {return next(err);}
          res.json({
              // TODO simplefy this
              pkImages: data.pkImages
              // remove hotImages in ko page
            , hotImages: []
            , foundPair: data.foundPair
          });
      })
  })

  app.get('/jsonp/mark', function(req, res, next) {
      var meta = JSON.parse(req.query.meta);
      var pageImages = JSON.parse(req.query.pageImages);
      var linkImages = JSON.parse(req.query.linkImages);
      var user = req.session.username;

      async.parallel([
          function(_callback) {
            service.queueAddImages(user, meta, pageImages, _callback);
          }
        , function(_callback) {
            service.queueAddLinks(user, meta, linkImages, _callback)
        }]
      , function(err, data) {
          if(err) return next(err);
          res.json(data);
      })
  })
}
