var exports = module.exports = function(app) {

  var redis = require('redis').createClient()
    , async = require('async');

  function isCompared(imagei, imagej) {
    return (imagei.ko && imagei.ko.indexOf(imagej.id) >= 0) ||
           (imagej.ko && imagej.ko.indexOf(imagei.id) >= 0);
  }

  app.get('/', function(req, res){
      var user = req.session.username
        , user_images = user + ':images'
        ;
      redis.zrange(user_images, 0, 10, function(err, imageids) {
          if(err) {return next(err);}
          async.map(imageids, function(imageid, _callback) {
              redis.multi()
              .hgetall(imageid)
              .smembers(imageid + ':KO')
              .smembers(imageid + ':KOby')
              .exec(function(err, data) {
                  if(err) {return _callback(err);}
                  var image = data[0]
                    , ko = image.ko = data[1]
                    , koby = image.koby = data[2]
                    ;
                  image.id = imageid;
                  // 被击败的计数 *2, 为了让优秀的图片能更多的比较
                  image.sort = (ko ? ko.length : 0) + 2 * (koby ? koby.length : 0);
                  _callback(err, image);
              });
          }, function(err, images) {

            var imagei, imagej;

            // sort by vote count to compare images never compared
            var sortImages = images.slice();
            sortImages.sort(function(a, b) {
                return a.sort > b.sort
            });

            for(var i = 0; i < sortImages.length - 1; i++) {
              imagei = sortImages[i];
              for(var j = i + 1; j < images.length; j++) {
                imagej = sortImages[j];
                if(!isCompared(imagei, imagej)) {
                  i = j = images.length;
                }
              }
            }

            if(err) {return next(err);}
            res.render('index', {
                hotImages: images
              , imageLeft: imagei
              , imageRight: imagej
            });
          });
      });
  });

  app.post('/login', function(req, res, next) {
      req.session.username = req.body.username
      res.redirect('/');
  });

  app.post('/upload', function(req, res, next) {
      var user = req.session.username
        , user_images = user + ':images'
        , imageurl = req.body.imageurl
        ;

      // simplest validation
      if(imageurl.indexOf('http') != 0) {
        return next('input ' + imageurl + ' is not url')
      }

      redis.incr('imageid', function(err, id) {
          if(err) {return next(err);}
          var imageid = 'image:' + id;
          redis.multi()
          .hmset(imageid, {
              url : imageurl
          })
          .zadd(user_images, 0, imageid)
          .exec(function(err, data) {
              if(err) {return next(err);}
              res.redirect('/');
          });
      })
  });

  app.get('/:left/ko/:right', function(req, res, next) {
      // left + 1
      // right - 1
      var left = req.params.left
        , right = req.params.right
        ;
      redis.multi()
      .sadd(left + ':KO', right)
      .sadd(right + ':KOby', left)
      .exec(function(err, data) {
          if(err) {return next(err);}
          res.redirect('/');
      });

  });

}
