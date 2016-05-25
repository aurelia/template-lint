'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var jasmine = require('gulp-jasmine');
var shell = require('gulp-shell');
var merge = require('merge2');
var runSequence = require('run-sequence');

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

gulp.task('compile-tests', function () {
    var project = ts.createProject('tsconfig.json');

    var tsResult = gulp
        .src([
            paths.source + '**/*spec.ts',
            'typings/index.d.ts'
        ])
        .pipe(ts(project));        
        
    return tsResult.js.pipe(gulp.dest(paths.spec));
});

gulp.task('test', function() {
   return gulp.src('spec/*.js')
      .pipe(jasmine());
});

gulp.task('watch', function () {
    gulp.watch(paths.source + '**/*.ts',   ['compile', 'compile-tests']);
    gulp.watch(paths.spec + '**/*.js',   ['test']);
});

gulp.task('default', function() {
   return runSequence('compile', 'compile-tests', 'test', 'watch');
});
