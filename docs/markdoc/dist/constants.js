import { join } from 'path';
import os from 'os';
export const HOME_DIR = os.homedir();
export const OUT_DIR = join(process.cwd(), 'out');
export const title = 'Zod Documentation';
export const description = 'TypeScript-first schema validation with static type inference';
