const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('compile:debug', function () {

  let tsProject = ts.createProject('tsconfig.json', {
            declaration: false
        });

  return gulp.src(['src/**/*.ts', 'test/**/*.ts'], { base: './' } )
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.', {sourceRoot: '..'}))
    .pipe(gulp.dest('./.tmp'));
});
