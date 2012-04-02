(function() {
// -----#define ID-----
if (window.__IMGKO_LOADED__) return;
window.__IMGKO_LOADED__ = true;
// -----#end define-----

if (!checkJQuery()) {
  loadjs('http://code.jquery.com/jquery-1.7.2.min.js');
}
loadcss('http://dev:3000/assets/css/marklet.css');
loadjs('http://dev:3000/assets/js/marklet-template.js');
loadjs('http://dev:3000/assets/js/marklet-modal.js');
loadjs('http://dev:3000/assets/js/marklet.js');

function checkJQuery() {
  var $ = window.jQuery;
  return $ && $().jquery >= '1.7.2';
}

function loadcss(url) {
  var fileref = document.createElement('link');
  fileref.setAttribute('rel', 'stylesheet');
  fileref.setAttribute('type', 'text/css');
  fileref.setAttribute('href', url);
  document.body.appendChild(fileref);
}

function loadjs(url) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  document.body.appendChild(script);
}
})();
