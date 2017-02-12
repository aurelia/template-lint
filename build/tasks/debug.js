const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const rimraf = require('gulp-rimraf');

gulp.task('clean:debug', function () {
  return gulp.src(['src/**/*.js', 'src/**/*.map', 'spec/**/*.js', 'spec/**/*.map'], { read: false })
    .pipe(rimraf());
});

gulp.task('compile:debug', ["clean:debug"], function () {

  let tsProject = ts.createProject('tsconfig.json', {
    declaration: false
  });

  return gulp.src(['**/*.ts', "!node_modules/**/*"])
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.', { sourceRoot: "." }))
    .pipe(gulp.dest('./'));
});
