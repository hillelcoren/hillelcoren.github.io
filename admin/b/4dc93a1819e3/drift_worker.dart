// Drift web worker entrypoint. Compiled to `web/drift_worker.js` via:
//   dart compile js -O4 -o web/drift_worker.js web/drift_worker.dart
//
// Regenerate whenever the `drift` package is bumped (the worker protocol is
// version-matched to the `drift` runtime — see CLAUDE.md § Web / docs/setup.md).
// Flutter's web build ignores stray `.dart` files under `web/`; only the
// committed `.js` output is served.
import 'package:drift/wasm.dart';

void main() {
  WasmDatabase.workerMainForOpen();
}
