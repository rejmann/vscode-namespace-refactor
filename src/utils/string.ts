import * as path from 'path';
import { WORKSPACE_ROOT } from '../feature/constants';

type Str = string | null | undefined

export const formatFileName = (str: Str) =>
  str
    ?.replace(WORKSPACE_ROOT, '')
    .replace(/^\/|\\/g, '') || '';

export const getCurrentDirectory = (str: Str) =>
  path.dirname(str || '');

export const removeFileExtension = (str: Str) =>
  path.basename(str || '', '.php') || '';
