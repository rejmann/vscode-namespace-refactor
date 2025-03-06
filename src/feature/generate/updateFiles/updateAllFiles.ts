import { CONFIG_ADDITIONAL_EXTENSIONS, CONFIG_IGNORED_DIRECTORIES, getConfigValue } from '../../../configUtils';
import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from 'vscode';
import { basename } from 'path';
import { createImport } from '../../autoImport/createImport';
import { getCurrentDirectory } from '../../../utils/string';
import { removeUnusedImports } from '../../removeUnusedImports';

const DEFAULT_DIRECTORIES = ['/vendor/', '/var/', '/cache/'];
const DEFAULT_EXTENSION_PHP = 'php';

interface Props {
  useOldNamespace: string,
  useNewNamespace: string,
  newUri: Uri,
  oldUri: Uri
}

export async function updateAllFiles({
  useOldNamespace,
  useNewNamespace,
  newUri,
  oldUri,
}: Props) {
  const directoryPath = getCurrentDirectory(oldUri.fsPath);
  const className = basename(oldUri.fsPath, '.php');

  const useImport = createImport({ fullNamespace: useNewNamespace });

  const ignoreFile = newUri.fsPath;
  for (const file of await getFiles()) {
    if (ignoreFile === file.fsPath) {
      continue;
    }

    const fileStream = workspace.fs;

    const fileContent = await fileStream.readFile(file);
    let text = Buffer.from(fileContent).toString();

    await updateFilesCurrentDir({
      file,
      oldDirectoryPath: directoryPath,
      useImport,
      className,
    });

    if (!text.includes(useOldNamespace)) {
      continue;
    }

    text = text.replace(useOldNamespace, useNewNamespace);

    await fileStream.writeFile(file, Buffer.from(text));
  }

  await removeUnusedImports({ uri: newUri });
}

async function getFiles() {
  const extensions = getConfigValue<string[]>({
    key: CONFIG_ADDITIONAL_EXTENSIONS,
    defaultValue: [DEFAULT_EXTENSION_PHP],
  });

  const phpFiles: Uri[] = await workspace.findFiles(
    `**/*.{${[DEFAULT_EXTENSION_PHP, ...extensions].join(',')}}`,
  );

  const ignoredDirectories = getConfigValue<string[]>({
    key: CONFIG_IGNORED_DIRECTORIES,
    defaultValue: DEFAULT_DIRECTORIES,
  });

  return phpFiles.filter(file => ![
    ...DEFAULT_DIRECTORIES,
    ...ignoredDirectories,
  ].some(dir => file.fsPath.includes(dir)));
}

async function updateFilesCurrentDir({
  file,
  oldDirectoryPath,
  useImport,
  className,
}: {
  file: Uri
  oldDirectoryPath: string
  useImport: string
  className: string
}) {
  const currentDir = getCurrentDirectory(file.fsPath);
  if (oldDirectoryPath !== currentDir) {
    return;
  }

  const document: TextDocument = await workspace.openTextDocument(file.fsPath);
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
