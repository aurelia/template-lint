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
var runsequence = require('run-sequence');
var through = require('through2');

var paths = {
  source: "source/",
  output: "dist/",
  spec: "spec/"
}

gulp.task('clean:sources', function () {
  return gulp.src([paths.output ], { read: false })
    .pipe(rimraf());
});

gulp.task('clean:tests', function () {
  return gulp.src([paths.spec + '**/*.spec.js', paths.spec + '**/*.map'], { read: false })
    .pipe(rimraf());
});

gulp.task('clean', ['clean:tests', 'clean:sources'], function () {
});

gulp.task('compile:sources', ['clean:sources'], function () {
  var project = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

  var tsResult =  gulp.src(paths.source + '**/*.ts')
    .pipe(sourcemap.init())
    .pipe(project());

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
});

gulp.task('lint:sources', function () {
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

gulp.task('format', ['format:sources', 'format:tests'], function () { });

gulp.task('compile:tests', ['compile:sources', 'clean:tests'], function () {
  var project = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

  var tsResult = gulp.src(paths.spec + '**/*spec.ts')
    .pipe(sourcemap.init())
    .pipe(project());

  return tsResult.js
    .pipe(sourcemap.write('.', {
      sourceRoot: function (file) {
        var relative = path.relative(file.path, path.join(__dirname, "spec"));
        var relativeSource = path.join(relative, 'spec')
        return relativeSource;
      }
    }))
    .pipe(replace(/(\/source\/)/g, '\/dist\/'))
    .pipe(gulp.dest(paths.spec));
});

gulp.task('test:jasmine', function (done) {
  return gulp.src('spec/**/*.js')
    .pipe(plumber())
    .pipe(jasmine({ verbose: true }));
});

gulp.task('test', function (done) {
  runsequence('compile:tests', 'lint:sources', 'test:jasmine', function (err) {
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

gulp.task('watch', ['test'], function () {
  gulp.watch(paths.source + '**/*.ts', ['test', 'lint:sources']);
  gulp.watch(paths.spec + '**/*spec.ts', ['test', 'lint:sources']);
});

gulp.task('default', ['test'], function () {
});
