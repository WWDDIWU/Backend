'use strict';

const gulp = require('gulp');
const notify = require('gulp-notify');
const growl = require('gulp-notify-growl');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');
const changed = require('gulp-changed');

gulp.task('jshint', function () {
    const lib = gulp.src('lib/**/*.js').pipe(changed('lib/*.js')).pipe(jshint()).pipe(jshint.reporter('jshint-stylish'));
    const routes = gulp.src('routes/*.js').pipe(changed('routes/*.js')).pipe(jshint()).pipe(jshint.reporter('jshint-stylish'));
    const test = gulp.src('test/*.js').pipe(changed('test/*.js')).pipe(jshint()).pipe(jshint.reporter('jshint-stylish'));
});
