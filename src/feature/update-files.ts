import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from 'vscode';
import { generateNamespace } from './generate';
import { REGEX_NAMESPACE_FILE } from './constants';

interface Props {
  newUri: Uri,
  oldUri: Uri,
}

export async function updateNamespaceFiles({
  newUri,
  oldUri,
}: Props) {
  const {
    namespace: newNamespace,
    fullNamespace: useNewNamespace,
  } = generateNamespace({
    uri: newUri.fsPath,
  });

  if (!newNamespace) {
    return;
  }

  const {
    namespace: oldNamespace,
    fullNamespace: useOldNamespace,
  } = generateNamespace({
    uri: oldUri.fsPath,
  });

  const updated = updateCurrentFile({
    oldNamespace,
    newNamespace,
    newUri,
  });

  if (null === updated) {
    return;
  }

  updateAllFiles({
    useOldNamespace,
    useNewNamespace,
  });
}

async function updateCurrentFile({
  oldNamespace,
  newNamespace,
  newUri,
}: {
  oldNamespace: string,
  newNamespace: string,
  newUri: Uri,
}) {
  const document: TextDocument = await workspace.openTextDocument(newUri.fsPath);
  const text = document.getText();

  if (!text.match(REGEX_NAMESPACE_FILE)) {
    return null;
  }

  const startPosition = document.positionAt(text.indexOf(oldNamespace));
  const endPosition = startPosition.translate(0, oldNamespace.length);

  const edit = new WorkspaceEdit();

  edit.replace(
    newUri,
    new Range(startPosition, endPosition),
    newNamespace,
  );

  workspace.applyEdit(edit);
}

async function updateAllFiles({
  useOldNamespace,
  useNewNamespace,
}: {
  useOldNamespace: string,
  useNewNamespace: string,
}) {
  const phpFiles: Uri[] = await workspace.findFiles('**/*.php');
  const filteredFiles = phpFiles.filter(file => (
    !file.fsPath.includes('/vendor/') &&
    !file.fsPath.includes('/var/')
  ));

  for (const uri of filteredFiles) {
    const fileContent = await workspace.fs.readFile(uri);
    let text = Buffer.from(fileContent).toString();

    if (!text.includes(useOldNamespace)) {
      continue;
    }

    text = text.replace(useOldNamespace, useNewNamespace);

    await workspace.fs.writeFile(uri, Buffer.from(text));
  }
}
