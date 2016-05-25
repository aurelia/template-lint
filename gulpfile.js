var gulp = require('gulp');
var ts = require('gulp-typescript');

var paths = {
    source = "source/",
    output = "dist/"
}

gulp.task('build-ts', function () {
    var project = ts.createProject('../tsconfig.json');

    var tsResult = gulp
        .src([
            paths.source + '**/*.ts',
            'typings/index.d.ts'
        ])
        .pipe(ts(project));

    return tsResult.js.pipe(gulp.dest(paths.output));
});

