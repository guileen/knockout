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

  app.get('/api/pkimages', function(req, res) {


      var user = req.session.username
        , user_images = user + ':images'
        ;
      service.getPkImages(req.session.username, function(err, data) {
          if(err) {return next(err);}
          res.json(data);
      })
  })

  app.get('/jsonp/mark', function(req, res, next) {
      var postData = req.query;
      var pageImages = JSON.parse(postData.pageImages);
      var linkImages = JSON.parse(postData.linkImages);
      console.log(pageImages)
      console.log(linkImages)
  })
}
