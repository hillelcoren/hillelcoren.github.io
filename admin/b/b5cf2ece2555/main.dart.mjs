// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
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
            AB: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AC: Function.prototype.call.bind(DataView.prototype.getFloat64),
      AD: x0 => x0.vendor,
      AE: x0 => x0.language,
      AF: x0 => x0.deltaY,
      AG: () => globalThis.window,
      AH: x0 => x0.state,
      AI: (x0,x1) => { x0.title = x1 },
      AJ: () => globalThis.window._flutter_skwasmInstance,
      AK: (x0,x1) => x0.createImageBitmap(x1),
      AL: (x0,x1) => x0.readAsArrayBuffer(x1),
      AM: x0 => x0.close(),
      AN: (x0,x1) => x0.postMessage(x1),
      AO: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      AP: x0 => x0.storage,
      AQ: () => globalThis.WebAssembly,
      AR: (x0,x1) => x0.share(x1),
      AS: (x0,x1) => { x0.cMapPacked = x1 },
      AT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      B: s => printToConsole(s),
      BB: x0 => new Promise(x0),
      BC: Function.prototype.call.bind(DataView.prototype.setFloat64),
      BD: (x0,x1) => x0.createTextNode(x1),
      BE: x0 => x0.languages,
      BF: x0 => x0.deltaX,
      BG: (x0,x1) => x0.getItem(x1),
      BH: (x0,x1) => x0.go(x1),
      BI: (x0,x1) => x0.vibrate(x1),
      BJ: x0 => x0.fontFallbackBaseUrl,
      BK: x0 => new Blob(x0),
      BL: x0 => x0.result,
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BN: x0 => x0.close(),
      BO: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      BP: () => globalThis.navigator,
      BQ: x0 => x0.href,
      BR: x0 => x0.message,
      BS: (x0,x1) => { x0.cMapUrl = x1 },
      BT: x0 => x0.parentNode,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (x0,x1,x2) => x0.call(x1,x2),
      CC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      CD: (x0,x1) => { x0.id = x1 },
      CE: (x0,x1) => x0.observe(x1),
      CF: x0 => x0.wheelDeltaY,
      CG: x0 => x0.databases(),
      CH: (x0,x1) => x0.querySelectorAll(x1),
      CI: x0 => x0.arrayBuffer(),
      CJ: (x0,x1,x2) => x0.slice(x1,x2),
      CK: x0 => x0.close(),
      CL: () => new XMLHttpRequest(),
      CM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CN: (x0,x1) => ({i: x0,p: x1}),
      CO: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      CP: (x0,x1) => globalThis.fetch(x0,x1),
      CQ: (x0,x1) => x0.openCursor(x1),
      CR: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      CS: (x0,x1) => { x0.data = x1 },
      CT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      DC: (t, s) => t.set(s),
      DD: (x0,x1) => { x0.nonce = x1 },
      DE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      DF: x0 => x0.wheelDeltaX,
      DG: x0 => x0.name,
      DH: (d, digits) => d.toFixed(digits),
      DI: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      DJ: (x0,x1) => x0.decode(x1),
      DK: x0 => x0.naturalHeight,
      DL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      DM: x0 => x0.credentials,
      DN: (x0,x1) => ({c: x0,r: x1}),
      DO: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      DP: (x0,x1) => x0.sqlite3session_delete(x1),
      DQ: x0 => x0.arrayBuffer(),
      DR: x0 => ({url: x0}),
      DS: x0 => x0.baseURI,
      DT: (x0,x1) => { x0.display = x1 },
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: x0 => new Array(x0),
      EC: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ED: x0 => x0.nonce,
      EE: x0 => new ResizeObserver(x0),
      EF: x0 => x0.bottom,
      EG: () => globalThis.indexedDB,
      EH: x0 => x0.maxHeight,
      EI: x0 => x0.status,
      EJ: (x0,x1) => x0.adoptText(x1),
      EK: x0 => x0.naturalWidth,
      EL: x0 => x0.send(),
      EM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EN: (x0,x1) => { x0.onmessage = x1 },
      EO: (x0,x1) => x0.sqlite3_column_count(x1),
      EP: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      EQ: () => globalThis.Blob,
      ER: (x0,x1,x2,x3,x4,x5) => ({clientId: x0,scope: x1,redirectURI: x2,state: x3,nonce: x4,usePopup: x5}),
      ES: (x0,x1) => x0.querySelector(x1),
      ET: (x0,x1) => { x0.draggable = x1 },
      F: () => new Error().stack,
      FB: o => [o],
      FC: Function.prototype.call.bind(DataView.prototype.getFloat32),
      FD: () => globalThis.window.flutterConfiguration,
      FE: (x0,x1) => x0.getPropertyValue(x1),
      FF: x0 => x0.right,
      FG: (x0,x1) => x0.deleteDatabase(x1),
      FH: x0 => x0.maxWidth,
      FI: (x0,x1) => x0.fetch(x1),
      FJ: x0 => x0.first(),
      FK: (x0,x1) => { x0.src = x1 },
      FL: x0 => x0.type,
      FM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FN: (o, a) => o == a,
      FO: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      FP: (x0,x1) => x0.unregister(x1),
      FQ: x0 => x0.value,
      FR: x0 => globalThis.AppleID.auth.init(x0),
      FS: (x0,x1) => { x0.id = x1 },
      FT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      G: s => JSON.stringify(s),
      GB: (o0, o1) => [o0, o1],
      GC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      GD: (x0,x1) => x0.attachShadow(x1),
      GE: x0 => globalThis.parseFloat(x0),
      GF: x0 => x0.clientY,
      GG: x0 => x0.error,
      GH: x0 => x0.minHeight,
      GI: x0 => x0.content,
      GJ: x0 => x0.next(),
      GK: x0 => x0.displayHeight,
      GL: x0 => x0.response,
      GM: (x0,x1) => x0.matchMedia(x1),
      GN: x0 => x0.r,
      GO: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      GP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GQ: x0 => x0.key,
      GR: () => globalThis.AppleID.auth.signIn(),
      GS: x0 => globalThis.URL.revokeObjectURL(x0),
      GT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (o0, o1, o2) => [o0, o1, o2],
      HC: Function.prototype.call.bind(DataView.prototype.getUint32),
      HD: (x0,x1) => x0.createElement(x1),
      HE: (x0,x1) => x0.getComputedStyle(x1),
      HF: x0 => x0.clientX,
      HG: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      HH: x0 => x0.minWidth,
      HI: x0 => x0.document,
      HJ: x0 => x0.current(),
      HK: x0 => x0.displayWidth,
      HL: (x0,x1) => { x0.responseType = x1 },
      HM: x0 => x0.matches,
      HN: x0 => x0.c,
      HO: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      HP: x0 => new FinalizationRegistry(x0),
      HQ: x0 => x0.continue(),
      HR: x0 => x0.error,
      HS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      IC: Function.prototype.call.bind(DataView.prototype.setUint32),
      ID: x0 => x0.scale,
      IE: x0 => x0.documentElement,
      IF: x0 => x0.changedTouches,
      IG: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      IH: (x0,x1) => x0.removeProperty(x1),
      II: x0 => new WeakRef(x0),
      IJ: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      IK: x0 => x0.duration,
      IL: x0 => x0.vendor,
      IM: (a, l) => a.length = l,
      IN: x0 => x0.p,
      IO: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      IP: () => globalThis.FinalizationRegistry,
      IQ: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      IR: x0 => x0.lastName,
      IS: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      IT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (x0,x1,x2) => { x0[x1] = x2 },
      JC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      JD: x0 => x0.visualViewport,
      JE: x0 => x0.computedStyleMap(),
      JF: x0 => x0.key,
      JG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JH: (x0,x1) => x0.add(x1),
      JI: x0 => x0.deref(),
      JJ: x0 => x0.v8BreakIterator,
      JK: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      JL: x0 => x0.navigator,
      JM: x0 => x0.userAgent,
      JN: x0 => x0.i,
      JO: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      JP: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      JQ: x0 => x0.length,
      JR: x0 => x0.firstName,
      JS: x0 => x0.size,
      JT: (x0,x1) => { x0.ondragleave = x1 },
      K: o => o,
      KB: (o, p) => o[p],
      KC: Function.prototype.call.bind(DataView.prototype.getInt32),
      KD: x0 => x0.devicePixelRatio,
      KE: (x0,x1) => x0.get(x1),
      KF: x0 => x0.identifier,
      KG: x0 => x0.result,
      KH: x0 => x0.data,
      KI: () => globalThis.WeakRef,
      KJ: () => globalThis.Intl,
      KK: (x0,x1) => x0.decode(x1),
      KL: x0 => new Blob(x0),
      KM: (x0,x1) => x0.querySelectorAll(x1),
      KN: x0 => x0.port1,
      KO: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      KP: x0 => x0.exports,
      KQ: (x0,x1) => x0.get(x1),
      KR: x0 => x0.name,
      KS: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      KT: x0 => x0.preventDefault(),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: () => globalThis,
      LC: Function.prototype.call.bind(DataView.prototype.setInt32),
      LD: x0 => x0.height,
      LE: (o, p) => p in o,
      LF: x0 => x0.touches,
      LG: (x0,x1) => x0.removeItem(x1),
      LH: (x0,x1) => x0.removeAttribute(x1),
      LI: (handle) => clearInterval(handle),
      LJ: (x0,x1) => x0.segment(x1),
      LK: x0 => x0.image,
      LL: x0 => ({type: x0}),
      LM: (x0,x1) => x0.createElement(x1),
      LN: (x0,x1,x2) => x0.transaction(x1,x2),
      LO: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      LP: x0 => x0.call(),
      LQ: (x0,x1) => x0.index(x1),
      LR: x0 => x0.email,
      LS: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      LT: x0 => x0.clientY,
      M: x0 => x0.index,
      MB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      MD: x0 => x0.width,
      ME: (x0,x1) => { x0.textContent = x1 },
      MF: x0 => x0.pressure,
      MG: x0 => x0.sessionStorage,
      MH: (x0,x1) => { x0.value = x1 },
      MI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      MJ: x0 => x0.index,
      MK: x0 => x0.close(),
      ML: (x0,x1) => new Blob(x0,x1),
      MM: (x0,x1) => x0.append(x1),
      MN: x0 => x0.close(),
      MO: (x0,x1) => x0.sqlite3_result_null(x1),
      MP: x0 => x0.instance,
      MQ: x0 => x0.openKeyCursor(),
      MR: x0 => x0.user,
      MS: x0 => x0.height,
      MT: x0 => x0.clientX,
      N: o => String(o),
      NB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NC: o => o instanceof Uint16Array,
      ND: x0 => x0.screen,
      NE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NF: x0 => x0.tiltY,
      NG: (o, m, a) => o[m].apply(o, a),
      NH: (x0,x1) => { x0.value = x1 },
      NI: () => Date.now(),
      NJ: x0 => x0.next(),
      NK: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      NL: x0 => globalThis.fetch(x0),
      NM: (x0,x1) => x0.item(x1),
      NN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      NO: (x0,x1) => x0.sqlite3_value_blob(x1),
      NP: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      NQ: x0 => x0.primaryKey,
      NR: x0 => x0.state,
      NS: x0 => x0.width,
      NT: (x0,x1) => { x0.ondragover = x1 },
      O: o => o === undefined,
      OB: (x0,x1) => ({addView: x0,removeView: x1}),
      OC: Function.prototype.call.bind(DataView.prototype.getUint16),
      OD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      OE: x0 => x0.matches,
      OF: x0 => x0.tiltX,
      OG: (o, p, v) => o[p] = v,
      OH: x0 => x0.value,
      OI: (map, o, v) => map.set(o, v),
      OJ: x0 => x0.value,
      OK: x0 => new window.ImageDecoder(x0),
      OL: x0 => x0.arrayBuffer(),
      OM: (x0,x1) => x0.removeAttribute(x1),
      ON: x0 => x0.abort(),
      OO: (x0,x1) => x0.sqlite3_value_bytes(x1),
      OP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OQ: (x0,x1,x2) => x0.open(x1,x2),
      OR: x0 => x0.id_token,
      OS: (x0,x1) => { x0.src = x1 },
      OT: (x0,x1) => { x0.ondragenter = x1 },
      P: (x0,x1) => x0.exec(x1),
      PB: (l, r) => l === r,
      PC: Function.prototype.call.bind(DataView.prototype.setUint16),
      PD: x0 => x0.tabIndex,
      PE: (x0,x1) => x0.matchMedia(x1),
      PF: x0 => x0.pointerType,
      PG: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      PH: x0 => x0.selectionDirection,
      PI: () => new WeakMap(),
      PJ: x0 => x0.done,
      PK: x0 => x0.name,
      PL: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      PM: x0 => x0.body,
      PN: x0 => x0.commit(),
      PO: (x0,x1) => x0.sqlite3_value_text(x1),
      PP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      PQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PR: x0 => x0.code,
      PS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PT: (x0,x1) => { x0.ondrop = x1 },
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => x0.random(),
      QC: o => o instanceof Int16Array,
      QD: (x0,x1) => x0.contains(x1),
      QE: x0 => x0.matches,
      QF: x0 => x0.pointerId,
      QG: x0 => x0.isSecureContext,
      QH: x0 => x0.selectionStart,
      QI: x0 => x0.protocol,
      QJ: x0 => x0.iterator,
      QK: x0 => x0.repetitionCount,
      QL: x0 => x0.type,
      QM: (x0,x1) => { x0.backgroundColor = x1 },
      QN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QO: (x0,x1) => x0.sqlite3_value_double(x1),
      QP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      QQ: (x0,x1) => { x0.onupgradeneeded = x1 },
      QR: x0 => x0.authorization,
      QS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QT: x0 => x0.webkitGetAsEntry(),
      R: o => o,
      RB: () => globalThis.Math,
      RC: Function.prototype.call.bind(DataView.prototype.getInt16),
      RD: x0 => x0.activeElement,
      RE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      RF: x0 => x0.getCoalescedEvents(),
      RG: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      RH: x0 => x0.selectionEnd,
      RI: (x0,x1,x2) => x0.close(x1,x2),
      RJ: () => globalThis.Symbol,
      RK: x0 => x0.frameCount,
      RL: (a, i) => a.splice(i, 1),
      RM: x0 => x0.style,
      RN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      RO: (x0,x1) => x0.sqlite3_value_int64(x1),
      RP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      RQ: x0 => ({autoIncrement: x0}),
      RR: x0 => globalThis.URL.createObjectURL(x0),
      RS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RT: x0 => x0.createReader(),
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      SC: Function.prototype.call.bind(DataView.prototype.setInt16),
      SD: x0 => x0.parentNode,
      SE: f => f.dartFunction,
      SF: s => s.trimLeft(),
      SG: (x0,x1) => x0.getAttribute(x1),
      SH: x0 => x0.value,
      SI: x0 => x0.close(),
      SJ: (x0,x1) => new Intl.Segmenter(x0,x1),
      SK: x0 => x0.selectedTrack,
      SL: a => a.pop(),
      SM: x0 => x0.head,
      SN: (x0,x1) => { x0.onerror = x1 },
      SO: (x0,x1) => x0.sqlite3_value_type(x1),
      SP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      SQ: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      SR: (x0,x1) => x0.getElementById(x1),
      SS: (x0,x1) => { x0.onerror = x1 },
      ST: () => new Blob(),
      T: o => o instanceof RegExp,
      TB: b => !!b,
      TC: o => o instanceof Uint8ClampedArray,
      TD: x0 => x0.tagName,
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TF: s => s.toUpperCase(),
      TG: x0 => x0.pathname,
      TH: x0 => x0.selectionDirection,
      TI: (x0,x1) => x0.send(x1),
      TJ: x0 => x0.Segmenter,
      TK: x0 => x0.completed,
      TL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TM: (x0,x1) => { x0.content = x1 },
      TN: x0 => new DOMException(x0),
      TO: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      TP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      TQ: x0 => ({unique: x0}),
      TR: (x0,x1,x2) => x0.setAttribute(x1,x2),
      TS: (x0,x1) => { x0.oncancel = x1 },
      TT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      U: (string, times) => string.repeat(times),
      UB: () => globalThis.document,
      UC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      UD: x0 => x0.target,
      UE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      UF: (a, s) => a.join(s),
      UG: x0 => x0.origin,
      UH: x0 => x0.selectionStart,
      UI: () => new Array(),
      UJ: () => new TextDecoder(),
      UK: x0 => x0.ready,
      UL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UM: (x0,x1) => { x0.name = x1 },
      UN: x0 => x0.error,
      UO: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      UP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      UQ: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      UR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      US: (x0,x1) => { x0.onchange = x1 },
      UT: (x0,x1) => x0.file(x1),
      V: o => o,
      VB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VC: Function.prototype.call.bind(DataView.prototype.setInt8),
      VD: x0 => x0.clientY,
      VE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      VF: (x0,x1) => x0.error(x1),
      VG: x0 => x0.location,
      VH: x0 => x0.selectionEnd,
      VI: (x0,x1) => new WebSocket(x0,x1),
      VJ: (map, o) => map.get(o),
      VK: x0 => x0.tracks,
      VL: (a, s, e) => a.splice(s, e),
      VM: x0 => x0.length,
      VN: (x0,x1) => { x0.onabort = x1 },
      VO: x0 => x0.sqlite3_initialize(),
      VP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      VQ: (x0,x1) => x0.createObjectStore(x1),
      VR: (x0,x1,x2) => x0.addEventListener(x1,x2),
      VS: x0 => x0.lastModified,
      VT: x0 => x0.fullPath,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: (x0,x1) => x0.focus(x1),
      WC: Function.prototype.call.bind(DataView.prototype.getInt8),
      WD: x0 => x0.clientX,
      WE: (o, i) => o[i],
      WF: () => globalThis.console,
      WG: x0 => x0.documentElement,
      WH: (x0,x1) => { x0.name = x1 },
      WI: x0 => x0.reason,
      WJ: (a, i) => a.splice(i, 1)[0],
      WK: () => globalThis.window.ImageDecoder,
      WL: x0 => x0.input,
      WM: (x0,x1,x2) => x0.insertBefore(x1,x2),
      WN: (x0,x1) => { x0.oncomplete = x1 },
      WO: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      WP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      WQ: x0 => x0.oldVersion,
      WR: x0 => x0.remove(),
      WS: x0 => x0.name,
      WT: x0 => x0.name,
      X: x0 => x0.dotAll,
      XB: () => ({}),
      XC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      XD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      XE: o => o.length,
      XF: s => s.trimRight(),
      XG: () => globalThis.document,
      XH: (x0,x1) => { x0.placeholder = x1 },
      XI: x0 => x0.code,
      XJ: (x0,x1) => x0.createElement(x1),
      XK: x0 => x0.naturalHeight,
      XL: x0 => x0.decode(),
      XM: x0 => x0.id,
      XN: (x0,x1) => x0.objectStore(x1),
      XO: (x0,x1) => globalThis.Atomics.load(x0,x1),
      XP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XQ: (x0,x1) => ({name: x0,length: x1}),
      XR: x0 => x0.click(),
      XS: (x0,x1) => x0.item(x1),
      XT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Y: x0 => x0.unicode,
      YB: (o, p, v) => o[p] = v,
      YC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      YD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      YE: o => {
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
      YF: (x0,x1) => x0.requestAnimationFrame(x1),
      YG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      YH: (x0,x1) => { x0.autocomplete = x1 },
      YI: (o, t) => typeof o === t,
      YJ: (x0,x1) => x0.append(x1),
      YK: x0 => x0.naturalWidth,
      YL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      YM: x0 => x0.offsetHeight,
      YN: x0 => x0.buffer,
      YO: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      YP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      YQ: (x0,x1) => x0.update(x1),
      YR: (x0,x1) => { x0.target = x1 },
      YS: x0 => x0.length,
      YT: (x0,x1) => x0.readEntries(x1),
      Z: x0 => x0.ignoreCase,
      ZB: () => [],
      ZC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      ZD: (x0,x1) => x0.closest(x1),
      ZE: x0 => x0.language,
      ZF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZG: (o, p) => p in o,
      ZH: (x0,x1) => { x0.type = x1 },
      ZI: x0 => x0.data,
      ZJ: (x0,x1,x2) => x0.insertRule(x1,x2),
      ZK: (x0,x1) => { x0.pointerEvents = x1 },
      ZL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZM: x0 => x0.offsetWidth,
      ZN: (x0,x1) => x0.sqlite3_errstr(x1),
      ZO: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      ZP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      ZQ: x0 => x0.name,
      ZR: (x0,x1) => { x0.download = x1 },
      ZS: x0 => x0.files,
      ZT: x0 => x0.isDirectory,
      a: x0 => x0.multiline,
      aB: x0 => new Int8Array(x0),
      aC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      aD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      aE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      aF: x0 => x0.now(),
      aG: x0 => x0.groups,
      aH: (x0,x1) => { x0.name = x1 },
      aI: x0 => x0.readyState,
      aJ: (x0,x1) => x0.add(x1),
      aK: (x0,x1) => { x0.src = x1 },
      aL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aM: x0 => x0.stopPropagation(),
      aN: (x0,x1) => x0.sqlite3_errmsg(x1),
      aO: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      aP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      aQ: x0 => globalThis.IDBKeyRange.only(x0),
      aR: (x0,x1) => { x0.href = x1 },
      aS: x0 => x0.target,
      aT: (x0,x1) => x0[x1],
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      bC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      bD: (handle) => clearTimeout(handle),
      bE: () => globalThis.window.FinalizationRegistry,
      bF: x0 => x0.performance,
      bG: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      bH: (x0,x1) => { x0.placeholder = x1 },
      bI: (x0,x1) => { x0.binaryType = x1 },
      bJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bK: x0 => x0.src,
      bL: x0 => x0.send(),
      bM: x0 => x0.disabled,
      bN: (x0,x1) => x0.sqlite3_error_offset(x1),
      bO: (x0,x1,x2) => x0.setInt32(x1,x2),
      bP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      bQ: (x0,x1,x2) => x0.put(x1,x2),
      bR: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      bS: (x0,x1) => x0.replaceChildren(x1),
      bT: x0 => x0.length,
      c: () => globalThis.Promise.resolve(),
      cB: x0 => new Uint8Array(x0),
      cC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      cD: x0 => x0.maxTouchPoints,
      cE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cF: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      cG: (x0,x1) => x0.getRandomValues(x1),
      cH: (x0,x1) => { x0.scrollTop = x1 },
      cI: () => new AbortController(),
      cJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      cK: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      cL: x0 => x0.status,
      cM: (x0,x1) => { x0.min = x1 },
      cN: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      cO: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      cP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      cQ: (x0,x1) => x0.getKey(x1),
      cR: (x0,x1) => { x0.innerHTML = x1 },
      cS: (x0,x1) => { x0.accept = x1 },
      cT: x0 => x0.items,
      d: (x0,x1) => x0.then(x1),
      dB: x0 => new Uint8ClampedArray(x0),
      dC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      dD: x0 => x0.platform,
      dE: x0 => new window.FinalizationRegistry(x0),
      dF: (a, s, e) => a.slice(s, e),
      dG: () => globalThis.crypto,
      dH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      dI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      dJ: x0 => x0.preventDefault(),
      dK: x0 => x0.arrayBuffer(),
      dL: x0 => x0.response,
      dM: (x0,x1) => { x0.max = x1 },
      dN: (x0,x1) => x0.sqlite3_close_v2(x1),
      dO: (x0,x1,x2) => new DataView(x0,x1,x2),
      dP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      dQ: (x0,x1) => x0.delete(x1),
      dR: x0 => x0.document,
      dS: (x0,x1) => { x0.multiple = x1 },
      dT: x0 => x0.dataTransfer,
      e: (x0,x1) => x0[x1],
      eB: x0 => new Int16Array(x0),
      eC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      eD: (x0,x1) => x0.contains(x1),
      eE: (x0,x1) => x0.unregister(x1),
      eF: x0 => x0.blur(),
      eG: l => new DataView(new ArrayBuffer(l)),
      eH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      eI: (x0,x1) => globalThis.fetch(x0,x1),
      eJ: x0 => x0.createRange(),
      eK: (x0,x1) => x0.transferFromImageBitmap(x1),
      eL: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      eM: (x0,x1) => { x0.disabled = x1 },
      eN: (x0,x1) => x0.sqlite3_finalize(x1),
      eO: () => globalThis.Uint8Array,
      eP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      eQ: (x0,x1) => x0.put(x1),
      eR: () => ({}),
      eS: (x0,x1) => { x0.type = x1 },
      eT: x0 => x0.onLine,
      f: (o, p, r) => o.replace(p, () => r),
      fB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      fC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      fD: (decoder, codeUnits) => decoder.decode(codeUnits),
      fE: x0 => x0.preventDefault(),
      fF: x0 => x0.button,
      fG: () => typeof dartUseDateNowForTicks !== "undefined",
      fH: x0 => x0.keyCode,
      fI: (x0,x1) => x0.get(x1),
      fJ: (x0,x1) => x0.selectNode(x1),
      fK: x0 => x0.rasterEndMilliseconds,
      fL: (x0,x1) => { x0.responseType = x1 },
      fM: (x0,x1) => { x0.scrollLeft = x1 },
      fN: (x0,x1) => x0.sqlite3_reset(x1),
      fO: x0 => x0.communicationBuffer,
      fP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      fQ: (x0,x1,x2) => x0.postMessage(x1,x2),
      fR: x0 => globalThis.pdfjsLib.getDocument(x0),
      fS: (x0,x1) => x0.debug(x1),
      fT: x0 => x0.href,
      g: (o, p, r) => o.replaceAll(p, () => r),
      gB: x0 => new Uint16Array(x0),
      gC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      gD: () => new TextDecoder("utf-8", {fatal: true}),
      gE: x0 => x0.parent,
      gF: (x0,x1) => x0.prepend(x1),
      gG: () => Date.now(),
      gH: (x0,x1) => x0.scrollIntoView(x1),
      gI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      gJ: x0 => x0.getSelection(),
      gK: x0 => x0.rasterStartMilliseconds,
      gL: () => new XMLHttpRequest(),
      gM: (x0,x1) => { x0.spellcheck = x1 },
      gN: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      gO: () => globalThis.Int32Array,
      gP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gQ: x0 => x0.randomUUID(),
      gR: (x0,x1) => x0.getContext(x1),
      gS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gT: x0 => x0.extraAssets,
      h: x0 => x0.pop(),
      hB: x0 => new Int32Array(x0),
      hC: (x0,x1) => x0.querySelector(x1),
      hD: () => new TextDecoder("utf-8", {fatal: false}),
      hE: x0 => x0.timeStamp,
      hF: x0 => x0.parentElement,
      hG: () => 1000 * performance.now(),
      hH: x0 => x0.multiViewEnabled,
      hI: (x0,x1) => x0.forEach(x1),
      hJ: x0 => x0.removeAllRanges(),
      hK: x0 => x0.imageBitmaps,
      hL: x0 => x0.clearMarks(),
      hM: (x0,x1) => { x0.disabled = x1 },
      hN: (x0,x1) => x0.sqlite3_step(x1),
      hO: x0 => x0.byteLength,
      hP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      hQ: () => globalThis.crypto,
      hR: (x0,x1) => x0.getPage(x1),
      hS: x0 => ({createScriptURL: x0}),
      hT: x0 => x0.fontManifest,
      i: x0 => x0.flags,
      iB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      iC: (x0,x1) => x0.item(x1),
      iD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      iE: (x0,x1) => x0.hasAttribute(x1),
      iF: x0 => x0.innerHeight,
      iG: x0 => x0.reload(),
      iH: (x0,x1) => x0.replaceWith(x1),
      iI: x0 => x0.name,
      iJ: (x0,x1) => x0.addRange(x1),
      iK: (x0,x1) => { x0.height = x1 },
      iL: x0 => x0.clearMeasures(),
      iM: () => new MessageChannel(),
      iN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      iO: x0 => x0.synchronizationBuffer,
      iP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iQ: x0 => x0.port2,
      iR: (x0,x1) => x0.getViewport(x1),
      iS: (x0,x1,x2) => x0.createPolicy(x1,x2),
      iT: x0 => x0.assetManifest,
      j: x0 => x0.length,
      jB: x0 => new Uint32Array(x0),
      jC: x0 => x0.length,
      jD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      jE: x0 => x0.type,
      jF: x0 => x0.innerWidth,
      jG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jH: (x0,x1) => { x0.className = x1 },
      jI: x0 => x0.statusText,
      jJ: () => globalThis.window,
      jK: (x0,x1) => { x0.width = x1 },
      jL: (x0,x1) => x0.parse(x1),
      jM: x0 => new BroadcastChannel(x0),
      jN: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      jO: (x0,x1,x2) => x0.postMessage(x1,x2),
      jP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jQ: (x0,x1) => new SharedWorker(x0,x1),
      jR: (x0,x1) => x0.render(x1),
      jS: (x0,x1) => x0.createScriptURL(x1),
      jT: x0 => x0.buildConfig,
      k: s => new Date(s * 1000).getTimezoneOffset() * 60,
      kB: x0 => new Float32Array(x0),
      kC: (x0,x1) => x0.querySelectorAll(x1),
      kD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      kE: (x0,x1) => x0.getModifierState(x1),
      kF: x0 => x0.height,
      kG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      kH: (x0,x1) => { x0.tabIndex = x1 },
      kI: x0 => x0.url,
      kJ: (x0,x1) => { x0.innerText = x1 },
      kK: x0 => x0.convertToBlob(),
      kL: (x0,x1,x2) => x0.mark(x1,x2),
      kM: x0 => globalThis.Array.isArray(x0),
      kN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      kO: x0 => new SharedArrayBuffer(x0),
      kP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kQ: x0 => x0.start(),
      kR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kS: (x0,x1) => x0.appendChild(x1),
      kT: x0 => x0.length,
      l: Date.now,
      lB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      lC: (x0,x1) => x0.getAttribute(x1),
      lD: (s) => +s,
      lE: x0 => x0.buttons,
      lF: x0 => x0.width,
      lG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      lH: (x0,x1) => { x0.action = x1 },
      lI: x0 => x0.status,
      lJ: x0 => x0.offsetY,
      lK: (x0,x1,x2) => new ImageData(x0,x1,x2),
      lL: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      lM: x0 => x0.table,
      lN: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      lO: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      lP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      lQ: x0 => x0.port,
      lR: (x0,x1) => x0.toBlob(x1),
      lS: (x0,x1) => { x0.nonce = x1 },
      lT: x0 => x0.getReader(),
      m: (x0,x1) => x0.test(x1),
      mB: x0 => new Float64Array(x0),
      mC: x0 => x0.remove(),
      mD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      mE: x0 => x0.ctrlKey,
      mF: x0 => x0.clientHeight,
      mG: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      mH: (x0,x1) => { x0.method = x1 },
      mI: x0 => x0.getReader(),
      mJ: x0 => x0.offsetX,
      mK: (x0,x1) => x0.getContext(x1),
      mL: () => globalThis.JSON,
      mM: x0 => x0.kind,
      mN: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      mO: x0 => x0.close(),
      mP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      mQ: x0 => x0.canvasKitMaximumSurfaces,
      mR: x0 => x0.cleanup(),
      mS: x0 => x0.nonce,
      mT: x0 => x0.value,
      n: (string, token) => string.split(token),
      nB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      nC: (x0,x1) => x0.appendChild(x1),
      nD: s => s.trim(),
      nE: x0 => x0.getBoundingClientRect(),
      nF: x0 => x0.clientWidth,
      nG: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      nH: (x0,x1) => { x0.noValidate = x1 },
      nI: x0 => x0.read(),
      nJ: x0 => x0.button,
      nK: (x0,x1) => new OffscreenCanvas(x0,x1),
      nL: x0 => x0.clearMarks,
      nM: x0 => x0.close(),
      nN: x0 => globalThis.BigInt(x0),
      nO: x0 => x0.getSize(),
      nP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      nQ: x0 => x0.nextSibling,
      nR: x0 => x0.destroy(),
      nS: (x0,x1) => { x0.src = x1 },
      nT: x0 => x0.done,
      o: o => o instanceof Array,
      oB: x0 => new ArrayBuffer(x0),
      oC: (x0,x1) => x0.append(x1),
      oD: x0 => x0.classList,
      oE: x0 => x0.y,
      oF: x0 => x0.isConnected,
      oG: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oH: x0 => x0.click(),
      oI: x0 => x0.value,
      oJ: x0 => x0.classList,
      oK: x0 => x0.allocationSize(),
      oL: x0 => x0.clearMeasures,
      oM: (x0,x1) => x0.postMessage(x1),
      oN: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      oO: (x0,x1) => x0.truncate(x1),
      oP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      oQ: (x0,x1) => x0.debug(x1),
      oR: x0 => x0.height,
      oS: (x0,x1) => { x0.src = x1 },
      oT: x0 => x0.read(),
      p: (a, i) => a[i],
      pB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      pC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      pD: x0 => x0.relatedTarget,
      pE: x0 => x0.x,
      pF: x0 => x0.head,
      pG: o => o.byteLength,
      pH: (x0,x1) => x0.getElementsByClassName(x1),
      pI: x0 => x0.done,
      pJ: (x0,x1) => { x0.height = x1 },
      pK: (x0,x1) => x0.copyTo(x1),
      pL: x0 => x0.mark,
      pM: (x0,x1) => ({kind: x0,table: x1}),
      pN: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      pO: x0 => ({at: x0}),
      pP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      pQ: x0 => x0.hostElement,
      pR: x0 => x0.width,
      pS: (x0,x1) => { x0.defer = x1 },
      pT: x0 => x0.body,
      q: (a, i) => a.push(i),
      qB: (x0,x1,x2) => new DataView(x0,x1,x2),
      qC: x0 => x0.style,
      qD: x0 => x0.hasFocus(),
      qE: x0 => x0.top,
      qF: (x0,x1) => { x0.content = x1 },
      qG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      qH: (x0,x1) => x0.dispatchEvent(x1),
      qI: x0 => x0.cancel(),
      qJ: (x0,x1) => { x0.width = x1 },
      qK: (x0,x1) => { x0.height = x1 },
      qL: x0 => x0.measure,
      qM: () => ({}),
      qN: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      qO: (x0,x1) => x0.write(x1),
      qP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      qQ: x0 => x0.location,
      qR: x0 => x0.promise,
      qS: (x0,x1) => { x0.async = x1 },
      qT: x0 => x0.assetBase,
      r: a => a.length,
      rB: (o, p) => o[p],
      rC: x0 => x0.debugShowSemanticsNodes,
      rD: x0 => x0.shiftKey,
      rE: x0 => x0.left,
      rF: (x0,x1) => { x0.name = x1 },
      rG: x0 => x0.history,
      rH: (x0,x1) => x0.createEvent(x1),
      rI: x0 => x0.body,
      rJ: x0 => x0.style,
      rK: (x0,x1) => { x0.width = x1 },
      rL: () => globalThis.performance,
      rM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      rN: (x0,x1) => x0.dart_sqlite3_free(x1),
      rO: (x0,x1,x2) => x0.write(x1,x2),
      rP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      rQ: (x0,x1) => x0.getModifierState(x1),
      rR: (x0,x1) => { x0.viewport = x1 },
      rS: x0 => x0.trustedTypes,
      rT: x0 => x0.loader,
      s: (a, i, v) => a[i] = v,
      sB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      sC: (x0,x1) => x0.warn(x1),
      sD: x0 => x0.body,
      sE: x0 => x0.scrollTop,
      sF: (x0,x1) => x0.removeChild(x1),
      sG: x0 => x0.search,
      sH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      sI: x0 => x0.headers,
      sJ: x0 => x0.sheet,
      sK: (x0,x1) => x0.toDataURL(x1),
      sL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sM: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      sN: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      sO: x0 => x0.createSyncAccessHandle(),
      sP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      sQ: x0 => x0.metaKey,
      sR: (x0,x1) => { x0.canvasContext = x1 },
      sS: x0 => x0.trustedTypes,
      sT: () => globalThis._flutter,
      t: (x0,x1) => x0.log(x1),
      tB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      tC: x0 => x0.console,
      tD: x0 => x0.visibilityState,
      tE: x0 => x0.offsetTop,
      tF: x0 => x0.firstChild,
      tG: x0 => x0.location,
      tH: x0 => x0.readText(),
      tI: x0 => x0.signal,
      tJ: x0 => x0.head,
      tK: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      tL: (x0,x1) => { x0.onmessage = x1 },
      tM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tN: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      tO: x0 => ({create: x0}),
      tP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tQ: x0 => x0.altKey,
      tR: (x0,x1) => { x0.width = x1 },
      tS: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      u: () => globalThis.console,
      uB: o => o.byteOffset,
      uC: () => globalThis.window,
      uD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uE: x0 => x0.scrollLeft,
      uF: x0 => x0.viewConstraints,
      uG: x0 => x0.pathname,
      uH: x0 => x0.clipboard,
      uI: x0 => x0.abort(),
      uJ: () => globalThis.document,
      uK: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      uL: x0 => x0.terminate(),
      uM: (o,s,v) => o[s] = v,
      uN: (x0,x1) => x0.sqlite3_changes(x1),
      uO: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      uP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      uQ: x0 => x0.ctrlKey,
      uR: x0 => x0.width,
      uS: x0 => { globalThis.onGoogleLibraryLoad = x0 },
      v: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      vB: o => o.buffer,
      vC: (o, c) => o instanceof c,
      vD: (a, l) => a.length = l,
      vE: x0 => x0.offsetLeft,
      vF: x0 => x0.hostElement,
      vG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      vH: (x0,x1) => x0.writeText(x1),
      vI: x0 => x0.debugSkipFontRetryDelay,
      vJ: x0 => x0.close(),
      vK: (x0,x1) => x0.getContext(x1),
      vL: (x0,x1) => x0.postMessage(x1),
      vM: () => Symbol("jsBoxedDartObjectProperty"),
      vN: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      vO: x0 => ({create: x0}),
      vP: (x0,x1) => x0.getBigInt64(x1),
      vQ: x0 => x0.isComposing,
      vR: (x0,x1) => { x0.height = x1 },
      vS: () => globalThis.removeSplashFromWeb(),
      w: (x0,x1) => x0.didCreateEngineInitializer(x1),
      wB: Function.prototype.call.bind(DataView.prototype.getUint8),
      wC: x0 => x0.userAgent,
      wD: x0 => x0.disconnect(),
      wE: x0 => x0.offsetParent,
      wF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      wH: x0 => x0.unlock(),
      wI: x0 => new Uint8Array(x0),
      wJ: x0 => x0.height,
      wK: x0 => x0.format,
      wL: x0 => new Worker(x0),
      wM: (x0,x1) => x0.call(x1),
      wN: x0 => globalThis.Number(x0),
      wO: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      wP: (x0,x1) => x0.getInt32(x1),
      wQ: x0 => x0.code,
      wR: x0 => x0.height,
      wS: (x0,x1) => x0.removeChild(x1),
      x: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xB: Function.prototype.call.bind(DataView.prototype.setUint8),
      xC: x0 => x0.navigator,
      xD: x0 => new Intl.Locale(x0),
      xE: x0 => x0.offsetY,
      xF: x0 => ({runApp: x0}),
      xG: o => Object.keys(o),
      xH: (x0,x1) => x0.lock(x1),
      xI: (x0,x1,x2) => x0.set(x1,x2),
      xJ: x0 => x0.width,
      xK: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xM: x0 => x0.locks,
      xN: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      xO: (x0,x1) => new URL(x0,x1),
      xP: (x0,x1) => x0.read(x1),
      xQ: x0 => x0.repeat,
      xR: (x0,x1) => { x0.scale = x1 },
      xS: x0 => x0.firstChild,
      y: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      yB: (b, o) => new DataView(b, o),
      yC: Function.prototype.call.bind(String.prototype.toLowerCase),
      yD: x0 => x0.region,
      yE: x0 => x0.offsetX,
      yF: (x0,x1,x2) => x0.setItem(x1,x2),
      yG: x0 => x0.state,
      yH: x0 => x0.orientation,
      yI: x0 => x0.buffer,
      yJ: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      yK: x0 => x0.data,
      yL: (x0,x1) => { x0.onmessage = x1 },
      yM: () => globalThis.navigator,
      yN: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      yO: x0 => x0.pathname,
      yP: (x0,x1,x2) => x0.read(x1,x2),
      yQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yR: x0 => x0.numPages,
      yS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      z: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      zB: (b, o, l) => new DataView(b, o, l),
      zC: Object.is,
      zD: x0 => x0.script,
      zE: x0 => x0.deltaMode,
      zF: x0 => x0.localStorage,
      zG: x0 => x0.hash,
      zH: (x0,x1) => x0.querySelector(x1),
      zI: x0 => x0.wasmMemory,
      zJ: (x0,x1,x2) => x0.createImageBitmap(x1,x2),
      zK: () => new FileReader(),
      zL: (x0,x1) => x0.postMessage(x1),
      zM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zN: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      zO: x0 => x0.getDirectory(),
      zP: x0 => x0.flush(),
      zQ: (x0,x1) => x0.canShare(x1),
      zR: x0 => x0.promise,
      zS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),

    };

    const baseImports = {
      _: dart2wasm,
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

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

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
