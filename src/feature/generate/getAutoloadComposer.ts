import * as fs from 'fs';
import { COMPOSER_FILE } from '../constants';

interface Props {
  workspaceRoot: string
}

export function getAutoloadComposer({
  workspaceRoot,
}: Props) {
  if (!workspaceRoot) {
    return {
      autoload: {},
      autoloadDev: {}
    };
  }

  const composerJson = JSON.parse(fs.readFileSync(
    workspaceRoot + '/' + COMPOSER_FILE,
    'utf8',
  ));

  return {
    autoload: composerJson.autoload?.['psr-4'] || {},
    autoloadDev: composerJson['autoload-dev']?.['psr-4'] || {},
  };
}
