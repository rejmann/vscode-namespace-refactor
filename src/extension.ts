import * as fs from 'fs';
import { COMPOSER_FILE, WORKSPACE_ROOT } from './infra/utils/constants';
import { ConfigKeys } from './infra/workspace/configTypes';
import { importMissingClasses } from './app/namespace/update/import/importMissingClasses';
import { isConfigEnabled } from './infra/workspace/vscodeConfig';
import { removeUnusedImports } from './app/namespace/remove/removeUnusedImports';
import { updateReferences } from './app/namespace/update/updateReferences';
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

      await updateReferences({ newUri, oldUri });

      if (isConfigEnabled({ key: ConfigKeys.AUTO_IMPORT_NAMESPACE })) {
        await importMissingClasses({
          oldFileName: oldUri.fsPath,
          newUri,
        });
      }

      await removeUnusedImports({ uri: newUri });
    });
  });
}
