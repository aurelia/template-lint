import { Linter, Config, Options } from '../source/index';
import { File, FileKind } from '../source/index';

describe("Linter", () => {
  describe("Process Example", () => {
    it("should return the result for file", async (done) => {
      try {
        var config = new Config();

        config.basepath = "./";        
        config.typings = "./example/**/*.d.ts";
        config.source = "./example/**/*.ts"; 
        config.markup = "./example/**/*.html"; 

        var linter = new Linter(config);

        await linter.init();


      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });  
  });
});
