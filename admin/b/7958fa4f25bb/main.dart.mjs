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
      AH: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      AI: (x0,x1) => x0.writeText(x1),
      AJ: () => globalThis.window._flutter_skwasmInstance,
      AK: (x0,x1) => x0.createImageBitmap(x1),
      AL: (x0,x1) => x0.readAsArrayBuffer(x1),
      AM: x0 => x0.close(),
      AN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      AO: (x0,x1) => x0.sqlite3_value_blob(x1),
      AP: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      AQ: x0 => x0.primaryKey,
      AR: x0 => x0.user,
      AS: x0 => x0.size,
      AT: (x0,x1) => { x0.draggable = x1 },
      B: s => printToConsole(s),
      BB: x0 => new Promise(x0),
      BC: Function.prototype.call.bind(DataView.prototype.setFloat64),
      BD: (x0,x1) => x0.createTextNode(x1),
      BE: x0 => x0.languages,
      BF: x0 => x0.deltaX,
      BG: (o, m, a) => o[m].apply(o, a),
      BH: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      BI: x0 => x0.unlock(),
      BJ: x0 => x0.fontFallbackBaseUrl,
      BK: x0 => new Blob(x0),
      BL: x0 => x0.result,
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BN: x0 => x0.abort(),
      BO: (x0,x1) => x0.sqlite3_value_bytes(x1),
      BP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BQ: (x0,x1,x2) => x0.open(x1,x2),
      BR: x0 => x0.state,
      BS: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      BT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      CG: (o, p, v) => o[p] = v,
      CH: o => Object.keys(o),
      CI: (x0,x1) => x0.lock(x1),
      CJ: (x0,x1,x2) => x0.slice(x1,x2),
      CK: x0 => x0.close(),
      CL: () => new XMLHttpRequest(),
      CM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CN: x0 => x0.commit(),
      CO: (x0,x1) => x0.sqlite3_value_text(x1),
      CP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CR: x0 => x0.id_token,
      CS: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
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
      DG: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      DH: x0 => x0.state,
      DI: x0 => x0.orientation,
      DJ: (x0,x1) => x0.decode(x1),
      DK: x0 => x0.naturalHeight,
      DL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      DM: x0 => x0.credentials,
      DN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      DO: (x0,x1) => x0.sqlite3_value_double(x1),
      DP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      DQ: (x0,x1) => { x0.onupgradeneeded = x1 },
      DR: x0 => x0.code,
      DS: x0 => x0.height,
      DT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      EG: x0 => x0.isSecureContext,
      EH: x0 => x0.hash,
      EI: (x0,x1) => x0.querySelector(x1),
      EJ: (x0,x1) => x0.adoptText(x1),
      EK: x0 => x0.naturalWidth,
      EL: x0 => x0.send(),
      EM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      EO: (x0,x1) => x0.sqlite3_value_int64(x1),
      EP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      EQ: x0 => ({autoIncrement: x0}),
      ER: x0 => x0.authorization,
      ES: x0 => x0.width,
      ET: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      F: () => new Error().stack,
      FB: o => [o],
      FC: Function.prototype.call.bind(DataView.prototype.getFloat32),
      FD: () => globalThis.window.flutterConfiguration,
      FE: (x0,x1) => x0.getPropertyValue(x1),
      FF: x0 => x0.right,
      FG: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      FH: x0 => x0.state,
      FI: (x0,x1) => { x0.title = x1 },
      FJ: x0 => x0.first(),
      FK: (x0,x1) => { x0.src = x1 },
      FL: x0 => x0.type,
      FM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FN: (x0,x1) => { x0.onerror = x1 },
      FO: (x0,x1) => x0.sqlite3_value_type(x1),
      FP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      FQ: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      FR: x0 => globalThis.URL.createObjectURL(x0),
      FS: (x0,x1) => { x0.src = x1 },
      FT: (x0,x1) => { x0.ondragleave = x1 },
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
      GG: (x0,x1) => x0.getAttribute(x1),
      GH: (x0,x1) => x0.go(x1),
      GI: (x0,x1) => x0.vibrate(x1),
      GJ: x0 => x0.next(),
      GK: x0 => x0.displayHeight,
      GL: x0 => x0.response,
      GM: (x0,x1) => x0.matchMedia(x1),
      GN: x0 => new DOMException(x0),
      GO: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      GP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      GQ: x0 => ({unique: x0}),
      GR: (x0,x1) => x0.getElementById(x1),
      GS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GT: x0 => x0.preventDefault(),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (o0, o1, o2) => [o0, o1, o2],
      HC: Function.prototype.call.bind(DataView.prototype.getUint32),
      HD: (x0,x1) => x0.createElement(x1),
      HE: (x0,x1) => x0.getComputedStyle(x1),
      HF: x0 => x0.clientX,
      HG: x0 => x0.pathname,
      HH: (x0,x1) => x0.querySelectorAll(x1),
      HI: x0 => x0.arrayBuffer(),
      HJ: x0 => x0.current(),
      HK: x0 => x0.displayWidth,
      HL: (x0,x1) => { x0.responseType = x1 },
      HM: x0 => x0.matches,
      HN: x0 => x0.error,
      HO: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      HP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      HQ: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      HR: (x0,x1) => x0.createElement(x1),
      HS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HT: x0 => x0.clientY,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      IC: Function.prototype.call.bind(DataView.prototype.setUint32),
      ID: x0 => x0.scale,
      IE: x0 => x0.documentElement,
      IF: x0 => x0.changedTouches,
      IG: x0 => x0.origin,
      IH: (d, digits) => d.toFixed(digits),
      II: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      IJ: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      IK: x0 => x0.duration,
      IL: x0 => x0.vendor,
      IM: (a, l) => a.length = l,
      IN: (x0,x1) => { x0.onabort = x1 },
      IO: x0 => x0.sqlite3_initialize(),
      IP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      IQ: (x0,x1) => x0.createObjectStore(x1),
      IR: (x0,x1,x2) => x0.setAttribute(x1,x2),
      IS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IT: x0 => x0.clientX,
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
      JG: x0 => x0.location,
      JH: x0 => x0.maxHeight,
      JI: x0 => x0.status,
      JJ: x0 => x0.v8BreakIterator,
      JK: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      JL: x0 => x0.navigator,
      JM: (x0,x1,x2) => x0.insertBefore(x1,x2),
      JN: (x0,x1) => { x0.oncomplete = x1 },
      JO: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      JP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      JQ: x0 => x0.oldVersion,
      JR: (x0,x1) => x0.append(x1),
      JS: (x0,x1) => { x0.onerror = x1 },
      JT: (x0,x1) => { x0.ondragover = x1 },
      K: o => o,
      KB: (o, p) => o[p],
      KC: Function.prototype.call.bind(DataView.prototype.getInt32),
      KD: x0 => x0.devicePixelRatio,
      KE: (x0,x1) => x0.get(x1),
      KF: x0 => x0.identifier,
      KG: x0 => x0.documentElement,
      KH: x0 => x0.maxWidth,
      KI: (x0,x1) => x0.fetch(x1),
      KJ: () => globalThis.Intl,
      KK: (x0,x1) => x0.decode(x1),
      KL: x0 => new Blob(x0),
      KM: x0 => x0.id,
      KN: (x0,x1) => x0.objectStore(x1),
      KO: (x0,x1) => globalThis.Atomics.load(x0,x1),
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KQ: (x0,x1) => ({name: x0,length: x1}),
      KR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KS: (x0,x1) => { x0.oncancel = x1 },
      KT: (x0,x1) => { x0.ondragenter = x1 },
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
      LG: () => globalThis.document,
      LH: x0 => x0.minHeight,
      LI: x0 => x0.content,
      LJ: (x0,x1) => x0.segment(x1),
      LK: x0 => x0.image,
      LL: x0 => ({type: x0}),
      LM: x0 => x0.offsetHeight,
      LN: x0 => x0.buffer,
      LO: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      LP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      LQ: (x0,x1) => x0.update(x1),
      LR: (x0,x1,x2) => x0.addEventListener(x1,x2),
      LS: (x0,x1) => { x0.onchange = x1 },
      LT: (x0,x1) => { x0.ondrop = x1 },
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
      MG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      MH: x0 => x0.minWidth,
      MI: x0 => x0.document,
      MJ: x0 => x0.index,
      MK: x0 => x0.close(),
      ML: (x0,x1) => new Blob(x0,x1),
      MM: x0 => x0.offsetWidth,
      MN: (x0,x1) => x0.sqlite3_errstr(x1),
      MO: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      MP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      MQ: x0 => x0.name,
      MR: x0 => x0.remove(),
      MS: x0 => x0.lastModified,
      MT: x0 => x0.webkitGetAsEntry(),
      N: o => String(o),
      NB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NC: o => o instanceof Uint16Array,
      ND: x0 => x0.screen,
      NE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NF: x0 => x0.tiltY,
      NG: (o, p) => p in o,
      NH: (x0,x1) => x0.removeProperty(x1),
      NI: x0 => new WeakRef(x0),
      NJ: x0 => x0.next(),
      NK: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      NL: x0 => globalThis.fetch(x0),
      NM: x0 => x0.stopPropagation(),
      NN: (x0,x1) => x0.sqlite3_errmsg(x1),
      NO: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      NP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      NQ: x0 => globalThis.IDBKeyRange.only(x0),
      NR: x0 => x0.click(),
      NS: x0 => x0.name,
      NT: x0 => x0.createReader(),
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
      OG: x0 => x0.groups,
      OH: (x0,x1) => x0.add(x1),
      OI: x0 => x0.deref(),
      OJ: x0 => x0.value,
      OK: x0 => new window.ImageDecoder(x0),
      OL: x0 => x0.arrayBuffer(),
      OM: x0 => x0.disabled,
      ON: (x0,x1) => x0.sqlite3_error_offset(x1),
      OO: (x0,x1,x2) => x0.setInt32(x1,x2),
      OP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      OQ: (x0,x1,x2) => x0.put(x1,x2),
      OR: (x0,x1) => { x0.target = x1 },
      OS: (x0,x1) => x0.item(x1),
      OT: () => new Blob(),
      P: (x0,x1) => x0.exec(x1),
      PB: (l, r) => l === r,
      PC: Function.prototype.call.bind(DataView.prototype.setUint16),
      PD: x0 => x0.tabIndex,
      PE: (x0,x1) => x0.matchMedia(x1),
      PF: x0 => x0.pointerType,
      PG: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      PH: x0 => x0.data,
      PI: () => globalThis.WeakRef,
      PJ: x0 => x0.done,
      PK: x0 => x0.name,
      PL: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      PM: (x0,x1) => { x0.min = x1 },
      PN: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      PO: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      PP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      PQ: (x0,x1) => x0.getKey(x1),
      PR: (x0,x1) => { x0.download = x1 },
      PS: x0 => x0.length,
      PT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => x0.random(),
      QC: o => o instanceof Int16Array,
      QD: (x0,x1) => x0.contains(x1),
      QE: x0 => x0.matches,
      QF: x0 => x0.pointerId,
      QG: x0 => x0.localStorage,
      QH: (x0,x1) => x0.removeAttribute(x1),
      QI: (handle) => clearInterval(handle),
      QJ: x0 => x0.iterator,
      QK: x0 => x0.repetitionCount,
      QL: x0 => x0.type,
      QM: (x0,x1) => { x0.max = x1 },
      QN: (x0,x1) => x0.sqlite3_close_v2(x1),
      QO: (x0,x1,x2) => new DataView(x0,x1,x2),
      QP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      QQ: (x0,x1) => x0.delete(x1),
      QR: (x0,x1) => { x0.href = x1 },
      QS: x0 => x0.files,
      QT: (x0,x1) => x0.file(x1),
      R: o => o,
      RB: () => globalThis.Math,
      RC: Function.prototype.call.bind(DataView.prototype.getInt16),
      RD: x0 => x0.activeElement,
      RE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      RF: x0 => x0.getCoalescedEvents(),
      RG: (x0,x1,x2) => x0.setItem(x1,x2),
      RH: (x0,x1) => { x0.value = x1 },
      RI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      RJ: () => globalThis.Symbol,
      RK: x0 => x0.frameCount,
      RL: (a, i) => a.splice(i, 1),
      RM: (x0,x1) => { x0.disabled = x1 },
      RN: (x0,x1) => x0.sqlite3_finalize(x1),
      RO: () => globalThis.Uint8Array,
      RP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      RQ: (x0,x1) => x0.put(x1),
      RR: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      RS: x0 => x0.target,
      RT: x0 => x0.fullPath,
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
      SG: (x0,x1) => x0.getItem(x1),
      SH: (x0,x1) => { x0.value = x1 },
      SI: () => Date.now(),
      SJ: (x0,x1) => new Intl.Segmenter(x0,x1),
      SK: x0 => x0.selectedTrack,
      SL: a => a.pop(),
      SM: (x0,x1) => { x0.scrollLeft = x1 },
      SN: (x0,x1) => x0.sqlite3_reset(x1),
      SO: x0 => x0.communicationBuffer,
      SP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SQ: (x0,x1,x2) => x0.postMessage(x1,x2),
      SR: x0 => x0.body,
      SS: (x0,x1) => x0.replaceChildren(x1),
      ST: x0 => x0.name,
      T: o => o instanceof RegExp,
      TB: b => !!b,
      TC: o => o instanceof Uint8ClampedArray,
      TD: x0 => x0.tagName,
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TF: s => s.toUpperCase(),
      TG: () => new AbortController(),
      TH: x0 => x0.value,
      TI: (map, o, v) => map.set(o, v),
      TJ: x0 => x0.Segmenter,
      TK: x0 => x0.completed,
      TL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TM: (x0,x1) => { x0.spellcheck = x1 },
      TN: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      TO: () => globalThis.Int32Array,
      TP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TQ: x0 => x0.randomUUID(),
      TR: (x0,x1) => { x0.innerHTML = x1 },
      TS: (x0,x1) => { x0.accept = x1 },
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
      UG: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      UH: x0 => x0.selectionDirection,
      UI: () => new WeakMap(),
      UJ: () => new TextDecoder(),
      UK: x0 => x0.ready,
      UL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UM: (x0,x1) => { x0.disabled = x1 },
      UN: (x0,x1) => x0.sqlite3_step(x1),
      UO: x0 => x0.byteLength,
      UP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      UQ: () => globalThis.crypto,
      UR: x0 => x0.document,
      US: (x0,x1) => { x0.multiple = x1 },
      UT: (x0,x1) => x0.readEntries(x1),
      V: o => o,
      VB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VC: Function.prototype.call.bind(DataView.prototype.setInt8),
      VD: x0 => x0.clientY,
      VE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      VF: (x0,x1) => x0.error(x1),
      VG: (x0,x1) => globalThis.fetch(x0,x1),
      VH: x0 => x0.selectionStart,
      VI: x0 => x0.protocol,
      VJ: (map, o) => map.get(o),
      VK: x0 => x0.tracks,
      VL: (a, s, e) => a.splice(s, e),
      VM: () => new MessageChannel(),
      VN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      VO: x0 => x0.synchronizationBuffer,
      VP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VQ: x0 => x0.port2,
      VR: () => ({}),
      VS: (x0,x1) => { x0.type = x1 },
      VT: x0 => x0.isDirectory,
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
      WG: (x0,x1) => x0.get(x1),
      WH: x0 => x0.selectionEnd,
      WI: (x0,x1,x2) => x0.close(x1,x2),
      WJ: (a, i) => a.splice(i, 1)[0],
      WK: () => globalThis.window.ImageDecoder,
      WL: x0 => x0.input,
      WM: x0 => new BroadcastChannel(x0),
      WN: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      WO: (x0,x1,x2) => x0.postMessage(x1,x2),
      WP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WQ: (x0,x1) => new SharedWorker(x0,x1),
      WR: x0 => globalThis.pdfjsLib.getDocument(x0),
      WS: (x0,x1) => x0.debug(x1),
      WT: (x0,x1) => x0[x1],
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
      XG: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      XH: x0 => x0.value,
      XI: x0 => x0.close(),
      XJ: (x0,x1) => x0.createElement(x1),
      XK: x0 => x0.naturalHeight,
      XL: x0 => x0.decode(),
      XM: x0 => globalThis.Array.isArray(x0),
      XN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      XO: x0 => new SharedArrayBuffer(x0),
      XP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XQ: x0 => x0.start(),
      XR: (x0,x1) => x0.getContext(x1),
      XS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XT: x0 => x0.length,
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
      YG: (x0,x1) => x0.forEach(x1),
      YH: x0 => x0.selectionDirection,
      YI: (x0,x1) => x0.send(x1),
      YJ: (x0,x1) => x0.append(x1),
      YK: x0 => x0.naturalWidth,
      YL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      YM: x0 => x0.table,
      YN: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      YO: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      YP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      YQ: x0 => x0.port,
      YR: (x0,x1) => x0.getPage(x1),
      YS: x0 => ({createScriptURL: x0}),
      YT: x0 => x0.items,
      Z: x0 => x0.ignoreCase,
      ZB: () => [],
      ZC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      ZD: (x0,x1) => x0.closest(x1),
      ZE: x0 => x0.language,
      ZF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZG: x0 => x0.name,
      ZH: x0 => x0.selectionStart,
      ZI: () => new Array(),
      ZJ: (x0,x1,x2) => x0.insertRule(x1,x2),
      ZK: (x0,x1) => { x0.pointerEvents = x1 },
      ZL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZM: x0 => x0.kind,
      ZN: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      ZO: x0 => x0.close(),
      ZP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      ZQ: x0 => x0.canvasKitMaximumSurfaces,
      ZR: (x0,x1) => x0.getViewport(x1),
      ZS: (x0,x1,x2) => x0.createPolicy(x1,x2),
      ZT: x0 => x0.dataTransfer,
      a: x0 => x0.multiline,
      aB: x0 => new Int8Array(x0),
      aC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      aD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      aE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      aF: x0 => x0.now(),
      aG: x0 => x0.statusText,
      aH: x0 => x0.selectionEnd,
      aI: (x0,x1) => new WebSocket(x0,x1),
      aJ: (x0,x1) => x0.add(x1),
      aK: (x0,x1) => { x0.src = x1 },
      aL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aM: x0 => x0.close(),
      aN: x0 => globalThis.BigInt(x0),
      aO: x0 => x0.getSize(),
      aP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      aQ: x0 => x0.nextSibling,
      aR: (x0,x1) => x0.render(x1),
      aS: (x0,x1) => x0.createScriptURL(x1),
      aT: x0 => x0.onLine,
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
      bG: x0 => x0.url,
      bH: (x0,x1) => { x0.name = x1 },
      bI: x0 => x0.reason,
      bJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bK: x0 => x0.src,
      bL: x0 => x0.send(),
      bM: (x0,x1) => x0.postMessage(x1),
      bN: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      bO: (x0,x1) => x0.truncate(x1),
      bP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      bQ: (x0,x1) => x0.debug(x1),
      bR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bS: (x0,x1) => x0.appendChild(x1),
      bT: x0 => x0.href,
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
      cG: x0 => x0.status,
      cH: (x0,x1) => { x0.placeholder = x1 },
      cI: x0 => x0.code,
      cJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      cK: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      cL: x0 => x0.status,
      cM: (x0,x1) => ({kind: x0,table: x1}),
      cN: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      cO: x0 => ({at: x0}),
      cP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      cQ: x0 => x0.hostElement,
      cR: (x0,x1) => x0.toBlob(x1),
      cS: x0 => x0.head,
      cT: x0 => x0.extraAssets,
      d: (x0,x1) => x0.then(x1),
      dB: x0 => new Uint8ClampedArray(x0),
      dC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      dD: x0 => x0.platform,
      dE: x0 => new window.FinalizationRegistry(x0),
      dF: (a, s, e) => a.slice(s, e),
      dG: x0 => x0.getReader(),
      dH: (x0,x1) => { x0.autocomplete = x1 },
      dI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      dJ: x0 => x0.preventDefault(),
      dK: x0 => x0.arrayBuffer(),
      dL: x0 => x0.response,
      dM: () => ({}),
      dN: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      dO: (x0,x1) => x0.write(x1),
      dP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      dQ: x0 => x0.location,
      dR: x0 => x0.cleanup(),
      dS: (x0,x1) => { x0.nonce = x1 },
      dT: x0 => x0.fontManifest,
      e: (x0,x1) => x0[x1],
      eB: x0 => new Int16Array(x0),
      eC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      eD: (x0,x1) => x0.contains(x1),
      eE: (x0,x1) => x0.unregister(x1),
      eF: x0 => x0.blur(),
      eG: x0 => x0.read(),
      eH: (x0,x1) => { x0.type = x1 },
      eI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eJ: x0 => x0.createRange(),
      eK: (x0,x1) => x0.transferFromImageBitmap(x1),
      eL: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      eM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      eN: (x0,x1) => x0.dart_sqlite3_free(x1),
      eO: (x0,x1,x2) => x0.write(x1,x2),
      eP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      eQ: (x0,x1) => x0.getModifierState(x1),
      eR: x0 => x0.destroy(),
      eS: (x0,x1) => x0.querySelectorAll(x1),
      eT: x0 => x0.assetManifest,
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
      fG: x0 => x0.value,
      fH: (x0,x1) => { x0.name = x1 },
      fI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      fJ: (x0,x1) => x0.selectNode(x1),
      fK: x0 => x0.rasterEndMilliseconds,
      fL: (x0,x1) => { x0.responseType = x1 },
      fM: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      fN: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      fO: x0 => x0.createSyncAccessHandle(),
      fP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      fQ: x0 => x0.metaKey,
      fR: x0 => x0.height,
      fS: (x0,x1) => x0.item(x1),
      fT: x0 => x0.buildConfig,
      g: (o, p, r) => o.replaceAll(p, () => r),
      gB: x0 => new Uint16Array(x0),
      gC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      gD: () => new TextDecoder("utf-8", {fatal: true}),
      gE: x0 => x0.parent,
      gF: (x0,x1) => x0.prepend(x1),
      gG: x0 => x0.done,
      gH: (x0,x1) => { x0.placeholder = x1 },
      gI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gJ: x0 => x0.getSelection(),
      gK: x0 => x0.rasterStartMilliseconds,
      gL: () => new XMLHttpRequest(),
      gM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      gN: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      gO: x0 => ({create: x0}),
      gP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      gQ: x0 => x0.altKey,
      gR: x0 => x0.width,
      gS: x0 => x0.nonce,
      gT: x0 => x0.length,
      h: x0 => x0.pop(),
      hB: x0 => new Int32Array(x0),
      hC: (x0,x1) => x0.querySelector(x1),
      hD: () => new TextDecoder("utf-8", {fatal: false}),
      hE: x0 => x0.timeStamp,
      hF: x0 => x0.parentElement,
      hG: x0 => x0.cancel(),
      hH: (x0,x1) => { x0.scrollTop = x1 },
      hI: (o, t) => typeof o === t,
      hJ: x0 => x0.removeAllRanges(),
      hK: x0 => x0.imageBitmaps,
      hL: x0 => x0.clearMarks(),
      hM: (o,s,v) => o[s] = v,
      hN: (x0,x1) => x0.sqlite3_changes(x1),
      hO: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      hP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      hQ: x0 => x0.ctrlKey,
      hR: x0 => x0.promise,
      hS: x0 => x0.length,
      hT: x0 => x0.getReader(),
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
      iG: x0 => x0.body,
      iH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      iI: x0 => x0.data,
      iJ: (x0,x1) => x0.addRange(x1),
      iK: (x0,x1) => { x0.height = x1 },
      iL: x0 => x0.clearMeasures(),
      iM: () => Symbol("jsBoxedDartObjectProperty"),
      iN: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      iO: x0 => ({create: x0}),
      iP: (x0,x1) => x0.getBigInt64(x1),
      iQ: x0 => x0.isComposing,
      iR: (x0,x1) => { x0.viewport = x1 },
      iS: (x0,x1) => { x0.src = x1 },
      iT: x0 => x0.value,
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
      jG: x0 => x0.headers,
      jH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      jI: x0 => x0.readyState,
      jJ: () => globalThis.window,
      jK: (x0,x1) => { x0.width = x1 },
      jL: (x0,x1) => x0.parse(x1),
      jM: (x0,x1) => x0.call(x1),
      jN: x0 => globalThis.Number(x0),
      jO: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      jP: (x0,x1) => x0.getInt32(x1),
      jQ: x0 => x0.code,
      jR: (x0,x1) => { x0.canvasContext = x1 },
      jS: (x0,x1) => { x0.src = x1 },
      jT: x0 => x0.done,
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
      kG: x0 => x0.signal,
      kH: x0 => x0.keyCode,
      kI: (x0,x1) => { x0.binaryType = x1 },
      kJ: (x0,x1) => { x0.innerText = x1 },
      kK: x0 => x0.convertToBlob(),
      kL: (x0,x1,x2) => x0.mark(x1,x2),
      kM: x0 => x0.locks,
      kN: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      kO: (x0,x1) => new URL(x0,x1),
      kP: (x0,x1) => x0.read(x1),
      kQ: x0 => x0.repeat,
      kR: (x0,x1) => { x0.width = x1 },
      kS: (x0,x1) => { x0.defer = x1 },
      kT: x0 => x0.read(),
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
      lG: x0 => x0.abort(),
      lH: (x0,x1) => x0.scrollIntoView(x1),
      lI: (x0,x1) => x0.getRandomValues(x1),
      lJ: x0 => x0.offsetY,
      lK: (x0,x1,x2) => new ImageData(x0,x1,x2),
      lL: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      lM: () => globalThis.navigator,
      lN: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      lO: x0 => x0.pathname,
      lP: (x0,x1,x2) => x0.read(x1,x2),
      lQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lR: x0 => x0.width,
      lS: (x0,x1) => { x0.async = x1 },
      lT: x0 => x0.body,
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
      mG: () => typeof dartUseDateNowForTicks !== "undefined",
      mH: x0 => x0.multiViewEnabled,
      mI: () => globalThis.crypto,
      mJ: x0 => x0.offsetX,
      mK: (x0,x1) => x0.getContext(x1),
      mL: () => globalThis.JSON,
      mM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mN: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      mO: x0 => x0.getDirectory(),
      mP: x0 => x0.flush(),
      mQ: (x0,x1) => x0.canShare(x1),
      mR: (x0,x1) => { x0.height = x1 },
      mS: x0 => x0.trustedTypes,
      mT: x0 => x0.assetBase,
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
      nG: () => Date.now(),
      nH: (x0,x1) => x0.replaceWith(x1),
      nI: l => new DataView(new ArrayBuffer(l)),
      nJ: x0 => x0.button,
      nK: (x0,x1) => new OffscreenCanvas(x0,x1),
      nL: x0 => x0.clearMarks,
      nM: (x0,x1) => x0.postMessage(x1),
      nN: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      nO: x0 => x0.storage,
      nP: () => globalThis.WebAssembly,
      nQ: (x0,x1) => x0.share(x1),
      nR: x0 => x0.height,
      nS: x0 => x0.trustedTypes,
      nT: x0 => x0.loader,
      o: o => o instanceof Array,
      oB: x0 => new ArrayBuffer(x0),
      oC: (x0,x1) => x0.append(x1),
      oD: x0 => x0.classList,
      oE: x0 => x0.y,
      oF: x0 => x0.isConnected,
      oG: () => 1000 * performance.now(),
      oH: (x0,x1) => { x0.className = x1 },
      oI: x0 => x0.reload(),
      oJ: x0 => x0.classList,
      oK: x0 => x0.allocationSize(),
      oL: x0 => x0.clearMeasures,
      oM: x0 => x0.close(),
      oN: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      oO: () => globalThis.navigator,
      oP: x0 => x0.href,
      oQ: x0 => x0.message,
      oR: (x0,x1) => { x0.scale = x1 },
      oS: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      oT: () => globalThis._flutter,
      p: (a, i) => a[i],
      pB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      pC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      pD: x0 => x0.relatedTarget,
      pE: x0 => x0.x,
      pF: x0 => x0.head,
      pG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pH: (x0,x1) => { x0.tabIndex = x1 },
      pI: x0 => x0.databases(),
      pJ: (x0,x1) => { x0.height = x1 },
      pK: (x0,x1) => x0.copyTo(x1),
      pL: x0 => x0.mark,
      pM: (x0,x1) => ({i: x0,p: x1}),
      pN: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      pO: (x0,x1) => globalThis.fetch(x0,x1),
      pP: (x0,x1) => x0.openCursor(x1),
      pQ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      pR: x0 => x0.numPages,
      pS: x0 => { globalThis.onGoogleLibraryLoad = x0 },
      q: (a, i) => a.push(i),
      qB: (x0,x1,x2) => new DataView(x0,x1,x2),
      qC: x0 => x0.style,
      qD: x0 => x0.hasFocus(),
      qE: x0 => x0.top,
      qF: (x0,x1) => { x0.content = x1 },
      qG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qH: (x0,x1) => { x0.action = x1 },
      qI: x0 => x0.name,
      qJ: (x0,x1) => { x0.width = x1 },
      qK: (x0,x1) => { x0.height = x1 },
      qL: x0 => x0.measure,
      qM: (x0,x1) => ({c: x0,r: x1}),
      qN: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      qO: (x0,x1) => x0.sqlite3session_delete(x1),
      qP: x0 => x0.arrayBuffer(),
      qQ: x0 => ({url: x0}),
      qR: x0 => x0.promise,
      qS: () => globalThis.removeSplashFromWeb(),
      r: a => a.length,
      rB: (o, p) => o[p],
      rC: x0 => x0.debugShowSemanticsNodes,
      rD: x0 => x0.shiftKey,
      rE: x0 => x0.left,
      rF: (x0,x1) => { x0.name = x1 },
      rG: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      rH: (x0,x1) => { x0.method = x1 },
      rI: () => globalThis.indexedDB,
      rJ: x0 => x0.style,
      rK: (x0,x1) => { x0.width = x1 },
      rL: () => globalThis.performance,
      rM: (x0,x1) => { x0.onmessage = x1 },
      rN: (x0,x1) => x0.sqlite3_column_count(x1),
      rO: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      rP: () => globalThis.Blob,
      rQ: x0 => x0.userAgent,
      rR: (x0,x1) => { x0.cMapPacked = x1 },
      rS: (x0,x1) => x0.removeChild(x1),
      s: (a, i, v) => a[i] = v,
      sB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      sC: (x0,x1) => x0.warn(x1),
      sD: x0 => x0.body,
      sE: x0 => x0.scrollTop,
      sF: (x0,x1) => x0.removeChild(x1),
      sG: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      sH: (x0,x1) => { x0.noValidate = x1 },
      sI: (x0,x1) => x0.deleteDatabase(x1),
      sJ: x0 => x0.sheet,
      sK: (x0,x1) => x0.toDataURL(x1),
      sL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sM: (o, a) => o == a,
      sN: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      sO: (x0,x1) => x0.unregister(x1),
      sP: x0 => x0.value,
      sQ: (x0,x1,x2,x3,x4,x5) => ({clientId: x0,scope: x1,redirectURI: x2,state: x3,nonce: x4,usePopup: x5}),
      sR: (x0,x1) => { x0.cMapUrl = x1 },
      sS: x0 => x0.firstChild,
      t: (x0,x1) => x0.log(x1),
      tB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      tC: x0 => x0.console,
      tD: x0 => x0.visibilityState,
      tE: x0 => x0.offsetTop,
      tF: x0 => x0.firstChild,
      tG: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      tH: x0 => x0.click(),
      tI: x0 => x0.error,
      tJ: x0 => x0.head,
      tK: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      tL: (x0,x1) => { x0.onmessage = x1 },
      tM: x0 => x0.r,
      tN: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      tO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tP: x0 => x0.key,
      tQ: x0 => globalThis.AppleID.auth.init(x0),
      tR: (x0,x1) => { x0.data = x1 },
      tS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      u: () => globalThis.console,
      uB: o => o.byteOffset,
      uC: () => globalThis.window,
      uD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uE: x0 => x0.scrollLeft,
      uF: x0 => x0.viewConstraints,
      uG: o => o.byteLength,
      uH: (x0,x1) => x0.getElementsByClassName(x1),
      uI: x0 => x0.result,
      uJ: () => globalThis.document,
      uK: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      uL: x0 => x0.terminate(),
      uM: x0 => x0.c,
      uN: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      uO: x0 => new FinalizationRegistry(x0),
      uP: x0 => x0.continue(),
      uQ: () => globalThis.AppleID.auth.signIn(),
      uR: x0 => x0.baseURI,
      uS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      v: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      vB: o => o.buffer,
      vC: (o, c) => o instanceof c,
      vD: (a, l) => a.length = l,
      vE: x0 => x0.offsetLeft,
      vF: x0 => x0.hostElement,
      vG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      vH: (x0,x1) => x0.dispatchEvent(x1),
      vI: x0 => x0.debugSkipFontRetryDelay,
      vJ: x0 => x0.close(),
      vK: (x0,x1) => x0.getContext(x1),
      vL: (x0,x1) => x0.postMessage(x1),
      vM: x0 => x0.p,
      vN: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      vO: () => globalThis.FinalizationRegistry,
      vP: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      vQ: x0 => x0.error,
      vR: (x0,x1) => x0.querySelector(x1),
      vS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      w: (x0,x1) => x0.didCreateEngineInitializer(x1),
      wB: Function.prototype.call.bind(DataView.prototype.getUint8),
      wC: x0 => x0.userAgent,
      wD: x0 => x0.disconnect(),
      wE: x0 => x0.offsetParent,
      wF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wG: x0 => x0.history,
      wH: (x0,x1) => x0.createEvent(x1),
      wI: x0 => new Uint8Array(x0),
      wJ: x0 => x0.height,
      wK: x0 => x0.format,
      wL: x0 => new Worker(x0),
      wM: x0 => x0.i,
      wN: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      wO: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      wP: x0 => x0.length,
      wQ: x0 => x0.lastName,
      wR: (x0,x1) => { x0.id = x1 },
      wS: x0 => x0.parentNode,
      x: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xB: Function.prototype.call.bind(DataView.prototype.setUint8),
      xC: x0 => x0.navigator,
      xD: x0 => new Intl.Locale(x0),
      xE: x0 => x0.offsetY,
      xF: x0 => ({runApp: x0}),
      xG: x0 => x0.search,
      xH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      xI: (x0,x1,x2) => x0.set(x1,x2),
      xJ: x0 => x0.width,
      xK: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xM: x0 => x0.port1,
      xN: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      xO: x0 => x0.exports,
      xP: (x0,x1) => x0.get(x1),
      xQ: x0 => x0.firstName,
      xR: x0 => globalThis.URL.revokeObjectURL(x0),
      xS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      y: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      yB: (b, o) => new DataView(b, o),
      yC: Function.prototype.call.bind(String.prototype.toLowerCase),
      yD: x0 => x0.region,
      yE: x0 => x0.offsetX,
      yF: (x0,x1) => x0.removeItem(x1),
      yG: x0 => x0.location,
      yH: x0 => x0.readText(),
      yI: x0 => x0.buffer,
      yJ: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      yK: x0 => x0.data,
      yL: (x0,x1) => { x0.onmessage = x1 },
      yM: (x0,x1,x2) => x0.transaction(x1,x2),
      yN: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      yO: x0 => x0.call(),
      yP: (x0,x1) => x0.index(x1),
      yQ: x0 => x0.name,
      yR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yS: (x0,x1) => { x0.display = x1 },
      z: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      zB: (b, o, l) => new DataView(b, o, l),
      zC: Object.is,
      zD: x0 => x0.script,
      zE: x0 => x0.deltaMode,
      zF: x0 => x0.sessionStorage,
      zG: x0 => x0.pathname,
      zH: x0 => x0.clipboard,
      zI: x0 => x0.wasmMemory,
      zJ: (x0,x1,x2) => x0.createImageBitmap(x1,x2),
      zK: () => new FileReader(),
      zL: (x0,x1) => x0.postMessage(x1),
      zM: x0 => x0.close(),
      zN: (x0,x1) => x0.sqlite3_result_null(x1),
      zO: x0 => x0.instance,
      zP: x0 => x0.openKeyCursor(),
      zQ: x0 => x0.email,
      zR: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      zS: x0 => x0.style,

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
