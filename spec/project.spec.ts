import { Project } from '../source/index';
import { File, FileKind } from '../source/index';

describe("Project", () => {
  it("should return the result for file after processing", async (done) => {
    try {
      var project = new Project();

      var result = await project.process(<File>{ content: "", path: "foo", kind: FileKind.Source });

      expect(result).not.toBeNull();

    } catch (err) {
      fail(err);
    }
    finally {
      done();
    }
  });
  it("should maintains the result for file after processing", async (done) => {
    try {
      var project = new Project();

      var expected = await project.process(<File>{ content: "", path: "foo", kind: FileKind.Source });
      var result = project.getResult("foo");

      expect(result).toBe(expected);

    } catch (err) {
      fail(err);
    }
    finally {
      done();
    }
  });
});
