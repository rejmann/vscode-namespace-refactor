import { CONFIG_ADDITIONAL_EXTENSIONS, CONFIG_IGNORED_DIRECTORIES, getConfigValue } from '../../../configUtils';
import { Uri, workspace } from 'vscode';

const DEFAULT_DIRECTORIES = ['/vendor/', '/var/', '/cache/'];
const DEFAULT_EXTENSION_PHP = 'php';

export async function updateAllFiles({
  useOldNamespace,
  useNewNamespace,
  ignoreFile,
}: {
  useOldNamespace: string,
  useNewNamespace: string,
  ignoreFile: string,
}) {
  for (const file of await getFiles()) {
    if (ignoreFile === file.fsPath) {
      continue;
    }

    const fileStream = workspace.fs;

    const fileContent = await fileStream.readFile(file);
    let text = Buffer.from(fileContent).toString();

    if (!text.includes(useOldNamespace)) {
      continue;
    }

    text = text.replace(useOldNamespace, useNewNamespace);

    await fileStream.writeFile(file, Buffer.from(text));
  }
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
