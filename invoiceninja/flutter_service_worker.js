'use strict';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "/assets/AssetManifest.json": "90d7b27343fcf361dbf6385b3055ce4f",
"/assets/assets/images/logo.png": "090f69e23311a4b6d851b3880ae52541",
"/assets/FontManifest.json": "3fca5e5514468a50735f8318fbb836e4",
"/assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"/assets/fonts/Roboto-Regular.ttf": "3e1af3ef546b9e6ecef9f3ba197bf7d2",
"/assets/LICENSE": "9b23f493027d96b1d739228ff7c02d38",
"/assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "51d23d1c30deda6f34673e0d5600fd38",
"/assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "d51b09f7b8345b41dd3b2201f653c62b",
"/assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "0ea892e09437fcaa050b2b15c53173b7",
"/assets/web/assets/fonts/Roboto-Regular.ttf": "3e1af3ef546b9e6ecef9f3ba197bf7d2",
"/favicon.ico": "51636d3a390451561744c42188ccd628",
"/index.html": "7bf06ad8ee733460dd4e4249f91b3745",
"/main.dart.js": "88b3f5eee3bbba3d59eb3e6fe0e17de0"
};

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheName) {
      return caches.delete(cacheName);
    }).then(function (_) {
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      return cache.addAll(Object.keys(RESOURCES));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
