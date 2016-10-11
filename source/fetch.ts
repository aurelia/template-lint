import { File } from './file';

export type Fetch = ((path: string) => Promise<File>);
