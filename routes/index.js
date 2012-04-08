var exports = module.exports = function(app) {

  var redis = require('redis').createClient()
    , config = require('../config')
    , request = require('request')
    , fs = require('fs')
    , myconsole = require('myconsole')
    , crypto = require('crypto')
    , async = require('async')
    , service = require('../lib')
    ;

  app.get('/ko', function(req, res){
      // TODO staticfy
      res.render('index');
  });

  app.get('/pop', function(req, res, next) {
      res.redirect('/mark');
  })

  app.get('/', function(req, res, next) {
      res.render('mark', {
          pageid: 'mark'
      })
  })

  app.get('/mark', function(req, res, next) {
      res.render('mark', {
          pageid: 'mark'
      })
  })

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

      service.addImage(user, {url: imageurl}, function(err, data) {
          if(err) {return next(err);}
          res.redirect('/');
      })

  });

  app.get('/:imageid/remove', function(req, res, next) {
      var imageid = req.params.imageid
        , user = req.session.username
        ;
      service.removeImage(user, imageid, function(err, data) {
          if(err) {return next(err);}
          res.redirect('/ko');
      })
  })

  app.get('/:imageid/reload', function(req, res, next) {
      var imageid = req.params.imageid
        , filename = imageid.substring(6)
        , tempFilename = config.tmpUploadFolder + filename
        , realFilename = config.uploadFoler + filename
        ;

      redis.hget(imageid, 'url', function(err, url) {
          if(err) {return next(err);}
          if(!url) return next(imageid + ' not found');
          var crawler = request({url: url, headers : {
                Referer: url
          }});
          crawler.pipe(res);
          crawler.pipe(fs.createWriteStream(tempFilename));
          crawler.on('error', function(err) {
              console.traceError(err);
              res.end();
          });
          crawler.on('end', function() {
              fs.rename(tempFilename, realFilename, function(err) {
                  if(err) {return console.traceError(err);}
                  service.updateImageLink(imageid, config.uploadRoot + filename, console.ifError);
              });
          })
      })
  })

  app.get('/:imageid/thumbnail', function(req, res, next) {
      var imageid = req.params.imageid
      service.reloadThumbnail(imageid, function(err, data) {
          if(err) {return next(err);}
          fs.createReadStream(data.tbFilename).pipe(res);
      })
  })

  app.get('/:left/ko/:right', function(req, res, next) {
      // left + 1
      // right - 1
      var left = req.params.left
        , right = req.params.right
        , user = req.session.username
        , user_images = user + ':images'
        ;
      service.koImage(user, left, right, function(err, data) {
          if(err) {return next(err);}
          res.redirect('/ko');
      })
  });

  app.get('/search', function(req, res, next) {
      var keyword = req.query.q
        , username = req.session.username;

      service.queueSearch(req.session.username, keyword, function(err, data) {
          if(err) {return next(err);}
          res.redirect('/');
      })

  });

  app.get('/test-marklet', function(req, res, next) {
      res.render('test-marklet', {

      });
  })

}
