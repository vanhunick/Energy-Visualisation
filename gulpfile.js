var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');


gulp.task('minify-css', function() {
  return gulp.src('public/stylesheets/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest('public/dist'));
});

gulp.task('compress', function (cb) {
  pump([
        gulp.src('public/javascripts/*.js'),
        uglify(),rename({
                suffix: '.min'
            }),
        gulp.dest('public/dist')
    ],
    cb
  );
  });
gulp.task('default', ['minify-css', 'compress']);
