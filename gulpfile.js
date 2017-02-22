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

gulp.task('min-scripts', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('min-compare', function() {
    return gulp.src('public/javascripts/compare/*.js')
        .pipe(concat('compare.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('compare.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('min-index', function() {
    return gulp.src('public/javascripts/index/*.js')
        .pipe(concat('index.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('index.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});


gulp.task('default', ['minify-css', 'min-scripts','min-index','min-compare']);
