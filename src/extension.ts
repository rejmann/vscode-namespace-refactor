import { autoImportNamespace } from './feature/auto-import';
import { isPhpProject } from './utils/file-helpers';
import { removeUnusedImports } from './feature/remove-unused-imports';
import { updateNamespaceFiles } from './feature/update-files';
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
