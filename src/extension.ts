import { workspace } from 'vscode';
import { updateNamespaceFiles } from './feature/update-namespace-files';

export function activate() {
  const workspaceRoot = workspace.workspaceFolders
    ? workspace.workspaceFolders[0].uri.fsPath
    : '';

  workspace.onDidRenameFiles((event) => {
    event.files.forEach(async (file) => {
      const oldUri = file.oldUri;
      const newUri = file.newUri;

      if (!oldUri.fsPath.endsWith('.php')
        && !newUri.fsPath.endsWith('.php')) {
        return;
      }

      await updateNamespaceFiles({
        workspaceRoot,
        newUri,
        oldUri,
      });
    });
  });
}
