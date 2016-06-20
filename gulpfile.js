'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var shell = require('gulp-shell');
var merge = require('merge2');
var jasmine = require('gulp-jasmine');
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var rimraf = require('gulp-rimraf');
var replace = require('gulp-replace');
var runsequence = require('run-sequence');

var paths = {
    source: "source/",
    output: "dist/",
    spec: "spec/"
}

gulp.task('clean:typescript', function () {
    return gulp.src([paths.output + '**/*'], { read: false })
        .pipe(rimraf());
});

gulp.task('clean:tests', function () {
    return gulp.src([paths.spec + '**/*.spec.js', paths.spec + '**/*.map'], { read: false })
        .pipe(rimraf());
});

gulp.task('clean', ['clean:tests', 'clean:typescript'], function () {
});

gulp.task('compile:typescript', ['clean:typescript'], function () {
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
            .pipe(sourcemap.write('.', { sourceRoot: '../source' }))
            .pipe(gulp.dest(paths.output))
    ]);
});

gulp.task('compile:tests', ['compile:typescript', 'clean:tests'], function () {
    var project = ts.createProject('tsconfig.json');

    var tsResult = gulp.src([
        paths.spec + '**/*spec.ts', 'typings/index.d.ts'
    ])
        .pipe(sourcemap.init())
        .pipe(ts(project));

    return tsResult.js
        .pipe(sourcemap.write('.', { sourceRoot: '../spec' }))
        .pipe(replace(/(require\('\..\/source\/)/g, 'require(\'..\/dist\/'))
        .pipe(gulp.dest(paths.spec));
});

gulp.task('test:jasmine', function (done) {
    return gulp.src('spec/*.js')
        .pipe(plumber())
        .pipe(jasmine({ verbose: true }));
});

gulp.task('test', function (done) {
    runsequence('compile:tests', 'test:jasmine', function (err) {
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
    gulp.watch(paths.source + '**/*.ts', ['test']);
});

gulp.task('default', ['test'], function () {
});
