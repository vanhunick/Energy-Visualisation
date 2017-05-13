var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');


// .pipe(rename({
//         suffix: '.min'
//     }))
gulp.task('minify-css', function() {
  return gulp.src('public/stylesheets/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('index.min.css'))

    .pipe(gulp.dest('public/dist'));
});

gulp.task('min-scripts', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('min-compare', function() {
    return gulp.src('public/javascripts/compare/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('compare.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('compare.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('min-index', function() {
    return gulp.src('public/javascripts/index/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('index.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('index.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist'));
});


// Without sourcemaps for production
gulp.task('min-scripts-prod', function() {
    return gulp.src('public/javascripts/*.js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('min-compare-prod', function() {
    return gulp.src('public/javascripts/compare/*.js')
        .pipe(concat('compare.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('compare.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('min-index-prod', function() {
    return gulp.src('public/javascripts/index/*.js')
        .pipe(concat('index.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename('index.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('production', ['minify-css','min-scripts-prod','min-index-prod','min-compare-prod']);

gulp.task('default', ['minify-css', 'min-scripts','min-index','min-compare']);
