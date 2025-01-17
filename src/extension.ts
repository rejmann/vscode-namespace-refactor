import * as fs from 'fs';
import { COMPOSER_FILE, WORKSPACE_ROOT } from './feature/constants';
import { CONFIG_AUTO_IMPORT_NAMESPACE, CONFIG_REMOVE_UNUSED_IMPORTS, isFeatureEnabled } from './configUtils';
import { autoImportNamespace } from './feature/autoImport';
import { removeUnusedImports } from './feature/removeUnusedImports';
import { updateNamespaceFiles } from './feature/generate/updateFiles';
import { workspace } from 'vscode';

const PHP = '.php';

export function activate() {
  const files: string[] = fs.readdirSync(WORKSPACE_ROOT);
  if (!files.includes(COMPOSER_FILE)) {
    return;
  }

  workspace.onDidRenameFiles((event) => {
    event.files.forEach(async (file) => {
      const oldUri = file.oldUri;
      const newUri = file.newUri;

      if (!oldUri.fsPath.endsWith(PHP) || !newUri.fsPath.endsWith(PHP)) {
        return;
      }

      await updateNamespaceFiles({ newUri, oldUri });

      if (isFeatureEnabled({ key: CONFIG_AUTO_IMPORT_NAMESPACE })) {
        await autoImportNamespace({
          oldFileName: oldUri.fsPath,
          newUri,
        });
      }

      if (isFeatureEnabled({ key: CONFIG_REMOVE_UNUSED_IMPORTS })) {
        await removeUnusedImports({ newUri });
      }
    });
  });
}
