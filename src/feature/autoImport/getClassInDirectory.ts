import * as fs from 'fs';
import * as path from 'path';

interface Props {
  directory: string
}

export function getClassesInDirectory({
  directory,
}: Props): string[] {
  const files = fs.readdirSync(directory);
  return files.filter(file => file.endsWith('.php'))
    .map(file => path.basename(file, '.php'));
}
