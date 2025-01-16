import * as path from 'path';
import { generateNamespace } from './generate';
import { TextDocument, Uri, workspace, RelativePattern, WorkspaceEdit, Range } from 'vscode';

interface Props {
  newUri: Uri
}

export async function removeUnusedImports({
  newUri,
}: Props) {
  const { className } = generateNamespace({
    uri: newUri.fsPath,
  });

  const directoryPath = path.dirname(newUri.fsPath);

  const phpFiles: Uri[] = await workspace.findFiles(
    new RelativePattern(Uri.parse(`file://${directoryPath}`), '*.php')
  );

  const fileNames = phpFiles.map(uri => path.basename(uri.fsPath, '.php'))
    .filter(Boolean)
    .filter(name => name !== className);

  if (!fileNames.length) {
    return;
  }

  const document: TextDocument = await workspace.openTextDocument(newUri.fsPath);
  const text = document.getText();

  const edit = new WorkspaceEdit();
  let isEdit = false;

  const importLines = text.split('\n').filter(line => line.startsWith('use '));
  for (const line of importLines) {
    const parts = line.split(' ');
    if (parts.length < 2) {
      continue;
    }

    const importedClass = parts[1].replace(';', '').split('\\').pop() || '';
    if (!fileNames.includes(importedClass)) {
      continue;
    }

    isEdit = true;

    const lineIndex = text.indexOf(line);
    edit.delete(document.uri, new Range(
      document.positionAt(lineIndex),
      document.positionAt((lineIndex + line.length) + 1)
    ));
  }

  if (false === isEdit) {
    return;
  }

  await workspace.applyEdit(edit);
}
