import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileLocation, FileKind, FileTask } from '../source/index';
import { Issue, IssueSeverity } from '../source/issue';
import { IssueSortTask } from '../source/tasks/issue-sort';


describe("Task: Issue Sort", () => {
  describe("Sorting", () => {
    it("should sort issues ascending by start value", async (done) => {
      try {
        var task = new IssueSortTask();
        var file = new File({ content: "", kind: FileKind.Html });

        file.issues.push(new Issue({
          message: "second",
          severity: IssueSeverity.Error,
          location: new FileLocation({ line: 0, column: 0, start: 0, end: 2 })
        }));

        file.issues.push(new Issue({
          message: "first",
          severity: IssueSeverity.Error,
          location: new FileLocation({ line: 0, column: 1, start: 1, end: 2 })
        }));

        task.process(file);

        expect(file.issues.length).toBe(2);
        expect(file.issues[0].message).toBe("first");
        expect(file.issues[1].message).toBe("second");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

     it("should place issues without location information at end", async (done) => {
      try {
        var task = new IssueSortTask();
        var file = new File({ content: "", kind: FileKind.Html });

        file.issues.push(new Issue({
          message: "second",
          severity: IssueSeverity.Error,
          location: undefined
        }));

        file.issues.push(new Issue({
          message: "first",
          severity: IssueSeverity.Error,
          location: new FileLocation({ line: 0, column: 1, start: 1, end: 2 })
        }));

        task.process(file);

        expect(file.issues.length).toBe(2);
        expect(file.issues[0].message).toBe("first");
        expect(file.issues[1].message).toBe("second");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
