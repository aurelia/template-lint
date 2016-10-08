export abstract interface Rule{  
  process(file: File, result: FileResult, next?: Rule): Promise;
}
