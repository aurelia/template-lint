import { Readable, Stream } from 'stream';
import { File } from './file';

export interface FileSystem extends NodeJS.EventEmitter {
  getFilePaths(): string[];
  createReadStream(path: string): Readable;

  on(event: "added", listener: (path: string) => void): this;
  on(event: "removed", listener: (path: string) => void): this;
  on(event: "changed", listener: (path: string) => void): this;
}

