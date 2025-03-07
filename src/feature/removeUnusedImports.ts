import { CONFIG_REMOVE_UNUSED_IMPORTS, isFeatureEnabled } from '../configUtils';
import { extractClassNameFromPath, extractDirectoryFromPath } from '../utils/filePathUtils';
import { RelativePattern, Uri, workspace } from 'vscode';
import { generateNamespace } from '../domain/namespace/generateNamespace';
import { removeImports } from './removeUnusedImports/removeImports';

interface Props {
  uri: Uri
}

export async function removeUnusedImports({ uri }: Props) {
  if (!isFeatureEnabled({ key: CONFIG_REMOVE_UNUSED_IMPORTS })) {
    return;
  }

  const { className } = generateNamespace({
    uri: uri.fsPath,
  });

  const directoryPath = extractDirectoryFromPath(uri.fsPath);

  const phpFiles: Uri[] = await workspace.findFiles(
    new RelativePattern(Uri.parse(`file://${directoryPath}`), '*.php')
  );

  const fileNames: string[] = phpFiles.map(uri => extractClassNameFromPath(uri.fsPath))
    .filter(Boolean)
    .filter(name => name !== className);

  if (!fileNames.length) {
    return;
  }

  for (const file of [uri, ...phpFiles]) {
    const document = await workspace.openTextDocument(file.fsPath);
  
    await removeImports({
      document,
      fileNames: file === uri ? fileNames : [className],
    });
  }
}
