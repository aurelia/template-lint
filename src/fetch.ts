import { Content } from './content';

export type FetchOptions = { process: boolean };
export type Fetch = ((path: string, opts?: FetchOptions) => Promise<Content | undefined | void>);

