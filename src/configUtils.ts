import { workspace } from 'vscode';

export const CONFIG_AUTO_IMPORT_NAMESPACE = 'autoImportNamespace';
export const CONFIG_REMOVE_UNUSED_IMPORTS = 'removeUnusedImports';
export const CONFIG_IGNORED_DIRECTORIES = 'ignoredDirectories';
export const CONFIG_ADDITIONAL_EXTENSIONS = 'additionalExtensions';

const userConfig = workspace.getConfiguration('phpNamespaceRefactor');

interface IsFeatureEnabledProps {
  key: string,
  defaultValue?: boolean
}

export const isFeatureEnabled = ({
  key,
  defaultValue = true,
}: IsFeatureEnabledProps): boolean => {
  return userConfig.get<boolean>(key, defaultValue);
};

interface GetConfigValueProps<T> {
  key: string,
  defaultValue?: T
}

export const getConfigValue = <T>({
  key,
  defaultValue,
}: GetConfigValueProps<T>) => {
  return userConfig.get<T>(key, defaultValue as T);
};
