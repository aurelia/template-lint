import { ContentContext, Content } from './content';

export type ResolveOptions = { process?: boolean, origin?: ContentContext };
export type Resolve = ((moduleName: string, opts?: ResolveOptions) => Promise<Content | undefined>);
