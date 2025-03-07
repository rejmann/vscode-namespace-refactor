import { createNamespace, Namespace } from './createNamespace';
import { extractClassNameFromPath } from '../../infra/utils/filePathUtils';
import { mapAutoloadNamespaces } from '../../infra/autoload/mapAutoloadNamespaces';

interface Props {
  uri: string
}

export async function generateNamespace({
  uri,
}: Props): Promise<Namespace> {
  const { autoload, autoloadDev } = await mapAutoloadNamespaces({
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
