import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from 'vscode';
import { createImport } from './autoImport/createImport';
import { generateNamespace } from './generate';
import { getClassesInDirectory } from './autoImport/getClassInDirectory';
import { getClassesUsed } from './autoImport/getClassesUsed';
import { getCurrentDirectory } from '../utils/string';

interface Props {
  oldFileName: string
  newUri: Uri
}

export async function autoImportNamespace({
  oldFileName,
  newUri,
}: Props) {
  const directoryPath = getCurrentDirectory(oldFileName);
  const classes: string[] = getClassesInDirectory({
    directory: directoryPath,
  });

  if (classes.length < 1) {
    return;
  }

  const document: TextDocument = await workspace.openTextDocument(newUri.fsPath);
  const text = document.getText();

  const imports = generateImports({
    classesUsed: getClassesUsed({
      text,
      classes,
    }),
    directoryPath,
  });

  if (!imports || (directoryPath === getCurrentDirectory(newUri.fsPath))) {
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

function generateImports({
  classesUsed,
  directoryPath,
}: {
  classesUsed: string[],
  directoryPath: string
}): string {
  return classesUsed
    .map((className) => {
      const { fullNamespace } = generateNamespace({
        uri: directoryPath + '/' + className + '.php',
      });

      return createImport({ fullNamespace });
    })
    .join('');
}
