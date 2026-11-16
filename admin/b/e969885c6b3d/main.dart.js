/* split_main_js */
(function () {
  var parts = ["main.dart.js.parts/eb31e44440e5.0.js", "main.dart.js.parts/eb31e44440e5.1.js"];
  var base = (document.currentScript && document.currentScript.src) || document.baseURI;
  function part(name) {
    return fetch(new URL(name, base)).then(function (response) {
      if (!response.ok) throw new Error(name + ' answered ' + response.status);
      return response.arrayBuffer();
    });
  }
  Promise.all(parts.map(part)).then(function (buffers) {
    var script = document.createElement('script');
    script.src = URL.createObjectURL(new Blob(buffers, { type: 'text/javascript' }));
    document.head.appendChild(script);
  }).catch(function (error) {
    console.error('main.dart.js could not be loaded: ' + error);
  });
})();
