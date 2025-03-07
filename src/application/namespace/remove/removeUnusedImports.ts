import { extractClassNameFromPath, extractDirectoryFromPath } from '../../../utils/filePathUtils';
import { RelativePattern, Uri, workspace } from 'vscode';
import { ConfigKeys } from '../../../infrastructure/workspace/configTypes';
import { generateNamespace } from '../../../domain/namespace/generateNamespace';
import { isConfigEnabled } from '../../../infrastructure/workspace/vscodeConfig';
import { removeImports } from './removeImports';

interface Props {
  uri: Uri
}

export async function removeUnusedImports({ uri }: Props) {
  if (!isConfigEnabled({ key: ConfigKeys.REMOVE_UNUSED_IMPORTS })) {
    return;
  }

  const { className } = await generateNamespace({
    uri: uri.fsPath,
  });

  const directoryPath = extractDirectoryFromPath(uri.fsPath);

  const pattern = new RelativePattern(Uri.parse(`file://${directoryPath}`), '*.php');
  const phpFiles: Uri[] = await workspace.findFiles(pattern);

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
