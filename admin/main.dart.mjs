// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arugments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `load-ids` option is passed. Each load ID maps to one
  //   or more wasm files as specified in the emitted JSON file. It also takes a
  //   callback that should be invoked for each loaded module with 2 arugments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDynamicModule` is a JS function that takes two string names matching,
  //   in order, a wasm file produced by the dart2wasm compiler during dynamic
  //   module compilation and a corresponding js file produced by the same
  //   compilation. It also takes a callback that should be invoked with the
  //   loaded module in a format supported by `WebAssembly.compile` or
  //   `WebAssembly.compileStreaming` and the result of using the JS 'import'
  //   API on the js file path. It should return a Promise that resolves when
  //   all the modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports,
      {loadDeferredModules, loadDynamicModule, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            _1: (decoder, codeUnits) => decoder.decode(codeUnits),
      _2: () => new TextDecoder("utf-8", {fatal: true}),
      _3: () => new TextDecoder("utf-8", {fatal: false}),
      _4: (s) => +s,
      _5: x0 => new Uint8Array(x0),
      _6: (x0,x1,x2) => x0.set(x1,x2),
      _7: (x0,x1) => x0.transferFromImageBitmap(x1),
      _8: x0 => x0.arrayBuffer(),
      _9: (x0,x1,x2) => x0.slice(x1,x2),
      _10: (x0,x1) => x0.decode(x1),
      _11: (x0,x1) => x0.segment(x1),
      _12: () => new TextDecoder(),
      _14: x0 => x0.buffer,
      _15: x0 => x0.wasmMemory,
      _16: () => globalThis.window._flutter_skwasmInstance,
      _17: x0 => x0.rasterStartMilliseconds,
      _18: x0 => x0.rasterEndMilliseconds,
      _19: x0 => x0.imageBitmaps,
      _135: (x0,x1) => x0.appendChild(x1),
      _166: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _167: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _168: (x0,x1) => new OffscreenCanvas(x0,x1),
      _169: x0 => x0.remove(),
      _170: (x0,x1) => x0.append(x1),
      _172: x0 => x0.unlock(),
      _173: x0 => x0.getReader(),
      _174: (x0,x1) => x0.item(x1),
      _175: x0 => x0.next(),
      _176: x0 => x0.now(),
      _177: (x0,x1) => x0.revokeObjectURL(x1),
      _178: x0 => x0.close(),
      _179: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _180: x0 => new window.ImageDecoder(x0),
      _181: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      _182: (x0,x1) => x0.decode(x1),
      _183: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._183(f,arguments.length,x0) }),
      _184: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _186: (x0,x1) => x0.getModifierState(x1),
      _187: x0 => x0.preventDefault(),
      _188: x0 => x0.stopPropagation(),
      _189: (x0,x1) => x0.removeProperty(x1),
      _190: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._190(f,arguments.length,x0) }),
      _191: x0 => new window.FinalizationRegistry(x0),
      _192: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _194: (x0,x1) => x0.unregister(x1),
      _195: (x0,x1) => x0.prepend(x1),
      _196: x0 => new Intl.Locale(x0),
      _197: (x0,x1) => x0.observe(x1),
      _198: x0 => x0.disconnect(),
      _199: (x0,x1) => x0.getAttribute(x1),
      _200: (x0,x1) => x0.contains(x1),
      _201: (x0,x1) => x0.querySelector(x1),
      _202: (x0,x1) => x0.matchMedia(x1),
      _203: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._203(f,arguments.length,x0) }),
      _204: (x0,x1,x2) => x0.call(x1,x2),
      _205: x0 => x0.blur(),
      _206: x0 => x0.hasFocus(),
      _207: (x0,x1) => x0.removeAttribute(x1),
      _208: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _209: (x0,x1) => x0.hasAttribute(x1),
      _210: (x0,x1) => x0.getModifierState(x1),
      _211: (x0,x1) => x0.createTextNode(x1),
      _212: x0 => x0.getBoundingClientRect(),
      _213: (x0,x1) => x0.replaceWith(x1),
      _214: (x0,x1) => x0.contains(x1),
      _215: (x0,x1) => x0.closest(x1),
      _216: () => new Array(),
      _653: x0 => new Uint8Array(x0),
      _656: () => globalThis.window.flutterConfiguration,
      _658: x0 => x0.assetBase,
      _663: x0 => x0.canvasKitMaximumSurfaces,
      _664: x0 => x0.debugShowSemanticsNodes,
      _665: x0 => x0.hostElement,
      _666: x0 => x0.multiViewEnabled,
      _667: x0 => x0.nonce,
      _669: x0 => x0.fontFallbackBaseUrl,
      _679: x0 => x0.console,
      _680: x0 => x0.devicePixelRatio,
      _681: x0 => x0.document,
      _682: x0 => x0.history,
      _683: x0 => x0.innerHeight,
      _684: x0 => x0.innerWidth,
      _685: x0 => x0.location,
      _686: x0 => x0.navigator,
      _687: x0 => x0.visualViewport,
      _688: x0 => x0.performance,
      _689: x0 => x0.parent,
      _691: x0 => x0.URL,
      _693: (x0,x1) => x0.getComputedStyle(x1),
      _694: x0 => x0.screen,
      _695: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._695(f,arguments.length,x0) }),
      _696: (x0,x1) => x0.requestAnimationFrame(x1),
      _700: (x0,x1) => x0.warn(x1),
      _702: (x0,x1) => x0.debug(x1),
      _703: x0 => globalThis.parseFloat(x0),
      _704: () => globalThis.window,
      _705: () => globalThis.Intl,
      _706: () => globalThis.Symbol,
      _707: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      _709: x0 => x0.clipboard,
      _710: x0 => x0.maxTouchPoints,
      _711: x0 => x0.vendor,
      _712: x0 => x0.language,
      _713: x0 => x0.platform,
      _714: x0 => x0.userAgent,
      _715: (x0,x1) => x0.vibrate(x1),
      _716: x0 => x0.languages,
      _717: x0 => x0.documentElement,
      _718: (x0,x1) => x0.querySelector(x1),
      _719: (x0,x1) => x0.querySelectorAll(x1),
      _721: (x0,x1) => x0.createElement(x1),
      _724: (x0,x1) => x0.createEvent(x1),
      _725: x0 => x0.activeElement,
      _728: x0 => x0.head,
      _729: x0 => x0.body,
      _731: (x0,x1) => { x0.title = x1 },
      _734: x0 => x0.visibilityState,
      _735: () => globalThis.document,
      _736: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._736(f,arguments.length,x0) }),
      _737: (x0,x1) => x0.dispatchEvent(x1),
      _745: x0 => x0.target,
      _747: x0 => x0.timeStamp,
      _748: x0 => x0.type,
      _750: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _757: x0 => x0.firstChild,
      _761: x0 => x0.parentElement,
      _763: (x0,x1) => { x0.textContent = x1 },
      _764: x0 => x0.parentNode,
      _765: x0 => x0.nextSibling,
      _766: (x0,x1) => x0.removeChild(x1),
      _767: x0 => x0.isConnected,
      _775: x0 => x0.clientHeight,
      _776: x0 => x0.clientWidth,
      _777: x0 => x0.offsetHeight,
      _778: x0 => x0.offsetWidth,
      _779: x0 => x0.id,
      _780: (x0,x1) => { x0.id = x1 },
      _783: (x0,x1) => { x0.spellcheck = x1 },
      _784: x0 => x0.tagName,
      _785: x0 => x0.style,
      _787: (x0,x1) => x0.querySelectorAll(x1),
      _788: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _789: x0 => x0.tabIndex,
      _790: (x0,x1) => { x0.tabIndex = x1 },
      _791: (x0,x1) => x0.focus(x1),
      _792: x0 => x0.scrollTop,
      _793: (x0,x1) => { x0.scrollTop = x1 },
      _794: (x0,x1) => { x0.scrollLeft = x1 },
      _795: x0 => x0.scrollLeft,
      _796: x0 => x0.classList,
      _797: (x0,x1) => x0.scrollIntoView(x1),
      _800: (x0,x1) => { x0.className = x1 },
      _802: (x0,x1) => x0.getElementsByClassName(x1),
      _803: x0 => x0.click(),
      _804: (x0,x1) => x0.attachShadow(x1),
      _807: x0 => x0.computedStyleMap(),
      _808: (x0,x1) => x0.get(x1),
      _814: (x0,x1) => x0.getPropertyValue(x1),
      _815: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _816: x0 => x0.offsetLeft,
      _817: x0 => x0.offsetTop,
      _818: x0 => x0.offsetParent,
      _820: (x0,x1) => { x0.name = x1 },
      _821: x0 => x0.content,
      _822: (x0,x1) => { x0.content = x1 },
      _826: (x0,x1) => { x0.src = x1 },
      _827: x0 => x0.naturalWidth,
      _828: x0 => x0.naturalHeight,
      _832: (x0,x1) => { x0.crossOrigin = x1 },
      _834: (x0,x1) => { x0.decoding = x1 },
      _835: x0 => x0.decode(),
      _840: (x0,x1) => { x0.nonce = x1 },
      _845: (x0,x1) => { x0.width = x1 },
      _847: (x0,x1) => { x0.height = x1 },
      _850: (x0,x1) => x0.getContext(x1),
      _918: x0 => x0.width,
      _919: x0 => x0.height,
      _921: (x0,x1) => x0.fetch(x1),
      _922: x0 => x0.status,
      _924: x0 => x0.body,
      _925: x0 => x0.arrayBuffer(),
      _928: x0 => x0.read(),
      _929: x0 => x0.value,
      _930: x0 => x0.done,
      _937: x0 => x0.name,
      _938: x0 => x0.x,
      _939: x0 => x0.y,
      _942: x0 => x0.top,
      _943: x0 => x0.right,
      _944: x0 => x0.bottom,
      _945: x0 => x0.left,
      _955: x0 => x0.height,
      _956: x0 => x0.width,
      _957: x0 => x0.scale,
      _958: (x0,x1) => { x0.value = x1 },
      _961: (x0,x1) => { x0.placeholder = x1 },
      _963: (x0,x1) => { x0.name = x1 },
      _964: x0 => x0.selectionDirection,
      _965: x0 => x0.selectionStart,
      _966: x0 => x0.selectionEnd,
      _969: x0 => x0.value,
      _971: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _972: x0 => x0.readText(),
      _973: (x0,x1) => x0.writeText(x1),
      _975: x0 => x0.altKey,
      _976: x0 => x0.code,
      _977: x0 => x0.ctrlKey,
      _978: x0 => x0.key,
      _979: x0 => x0.keyCode,
      _980: x0 => x0.location,
      _981: x0 => x0.metaKey,
      _982: x0 => x0.repeat,
      _983: x0 => x0.shiftKey,
      _984: x0 => x0.isComposing,
      _986: x0 => x0.state,
      _987: (x0,x1) => x0.go(x1),
      _989: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _990: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _991: x0 => x0.pathname,
      _992: x0 => x0.search,
      _993: x0 => x0.hash,
      _997: x0 => x0.state,
      _1000: (x0,x1) => x0.createObjectURL(x1),
      _1002: x0 => new Blob(x0),
      _1012: x0 => x0.matches,
      _1016: x0 => x0.matches,
      _1020: x0 => x0.relatedTarget,
      _1022: x0 => x0.clientX,
      _1023: x0 => x0.clientY,
      _1024: x0 => x0.offsetX,
      _1025: x0 => x0.offsetY,
      _1028: x0 => x0.button,
      _1029: x0 => x0.buttons,
      _1030: x0 => x0.ctrlKey,
      _1034: x0 => x0.pointerId,
      _1035: x0 => x0.pointerType,
      _1036: x0 => x0.pressure,
      _1037: x0 => x0.tiltX,
      _1038: x0 => x0.tiltY,
      _1039: x0 => x0.getCoalescedEvents(),
      _1042: x0 => x0.deltaX,
      _1043: x0 => x0.deltaY,
      _1044: x0 => x0.wheelDeltaX,
      _1045: x0 => x0.wheelDeltaY,
      _1046: x0 => x0.deltaMode,
      _1053: x0 => x0.changedTouches,
      _1056: x0 => x0.clientX,
      _1057: x0 => x0.clientY,
      _1060: x0 => x0.data,
      _1063: (x0,x1) => { x0.disabled = x1 },
      _1065: (x0,x1) => { x0.type = x1 },
      _1066: (x0,x1) => { x0.max = x1 },
      _1067: (x0,x1) => { x0.min = x1 },
      _1068: x0 => x0.value,
      _1069: (x0,x1) => { x0.value = x1 },
      _1070: x0 => x0.disabled,
      _1071: (x0,x1) => { x0.disabled = x1 },
      _1073: (x0,x1) => { x0.placeholder = x1 },
      _1075: (x0,x1) => { x0.name = x1 },
      _1076: (x0,x1) => { x0.autocomplete = x1 },
      _1078: x0 => x0.selectionDirection,
      _1079: x0 => x0.selectionStart,
      _1081: x0 => x0.selectionEnd,
      _1084: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1085: (x0,x1) => x0.add(x1),
      _1087: (x0,x1) => { x0.noValidate = x1 },
      _1088: (x0,x1) => { x0.method = x1 },
      _1089: (x0,x1) => { x0.action = x1 },
      _1095: (x0,x1) => x0.getContext(x1),
      _1097: x0 => x0.convertToBlob(),
      _1114: x0 => x0.orientation,
      _1115: x0 => x0.width,
      _1116: x0 => x0.height,
      _1117: (x0,x1) => x0.lock(x1),
      _1136: x0 => new ResizeObserver(x0),
      _1139: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1139(f,arguments.length,x0,x1) }),
      _1147: x0 => x0.length,
      _1148: x0 => x0.iterator,
      _1149: x0 => x0.Segmenter,
      _1150: x0 => x0.v8BreakIterator,
      _1151: (x0,x1) => new Intl.Segmenter(x0,x1),
      _1154: x0 => x0.language,
      _1155: x0 => x0.script,
      _1156: x0 => x0.region,
      _1174: x0 => x0.done,
      _1175: x0 => x0.value,
      _1176: x0 => x0.index,
      _1180: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _1181: (x0,x1) => x0.adoptText(x1),
      _1182: x0 => x0.first(),
      _1183: x0 => x0.next(),
      _1184: x0 => x0.current(),
      _1186: () => globalThis.window.FinalizationRegistry,
      _1197: x0 => x0.hostElement,
      _1198: x0 => x0.viewConstraints,
      _1201: x0 => x0.maxHeight,
      _1202: x0 => x0.maxWidth,
      _1203: x0 => x0.minHeight,
      _1204: x0 => x0.minWidth,
      _1205: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1205(f,arguments.length,x0) }),
      _1206: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1206(f,arguments.length,x0) }),
      _1207: (x0,x1) => ({addView: x0,removeView: x1}),
      _1210: x0 => x0.loader,
      _1211: () => globalThis._flutter,
      _1212: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1213: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1213(f,arguments.length,x0) }),
      _1214: (module,f) => finalizeWrapper(f, function() { return module.exports._1214(f,arguments.length) }),
      _1215: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _1218: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1218(f,arguments.length,x0) }),
      _1219: x0 => ({runApp: x0}),
      _1221: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1221(f,arguments.length,x0,x1) }),
      _1222: x0 => new Promise(x0),
      _1223: x0 => x0.length,
      _1224: () => globalThis.window.ImageDecoder,
      _1225: x0 => x0.tracks,
      _1227: x0 => x0.completed,
      _1229: x0 => x0.image,
      _1235: x0 => x0.displayWidth,
      _1236: x0 => x0.displayHeight,
      _1237: x0 => x0.duration,
      _1240: x0 => x0.ready,
      _1241: x0 => x0.selectedTrack,
      _1242: x0 => x0.repetitionCount,
      _1243: x0 => x0.frameCount,
      _1290: (x0,x1) => x0.createElement(x1),
      _1296: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1297: x0 => x0.remove(),
      _1299: x0 => ({createScriptURL: x0}),
      _1300: (x0,x1,x2) => x0.createPolicy(x1,x2),
      _1304: (x0,x1) => x0.append(x1),
      _1305: (x0,x1) => x0.querySelectorAll(x1),
      _1306: (x0,x1) => x0.item(x1),
      _1324: x0 => ({type: x0}),
      _1325: (x0,x1) => new Blob(x0,x1),
      _1326: x0 => globalThis.URL.createObjectURL(x0),
      _1327: (x0,x1) => x0.getElementById(x1),
      _1328: (x0,x1) => x0.createElement(x1),
      _1329: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1330: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _1331: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1331(f,arguments.length,x0) }),
      _1332: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1333: x0 => x0.click(),
      _1334: () => ({}),
      _1335: x0 => globalThis.pdfjsLib.getDocument(x0),
      _1336: (x0,x1) => x0.getContext(x1),
      _1337: (x0,x1) => x0.getPage(x1),
      _1338: (x0,x1) => x0.getViewport(x1),
      _1339: (x0,x1) => x0.render(x1),
      _1340: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1340(f,arguments.length,x0) }),
      _1341: (x0,x1) => x0.toBlob(x1),
      _1342: () => new FileReader(),
      _1343: (x0,x1) => x0.readAsArrayBuffer(x1),
      _1344: x0 => x0.cleanup(),
      _1345: x0 => x0.destroy(),
      _1346: (x0,x1) => { x0.module = x1 },
      _1347: (x0,x1) => { x0.exports = x1 },
      _1348: x0 => x0.preventDefault(),
      _1349: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1350: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1352: (x0,x1) => x0.getAttribute(x1),
      _1356: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1378: x0 => globalThis.URL.revokeObjectURL(x0),
      _1386: (x0,x1) => x0.querySelector(x1),
      _1397: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1397(f,arguments.length,x0) }),
      _1398: (x0,x1) => x0.readEntries(x1),
      _1399: x0 => x0.createReader(),
      _1400: () => new Blob(),
      _1401: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      _1402: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1402(f,arguments.length,x0) }),
      _1403: (x0,x1) => x0.file(x1),
      _1404: x0 => x0.webkitGetAsEntry(),
      _1405: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1405(f,arguments.length,x0) }),
      _1406: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1406(f,arguments.length,x0) }),
      _1407: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1407(f,arguments.length,x0) }),
      _1408: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1408(f,arguments.length,x0) }),
      _1410: (x0,x1) => x0.item(x1),
      _1411: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1411(f,arguments.length,x0) }),
      _1412: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1412(f,arguments.length,x0) }),
      _1413: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1413(f,arguments.length,x0) }),
      _1414: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1414(f,arguments.length,x0) }),
      _1415: (x0,x1) => x0.removeChild(x1),
      _1416: x0 => new Blob(x0),
      _1418: x0 => x0.decode(),
      _1419: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1420: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1421: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1421(f,arguments.length,x0) }),
      _1422: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1422(f,arguments.length,x0) }),
      _1423: x0 => x0.send(),
      _1424: () => new XMLHttpRequest(),
      _1425: (x0,x1) => x0.getItem(x1),
      _1426: (x0,x1,x2) => x0.setItem(x1,x2),
      _1427: (x0,x1) => x0.removeItem(x1),
      _1437: () => globalThis.removeSplashFromWeb(),
      _1439: (x0,x1) => x0.initialize(x1),
      _1440: (x0,x1) => x0.initTokenClient(x1),
      _1444: Date.now,
      _1446: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1447: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1448: () => typeof dartUseDateNowForTicks !== "undefined",
      _1449: () => 1000 * performance.now(),
      _1450: () => Date.now(),
      _1451: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _1452: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _1453: () => new WeakMap(),
      _1454: (map, o) => map.get(o),
      _1455: (map, o, v) => map.set(o, v),
      _1456: x0 => new WeakRef(x0),
      _1457: x0 => x0.deref(),
      _1458: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1458(f,arguments.length,x0) }),
      _1459: x0 => new FinalizationRegistry(x0),
      _1460: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _1462: (x0,x1) => x0.unregister(x1),
      _1464: () => globalThis.WeakRef,
      _1465: () => globalThis.FinalizationRegistry,
      _1467: x0 => x0.call(),
      _1468: s => JSON.stringify(s),
      _1469: s => printToConsole(s),
      _1470: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      _1471: (o, p, r) => o.replaceAll(p, () => r),
      _1472: (o, p, r) => o.replace(p, () => r),
      _1473: Function.prototype.call.bind(String.prototype.toLowerCase),
      _1474: s => s.toUpperCase(),
      _1475: s => s.trim(),
      _1476: s => s.trimLeft(),
      _1477: s => s.trimRight(),
      _1478: (string, times) => string.repeat(times),
      _1479: Function.prototype.call.bind(String.prototype.indexOf),
      _1480: (s, p, i) => s.lastIndexOf(p, i),
      _1481: (string, token) => string.split(token),
      _1482: Object.is,
      _1486: (o, t) => typeof o === t,
      _1487: (o, c) => o instanceof c,
      _1488: o => Object.keys(o),
      _1490: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      _1492: (o, a) => o + a,
      _1502: (o, a) => o == a,
      _1542: x0 => new Array(x0),
      _1544: x0 => x0.length,
      _1546: (x0,x1) => x0[x1],
      _1547: (x0,x1,x2) => { x0[x1] = x2 },
      _1550: (x0,x1,x2) => new DataView(x0,x1,x2),
      _1552: x0 => new Int8Array(x0),
      _1553: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _1555: x0 => new Uint8ClampedArray(x0),
      _1557: x0 => new Int16Array(x0),
      _1559: x0 => new Uint16Array(x0),
      _1561: x0 => new Int32Array(x0),
      _1563: x0 => new Uint32Array(x0),
      _1565: x0 => new Float32Array(x0),
      _1567: x0 => new Float64Array(x0),
      _1591: x0 => x0.random(),
      _1592: (x0,x1) => x0.getRandomValues(x1),
      _1593: () => globalThis.crypto,
      _1594: () => globalThis.Math,
      _1596: () => globalThis.performance,
      _1597: () => globalThis.JSON,
      _1598: x0 => x0.measure,
      _1599: x0 => x0.mark,
      _1600: x0 => x0.clearMeasures,
      _1601: x0 => x0.clearMarks,
      _1602: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      _1603: (x0,x1,x2) => x0.mark(x1,x2),
      _1604: x0 => x0.clearMeasures(),
      _1605: x0 => x0.clearMarks(),
      _1606: (x0,x1) => x0.parse(x1),
      _1607: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1608: (handle) => clearTimeout(handle),
      _1609: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1610: (handle) => clearInterval(handle),
      _1611: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1612: () => Date.now(),
      _1613: () => new Error().stack,
      _1614: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1615: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _1616: (x0,x1) => x0.exec(x1),
      _1617: (x0,x1) => x0.test(x1),
      _1618: x0 => x0.pop(),
      _1620: o => o === undefined,
      _1622: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _1624: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _1625: o => o instanceof RegExp,
      _1626: (l, r) => l === r,
      _1627: o => o,
      _1628: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      _1629: o => o,
      _1630: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      _1631: o => o,
      _1632: b => !!b,
      _1633: o => o.length,
      _1635: (o, i) => o[i],
      _1636: f => f.dartFunction,
      _1637: () => ({}),
      _1638: () => [],
      _1640: () => globalThis,
      _1641: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _1642: (o, p) => p in o,
      _1643: (o, p) => o[p],
      _1644: (o, p, v) => o[p] = v,
      _1645: (o, m, a) => o[m].apply(o, a),
      _1647: o => String(o),
      _1648: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      _1649: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1649(f,arguments.length,x0) }),
      _1650: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1650(f,arguments.length,x0,x1) }),
      _1651: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      _1652: o => [o],
      _1653: (o0, o1) => [o0, o1],
      _1654: (o0, o1, o2) => [o0, o1, o2],
      _1655: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      _1656: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      _1657: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1658: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1659: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1660: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1661: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1662: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1663: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1664: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1665: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1666: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1667: x0 => new ArrayBuffer(x0),
      _1668: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _1669: x0 => x0.input,
      _1670: x0 => x0.index,
      _1671: x0 => x0.groups,
      _1672: x0 => x0.flags,
      _1673: x0 => x0.multiline,
      _1674: x0 => x0.ignoreCase,
      _1675: x0 => x0.unicode,
      _1676: x0 => x0.dotAll,
      _1677: (x0,x1) => { x0.lastIndex = x1 },
      _1678: (o, p) => p in o,
      _1679: (o, p) => o[p],
      _1680: (o, p, v) => o[p] = v,
      _1682: x0 => x0.arrayBuffer(),
      _1683: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      _1684: (x0,x1) => x0.sqlite3session_delete(x1),
      _1685: (x0,x1) => x0.sqlite3_close_v2(x1),
      _1686: (x0,x1) => x0.sqlite3_finalize(x1),
      _1687: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      _1688: (x0,x1) => x0.dart_sqlite3_free(x1),
      _1690: x0 => x0.sqlite3_initialize(),
      _1696: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      _1697: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      _1698: (x0,x1) => x0.sqlite3_errmsg(x1),
      _1699: (x0,x1) => x0.sqlite3_errstr(x1),
      _1700: (x0,x1) => x0.sqlite3_error_offset(x1),
      _1701: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      _1702: (x0,x1,x2) => x0.dart_sqlite3_updates(x1,x2),
      _1703: (x0,x1,x2) => x0.dart_sqlite3_commits(x1,x2),
      _1704: (x0,x1,x2) => x0.dart_sqlite3_rollbacks(x1,x2),
      _1705: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      _1706: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      _1707: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      _1708: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      _1709: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      _1710: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      _1711: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      _1712: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      _1714: (x0,x1) => x0.sqlite3_column_count(x1),
      _1715: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      _1716: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      _1717: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      _1718: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      _1719: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      _1720: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      _1721: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      _1722: (x0,x1) => x0.sqlite3_value_type(x1),
      _1724: (x0,x1) => x0.sqlite3_value_int64(x1),
      _1725: (x0,x1) => x0.sqlite3_value_double(x1),
      _1726: (x0,x1) => x0.sqlite3_value_bytes(x1),
      _1727: (x0,x1) => x0.sqlite3_value_text(x1),
      _1728: (x0,x1) => x0.sqlite3_value_blob(x1),
      _1729: (x0,x1) => x0.sqlite3_result_null(x1),
      _1730: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      _1731: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      _1732: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      _1733: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      _1734: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      _1735: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      _1738: (x0,x1) => x0.sqlite3_step(x1),
      _1739: (x0,x1) => x0.sqlite3_reset(x1),
      _1740: (x0,x1) => x0.sqlite3_changes(x1),
      _1741: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      _1743: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      _1760: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      _1763: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      _1765: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1765(f,arguments.length,x0) }),
      _1766: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1766(f,arguments.length,x0,x1) }),
      _1767: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return module.exports._1767(f,arguments.length,x0,x1,x2,x3,x4) }),
      _1768: (module,f) => finalizeWrapper(f, function(x0,x1,x2) { return module.exports._1768(f,arguments.length,x0,x1,x2) }),
      _1769: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1769(f,arguments.length,x0,x1,x2,x3) }),
      _1770: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1770(f,arguments.length,x0,x1,x2,x3) }),
      _1771: (module,f) => finalizeWrapper(f, function(x0,x1,x2) { return module.exports._1771(f,arguments.length,x0,x1,x2) }),
      _1772: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1772(f,arguments.length,x0,x1) }),
      _1773: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1773(f,arguments.length,x0,x1) }),
      _1774: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1774(f,arguments.length,x0) }),
      _1775: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1775(f,arguments.length,x0,x1,x2,x3) }),
      _1776: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1776(f,arguments.length,x0,x1,x2,x3) }),
      _1777: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1777(f,arguments.length,x0,x1) }),
      _1778: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1778(f,arguments.length,x0,x1) }),
      _1779: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1779(f,arguments.length,x0,x1) }),
      _1780: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1780(f,arguments.length,x0,x1) }),
      _1781: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1781(f,arguments.length,x0,x1) }),
      _1782: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1782(f,arguments.length,x0,x1) }),
      _1783: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1783(f,arguments.length,x0) }),
      _1784: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1784(f,arguments.length,x0) }),
      _1785: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1785(f,arguments.length,x0) }),
      _1786: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return module.exports._1786(f,arguments.length,x0,x1,x2,x3,x4) }),
      _1787: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1787(f,arguments.length,x0,x1,x2,x3) }),
      _1788: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1788(f,arguments.length,x0,x1,x2,x3) }),
      _1789: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return module.exports._1789(f,arguments.length,x0,x1,x2,x3) }),
      _1790: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1790(f,arguments.length,x0,x1) }),
      _1791: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1791(f,arguments.length,x0,x1) }),
      _1792: (module,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return module.exports._1792(f,arguments.length,x0,x1,x2,x3,x4) }),
      _1793: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1793(f,arguments.length,x0,x1) }),
      _1794: (module,f) => finalizeWrapper(f, function(x0,x1) { return module.exports._1794(f,arguments.length,x0,x1) }),
      _1795: (module,f) => finalizeWrapper(f, function(x0,x1,x2) { return module.exports._1795(f,arguments.length,x0,x1,x2) }),
      _1796: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      _1800: (x0,x1) => new URL(x0,x1),
      _1801: (x0,x1) => globalThis.fetch(x0,x1),
      _1802: (x0,x1,x2) => x0.postMessage(x1,x2),
      _1803: (x0,x1,x2) => x0.postMessage(x1,x2),
      _1805: (x0,x1) => ({i: x0,p: x1}),
      _1806: (x0,x1) => ({c: x0,r: x1}),
      _1807: x0 => x0.i,
      _1808: x0 => x0.p,
      _1809: x0 => x0.c,
      _1810: x0 => x0.r,
      _1811: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1811(f,arguments.length,x0) }),
      _1812: (x0,x1) => x0.postMessage(x1),
      _1813: x0 => x0.close(),
      _1815: x0 => new Worker(x0),
      _1817: x0 => x0.getDirectory(),
      _1818: x0 => ({create: x0}),
      _1819: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      _1820: x0 => x0.createSyncAccessHandle(),
      _1821: x0 => x0.close(),
      _1824: x0 => x0.close(),
      _1825: (x0,x1) => x0.deleteDatabase(x1),
      _1827: (x0,x1,x2) => x0.open(x1,x2),
      _1831: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      _1836: x0 => ({create: x0}),
      _1841: (x0,x1) => new SharedWorker(x0,x1),
      _1842: x0 => x0.start(),
      _1843: x0 => x0.terminate(),
      _1844: () => new MessageChannel(),
      _1847: (x0,x1) => x0.postMessage(x1),
      _1849: x0 => globalThis.BigInt(x0),
      _1850: x0 => globalThis.Number(x0),
      _1857: () => globalThis.navigator,
      _1858: (x0,x1) => x0.read(x1),
      _1859: (x0,x1,x2) => x0.read(x1,x2),
      _1860: (x0,x1) => x0.write(x1),
      _1861: (x0,x1,x2) => x0.write(x1,x2),
      _1864: x0 => ({at: x0}),
      _1865: x0 => x0.getSize(),
      _1866: (x0,x1) => x0.truncate(x1),
      _1867: x0 => x0.flush(),
      _1870: x0 => x0.synchronizationBuffer,
      _1871: x0 => x0.communicationBuffer,
      _1872: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      _1873: x0 => new SharedArrayBuffer(x0),
      _1874: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      _1875: x0 => ({autoIncrement: x0}),
      _1876: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      _1877: x0 => ({unique: x0}),
      _1878: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      _1879: (x0,x1) => x0.createObjectStore(x1),
      _1880: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1880(f,arguments.length,x0) }),
      _1881: (x0,x1,x2) => x0.transaction(x1,x2),
      _1882: (x0,x1) => x0.objectStore(x1),
      _1884: (x0,x1) => x0.index(x1),
      _1885: x0 => x0.openKeyCursor(),
      _1886: (x0,x1) => x0.getKey(x1),
      _1887: (x0,x1) => ({name: x0,length: x1}),
      _1888: (x0,x1) => x0.put(x1),
      _1889: (x0,x1) => x0.get(x1),
      _1890: (x0,x1) => x0.openCursor(x1),
      _1891: x0 => globalThis.IDBKeyRange.only(x0),
      _1892: (x0,x1,x2) => x0.put(x1,x2),
      _1893: (x0,x1) => x0.update(x1),
      _1894: (x0,x1) => x0.delete(x1),
      _1895: x0 => x0.name,
      _1896: x0 => x0.length,
      _1898: x0 => new BroadcastChannel(x0),
      _1899: x0 => globalThis.Array.isArray(x0),
      _1900: (x0,x1) => x0.postMessage(x1),
      _1901: x0 => x0.close(),
      _1902: (x0,x1) => ({kind: x0,table: x1}),
      _1903: x0 => x0.kind,
      _1904: x0 => x0.table,
      _1905: x0 => x0.continue(),
      _1906: () => globalThis.indexedDB,
      _1907: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      _1909: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      _1910: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      _1911: (x0,x1) => globalThis.Atomics.load(x0,x1),
      _1912: () => globalThis.Int32Array,
      _1914: () => globalThis.Uint8Array,
      _1916: () => globalThis.DataView,
      _1918: x0 => x0.byteLength,
      _1926: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1926(f,arguments.length,x0) }),
      _1927: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1927(f,arguments.length,x0) }),
      _1932: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1932(f,arguments.length,x0) }),
      _1933: (x0,x1) => x0.postMessage(x1),
      _1934: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1934(f,arguments.length,x0) }),
      _1935: x0 => x0.close(),
      _1940: (x0,x1) => x0.appendChild(x1),
      _1944: x0 => x0.trustedTypes,
      _1945: (x0,x1) => { x0.src = x1 },
      _1946: (x0,x1) => x0.createScriptURL(x1),
      _1947: x0 => x0.nonce,
      _1948: (x0,x1) => x0.debug(x1),
      _1949: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._1949(f,arguments.length,x0) }),
      _1950: () => new AbortController(),
      _1951: x0 => x0.abort(),
      _1952: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      _1953: (x0,x1) => globalThis.fetch(x0,x1),
      _1954: (x0,x1) => x0.get(x1),
      _1955: (module,f) => finalizeWrapper(f, function(x0,x1,x2) { return module.exports._1955(f,arguments.length,x0,x1,x2) }),
      _1956: (x0,x1) => x0.forEach(x1),
      _1957: x0 => x0.getReader(),
      _1958: x0 => x0.cancel(),
      _1959: x0 => x0.read(),
      _1963: (x0,x1) => { x0.data = x1 },
      _1964: (x0,x1) => { x0.scale = x1 },
      _1965: (x0,x1) => { x0.canvasContext = x1 },
      _1966: (x0,x1) => { x0.viewport = x1 },
      _1967: (x0,x1) => { x0.cMapUrl = x1 },
      _1968: (x0,x1) => { x0.cMapPacked = x1 },
      _1969: x0 => x0.promise,
      _1970: x0 => x0.numPages,
      _1971: x0 => x0.width,
      _1972: x0 => x0.height,
      _1973: x0 => x0.promise,
      _1974: o => o instanceof Array,
      _1975: (a, i) => a.splice(i, 1)[0],
      _1977: (a, l) => a.length = l,
      _1978: a => a.pop(),
      _1979: (a, i) => a.splice(i, 1),
      _1980: (a, s) => a.join(s),
      _1981: (a, s, e) => a.slice(s, e),
      _1982: (a, s, e) => a.splice(s, e),
      _1983: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _1984: a => a.length,
      _1986: (a, i) => a[i],
      _1987: (a, i, v) => a[i] = v,
      _1989: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      _1990: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1991: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof DataView) return 1;
        return 2;
      },
      _1992: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      _1993: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1994: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      _1995: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1996: o => o instanceof Uint8ClampedArray,
      _1997: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1998: o => o instanceof Uint16Array,
      _1999: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _2000: o => o instanceof Int16Array,
      _2001: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _2002: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      _2003: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _2004: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      _2005: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _2006: (o, start, length) => new BigUint64Array(o.buffer, o.byteOffset + start, length),
      _2007: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _2008: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      _2009: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _2010: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      _2011: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _2012: (a, i) => a.push(i),
      _2013: (t, s) => t.set(s),
      _2014: l => new DataView(new ArrayBuffer(l)),
      _2015: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _2016: o => o.byteLength,
      _2017: o => o.buffer,
      _2018: o => o.byteOffset,
      _2019: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _2020: (b, o) => new DataView(b, o),
      _2021: (b, o, l) => new DataView(b, o, l),
      _2022: Function.prototype.call.bind(DataView.prototype.getUint8),
      _2023: Function.prototype.call.bind(DataView.prototype.setUint8),
      _2024: Function.prototype.call.bind(DataView.prototype.getInt8),
      _2025: Function.prototype.call.bind(DataView.prototype.setInt8),
      _2026: Function.prototype.call.bind(DataView.prototype.getUint16),
      _2027: Function.prototype.call.bind(DataView.prototype.setUint16),
      _2028: Function.prototype.call.bind(DataView.prototype.getInt16),
      _2029: Function.prototype.call.bind(DataView.prototype.setInt16),
      _2030: Function.prototype.call.bind(DataView.prototype.getUint32),
      _2031: Function.prototype.call.bind(DataView.prototype.setUint32),
      _2032: Function.prototype.call.bind(DataView.prototype.getInt32),
      _2033: Function.prototype.call.bind(DataView.prototype.setInt32),
      _2034: Function.prototype.call.bind(DataView.prototype.getBigUint64),
      _2035: Function.prototype.call.bind(DataView.prototype.setBigUint64),
      _2036: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _2037: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _2038: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _2039: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _2040: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _2041: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _2042: Function.prototype.call.bind(Number.prototype.toString),
      _2043: Function.prototype.call.bind(BigInt.prototype.toString),
      _2044: Function.prototype.call.bind(Number.prototype.toString),
      _2045: (d, digits) => d.toFixed(digits),
      _2056: x0 => globalThis.fetch(x0),
      _2057: x0 => x0.arrayBuffer(),
      _2063: () => globalThis.google.accounts.oauth2,
      _2064: (x0,x1,x2) => x0.hasGrantedAllScopes(x1,x2),
      _2077: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._2077(f,arguments.length,x0) }),
      _2078: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._2078(f,arguments.length,x0) }),
      _2079: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10) => ({client_id: x0,callback: x1,scope: x2,include_granted_scopes: x3,prompt: x4,enable_granular_consent: x5,enable_serial_consent: x6,login_hint: x7,hd: x8,state: x9,error_callback: x10}),
      _2080: x0 => x0.requestAccessToken(),
      _2083: x0 => x0.access_token,
      _2084: x0 => x0.expires_in,
      _2090: x0 => x0.error,
      _2091: x0 => x0.error_description,
      _2093: x0 => x0.type,
      _2094: x0 => x0.message,
      _2098: () => globalThis.google.accounts.id,
      _2112: (module,f) => finalizeWrapper(f, function(x0) { return module.exports._2112(f,arguments.length,x0) }),
      _2115: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16) => ({client_id: x0,auto_select: x1,callback: x2,login_uri: x3,native_callback: x4,cancel_on_tap_outside: x5,prompt_parent_id: x6,nonce: x7,context: x8,state_cookie_domain: x9,ux_mode: x10,allowed_parent_origin: x11,intermediate_iframe_close_callback: x12,itp_support: x13,login_hint: x14,hd: x15,use_fedcm_for_prompt: x16}),
      _2126: x0 => x0.error,
      _2128: x0 => x0.credential,
      _2139: x0 => { globalThis.onGoogleLibraryLoad = x0 },
      _2140: (module,f) => finalizeWrapper(f, function() { return module.exports._2140(f,arguments.length) }),
      _2250: (x0,x1) => { x0.draggable = x1 },
      _2266: x0 => x0.style,
      _2465: (x0,x1) => { x0.nonce = x1 },
      _2623: (x0,x1) => { x0.target = x1 },
      _2625: (x0,x1) => { x0.download = x1 },
      _2650: (x0,x1) => { x0.href = x1 },
      _3195: (x0,x1) => { x0.accept = x1 },
      _3209: x0 => x0.files,
      _3235: (x0,x1) => { x0.multiple = x1 },
      _3253: (x0,x1) => { x0.type = x1 },
      _3503: (x0,x1) => { x0.src = x1 },
      _3505: (x0,x1) => { x0.type = x1 },
      _3509: (x0,x1) => { x0.async = x1 },
      _3511: (x0,x1) => { x0.defer = x1 },
      _3547: x0 => x0.width,
      _3548: (x0,x1) => { x0.width = x1 },
      _3549: x0 => x0.height,
      _3550: (x0,x1) => { x0.height = x1 },
      _3953: x0 => x0.items,
      _3956: (x0,x1) => x0[x1],
      _3960: x0 => x0.length,
      _3966: x0 => x0.dataTransfer,
      _3970: () => globalThis.window,
      _4009: x0 => x0.document,
      _4031: x0 => x0.navigator,
      _4102: (x0,x1) => { x0.ondragenter = x1 },
      _4104: (x0,x1) => { x0.ondragleave = x1 },
      _4106: (x0,x1) => { x0.ondragover = x1 },
      _4110: (x0,x1) => { x0.ondrop = x1 },
      _4293: x0 => x0.trustedTypes,
      _4295: x0 => x0.localStorage,
      _4420: x0 => x0.userAgent,
      _4426: x0 => x0.onLine,
      _4433: x0 => x0.storage,
      _4471: x0 => x0.data,
      _4501: x0 => x0.port1,
      _4502: x0 => x0.port2,
      _4504: (x0,x1) => { x0.onmessage = x1 },
      _4558: (x0,x1) => { x0.onmessage = x1 },
      _4569: (x0,x1) => { x0.onmessage = x1 },
      _4581: x0 => x0.port,
      _6561: x0 => x0.signal,
      _6570: x0 => x0.length,
      _6610: x0 => x0.baseURI,
      _6616: x0 => x0.firstChild,
      _6627: () => globalThis.document,
      _6707: x0 => x0.body,
      _6709: x0 => x0.head,
      _7038: (x0,x1) => { x0.id = x1 },
      _7062: (x0,x1) => { x0.innerHTML = x1 },
      _7065: x0 => x0.children,
      _7371: x0 => x0.clientX,
      _7372: x0 => x0.clientY,
      _8384: x0 => x0.value,
      _8386: x0 => x0.done,
      _8545: x0 => x0.size,
      _8546: x0 => x0.type,
      _8553: x0 => x0.name,
      _8554: x0 => x0.lastModified,
      _8559: x0 => x0.length,
      _8565: x0 => x0.result,
      _9061: x0 => x0.url,
      _9063: x0 => x0.status,
      _9065: x0 => x0.statusText,
      _9066: x0 => x0.headers,
      _9067: x0 => x0.body,
      _9079: x0 => x0.instance,
      _9081: () => globalThis.WebAssembly,
      _9103: x0 => x0.exports,
      _9111: x0 => x0.buffer,
      _10520: x0 => x0.result,
      _10521: x0 => x0.error,
      _10532: (x0,x1) => { x0.onupgradeneeded = x1 },
      _10534: x0 => x0.oldVersion,
      _10613: x0 => x0.key,
      _10614: x0 => x0.primaryKey,
      _10616: x0 => x0.value,
      _11454: (x0,x1) => { x0.display = x1 },
      _12676: x0 => x0.name,
      _12765: x0 => x0.href,
      _12780: x0 => x0.pathname,
      _13350: x0 => x0.isDirectory,
      _13351: x0 => x0.name,
      _13352: x0 => x0.fullPath,
      _13382: () => globalThis.console,
      _13403: () => globalThis.document,
      _13405: () => globalThis.console,
      _13410: (x0,x1) => { x0.height = x1 },
      _13412: (x0,x1) => { x0.width = x1 },
      _13414: (x0,x1) => { x0.pointerEvents = x1 },
      _13423: x0 => x0.style,
      _13426: x0 => x0.src,
      _13427: (x0,x1) => { x0.src = x1 },
      _13428: x0 => x0.naturalWidth,
      _13429: x0 => x0.naturalHeight,
      _13444: (x0,x1) => x0.error(x1),
      _13449: x0 => x0.status,
      _13450: (x0,x1) => { x0.responseType = x1 },
      _13452: x0 => x0.response,

    };

    const baseImports = {
      dart2wasm: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });
    dartInstance.exports.$setThisModule(dartInstance);

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
