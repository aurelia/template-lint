import { SAXParser, StartTagLocationInfo } from 'parse5';
import * as parse5 from 'parse5';

import { ParserState } from './parser-state';
import { ParserTask } from './parser-task';
import { ASTGen } from './ast';

import { File } from './file';
import { FileResult } from './file-result';
import { Readable } from 'stream';
import { Issue } from './issue';

export class Parser extends SAXParser {
  constructor(public state: ParserState) {
    super({ locationInfo: true });
    this.setMaxListeners(100);
  }

  public isVoid(name: string): boolean {
    return this.state.isVoid(name);
  }

  public isScope(name: string): boolean {
    return this.state.isScope(name);
  }

  public init(tasks: ParserTask[], path: string) {
    this.state.initPreRules(this);

    tasks.forEach((rule) => {
      rule.init(this, path);
    });

    this.state.initPostRules(this);
  }

  public finalise() {
    this.state.finalise();
  }

  static process(file: File, tasks: ParserTask[]): Promise<FileResult> {
    var parserState = new ParserState();
    var parser = new Parser(parserState);
    var content = file.content;

    tasks = tasks || [];

    parser.init(tasks, file.path);

    if (typeof (file.content) === 'string') {
      var stream: Readable = new Readable();
      stream.push(file.content);
      stream.push(null);
      stream.pipe(parser);
    } else if (Parser.isStream(content)) {
      content.pipe(parser);
    }
    else {
      throw new Error("html isn't pipeable");
    }

    var completed = new Promise<void>(function (resolve, reject) {
      parser.on("end", () => {
        parser.finalise();
        resolve();
      });
    });

    return completed
      .then(() => {
        return Promise.all(tasks.map((rule) => {
          return rule.finalise();
        }));
      })
      .then(results => {
        var issues = new Array<Issue>();

        results.forEach(parts => {
          issues = issues.concat(parts);
        });

        issues = issues.sort((a, b) => (a.line - b.line) * 1000 + (a.column - b.column));

        return <FileResult>{ issues: issues, file: file, root: ast.root };
      });
  }

  private static isStream(input): input is Stream {
    return input.pipe && typeof (input.pipe) === "function";
  }
}
