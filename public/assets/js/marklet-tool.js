(function(document) {
  // if (window[namespace] && typeof window[namespace].postToPostsli === 'function') {
  //   return;
  // }
  if(!window.__IMGKO_LOADED__) {
    var script = document.createElement('script');
    // script.setAttribute('charset', 'utf-8');
    script.src = '{marklet_loader_js}?' + Math.floor(new Date() / 10000000);
    document.body.appendChild(script);
  }
})(document)
