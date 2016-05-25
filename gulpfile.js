'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var shell = require('gulp-shell');
var merge = require('merge2');
var runSequence = require('run-sequence');
var jasmine = require('gulp-jasmine');
var plumber = require('gulp-plumber');

var paths = {
    source : "source/",
    output : "dist/",
    spec : "spec/"
}

gulp.task('compile', function () {
    var project = ts.createProject('tsconfig.json');

    var tsResult = gulp
        .src([
            '!' + paths.source + '**/*spec.ts',
            paths.source + '**/*.ts',
            'typings/index.d.ts'
        ])
        .pipe(ts(project));
        
        
    return merge([
		tsResult.dts.pipe(gulp.dest(paths.output)),
		tsResult.js.pipe(gulp.dest(paths.output))
	]);
});

gulp.task('compile-tests', ['compile'], function () {
    var project = ts.createProject('tsconfig.json');

    var tsResult = gulp
        .src([
            paths.source + '**/*spec.ts',
            'typings/index.d.ts'
        ])
        .pipe(ts(project));        
        
    return tsResult.js.pipe(gulp.dest(paths.spec));
});

gulp.task('test', ['compile-tests'], function() {
   return gulp.src('spec/*.js')
      .pipe(plumber())
      .pipe(jasmine({verbose:true}));
});

gulp.task('watch', ['compile-tests'], function () {
    gulp.watch(paths.source + '**/*.ts',   ['compile-tests']);
    gulp.watch(paths.spec + '**/*.js', [ 'flush', 'test']);
});

gulp.task('flush', function () {
  for (var prop in require.cache) {
    if (prop.indexOf("node_modules") === -1) {
      delete require.cache[prop];
    }
  }
});

gulp.task('default', function() {
   return runSequence('compile', 'compile-tests', 'test');
});
