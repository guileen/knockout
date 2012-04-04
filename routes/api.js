var exports = module.exports = function(app) {

  var redis = require('redis').createClient()
    , config = require('../config')
    , request = require('request')
    , fs = require('fs')
    , myconsole = require('myconsole')
    , crypto = require('crypto')
    , async = require('async');

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
      redis.zrevrange(user_images, 0, 1000, function(err, imageids) {
          if(err) {return next(err);}
          async.map(imageids, function(imageid, _callback) {
              redis.multi()
              .hgetall(imageid)
              .smembers(imageid + ':KO')
              .smembers(imageid + ':KOby')
              .exec(function(err, data) {
                  if(err) {return _callback(err);}
                  if(!data[0]) {
                    console.log(imageid + ' can not load')
                    console.log(data)
                    return _callback(null)
                  }
                  var image = data[0]
                    , ko = image.ko = data[1]
                    , koby = image.koby = data[2]
                    ;
                  image.id = imageid;
                  image.sort = (ko ? ko.length : 0) + (koby ? koby.length : 0);
                  _callback(err, image);
              });
          }, function(err, images) {

            var foundPair = false;
            var imagei, imagej;

            images = images.filter(function(image) { return image })

            // sort by vote count to compare images never compared
            var sortImages = images.filter(function(image) { return image.sort < 2 });

            sortImages.sort(function(a, b) {
                return a.sort > b.sort
            });

            // 无人比较的图片优先
            for(var i = 0; i < sortImages.length - 1; i++) {
              imagei = sortImages[i];
              for(var j = i + 1; j < images.length; j++) {
                imagej = sortImages[j];
                if(!isCompared(imagei, imagej)) {
                  foundPair = true;
                  i = j = images.length;
                }
              }
            }

            // 有人比较的图片优先比较得分较高排名相近的
            if(!foundPair) {
              for(var off = 1; off < images.length; off++) {
                for(var i = 0; i < images.length - off; i++) {
                  imagei = images[i];
                  imagej = images[i + off];
                  if(!isCompared(imagei, imagej)) {
                    foundPair = true;
                    off = i = images.length;
                  }
                }
              }
            }

            if(err) {return next(err);}
            res.json({
                hotImages: images.slice(0, 100)
              , foundPair: foundPair
              , pkImages: [imagei, imagej]
            });
          });
      });
  })
}
