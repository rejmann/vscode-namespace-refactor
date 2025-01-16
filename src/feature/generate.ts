import { basename } from 'path';
import { getSrcAutoload } from './generate/getSrcAutoload';
import { WORKSPACE_ROOT } from './constants';

interface Props {
  uri: string
}

export function generateNamespace({
  uri,
}: Props) {
  const { autoload, autoloadDev } = getSrcAutoload({
    workspaceRoot: WORKSPACE_ROOT,
    uri
  });

  const className = basename(uri, '.php');

  for (const currentAutoload of [autoload, autoloadDev]) {
    if (null === currentAutoload) {
      continue;
    }

    return {
      namespace: currentAutoload,
      className,
      fullNamespace: currentAutoload + '\\' + className,
    };
  }

  return {
    namespace: '',
    className,
    fullNamespace: className,
  };
}
