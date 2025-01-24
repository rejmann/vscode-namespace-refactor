import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from 'vscode';
import { generateNamespace } from '../generate';
import { updateAllFiles } from './updateFiles/updateAllFiles';

interface Props {
  newUri: Uri,
  oldUri: Uri,
}

export async function updateNamespaceFiles({
  newUri,
  oldUri,
}: Props) {
  const { namespace: newNamespace, fullNamespace: useNewNamespace } = generateNamespace({
    uri: newUri.fsPath,
  });

  if (!newNamespace) {
    return;
  }

  const { fullNamespace: useOldNamespace } = generateNamespace({
    uri: oldUri.fsPath,
  });

  const updated = await updateCurrentFile({
    newNamespace,
    newUri,
  });

  if (!updated) {
    return;
  }

  updateAllFiles({
    useOldNamespace,
    useNewNamespace,
    ignoreFile: newUri.fsPath,
  });
}

async function updateCurrentFile({
  newNamespace,
  newUri,
}: {
  newNamespace: string,
  newUri: Uri,
}) {
  const document: TextDocument = await workspace.openTextDocument(newUri.fsPath);
  const text = document.getText();

  const namespaceRegex = /^\s*namespace\s+[\w\\]+;/m;
  const match = text.match(namespaceRegex);

  if (!match) {
    return false;
  }

  const startIndex = match.index!;
  const startPosition = document.positionAt(startIndex);
  const endPosition = document.positionAt(startIndex + match[0].length);

  const namespaceReplace = `\nnamespace ${newNamespace};`;

  const edit = new WorkspaceEdit();

  edit.replace(
    newUri,
    new Range(startPosition, endPosition),
    namespaceReplace,
  );

  workspace.applyEdit(edit);

  return true;
}
