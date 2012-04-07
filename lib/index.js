var config = require('../config')
  , parser = require('./parser')
  , redis = config.redisClient
  , request = require('request')
  , fs = require('fs')
  , myconsole = require('myconsole')
  , crypto = require('crypto')
  , imagemagick = require('imagemagick')
  , async = require('async');

function isCompared(imagei, imagej) {
  return (imagei.ko && imagei.ko.indexOf(imagej.id) >= 0)
    || (imagej.ko && imagej.ko.indexOf(imagei.id) >= 0);
}

function joinImageId(images, exclude) {
  return images.filter(function(i) {
      return i != exclude;
  }).map(function(i) {
      return i.id;
  }).join('--');
}

exports.getPkImages = function(user, callback) {

  var user_images = user + ':images';
  redis.zrevrange(user_images, 0, 1000, function(err, imageids) {
      if(err) {return callback(err);}
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
          if(err) return callback(err);

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

          callback(null, {
              hotImages: images.slice(0, 100)
            , foundPair: foundPair
            , pkImages: [imagei, imagej]
          });
      });
  });
}

exports.removeImage = function(user, imageid, callback) {
  redis.zrem(user + ':images', imageid, callback);
}

exports.updateImageLink = function(imageid, url, callback) {
  redis.hset(imageid, 'newurl', url, callback)
}

exports.koImage = function(user, left, right, callback) {

  var user_images = user + ':images';

  redis.multi()
    .smembers(left + ':KOby')
    .smembers(right + ':KO')
    .exec(function(err, data) {
      if(err) {return callback(err);}
      var koby = data[0]
        , ko = data[1]
        ;
      async.map(koby, function(id, _callback) {
          redis.zincrby(user_images, 0.5, id, _callback);
      }, function(){})

      async.map(ko, function(id, _callback) {
          redis.zincrby(user_images, -0.5, id, _callback);
      }, function(){})

      redis.multi()
        .sadd(left + ':KO', right)
        .sadd(right + ':KOby', left)
        .zincrby(user + ':images', 1, left)
        .zincrby(user + ':images', -1, right)
        .exec(callback);
  })
}

// ----------- crawlers ---------------

exports.queueSearch = function(username, keyword, callback) {

  loadPage(0, function(err, data) {
      if(err) {return callback(err);}
      var pages = data.cursor.pages;
      async.forEachSeries(pages, function(page, _callback) {
          console.log('page');
          console.log(page);
          loadPage(page.start, _callback)
      }, myconsole.ifError );
      // once first page response, return it
      callback();
  });

  // load Other pages
  function loadPage(start, callback) {
    googleImageSearch(keyword, start, function(err, data) {
        if(err) {return callback(err);}
        async.forEach(data.results, function(image, _callback) {
            addImage(username, image, _callback);
          }, function(err) {
            if(err) {return callback(err);}
            callback(null, data)
        });
    })
  }
};

exports.queueAddImages = function(user, meta, pageImages, callback) {
  // TODO update meta data analysis
  async.forEachLimit(pageImages, 10, function(image, _callback) {
      addImage(user, {
          url: image.url
        , text: image.text
        , width: image.width
        , height: image.height
        , meta_text: meta.text
        , meta_link: meta.link
          // TODO meta data info
      }, _callback);
  }, callback)
}

exports.queueAddLinks = function(user, meta, linkImages, callback) {
  // TODO update meta data analysis
  async.forEachLimit(linkImages, 10, function(imagelink, _callback) {
      parseSinglePage(user, meta, imagelink, _callback);
  }, callback);

}

// move to crawler service
function parseSinglePage(user, meta, imagelink, callback) {
  var url = imagelink.href;

  request({
      uri: url
    , headers: {
        Referer: url
      }
    }, function(err, response, body) {
      callback(err);
      if(err) return console.traceError(err);
      var html = body.toString();
      // console.log(html);
      parser.getAllImages(html, function(err, $images, $){
          if(err) return console.traceError(err);
          $images.each(function(i, img) {
              var src = img.src
                , text = img.title || img.alt
                ;

              console.log(img.outerHTML);

              loadImage(src, function(err, data) {
                  if(err) {
                    return console.traceError(err);
                  }
                  if(data) {
                    // imagelink
                    // FIXME make this safe
                    addImage(user, {
                        url: src
                      , newurl: data.newurl
                      , text: text
                      , width: data.width
                      , height: data.height
                      , tbText: imagelink.text
                      , tbUrl: imagelink.tbUrl
                      , tbWidth: imagelink.tbWidth
                      , tbHeight: imagelink.tbHeight
                      , meta_text: meta.text
                      , meta_link: meta.link
                    }, console.ifError)
                  }
              });
          });
      });

  })
}


function loadImage(src, callback) {
  var req = request({
      url: src
    , headers: {
        Referer: src
      }
    , timeout: 15000
  });

  var filename = md5(src)
    , tmpFilename = config.tmpUploadFolder + '/' + filename
    , realFilename = config.uploadFolder + filename;

  req.pipe(fs.createWriteStream(tmpFilename));

  req.on('error', function(err) {
      console.traceError(err);
      callback(err);
  });

  req.on('end', function() {
      imagemagick.identify(tmpFilename, function(err, features) {
          if(err) {
            callback(err);
            fs.unlink(tmpFilename, console.ifError);
            return;
          }
          console.log(features);
          var width = features.width
            , height = features.height
            ;

          if(width > 300 && height > 300 && (width + height) > 900) {
            fs.rename(tmpFilename, realFilename, function(err) {
                if(err) {return console.traceError(err);}
                var newurl =  config.uploadRoot + filename;
                callback(null, {
                    newurl: newurl
                  , width: width
                  , height: height
                });
            });
          } else {
            fs.unlink(tmpFilename, console.ifError);
            callback();
          }

      });
  })

}


// --------- data api

var addImage = exports.addImage = function(user, image, callback) {
  var url = image.url = (image.unescapedUrl || image.url);
  delete image.unescapedUrl;
  var imageid = 'image:' + md5(url); // checksum the result is best way

  myconsole.dir(image);

  redis.multi()
    .hmset(imageid, image)
    .zadd(user + ':images', 0, imageid)
    .exec(callback);
}

// ......... google Image Search API
// page, 0-index
var googleImageSearch = exports.googleImageSearch = function(options, start, callback) {
  // https://developers.google.com/image-search/v1/jsondevguide#json_reference
  if(!options) return callback(new Error('googleImageSearch: options or keyword required'));

  if(typeof options == 'string') {
    options = {
      q: options
    }
  }

  if(!options.q) {
    callback(new Error('googleImageSearch: options.q is required'));
  }
  options.v = '1.0'
  options.imgsz = options.imgsz || 'large'
  options.rsz = options.rsz || 8;
  options.start = start || 0;
  var timeout = 5000;
  if(options.timeout) {
    timeout = options.timeout;
    delete options.timeout;
  }
  request({
      url: 'https://ajax.googleapis.com/ajax/services/search/images'
    , qs : options
    , headers : {
        Referer: 'http://localhost:3000/'
      }
    , timeout : timeout
      // , strictSSL: true
    }, function(err, response, body) {
      if(err) return callback(err);
      var data = JSON.parse(body);
      if(data.responseStatus != 200) {
        console.log(data);
        return callback(new Error(data.responseDetails));
      }
      console.log(data)
      callback(null, data.responseData);
  })
}

// ---------- utils
function md5(str) {
  return hash('md5', str);
}

function hash(algorithm, str){
  var hash = crypto.createHash(algorithm);
  hash.update(str);
  return hash.digest('hex');
}
