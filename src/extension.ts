import { workspace } from 'vscode';
import { updateNamespaceFiles } from './feature/update-files';
import { isPhpProject } from './utils/file-helpers';
import { autoImportNamespace } from './feature/auto-import';

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
        workspaceRoot,
        newUri,
        oldUri,
      });

      await autoImportNamespace({
        workspaceRoot,
        oldFileName: oldUri.fsPath,
        newUri,
      });
    });
  });
}
