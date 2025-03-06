interface Props {
  fullNamespace: string
}

export function createImport({ fullNamespace }: Props) {
  return '\n' + 'use ' + fullNamespace + ';';
}
