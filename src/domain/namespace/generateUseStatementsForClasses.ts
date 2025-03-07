import { generateNamespace } from './generateNamespace';
import { generateUseStatement } from './generateUseStatement';

interface Props {
  classesUsed: string[]
  directoryPath: string
}

export async function generateUseStatementsForClasses({
  classesUsed,
  directoryPath,
}: Props): Promise<string> {
  const useStatements = await Promise.all(
    classesUsed.map(async (className) => {
      const uri = `${directoryPath}/${className}.php`;

      const { fullNamespace } = await generateNamespace({ uri });

      return generateUseStatement({ fullNamespace });
    })
  );

  return useStatements.join('');
}
