const Reflection = require('./dist/reflection/reflection.js').Reflection;

let reflection = new Reflection();


let typing = 
`export interface Foo {
  name:string;
}`

reflection.add("foo.d.ts", typing);

let program = reflection.createProgram();
let typechecker = program.getTypeChecker();

let type = typechecker.getContextualType()






