import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from 'vscode';

interface Props {
  newNamespace: string,
  newUri: Uri,
}

export async function updateInCurrentFile({
  newNamespace,
  newUri,
}: Props) {
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
