import { basename, dirname } from 'path';
import { WORKSPACE_ROOT } from '../utils/constants';

type AbsolutePath = string | null | undefined

export const removeWorkspaceRoot = (filePath: AbsolutePath) =>
  filePath
    ?.replace(WORKSPACE_ROOT, '')
    .replace(/^\/|\\/g, '') || '';

export const extractDirectoryFromPath = (filePath: AbsolutePath) =>
  dirname(filePath || '');

export const extractClassNameFromPath = (filePath: AbsolutePath) =>
  basename(filePath || '', '.php') || '';
