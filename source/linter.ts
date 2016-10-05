import { Readable, Stream } from 'stream';
import { ParserTask } from './parser-task';

import { Parser } from './parser';
import { ParserState } from './parser-state';
import { Issue } from './issue';
import { ASTGen } from './ast';

import { File } from './file';
import { FileResult } from './file-result';

export interface ILintConfig {
  tasks: ParserTask[];
  makeParser: () => Parser;
  makeAST: () => ASTGen;
}

export abstract class Linter {
  static lint(file: File, config: ILintConfig): Promise<FileResult> {
    if (!config)
      throw Error("argument-null: config");
    if (!config.tasks)
      throw Error("argument-null: config.tasks");
    if (!config.makeParser)
      throw Error("argument-null: config.makeParser");
    if (!config.makeAST)
      throw Error("argument-null: config.makeAST");

    var parser = config.makeParser();
    var ast = config.makeAST();
    var fileContent = file.content;
    var filePath = file.path;
    var tasks = config.tasks;

    parser.init(config.tasks, config.makeAST(), filePath);

    if (typeof (file.content) === 'string') {
      var stream: Readable = new Readable();
      stream.push(file.content);
      stream.push(null);
      stream.pipe(parser);
    } else if (Linter.isStream(fileContent)) {
      fileContent.pipe(parser);
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
          return rule.finalise(ast.root);
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
