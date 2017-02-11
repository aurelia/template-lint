const gulp = require('gulp');
const rimraf = require('gulp-rimraf');

const paths = require('../paths');

gulp.task('clean:output', function () {
  return gulp.src([paths.output], { read: false })
    .pipe(rimraf());
});

gulp.task('clean:source', function () {
  return gulp.src([paths.source + '**/*.js', paths.source + '**/*.map'], { read: false })
    .pipe(rimraf());
});

gulp.task('clean:test', function () {
  return gulp.src([paths.test + '**/*.js', paths.test + '**/*.map'], { read: false })
    .pipe(rimraf());
});

gulp.task('clean', ['clean:tests', 'clean:source', 'clean:output'], function () {});
