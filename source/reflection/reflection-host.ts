import * as $path from "path";
import * as ts from "typescript";
import * as glob from "glob";
import * as fs from "fs";

export class ReflectionHost implements ts.CompilerHost {
  private files = new Map<string, { content: string, source: ts.SourceFile, rev: number }>();

  getSourceByPath(filePath: string): ts.SourceFile | undefined {
    filePath = $path.normalize(filePath);
    if (this.files.has(filePath))
      return;

    var entry = this.files.get(filePath);

    if (!entry)
      return;

    return entry.source;
  }

  add(filePath: string, fileContent: string) {
    filePath = $path.normalize(filePath);
    if (this.files.has(filePath))
      return;

    let fileSource = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);

    this.files.set(filePath, { content: fileContent, source: fileSource, rev: 1 });
  }

  fileExists = (fileName: string) => this.files.has($path.normalize(fileName));
  readFile = (fileName: string) => this.files.get($path.normalize(fileName)) !.content;
  //trace?(s: string): void;
  //directoryExists?(directoryName: string): boolean;
  //realpath?(path: string): string;
  getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => this.files.get($path.normalize(fileName)) !.source;
  //getSourceFileByPath?(fileName: string, path: Path, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile;
  //getCancellationToken?(): CancellationToken;
  getDefaultLibFileName = () => "lib.d.ts";
  //getDefaultLibLocation?(): string;
  writeFile = (name, text, writeByteOrderMark) => { }
  getCurrentDirectory = () => ""
  getDirectories = (path: string) => [];
  getCanonicalFileName = fileName => $path.normalize(fileName);
  useCaseSensitiveFileNames = () => false;
  getNewLine = () => '\r';
  //resolveModuleNames?(moduleNames: string[], containingFile: string): ResolvedModule[];
  /**
   * This method is a companion for 'resolveModuleNames' and is used to resolve 'types' references to actual type declaration files
   */
  //resolveTypeReferenceDirectives?(typeReferenceDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
}
