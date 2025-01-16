import { autoImportNamespace } from './feature/autoImport';
import { isPhpProject } from './utils/fileHelpers';
import { removeUnusedImports } from './feature/removeUnusedImports';
import { updateNamespaceFiles } from './feature/updateFiles';
import { workspace } from 'vscode';

export function activate() {
  const workspaceRoot = workspace.workspaceFolders
    ? workspace.workspaceFolders[0].uri.fsPath
    : '';

  if (!isPhpProject(workspaceRoot)) {
    return;
  }

  workspace.onDidRenameFiles((event) => {
    event.files.forEach(async (file) => {
      const oldUri = file.oldUri;
      const newUri = file.newUri;

      if (!oldUri.fsPath.endsWith('.php') && !newUri.fsPath.endsWith('.php')) {
        return;
      }

      await updateNamespaceFiles({
        newUri,
        oldUri,
      });

      await autoImportNamespace({
        oldFileName: oldUri.fsPath,
        newUri,
      });

      await removeUnusedImports({
        newUri,
      });
    });
  });
}
