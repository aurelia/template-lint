import { Content } from './content';
import { ContentContext } from './context';

export type ResolveOptions = { origin?: ContentContext, process?: boolean };
export type Resolve = ((moduleName: string, opts?: ResolveOptions) => Promise<Content | undefined>);
