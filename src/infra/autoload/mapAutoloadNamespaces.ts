import { fetchComposerAutoload } from './fetchComposerAutoload';
import { removeWorkspaceRoot } from '@infra/utils/filePathUtils';
import { resolvePathFromPrefix } from './resolvePathFromPrefix';
import { WORKSPACE_ROOT } from '@infra/utils/constants';

interface Props {
  uri: string
}

export async function mapAutoloadNamespaces({
  uri,
}: Props) {
  const { autoload, autoloadDev } = await fetchComposerAutoload({
    workspaceRoot: WORKSPACE_ROOT,
  });

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

