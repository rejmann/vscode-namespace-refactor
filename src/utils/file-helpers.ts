
import * as fs from 'fs';
import * as path from 'path';
import { COMPOSER_FILE } from '../feature/constants';

export function isPhpProject(workspaceRoot: string) {
  const files = fs.readdirSync(workspaceRoot);

  if (files.includes(COMPOSER_FILE) || files.some(file => file.endsWith('.php'))) {
    return true;
  }

  const composerJsonPath = path.join(workspaceRoot, COMPOSER_FILE);
  if (fs.existsSync(composerJsonPath)) {
    const composerJson = JSON.parse(fs.readFileSync(composerJsonPath, 'utf8'));
    if (composerJson.require && composerJson.require.php) {
      return true;
    }
  }

  return false;
}
