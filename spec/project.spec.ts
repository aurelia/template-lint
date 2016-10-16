import { Project } from '../source/index';
import { File, FileKind } from '../source/index';

describe("Project", () => {
  describe("Processing", () => {
    it("should return the result for file", async (done) => {
      try {

        var project = new Project(); 

        var result = await project.process(new File({ content: "", path: "foo", kind: FileKind.Source }));

        expect(result).not.toBeNull();

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
    
    it("should maintain the file result when file has a path", async (done) => {
      try {
        var project = new Project();

        var expected = await project.process(new File({ content: "", path: "foo", kind: FileKind.Source }));
        var result = project.getResult("foo");

        expect(result).toBe(expected);

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should not maintain the file result when file has not path", async (done) => {
      try {
        var project = new Project(); 

        await project.process(new File({ path: "", content: "", kind: FileKind.Source }));

        var result = project.getResult("");

        expect(result).toBeUndefined();

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
