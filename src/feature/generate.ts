import * as fs from 'fs';
import { basename } from 'path';
import { COMPOSER_FILE, WORKSPACE_ROOT } from './constants';

type AutoloadType = {
  [key: string]: string
}

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

function getSrcAutoload({
  workspaceRoot,
  uri,
}: {
  workspaceRoot: string,
  uri: string,
}) {
  const { autoload, autoloadDev } = getAutoloadComposer(workspaceRoot);
  if (!autoload && !autoloadDev) {
    return {
      autoload: null,
      autoloadDev: null,
    };
  }

  const newDir = uri.replace(workspaceRoot, '')
    .replace(/^\/|\\/g, '')
    .replace(/\\/g, '/');

  return {
    autoload: resolvePathFromPrefix({
      autoload,
      workspaceRoot: newDir,
    }),
    autoloadDev: resolvePathFromPrefix({
      autoload: autoloadDev,
      workspaceRoot: newDir,
    })
  };
}

function resolvePathFromPrefix({
  autoload,
  workspaceRoot,
}: {
  autoload: AutoloadType,
  workspaceRoot: string,
}) {
  for (const prefix in autoload) {
    const src = autoload[prefix].replace(/\\/g, '/');

    if (!workspaceRoot.startsWith(src)) {
      continue;
    }

    const prefixoBase = prefix.split('\\')[0];

    return workspaceRoot
      .replace(src, (src.endsWith('/') ? prefixoBase + '\\' : prefixoBase))
      .replace(/\//g, '\\')
      .replace(/\\[^\\]+$/, '');
  }

  return '';
}

function getAutoloadComposer(
  workspaceRoot: string
) {
  if (!workspaceRoot) {
    return {
      autoload: {},
      autoloadDev: {}
    };
  }

  const COMPOSER_PATH = workspaceRoot + '/' + COMPOSER_FILE;

  if (!fs.existsSync(COMPOSER_PATH)) {
    return {
      autoload: {},
      autoloadDev: {}
    };
  }

  const composerJson = JSON.parse(fs.readFileSync(COMPOSER_PATH, 'utf8'));

  return {
    autoload: composerJson.autoload?.['psr-4'] || {},
    autoloadDev: composerJson['autoload-dev']?.['psr-4'] || {},
  };
}
