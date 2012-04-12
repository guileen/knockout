exports.getAllImages = function(html, callback) {
  var matchs = html.match(/<img ([^>]*)>/igm);
  var images = [];
  console.log(matchs);
  for(var i in matchs) {
    var img = matchs[i]
    var match = img.match(/<img ([^>]*)\/?>/i)
    if(!match) console.log(img);
    var attrs = match[1]
    attrs = attrs.split(/\s+/)
    var obj = {}
    for(var j in attrs) {
      var attr = attrs[j];
      var pair = attr.split('=');
      if(pair.length == 1) {
        obj[attr] = true;
        continue;
      }
      match = pair[1].match(/\s*['"](.*)['"]\s*/);
      obj[pair[0]] = match && match[1] || pair[1];
    }
    images.push(obj);
  }
  callback(null, images);
}
