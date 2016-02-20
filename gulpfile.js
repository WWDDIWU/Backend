const gulp = require('gulp');
const notify = require('gulp-notify');
const growl = require('gulp-notify-growl');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');


gulp.task('jscs', function() {
    gulp.src('./lib/*.js')
        .pipe(jscs())
        .pipe(notify({
            title: 'JSCS',
            message: 'JSCS Passed. Let it fly!'
        }));
});