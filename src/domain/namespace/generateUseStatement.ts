interface Props {
  fullNamespace: string
}

export function generateUseStatement({ fullNamespace }: Props) {
  if (!fullNamespace || typeof fullNamespace !== 'string') {
    throw new Error('O parâmetro "fullNamespace" deve ser uma string válida.');
  }

  return `\nuse ${fullNamespace};`;
}
