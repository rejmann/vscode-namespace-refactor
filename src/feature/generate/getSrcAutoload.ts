import { removeWorkspaceRoot } from '../../utils/filePathUtils';
import { getAutoloadComposer } from './getAutoloadComposer';

type AutoloadType = {
  [key: string]: string
}

interface Props {
  workspaceRoot: string,
  uri: string,
}

export function getSrcAutoload({
  workspaceRoot,
  uri,
}: Props) {
  const { autoload, autoloadDev } = getAutoloadComposer({ workspaceRoot });
  if (!autoload && !autoloadDev) {
    return {
      autoload: null,
      autoloadDev: null,
    };
  }

  const newDir = removeWorkspaceRoot(uri);

  return {
    autoload: resolvePathFromPrefix({
      autoload,
      workspaceRoot: newDir,
    }),
    autoloadDev: resolvePathFromPrefix({
      autoload: autoloadDev,
      workspaceRoot: newDir,
    })
  };
}

function resolvePathFromPrefix({
  autoload,
  workspaceRoot,
}: {
  autoload: AutoloadType,
  workspaceRoot: string,
}) {
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
