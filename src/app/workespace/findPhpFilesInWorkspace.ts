import { Uri, workspace } from 'vscode';
import { ConfigKeys } from '../../infra/workspace/configTypes';
import { getWorkspaceConfig } from '../../infra/workspace/vscodeConfig';

const DEFAULT_DIRECTORIES = ['/vendor/', '/var/', '/cache/'];
const DEFAULT_EXTENSION_PHP = 'php';

export async function findPhpFilesInWorkspace(): Promise<Uri[]> {
  const extensions = getWorkspaceConfig<string[]>({
    key: ConfigKeys.ADDITIONAL_EXTENSIONS,
    defaultValue: [DEFAULT_EXTENSION_PHP],
  });

  const pattern = `**/*.{${[DEFAULT_EXTENSION_PHP, ...extensions].join(',')}}`;
  const phpFiles: Uri[] = await workspace.findFiles(pattern);

  const ignoredDirectories = getWorkspaceConfig<string[]>({
    key: ConfigKeys.IGNORED_DIRECTORIES,
    defaultValue: DEFAULT_DIRECTORIES,
  });

  return phpFiles.filter(file => ![
    ...DEFAULT_DIRECTORIES,
    ...ignoredDirectories,
  ].some(dir => file.fsPath.includes(dir)));
}
