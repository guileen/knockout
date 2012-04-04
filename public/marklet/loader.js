(function() {
// -----#define ID-----
if (window.__IMGKO_LOADED__) return;
// -----#end define-----
if (!checkJQuery()) {
  loadjs('http://code.jquery.com/jquery-1.7.2.min.js');
}
loadcss('http://dev:3000/marklet/marklet.css');
loadjs('http://dev:3000/marklet/marklet.js');
// loadjs('http://dev:3000/marklet/bootstrap-transition.js');
// loadjs('http://dev:3000/marklet/bootstrap-modal.js');
// loadjs('http://dev:3000/marklet/bootstrap-tooltip.js');
// loadjs('http://dev:3000/marklet/bootstrap-popover.js');
// loadjs('http://dev:3000/assets/js/jade.runtime.js');
// loadjs('http://dev:3000/marklet/stage_template.js');
// loadjs('http://dev:3000/marklet/tb_template.js');
// loadjs('http://dev:3000/marklet/main.js');


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
