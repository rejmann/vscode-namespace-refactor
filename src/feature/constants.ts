import { workspace } from 'vscode';

export const COMPOSER_FILE = 'composer.json';

export const REGEX_NAMESPACE_FILE = /namespace\s+([a-zA-Z0-9_\\]+);/;

export const WORKSPACE_ROOT = workspace.workspaceFolders
  ? workspace.workspaceFolders[0].uri.fsPath
  : '';
