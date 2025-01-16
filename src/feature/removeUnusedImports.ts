import * as path from 'path';
import { RelativePattern, Uri, workspace } from 'vscode';
import { generateNamespace } from './generate';
import { removeImports } from './removeUnusedImports/removeImports';

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

  const fileNames: string[] = phpFiles.map(uri => path.basename(uri.fsPath, '.php'))
    .filter(Boolean)
    .filter(name => name !== className);

  if (!fileNames.length) {
    return;
  }

  const document = await workspace.openTextDocument(newUri.fsPath);

  await removeImports({
    document,
    fileNames,
  });
}
