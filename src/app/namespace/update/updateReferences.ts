import { generateNamespace } from '../../../domain/namespace/generateNamespace';
import { updateInCurrentFile } from './updateInCurrentFile';
import { updateReferencesInFiles } from './updateReferencesInFiles';
import { Uri } from 'vscode';

interface Props {
  newUri: Uri,
  oldUri: Uri,
}

export async function updateReferences({
  newUri,
  oldUri,
}: Props) {
  const {
    namespace: newNamespace,
    fullNamespace: useNewNamespace,
  } = await generateNamespace({
    uri: newUri.fsPath,
  });

  if (!newNamespace) {
    return;
  }

  const { fullNamespace: useOldNamespace } = await generateNamespace({
    uri: oldUri.fsPath,
  });

  const updated = await updateInCurrentFile({
    newNamespace,
    newUri,
  });

  if (!updated) {
    return;
  }

  await updateReferencesInFiles({
    useOldNamespace,
    useNewNamespace,
    newUri,
    oldUri,
  });
}
