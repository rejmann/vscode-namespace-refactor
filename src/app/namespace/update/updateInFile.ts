import { Range, Uri, workspace, WorkspaceEdit } from 'vscode';
import { extractDirectoryFromPath } from '../../../infra/utils/filePathUtils';

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

  const useRegex = /^use\s+[^\n]+;/gm;
  const useMatches = [...text.matchAll(useRegex)];
  const lastUseMatch = useMatches[useMatches.length - 1] || 1;

  const edit = new WorkspaceEdit();
  const endPosition = document.positionAt(lastUseMatch.index + lastUseMatch[0].length);
  edit.replace(file, new Range(endPosition, endPosition), useImport);

  await workspace.applyEdit(edit);
}
