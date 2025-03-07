export const ConfigKeys = {
  AUTO_IMPORT_NAMESPACE: 'autoImportNamespace',
  REMOVE_UNUSED_IMPORTS: 'removeUnusedImports',
  IGNORED_DIRECTORIES: 'ignoredDirectories',
  ADDITIONAL_EXTENSIONS: 'additionalExtensions',
} as const;

export type IsConfigEnabledProps = {
  key: string,
  defaultValue?: boolean
}

export type GetWorkspaceConfigProps<T> = {
  key: string,
  defaultValue?: T
}
