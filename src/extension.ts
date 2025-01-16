import { autoImportNamespace } from './feature/autoImport';
import { isPhpProject } from './utils/fileHelpers';
import { removeUnusedImports } from './feature/removeUnusedImports';
import { updateNamespaceFiles } from './feature/generate/updateFiles';
import { workspace } from 'vscode';

export function activate() {
  const workspaceRoot = workspace.workspaceFolders
    ? workspace.workspaceFolders[0].uri.fsPath
    : '';

  if (!isPhpProject(workspaceRoot)) {
    return;
  }

  const userConfig = workspace.getConfiguration('phpNamespaceRefactor');

  workspace.onDidRenameFiles((event) => {
    event.files.forEach(async (file) => {
      const oldUri = file.oldUri;
      const newUri = file.newUri;

      if (!oldUri.fsPath.endsWith('.php') && !newUri.fsPath.endsWith('.php')) {
        return;
      }

      await updateNamespaceFiles({ newUri, oldUri });

      if (userConfig.get<boolean>('autoImportNamespace', true)) {
        await autoImportNamespace({
          oldFileName: oldUri.fsPath,
          newUri,
        });
      }

      if (userConfig.get<boolean>('removeUnusedImports', true)) {
        await removeUnusedImports({ newUri });
      }
    });
  });
}
