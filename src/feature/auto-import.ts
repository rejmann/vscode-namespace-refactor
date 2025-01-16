import * as fs from 'fs';
import * as path from 'path';
import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from 'vscode';
import { generateNamespace } from './generate';

interface Props {
  oldFileName: string
  newUri: Uri
}

export async function autoImportNamespace({
  oldFileName,
  newUri,
}: Props) {
  const directoryPath = path.dirname(oldFileName);
  const classes: string[] = getClassesInDirectory(directoryPath);

  if (classes.length < 1) {
    return;
  }

  const document: TextDocument = await workspace.openTextDocument(newUri.fsPath);
  const text = document.getText();

  const imports = generateImports({
    classesUsed: getClassesUsed(text, classes),
    directoryPath,
  });

  if (!imports) {
    return;
  }

  const useRegex = /^use\s+[^\n]+;/gm;
  const useMatches = [...text.matchAll(useRegex)];

  const lastUseMatch = useMatches[useMatches.length - 1];
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

function getClassesInDirectory(directory: string): string[] {
  const files = fs.readdirSync(directory);
  return files.filter(file => file.endsWith('.php'))
    .map(file => path.basename(file, '.php'));
}

function getClassesUsed(text: string, classes: string[]): string[] {
  const classesUsed: string[] = [];

  classes.forEach(className => {
    const regex = new RegExp(`\\b${className}\\b`, 'g');
    if (regex.test(text) && !classesUsed.includes(className)) {
      classesUsed.push(className);
    }
  });

  const existingImports: string[] = extractClassesExistingImports(text);

  return classesUsed.filter(className => !existingImports.includes(className));
}

function extractClassesExistingImports(text: string): string[] {
  const regex = /use\s+([a-zA-Z0-9\\]+)/g;
  const imports: string[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    imports.push(match[1]);
  }

  return imports.map(namespace => {
    const parts = namespace.split('\\');
    return parts[parts.length - 1];
  });
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

      return '\n' + 'use ' + fullNamespace + ';';
    })
    .join('');
}
