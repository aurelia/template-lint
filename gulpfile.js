'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var jasmine = require('gulp-jasmine');
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var rimraf = require('gulp-rimraf');
var replace = require('gulp-replace');
var tslint = require('gulp-tslint');
var formatter = require('typescript-formatter');
var shell = require('gulp-shell');

var path = require('path');
var merge = require('merge2');
var runsequence = require('gulp4-run-sequence');
var through = require('through2');

var paths = {
  source: "source/",
  output: "dist/",
  spec: "spec/"
}

gulp.task('clean:typescript', function () {
  return gulp.src([paths.output], { read: false, allowEmpty: true })
    .pipe(rimraf());
});

gulp.task('clean:tests', function () {
  return gulp.src([paths.spec + '**/*.spec.js', paths.spec + '**/*.map'], { read: false })
    .pipe(rimraf());
});

gulp.task('clean', gulp.series('clean:tests', 'clean:typescript'));

gulp.task('compile:typescript', gulp.series('clean:typescript', function () {
  var project = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

  var tsResult =  gulp.src([paths.source + '**/*.ts', "node_modules/@types/**/index.d.ts", "!node_modules/@types/**/node_modules/**/index.d.ts"])
    .pipe(sourcemap.init())
    .pipe(ts(project));

  return merge([
    tsResult.dts.pipe(gulp.dest(paths.output)),
    tsResult.js
      .pipe(sourcemap.write('.', {
        sourceRoot: function (file) {
          var relative = path.relative(file.path, path.join(__dirname, "source"));
          var relativeSource = path.join(relative, 'source')
          return relativeSource;
        }
      }))
      .pipe(gulp.dest(paths.output))
  ]);
}));

gulp.task('lint:typescript', function () {
  return gulp.src([paths.source + '**/*.ts', paths.spec + '**/*.ts'])
    .pipe(plumber())
    .pipe(tslint({
      formatter: "verbose"
    }))
    .pipe(tslint.report());
});


function gulpTypescriptFormatter(options) {
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }

    if (file.isBuffer()) {
      var fileContentPromise = formatter.processString(file.path, String(file.contents), options);

      fileContentPromise.then(function(result) {
        file.contents = new Buffer(result.dest);

        cb(null, file);
      });
    }
  });
}

function format(sourcePattern, targetDir) {
  return gulp.src(sourcePattern)
    .pipe(gulpTypescriptFormatter({
      baseDir: '.',
      tslint: true, // use tslint.json file ?
      editorconfig: true, // use .editorconfig file ?
      tsfmt: true, // use tsfmt.json ?
    }))
    .pipe(gulp.dest(targetDir));
}

gulp.task('format:sources', function () {
  return format(paths.source + '**/*.ts', paths.source);
});

gulp.task('format:tests', function () {
  return format(paths.spec + '**/*.ts', paths.spec);
});

gulp.task('format', gulp.series('format:sources', 'format:tests'), function () { });

gulp.task('compile:tests', gulp.series('compile:typescript', 'clean:tests', function () {
  var project = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

  var tsResult = gulp.src([paths.spec + '**/*spec.ts', "node_modules/@types/**/index.d.ts", "!node_modules/@types/**/node_modules/**/index.d.ts"])
    .pipe(sourcemap.init())
    .pipe(ts(project));

  return tsResult.js
    .pipe(sourcemap.write('.', {
      sourceRoot: function (file) {
        var relative = path.relative(file.path, path.join(__dirname, "spec"));
        var relativeSource = path.join(relative, 'spec')
        return relativeSource;
      }
    }))
    .pipe(replace(/(require\("\..\/source\/)/g, 'require(\"..\/dist\/'))
    .pipe(gulp.dest(paths.spec));
}));

gulp.task('test:jasmine', function (done) {
  return gulp.src('spec/*.js')
    .pipe(plumber())
    .pipe(jasmine({ verbose: true }));
});

gulp.task('test', function (done) {
  runsequence('compile:tests', 'lint:typescript', 'test:jasmine', function (err) {
    runsequence('clean:tests');
    done();
  });
});

gulp.task('test-no-compile', function (done) {
  runsequence('test:jasmine', function (err) {
    runsequence('clean:tests');
    done();
  });
});

gulp.task('watch', gulp.series('test', function () {
  gulp.watch(paths.source + '**/*.ts', gulp.series('test', 'lint:typescript'));
  gulp.watch(paths.spec + '**/*spec.ts', gulp.series('test', 'lint:typescript'));
}));

gulp.task('default', gulp.series('test'));
