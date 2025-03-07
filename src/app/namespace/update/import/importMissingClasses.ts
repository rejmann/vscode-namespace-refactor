import { Range, Uri, workspace, WorkspaceEdit } from 'vscode';
import { extractDirectoryFromPath } from '@infra/utils/filePathUtils';
import { findUnimportedClasses } from './findUnimportedClasses';
import { generateUseStatementsForClasses } from '@domain/namespace/generateUseStatementsForClasses';
import { getClassesNamesInDirectory } from './getClassesNamesInDirectory';

interface Props {
  oldFileName: string
  newUri: Uri
}

export async function importMissingClasses({
  oldFileName,
  newUri,
}: Props) {
  const directoryPath = extractDirectoryFromPath(oldFileName);
  const classes: string[] = await getClassesNamesInDirectory({
    directory: directoryPath,
  });

  if (classes.length < 1) {
    return;
  }

  const document = await workspace.openTextDocument(newUri.fsPath);
  const text = document.getText();

  const imports = await generateUseStatementsForClasses({
    classesUsed: findUnimportedClasses({
      text,
      classes,
    }),
    directoryPath,
  });

  if (!imports || (directoryPath === extractDirectoryFromPath(newUri.fsPath))) {
    return;
  }

  const useRegex = /^use\s+[^\n]+;/gm;
  const useMatches = [...text.matchAll(useRegex)];

  const lastUseMatch = useMatches[useMatches.length - 1] || 0;
  if (!lastUseMatch) {
    return;
  }

  const edit = new WorkspaceEdit();
  for (const use of imports) {
    const endPosition = document.positionAt(lastUseMatch.index + lastUseMatch[0].length);
    edit.replace(newUri, new Range(endPosition, endPosition), use);
  }

  await workspace.applyEdit(edit);
}
