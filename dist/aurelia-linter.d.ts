import { Linter, Issue } from 'template-lint';
import { Config } from './config';
export declare class AureliaLinter {
    linter: Linter;
    constructor(config?: Config);
    lint(html: string): Promise<Issue[]>;
}
