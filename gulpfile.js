'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var shell = require('gulp-shell');
var merge = require('merge2');
var runSequence = require('run-sequence');
var jasmine = require('gulp-jasmine');
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');

var paths = {
    source : "source/",
    output : "dist/",
    spec : "spec/"
}

gulp.task('clean', function() {
 return gulp.src([paths.output + '**/*', paths.spec + '**/*.spec.*'], { read: false }) // much faster 
   .pipe(rimraf());
});

gulp.task('compile:typescript', ['clean'], function () {
    var project = ts.createProject('tsconfig.json');

    var tsResult = gulp        
        .src([
            '!' + paths.source + '**/*spec.ts',
            paths.source + '**/*.ts',
            'typings/index.d.ts'
        ])
        .pipe(sourcemap.init())
        .pipe(ts(project));        
        
    return merge([
		tsResult.dts.pipe(gulp.dest(paths.output)),
		tsResult.js
            .pipe(sourcemap.write('.', {sourceRoot: '../source'}))   
            .pipe(gulp.dest(paths.output))
	]);
});

gulp.task('compile:tests', ['compile:typescript'], function () {
    var project = ts.createProject('tsconfig.json');

    var tsResult = gulp.src([
            paths.source + '**/*spec.ts',
            'typings/index.d.ts'
        ])
        .pipe(sourcemap.init())
        .pipe(ts(project));        
        
    return tsResult.js
        .pipe(sourcemap.write('.',  {sourceRoot: '../source'}))
        .pipe(gulp.dest(paths.spec));
});

gulp.task('test', ['compile:tests'], function() {
   return gulp.src('spec/*.js')
      .pipe(plumber())
      .pipe(jasmine({verbose:true}));
});

gulp.task('watch', ['test'], function () {
    
    gulp.watch(paths.source + '**/*.ts', ['test']);
        
});

gulp.task('default', ['test'], function() {
});
