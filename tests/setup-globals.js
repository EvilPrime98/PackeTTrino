// [agent-added: esm-migration phase 04]
// DEPRECATED: vm sandbox no longer needed after ESM migration.
// Will be removed in Phase 08.
import { parseHTML } from 'linkedom';
import { readFileSync } from 'fs';
import vm from 'vm';

export function createWindowWithScripts(...paths) {

  const { window } = parseHTML('<!DOCTYPE html><html><body></body></html>');

  const context = vm.createContext(window);

  for (const path of paths) {
    const code = readFileSync(path, 'utf-8');
    vm.runInContext(code, context);
  }

  return window;

}
