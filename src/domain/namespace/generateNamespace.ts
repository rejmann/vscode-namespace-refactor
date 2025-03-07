import { createNamespace, Namespace } from './createNamespace';
import { extractClassNameFromPath } from '../../utils/filePathUtils';
import { getSrcAutoload } from '../../feature/generate/getSrcAutoload';
import { WORKSPACE_ROOT } from '../../feature/constants';

interface Props {
  uri: string
}

export function generateNamespace({
  uri,
}: Props): Namespace {
  const { autoload, autoloadDev } = getSrcAutoload({
    workspaceRoot: WORKSPACE_ROOT,
    uri
  });

  const className = extractClassNameFromPath(uri);

  for (const currentAutoload of [autoload, autoloadDev]) {
    if (null === currentAutoload) {
      continue;
    }

    return createNamespace({
      namespace: currentAutoload,
      className
    });
  }

  return createNamespace({ className });
}
