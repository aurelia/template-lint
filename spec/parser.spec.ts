import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileKind } from '../source/index';
import { ParserFileTask} from '../source/tasks/parser-file-task';

describe("Task: Parser", () => {
  describe("Hook: AST Generator", () => {
    it("should generate AST node in file result", async (done) => {
      try {
        var opts = <Options>{};
        var project = new Project();

        project.use(new ParserFileTask(opts));

        var file = <File>{ 
          content: "<template></template>", 
          path: "foo.html",
          kind: FileKind.Html 
        };

        var result = await project.process(file);

        expect(result["ast"]).toBeDefined();     

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
