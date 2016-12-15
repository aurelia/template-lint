import { File } from './file';

export type FetchOptions = { process: boolean };
export type Fetch = ((path: string, opts?: FetchOptions) => Promise<File | undefined>);

