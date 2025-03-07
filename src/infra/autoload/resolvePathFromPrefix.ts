type AutoloadType = {
  [key: string]: string
}

interface Props {
  autoload: AutoloadType,
  workspaceRoot: string,
}

export function resolvePathFromPrefix({
  autoload,
  workspaceRoot,
}: Props) {
  for (const prefix in autoload) {
    const src = autoload[prefix].replace(/\\/g, '/');

    if (!workspaceRoot.startsWith(src)) {
      continue;
    }

    const prefixoBase = prefix.split('\\')[0];

    return workspaceRoot
      .replace(src, (src.endsWith('/') ? prefixoBase + '\\' : prefixoBase))
      .replace(/\//g, '\\')
      .replace(/\\[^\\]+$/, '');
  }

  return '';
}
