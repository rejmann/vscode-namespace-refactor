import { Range, Uri, workspace, WorkspaceEdit } from 'vscode';
import { extractDirectoryFromPath } from '@infra/utils/filePathUtils';
import { findLastUseEndIndex } from '@domain/namespace/findLastUseEndIndex';
import { insertUseStatement } from '@domain/namespace/import/insertUseStatement';

interface Props {
  file: Uri
  oldDirectoryPath: string
  useImport: string
  className: string
}

export async function updateInFile({
  file,
  oldDirectoryPath,
  useImport,
  className,
}: Props) {
  const currentDir = extractDirectoryFromPath(file.fsPath);
  if (oldDirectoryPath !== currentDir) {
    return;
  }

  const document = await workspace.openTextDocument(file.fsPath);
  const text = document.getText();

  if (! text.includes(className)) {
    return;
  }

  const lastUseEndIndex = findLastUseEndIndex({ document });

  const edit = new WorkspaceEdit();

  await insertUseStatement({
    document,
    workspaceEdit: edit,
    uri: file,
    lastUseEndIndex,
    useNamespace: useImport,
    flush: true,
  });
}
