// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
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
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.getInt16),
      AD: x0 => x0.devicePixelRatio,
      AE: x0 => x0.languages,
      AF: x0 => x0.deltaX,
      AG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      AH: (x0,x1) => { x0.placeholder = x1 },
      AI: x0 => x0.abort(),
      AJ: x0 => x0.value,
      AK: x0 => new window.ImageDecoder(x0),
      AL: x0 => x0.arrayBuffer(),
      AM: x0 => x0.stopPropagation(),
      AN: x0 => x0.buffer,
      AO: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      AP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      AQ: (x0,x1) => x0.update(x1),
      AR: x0 => x0.click(),
      AS: x0 => x0.lastModified,
      AT: (x0,x1) => x0.removeChild(x1),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: o => o instanceof Uint8ClampedArray,
      BD: x0 => x0.height,
      BE: (x0,x1) => x0.observe(x1),
      BF: x0 => x0.wheelDeltaY,
      BG: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      BH: (x0,x1) => { x0.action = x1 },
      BI: () => typeof dartUseDateNowForTicks !== "undefined",
      BJ: x0 => x0.done,
      BK: x0 => x0.name,
      BL: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      BM: x0 => x0.disabled,
      BN: (x0,x1) => x0.sqlite3_errstr(x1),
      BO: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      BP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      BQ: x0 => x0.name,
      BR: (x0,x1) => { x0.target = x1 },
      BS: x0 => x0.name,
      BT: x0 => x0.firstChild,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      CD: x0 => x0.width,
      CE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CF: x0 => x0.wheelDeltaX,
      CG: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      CH: (x0,x1) => { x0.method = x1 },
      CI: () => Date.now(),
      CJ: (o, m, a) => o[m].apply(o, a),
      CK: x0 => x0.repetitionCount,
      CL: x0 => x0.type,
      CM: (x0,x1) => { x0.min = x1 },
      CN: (x0,x1) => x0.sqlite3_errmsg(x1),
      CO: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      CP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CQ: x0 => globalThis.IDBKeyRange.only(x0),
      CR: (x0,x1) => { x0.download = x1 },
      CS: (x0,x1) => x0.item(x1),
      CT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: x0 => x0.screen,
      DE: x0 => new ResizeObserver(x0),
      DF: x0 => x0.key,
      DG: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      DH: (x0,x1) => { x0.noValidate = x1 },
      DI: () => 1000 * performance.now(),
      DJ: x0 => x0.iterator,
      DK: x0 => x0.frameCount,
      DL: (a, i) => a.splice(i, 1),
      DM: (x0,x1) => { x0.max = x1 },
      DN: (x0,x1) => x0.sqlite3_error_offset(x1),
      DO: (x0,x1,x2) => x0.setInt32(x1,x2),
      DP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      DQ: (x0,x1,x2) => x0.put(x1,x2),
      DR: (x0,x1) => { x0.href = x1 },
      DS: x0 => x0.length,
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
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      EE: (x0,x1) => x0.getPropertyValue(x1),
      EF: x0 => x0.identifier,
      EG: o => o.byteLength,
      EH: (x0,x1) => x0.removeAttribute(x1),
      EI: (map, o, v) => map.set(o, v),
      EJ: () => globalThis.Symbol,
      EK: x0 => x0.selectedTrack,
      EL: a => a.pop(),
      EM: (x0,x1) => { x0.disabled = x1 },
      EN: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      EO: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      EP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      EQ: (x0,x1) => x0.getKey(x1),
      ER: () => globalThis.document,
      ES: x0 => x0.files,
      ET: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: x0 => x0.tabIndex,
      FE: x0 => globalThis.parseFloat(x0),
      FF: x0 => x0.touches,
      FG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      FH: x0 => x0.isConnected,
      FI: () => new WeakMap(),
      FJ: (x0,x1) => new Intl.Segmenter(x0,x1),
      FK: x0 => x0.completed,
      FL: (a, s, e) => a.splice(s, e),
      FM: (x0,x1) => { x0.scrollLeft = x1 },
      FN: (x0,x1) => x0.sqlite3_close_v2(x1),
      FO: (x0,x1,x2) => new DataView(x0,x1,x2),
      FP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      FQ: (x0,x1) => x0.delete(x1),
      FR: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      FS: x0 => x0.target,
      FT: x0 => x0.parentNode,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: (x0,x1) => x0.contains(x1),
      GE: (x0,x1) => x0.getComputedStyle(x1),
      GF: x0 => x0.pressure,
      GG: x0 => x0.history,
      GH: x0 => x0.click(),
      GI: x0 => x0.protocol,
      GJ: x0 => x0.Segmenter,
      GK: x0 => x0.ready,
      GL: x0 => x0.input,
      GM: (x0,x1) => { x0.spellcheck = x1 },
      GN: (x0,x1) => x0.sqlite3_finalize(x1),
      GO: () => globalThis.Uint8Array,
      GP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      GQ: (x0,x1) => x0.put(x1),
      GR: x0 => x0.body,
      GS: (x0,x1) => x0.replaceChildren(x1),
      GT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.activeElement,
      HE: x0 => x0.documentElement,
      HF: x0 => x0.tiltY,
      HG: x0 => x0.search,
      HH: (x0,x1) => x0.getElementsByClassName(x1),
      HI: (x0,x1,x2) => x0.close(x1,x2),
      HJ: () => new TextDecoder(),
      HK: x0 => x0.tracks,
      HL: (o, p) => p in o,
      HM: (x0,x1) => { x0.disabled = x1 },
      HN: (x0,x1) => x0.sqlite3_reset(x1),
      HO: x0 => x0.communicationBuffer,
      HP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      HQ: (x0,x1,x2) => x0.postMessage(x1,x2),
      HR: (x0,x1) => { x0.innerHTML = x1 },
      HS: (x0,x1) => { x0.accept = x1 },
      HT: (x0,x1) => { x0.display = x1 },
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.parentNode,
      IE: x0 => x0.computedStyleMap(),
      IF: x0 => x0.tiltX,
      IG: x0 => x0.location,
      IH: (x0,x1) => x0.dispatchEvent(x1),
      II: x0 => x0.close(),
      IJ: (a, i) => a.splice(i, 1)[0],
      IK: () => globalThis.window.ImageDecoder,
      IL: x0 => x0.groups,
      IM: () => new MessageChannel(),
      IN: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      IO: () => globalThis.Int32Array,
      IP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IQ: x0 => x0.randomUUID(),
      IR: x0 => x0.document,
      IS: (x0,x1) => { x0.multiple = x1 },
      IT: x0 => x0.style,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.tagName,
      JE: (x0,x1) => x0.get(x1),
      JF: x0 => x0.pointerType,
      JG: x0 => x0.pathname,
      JH: (x0,x1) => x0.createEvent(x1),
      JI: (x0,x1) => x0.send(x1),
      JJ: (x0,x1) => x0.createElement(x1),
      JK: x0 => x0.naturalHeight,
      JL: x0 => x0.decode(),
      JM: x0 => new BroadcastChannel(x0),
      JN: (x0,x1) => x0.sqlite3_step(x1),
      JO: x0 => x0.byteLength,
      JP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      JQ: () => globalThis.crypto,
      JR: () => ({}),
      JS: (x0,x1) => { x0.type = x1 },
      JT: (x0,x1) => { x0.draggable = x1 },
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.target,
      KE: (o, p) => p in o,
      KF: x0 => x0.pointerId,
      KG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      KH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      KI: () => new Array(),
      KJ: (x0,x1) => x0.append(x1),
      KK: x0 => x0.naturalWidth,
      KL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      KM: x0 => globalThis.Array.isArray(x0),
      KN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      KO: x0 => x0.synchronizationBuffer,
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KQ: x0 => x0.port2,
      KR: x0 => globalThis.pdfjsLib.getDocument(x0),
      KS: (x0,x1) => x0.getAttribute(x1),
      KT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientY,
      LE: (x0,x1) => { x0.textContent = x1 },
      LF: x0 => x0.getCoalescedEvents(),
      LG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      LH: x0 => x0.readText(),
      LI: (x0,x1) => new WebSocket(x0,x1),
      LJ: (x0,x1,x2) => x0.insertRule(x1,x2),
      LK: (x0,x1) => { x0.pointerEvents = x1 },
      LL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LM: x0 => x0.table,
      LN: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      LO: (x0,x1,x2) => x0.postMessage(x1,x2),
      LP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LQ: (x0,x1) => new SharedWorker(x0,x1),
      LR: (x0,x1) => x0.getContext(x1),
      LS: (x0,x1) => x0.debug(x1),
      LT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: x0 => x0.clientX,
      ME: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MF: (x0,x1) => x0.getModifierState(x1),
      MG: o => Object.keys(o),
      MH: x0 => x0.clipboard,
      MI: x0 => x0.reason,
      MJ: (x0,x1) => x0.add(x1),
      MK: (x0,x1) => { x0.src = x1 },
      ML: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MM: x0 => x0.kind,
      MN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      MO: x0 => new SharedArrayBuffer(x0),
      MP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MQ: x0 => x0.start(),
      MR: (x0,x1) => x0.getPage(x1),
      MS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: (x0,x1,x2) => x0.setAttribute(x1,x2),
      NE: x0 => x0.matches,
      NF: s => s.trimLeft(),
      NG: x0 => x0.state,
      NH: (x0,x1) => x0.writeText(x1),
      NI: x0 => x0.code,
      NJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NK: x0 => x0.src,
      NL: x0 => x0.send(),
      NM: x0 => x0.close(),
      NN: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      NO: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      NP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      NQ: x0 => x0.port,
      NR: (x0,x1) => x0.getViewport(x1),
      NS: x0 => ({createScriptURL: x0}),
      NT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: x0 => x0.getBoundingClientRect(),
      OE: (x0,x1) => x0.matchMedia(x1),
      OF: s => s.toUpperCase(),
      OG: x0 => x0.hash,
      OH: x0 => x0.unlock(),
      OI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      OJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      OK: (map, o) => map.get(o),
      OL: x0 => x0.status,
      OM: (x0,x1) => x0.postMessage(x1),
      ON: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      OO: x0 => x0.close(),
      OP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      OQ: x0 => x0.canvasKitMaximumSurfaces,
      OR: (x0,x1) => x0.render(x1),
      OS: (x0,x1,x2) => x0.createPolicy(x1,x2),
      OT: (x0,x1) => { x0.ondragleave = x1 },
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      PE: x0 => x0.matches,
      PF: x0 => x0.pop(),
      PG: x0 => x0.state,
      PH: (x0,x1) => x0.lock(x1),
      PI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PJ: x0 => x0.preventDefault(),
      PK: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      PL: x0 => x0.response,
      PM: (x0,x1) => ({kind: x0,table: x1}),
      PN: x0 => globalThis.BigInt(x0),
      PO: x0 => x0.getSize(),
      PP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      PQ: x0 => x0.nextSibling,
      PR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PS: (x0,x1) => x0.createScriptURL(x1),
      PT: x0 => x0.preventDefault(),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      QE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      QF: x0 => x0.flags,
      QG: (x0,x1) => x0.go(x1),
      QH: x0 => x0.orientation,
      QI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      QJ: x0 => x0.createRange(),
      QK: x0 => x0.arrayBuffer(),
      QL: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      QM: () => ({}),
      QN: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      QO: (x0,x1) => x0.truncate(x1),
      QP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      QQ: (x0,x1) => x0.debug(x1),
      QR: (x0,x1) => x0.toBlob(x1),
      QS: (x0,x1) => x0.appendChild(x1),
      QT: x0 => x0.clientY,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: Date.now,
      RE: f => f.dartFunction,
      RF: (a, s) => a.join(s),
      RG: x0 => x0.parentElement,
      RH: (x0,x1) => x0.querySelector(x1),
      RI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RJ: (x0,x1) => x0.selectNode(x1),
      RK: (x0,x1) => x0.transferFromImageBitmap(x1),
      RL: (x0,x1) => { x0.responseType = x1 },
      RM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      RN: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      RO: x0 => ({at: x0}),
      RP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      RQ: x0 => x0.hostElement,
      RR: x0 => x0.cleanup(),
      RS: x0 => x0.head,
      RT: x0 => x0.clientX,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (handle) => clearTimeout(handle),
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SF: (x0,x1) => x0.error(x1),
      SG: (x0,x1) => x0.querySelectorAll(x1),
      SH: (x0,x1) => { x0.title = x1 },
      SI: (o, t) => typeof o === t,
      SJ: x0 => x0.getSelection(),
      SK: x0 => x0.height,
      SL: () => new XMLHttpRequest(),
      SM: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      SN: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      SO: (x0,x1) => x0.write(x1),
      SP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SQ: x0 => x0.location,
      SR: x0 => x0.destroy(),
      SS: (x0,x1) => { x0.nonce = x1 },
      ST: (x0,x1) => { x0.ondragover = x1 },
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: (a, l) => a.length = l,
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TF: () => globalThis.console,
      TG: (d, digits) => d.toFixed(digits),
      TH: (x0,x1) => x0.vibrate(x1),
      TI: x0 => x0.data,
      TJ: x0 => x0.removeAllRanges(),
      TK: x0 => x0.width,
      TL: x0 => x0.clearMarks(),
      TM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TN: (x0,x1) => x0.dart_sqlite3_free(x1),
      TO: (x0,x1,x2) => x0.write(x1,x2),
      TP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      TQ: (x0,x1) => x0.getModifierState(x1),
      TR: x0 => x0.height,
      TS: (x0,x1) => x0.querySelectorAll(x1),
      TT: (x0,x1) => { x0.ondragenter = x1 },
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: (x0,x1) => x0.closest(x1),
      UE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      UF: s => s.trimRight(),
      UG: x0 => x0.maxHeight,
      UH: x0 => x0.arrayBuffer(),
      UI: x0 => x0.readyState,
      UJ: (x0,x1) => x0.addRange(x1),
      UK: x0 => x0.rasterEndMilliseconds,
      UL: x0 => x0.clearMeasures(),
      UM: (o,s,v) => o[s] = v,
      UN: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      UO: x0 => x0.createSyncAccessHandle(),
      UP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      UQ: x0 => x0.metaKey,
      UR: x0 => x0.width,
      US: (x0,x1) => x0.item(x1),
      UT: (x0,x1) => { x0.ondrop = x1 },
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.bottom,
      VE: (o, i) => o[i],
      VF: (x0,x1) => x0.requestAnimationFrame(x1),
      VG: x0 => x0.maxWidth,
      VH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      VI: (x0,x1) => { x0.binaryType = x1 },
      VJ: () => globalThis.window,
      VK: x0 => x0.rasterStartMilliseconds,
      VL: (x0,x1) => x0.parse(x1),
      VM: () => Symbol("jsBoxedDartObjectProperty"),
      VN: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      VO: x0 => ({create: x0}),
      VP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      VQ: x0 => x0.altKey,
      VR: x0 => x0.promise,
      VS: x0 => x0.nonce,
      VT: x0 => x0.webkitGetAsEntry(),
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.top,
      WE: o => o.length,
      WF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WG: x0 => x0.minHeight,
      WH: x0 => x0.status,
      WI: (x0,x1) => x0.getRandomValues(x1),
      WJ: (x0,x1) => { x0.innerText = x1 },
      WK: x0 => x0.imageBitmaps,
      WL: (x0,x1,x2) => x0.mark(x1,x2),
      WM: (x0,x1) => x0.call(x1),
      WN: (x0,x1) => x0.sqlite3_changes(x1),
      WO: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      WP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      WQ: x0 => x0.ctrlKey,
      WR: (x0,x1) => { x0.viewport = x1 },
      WS: x0 => x0.length,
      WT: x0 => x0.createReader(),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.right,
      XE: o => {
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
      XF: x0 => x0.now(),
      XG: x0 => x0.minWidth,
      XH: (x0,x1) => x0.fetch(x1),
      XI: () => globalThis.crypto,
      XJ: x0 => x0.offsetY,
      XK: (x0,x1) => { x0.height = x1 },
      XL: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      XM: x0 => x0.locks,
      XN: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      XO: x0 => ({create: x0}),
      XP: (x0,x1) => x0.getBigInt64(x1),
      XQ: x0 => x0.isComposing,
      XR: (x0,x1) => { x0.canvasContext = x1 },
      XS: (x0,x1) => { x0.src = x1 },
      XT: () => new Blob(),
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.left,
      YE: x0 => x0.language,
      YF: x0 => x0.performance,
      YG: (x0,x1) => x0.removeProperty(x1),
      YH: x0 => x0.content,
      YI: l => new DataView(new ArrayBuffer(l)),
      YJ: x0 => x0.offsetX,
      YK: (x0,x1) => { x0.width = x1 },
      YL: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      YM: () => globalThis.navigator,
      YN: x0 => globalThis.Number(x0),
      YO: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      YP: (x0,x1) => x0.getInt32(x1),
      YQ: x0 => x0.code,
      YR: (x0,x1) => { x0.width = x1 },
      YS: (x0,x1) => { x0.src = x1 },
      YT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.clientY,
      ZE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      ZF: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      ZG: (x0,x1) => x0.add(x1),
      ZH: x0 => x0.document,
      ZI: x0 => x0.reload(),
      ZJ: x0 => x0.button,
      ZK: x0 => x0.convertToBlob(),
      ZL: () => globalThis.JSON,
      ZM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZN: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      ZO: (x0,x1) => new URL(x0,x1),
      ZP: (x0,x1) => x0.read(x1),
      ZQ: x0 => x0.repeat,
      ZR: x0 => x0.width,
      ZS: (x0,x1) => { x0.defer = x1 },
      ZT: (x0,x1) => x0.file(x1),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.clientX,
      aE: () => globalThis.window.FinalizationRegistry,
      aF: (a, s, e) => a.slice(s, e),
      aG: x0 => x0.data,
      aH: x0 => new WeakRef(x0),
      aI: x0 => x0.location,
      aJ: x0 => x0.classList,
      aK: (x0,x1,x2) => new ImageData(x0,x1,x2),
      aL: x0 => x0.clearMarks,
      aM: (x0,x1) => x0.postMessage(x1),
      aN: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      aO: x0 => x0.pathname,
      aP: (x0,x1,x2) => x0.read(x1,x2),
      aQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aR: (x0,x1) => { x0.height = x1 },
      aS: (x0,x1) => { x0.async = x1 },
      aT: x0 => x0.fullPath,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.changedTouches,
      bE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bF: x0 => x0.blur(),
      bG: (x0,x1) => { x0.scrollTop = x1 },
      bH: x0 => x0.deref(),
      bI: x0 => x0.databases(),
      bJ: (x0,x1) => { x0.height = x1 },
      bK: (x0,x1) => x0.getContext(x1),
      bL: x0 => x0.clearMeasures,
      bM: x0 => x0.close(),
      bN: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      bO: x0 => x0.getDirectory(),
      bP: x0 => x0.flush(),
      bQ: x0 => x0.userAgent,
      bR: x0 => x0.height,
      bS: x0 => x0.trustedTypes,
      bT: x0 => x0.name,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.offsetY,
      cE: x0 => new window.FinalizationRegistry(x0),
      cF: x0 => x0.button,
      cG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      cH: () => globalThis.WeakRef,
      cI: x0 => x0.name,
      cJ: (x0,x1) => { x0.width = x1 },
      cK: (x0,x1) => new OffscreenCanvas(x0,x1),
      cL: x0 => x0.mark,
      cM: (x0,x1) => ({i: x0,p: x1}),
      cN: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      cO: x0 => x0.storage,
      cP: () => globalThis.WebAssembly,
      cQ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      cR: (x0,x1) => { x0.scale = x1 },
      cS: x0 => x0.trustedTypes,
      cT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.offsetX,
      dE: (x0,x1) => x0.unregister(x1),
      dF: x0 => x0.innerHeight,
      dG: (x0,x1) => { x0.value = x1 },
      dH: (x0,x1) => x0.removeItem(x1),
      dI: () => globalThis.indexedDB,
      dJ: x0 => x0.style,
      dK: x0 => x0.allocationSize(),
      dL: x0 => x0.measure,
      dM: (x0,x1) => ({c: x0,r: x1}),
      dN: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      dO: () => globalThis.navigator,
      dP: x0 => x0.href,
      dQ: () => globalThis.AppleID.auth.signIn(),
      dR: x0 => x0.numPages,
      dS: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      dT: (x0,x1) => x0.readEntries(x1),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.type,
      eE: (x0,x1) => x0.contains(x1),
      eF: x0 => x0.innerWidth,
      eG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      eH: x0 => x0.localStorage,
      eI: (x0,x1) => x0.deleteDatabase(x1),
      eJ: x0 => x0.sheet,
      eK: (x0,x1) => x0.copyTo(x1),
      eL: () => globalThis.performance,
      eM: (x0,x1) => { x0.onmessage = x1 },
      eN: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      eO: (x0,x1) => globalThis.fetch(x0,x1),
      eP: (x0,x1) => x0.openCursor(x1),
      eQ: x0 => x0.error,
      eR: x0 => x0.promise,
      eS: x0 => { globalThis.onGoogleLibraryLoad = x0 },
      eT: x0 => x0.isDirectory,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.maxTouchPoints,
      fE: (s) => +s,
      fF: x0 => x0.height,
      fG: (x0,x1) => { x0.value = x1 },
      fH: () => globalThis.window,
      fI: x0 => x0.error,
      fJ: x0 => x0.head,
      fK: (x0,x1) => { x0.height = x1 },
      fL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fM: (o, a) => o == a,
      fN: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      fO: (x0,x1) => x0.sqlite3session_delete(x1),
      fP: x0 => x0.arrayBuffer(),
      fQ: x0 => x0.lastName,
      fR: (x0,x1) => { x0.cMapPacked = x1 },
      fS: (x0,x1) => x0.initialize(x1),
      fT: (x0,x1) => x0[x1],
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: x0 => x0.platform,
      gE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      gF: x0 => x0.width,
      gG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      gH: (x0,x1,x2) => x0.setItem(x1,x2),
      gI: x0 => x0.result,
      gJ: () => globalThis.document,
      gK: (x0,x1) => { x0.width = x1 },
      gL: (x0,x1) => { x0.onmessage = x1 },
      gM: x0 => x0.r,
      gN: (x0,x1) => x0.sqlite3_column_count(x1),
      gO: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      gP: () => globalThis.Blob,
      gQ: x0 => x0.firstName,
      gR: (x0,x1) => { x0.cMapUrl = x1 },
      gS: () => globalThis.google.accounts.id,
      gT: x0 => x0.length,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: x0 => x0.body,
      hE: s => s.trim(),
      hF: x0 => x0.clientHeight,
      hG: x0 => x0.value,
      hH: (x0,x1) => x0.getItem(x1),
      hI: x0 => x0.debugSkipFontRetryDelay,
      hJ: (x0,x1) => x0.revokeObjectURL(x1),
      hK: (x0,x1) => x0.toDataURL(x1),
      hL: x0 => x0.terminate(),
      hM: x0 => x0.c,
      hN: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      hO: (x0,x1) => x0.unregister(x1),
      hP: x0 => x0.value,
      hQ: x0 => x0.name,
      hR: (x0,x1) => { x0.data = x1 },
      hS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hT: x0 => x0.items,
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i, v) => a[i] = v,
      iD: () => globalThis.document,
      iE: x0 => x0.classList,
      iF: x0 => x0.clientWidth,
      iG: x0 => x0.selectionDirection,
      iH: () => new AbortController(),
      iI: x0 => new Uint8Array(x0),
      iJ: (x0,x1) => { x0.src = x1 },
      iK: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      iL: (x0,x1) => x0.postMessage(x1),
      iM: x0 => x0.p,
      iN: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      iO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iP: x0 => x0.key,
      iQ: x0 => x0.email,
      iR: x0 => x0.baseURI,
      iS: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16) => ({client_id: x0,auto_select: x1,callback: x2,login_uri: x3,native_callback: x4,cancel_on_tap_outside: x5,prompt_parent_id: x6,nonce: x7,context: x8,state_cookie_domain: x9,ux_mode: x10,allowed_parent_origin: x11,intermediate_iframe_close_callback: x12,itp_support: x13,login_hint: x14,hd: x15,use_fedcm_for_prompt: x16}),
      iT: x0 => x0.dataTransfer,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: (a, i) => a[i],
      jD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      jE: x0 => x0.preventDefault(),
      jF: (x0,x1) => { x0.content = x1 },
      jG: x0 => x0.selectionStart,
      jH: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      jI: (x0,x1,x2) => x0.set(x1,x2),
      jJ: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      jK: (x0,x1) => x0.getContext(x1),
      jL: x0 => new Worker(x0),
      jM: x0 => x0.i,
      jN: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      jO: x0 => new FinalizationRegistry(x0),
      jP: x0 => x0.continue(),
      jQ: x0 => x0.user,
      jR: (x0,x1) => x0.querySelector(x1),
      jS: x0 => x0.error,
      jT: x0 => x0.onLine,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: Function.prototype.call.bind(DataView.prototype.setUint8),
      kC: a => a.length,
      kD: x0 => x0.hasFocus(),
      kE: x0 => x0.parent,
      kF: (x0,x1) => { x0.name = x1 },
      kG: x0 => x0.selectionEnd,
      kH: (x0,x1) => globalThis.fetch(x0,x1),
      kI: x0 => x0.buffer,
      kJ: x0 => x0.naturalHeight,
      kK: x0 => x0.format,
      kL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kM: x0 => x0.port1,
      kN: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      kO: () => globalThis.FinalizationRegistry,
      kP: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      kQ: x0 => x0.state,
      kR: (x0,x1) => { x0.id = x1 },
      kS: x0 => x0.credential,
      kT: x0 => x0.href,
      l: x0 => new Array(x0),
      lB: (t, s) => t.set(s),
      lC: (x0,x1) => x0.test(x1),
      lD: x0 => x0.relatedTarget,
      lE: x0 => x0.timeStamp,
      lF: x0 => x0.head,
      lG: x0 => x0.value,
      lH: (x0,x1) => x0.get(x1),
      lI: x0 => x0.wasmMemory,
      lJ: x0 => x0.naturalWidth,
      lK: () => new FileReader(),
      lL: (x0,x1) => { x0.onmessage = x1 },
      lM: (x0,x1,x2) => x0.transaction(x1,x2),
      lN: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      lO: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      lP: x0 => x0.length,
      lQ: x0 => x0.id_token,
      lR: x0 => globalThis.URL.revokeObjectURL(x0),
      lS: x0 => x0.disableAutoSelect(),
      lT: x0 => x0.length,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      mC: x0 => x0.userAgent,
      mD: x0 => x0.shiftKey,
      mE: (x0,x1) => x0.hasAttribute(x1),
      mF: (x0,x1) => x0.removeChild(x1),
      mG: x0 => x0.selectionDirection,
      mH: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      mI: () => globalThis.window._flutter_skwasmInstance,
      mJ: x0 => x0.decode(),
      mK: (x0,x1) => x0.readAsArrayBuffer(x1),
      mL: (x0,x1) => x0.postMessage(x1),
      mM: x0 => x0.close(),
      mN: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      mO: x0 => x0.exports,
      mP: (x0,x1) => x0.get(x1),
      mQ: x0 => x0.code,
      mR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mS: x0 => x0.requestAccessToken(),
      mT: x0 => x0.getReader(),
      n: (o0, o1) => [o0, o1],
      nB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      nC: x0 => x0.navigator,
      nD: (decoder, codeUnits) => decoder.decode(codeUnits),
      nE: x0 => x0.buttons,
      nF: x0 => x0.firstChild,
      nG: x0 => x0.selectionStart,
      nH: (x0,x1) => x0.forEach(x1),
      nI: x0 => x0.fontFallbackBaseUrl,
      nJ: (x0,x1) => { x0.decoding = x1 },
      nK: x0 => x0.result,
      nL: x0 => x0.close(),
      nM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      nN: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      nO: x0 => x0.call(),
      nP: (x0,x1) => x0.index(x1),
      nQ: x0 => x0.authorization,
      nR: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      nS: (x0,x1) => x0.initTokenClient(x1),
      nT: x0 => x0.value,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      oC: Function.prototype.call.bind(String.prototype.toLowerCase),
      oD: () => new TextDecoder("utf-8", {fatal: true}),
      oE: x0 => x0.ctrlKey,
      oF: x0 => x0.viewConstraints,
      oG: x0 => x0.selectionEnd,
      oH: x0 => x0.name,
      oI: (x0,x1,x2) => x0.slice(x1,x2),
      oJ: (x0,x1) => { x0.crossOrigin = x1 },
      oK: () => new XMLHttpRequest(),
      oL: x0 => x0.isSecureContext,
      oM: () => globalThis.Promise.resolve(),
      oN: (x0,x1) => x0.sqlite3_result_null(x1),
      oO: x0 => x0.instance,
      oP: x0 => x0.openKeyCursor(),
      oQ: (x0,x1) => x0.canShare(x1),
      oR: x0 => x0.size,
      oS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oT: x0 => x0.done,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: Function.prototype.call.bind(DataView.prototype.setUint32),
      pC: Object.is,
      pD: () => new TextDecoder("utf-8", {fatal: false}),
      pE: x0 => x0.y,
      pF: x0 => x0.hostElement,
      pG: x0 => x0.keyCode,
      pH: x0 => x0.statusText,
      pI: (x0,x1) => x0.decode(x1),
      pJ: (x0,x1) => x0.createObjectURL(x1),
      pK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      pL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pM: (x0,x1) => x0.then(x1),
      pN: (x0,x1) => x0.sqlite3_value_blob(x1),
      pO: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      pP: x0 => x0.primaryKey,
      pQ: (x0,x1) => x0.share(x1),
      pR: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      pS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pT: x0 => x0.read(),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getUint32),
      qC: x0 => x0.vendor,
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.x,
      qF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qG: (x0,x1) => x0.scrollIntoView(x1),
      qH: x0 => x0.url,
      qI: (x0,x1) => x0.adoptText(x1),
      qJ: x0 => x0.URL,
      qK: x0 => x0.send(),
      qL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qM: x0 => x0.abort(),
      qN: (x0,x1) => x0.sqlite3_value_bytes(x1),
      qO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qP: (x0,x1,x2) => x0.open(x1,x2),
      qQ: x0 => x0.message,
      qR: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      qS: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10) => ({client_id: x0,callback: x1,scope: x2,include_granted_scopes: x3,prompt: x4,enable_granular_consent: x5,enable_serial_consent: x6,login_hint: x7,hd: x8,state: x9,error_callback: x10}),
      qT: x0 => x0.body,
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => x0.createTextNode(x1),
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.scrollTop,
      rF: x0 => ({runApp: x0}),
      rG: x0 => x0.multiViewEnabled,
      rH: x0 => x0.status,
      rI: x0 => x0.first(),
      rJ: x0 => new Blob(x0),
      rK: x0 => x0.type,
      rL: x0 => x0.credentials,
      rM: x0 => x0.commit(),
      rN: (x0,x1) => x0.sqlite3_value_text(x1),
      rO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      rP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rQ: x0 => ({url: x0}),
      rR: x0 => x0.height,
      rS: x0 => x0.message,
      rT: x0 => x0.assetBase,
      s: () => globalThis,
      sB: Function.prototype.call.bind(DataView.prototype.setInt32),
      sC: (x0,x1) => { x0.id = x1 },
      sD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      sE: x0 => x0.offsetTop,
      sF: (handle) => clearInterval(handle),
      sG: (x0,x1) => x0.replaceWith(x1),
      sH: x0 => x0.getReader(),
      sI: x0 => x0.next(),
      sJ: x0 => x0.close(),
      sK: x0 => x0.response,
      sL: (o, p, v) => o[p] = v,
      sM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      sN: (x0,x1) => x0.sqlite3_value_double(x1),
      sO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      sP: (x0,x1) => { x0.onupgradeneeded = x1 },
      sQ: x0 => globalThis.URL.createObjectURL(x0),
      sR: x0 => x0.width,
      sS: x0 => x0.type,
      sT: x0 => x0.loader,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getInt32),
      tC: (x0,x1) => { x0.nonce = x1 },
      tD: x0 => x0.visibilityState,
      tE: x0 => x0.scrollLeft,
      tF: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      tG: (x0,x1) => { x0.type = x1 },
      tH: x0 => x0.read(),
      tI: x0 => x0.current(),
      tJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      tK: (x0,x1) => { x0.responseType = x1 },
      tL: (x0,x1) => x0.matchMedia(x1),
      tM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      tN: (x0,x1) => x0.sqlite3_value_int64(x1),
      tO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      tP: x0 => ({autoIncrement: x0}),
      tQ: (x0,x1) => x0.getElementById(x1),
      tR: (x0,x1) => { x0.src = x1 },
      tS: x0 => x0.error_description,
      tT: () => globalThis._flutter,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      uC: x0 => x0.nonce,
      uD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uE: x0 => x0.offsetLeft,
      uF: () => Date.now(),
      uG: (x0,x1) => { x0.className = x1 },
      uH: x0 => x0.value,
      uI: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      uJ: (x0,x1) => x0.decode(x1),
      uK: x0 => x0.vendor,
      uL: x0 => x0.matches,
      uM: (x0,x1) => { x0.onerror = x1 },
      uN: (x0,x1) => x0.sqlite3_value_type(x1),
      uO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      uP: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      uQ: (x0,x1) => x0.createElement(x1),
      uR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uS: x0 => x0.expires_in,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: o => o instanceof Uint16Array,
      vC: () => globalThis.window.flutterConfiguration,
      vD: x0 => x0.disconnect(),
      vE: x0 => x0.offsetParent,
      vF: (x0,x1) => x0.log(x1),
      vG: (x0,x1) => { x0.tabIndex = x1 },
      vH: x0 => x0.done,
      vI: x0 => x0.v8BreakIterator,
      vJ: x0 => x0.displayHeight,
      vK: x0 => x0.navigator,
      vL: (a, l) => a.length = l,
      vM: x0 => new DOMException(x0),
      vN: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      vO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      vP: x0 => ({unique: x0}),
      vQ: (x0,x1,x2) => x0.setAttribute(x1,x2),
      vR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vS: x0 => x0.error,
      w: (l, r) => l === r,
      wB: Function.prototype.call.bind(DataView.prototype.setUint16),
      wC: (x0,x1) => x0.attachShadow(x1),
      wD: x0 => new Intl.Locale(x0),
      wE: (o, p, r) => o.replace(p, () => r),
      wF: () => globalThis.console,
      wG: (x0,x1) => { x0.name = x1 },
      wH: x0 => x0.cancel(),
      wI: () => globalThis.Intl,
      wJ: x0 => x0.displayWidth,
      wK: x0 => new Blob(x0),
      wL: (x0,x1,x2) => x0.insertBefore(x1,x2),
      wM: x0 => x0.error,
      wN: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      wO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      wP: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      wQ: (x0,x1) => x0.append(x1),
      wR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wS: x0 => x0.access_token,
      x: x0 => x0.random(),
      xB: Function.prototype.call.bind(DataView.prototype.getUint16),
      xC: (x0,x1) => x0.createElement(x1),
      xD: x0 => x0.region,
      xE: (o, p, r) => o.replaceAll(p, () => r),
      xF: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      xG: (x0,x1) => { x0.placeholder = x1 },
      xH: x0 => x0.body,
      xI: (x0,x1) => x0.segment(x1),
      xJ: x0 => x0.duration,
      xK: x0 => ({type: x0}),
      xL: x0 => x0.id,
      xM: (x0,x1) => { x0.onabort = x1 },
      xN: x0 => x0.sqlite3_initialize(),
      xO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      xP: (x0,x1) => x0.createObjectStore(x1),
      xQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xR: (x0,x1) => { x0.onerror = x1 },
      xS: (x0,x1,x2) => x0.hasGrantedAllScopes(x1,x2),
      y: () => globalThis.Math,
      yB: o => o instanceof Int16Array,
      yC: x0 => x0.scale,
      yD: x0 => x0.script,
      yE: x0 => x0.deltaMode,
      yF: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      yG: (x0,x1) => { x0.autocomplete = x1 },
      yH: x0 => x0.headers,
      yI: x0 => x0.index,
      yJ: x0 => x0.image,
      yK: (x0,x1) => new Blob(x0,x1),
      yL: x0 => x0.offsetHeight,
      yM: (x0,x1) => { x0.oncomplete = x1 },
      yN: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      yO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      yP: x0 => x0.oldVersion,
      yQ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      yR: (x0,x1) => { x0.oncancel = x1 },
      yS: () => globalThis.google.accounts.oauth2,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setInt16),
      zC: x0 => x0.visualViewport,
      zD: x0 => x0.language,
      zE: x0 => x0.deltaY,
      zF: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      zG: (x0,x1) => { x0.name = x1 },
      zH: x0 => x0.signal,
      zI: x0 => x0.next(),
      zJ: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      zK: x0 => globalThis.fetch(x0),
      zL: x0 => x0.offsetWidth,
      zM: (x0,x1) => x0.objectStore(x1),
      zN: (x0,x1) => globalThis.Atomics.load(x0,x1),
      zO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zP: (x0,x1) => ({name: x0,length: x1}),
      zQ: x0 => x0.remove(),
      zR: (x0,x1) => { x0.onchange = x1 },
      zS: () => globalThis.removeSplashFromWeb(),

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
