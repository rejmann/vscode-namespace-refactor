import { getCurrentDirectory, removeFileExtension } from '../utils/string';
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

  const directoryPath = getCurrentDirectory(newUri.fsPath);

  const phpFiles: Uri[] = await workspace.findFiles(
    new RelativePattern(Uri.parse(`file://${directoryPath}`), '*.php')
  );

  const fileNames: string[] = phpFiles.map(uri => removeFileExtension(uri.fsPath))
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
