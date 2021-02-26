'use strict'

const { src, dest }     = require('gulp');
const gulp              = require('gulp');
const browserSync       = require('browser-sync').create();
const notify            = require("gulp-notify");
const plumber           = require("gulp-plumber");
const rename            = require("gulp-rename");
const imagemin          = require("gulp-imagemin");
const del               = require("del");

// css
const sass              = require('gulp-sass');
const autoprefixer      = require("gulp-autoprefixer");
const cssbeautify       = require("gulp-cssbeautify");
const removeComments    = require('gulp-strip-css-comments');
const cssnano           = require("gulp-cssnano");

// -----------------------PATHS-----------------------
const srcPath  = 'src/';
const distPath = 'dist/';

const path = {
    // пути к файлам готового проекта
    build: {
        html:   distPath,
        js:     distPath + 'assets/js/',
        css:    distPath + 'assets/css/',
        images: distPath + 'assets/images/',
        fonts:  distPath + "assets/fonts/"
    },
    // пути к исходникам
    src: {
        html:   srcPath + '*.html',
        js:     srcPath + 'assets/js/*.js',
        css:    srcPath + 'assets/scss/*.scss',
        images: srcPath + 'assets/images/**/*.{ipg,png,svg,gif,ico,webp,webmanifest,xml,json}',
        fonts:  srcPath + 'assets/fonts/**/*.{eot,woff,woff2,ttf,svg}'
    },
    // пути для отслеживания изменений
    watch: {
        html:   srcPath + '**/*.html',
        js:     srcPath + 'assets/js/**/*.js',
        css:    srcPath + 'assets/scss/**/*.scss',
        images: srcPath + 'assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}',
        fonts:  srcPath + 'assets/fonts/**/*.{eot,woff,woff2,ttf,svg}'
    },
    clean: './' + distPath
}


// -----------------------TASKS-----------------------
// синхронизация устройств и браузеров
function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    });
}

// HTML
function html() {
    return src(path.src.html, {base: srcPath})
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
}

// STYLES
// обработка scss - РЕЛИЗ
function css() {
    return src(path.src.css, {base: srcPath + 'assets/scss/'})
    .pipe(plumber({
        errorHandler : function(err) {
            notify.onError({
                title:    "SCSS Error",
                message:  "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(autoprefixer({
        cascade: true
    }))
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano({
        zindex: false,
        discardComments: {
            removeAll: true
        }
    }))
    .pipe(removeComments())
    .pipe(rename({
        suffix: ".min",
        extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({stream: true}));
}
// обработка scss - РАЗРАБОТКА
function cssWatch() {
    return src(path.src.css, {base: srcPath + 'assets/scss/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(cssbeautify())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
}

// JS
// todo добавить webpack
function js() {
    return src(path.src.js)
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
}


// IMAGES & FONTS
function images() {
    return src(path.src.images)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 95, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));
}

// OTHER
// удаление файлов в папке dist
function clean() {
    return del(path.clean);
}

// сборка проекта и отслеживание при разработке
function watchFiles() {
    gulp.watch([path.watch.html],   html);
    gulp.watch([path.watch.css],    css);
    gulp.watch([path.watch.js],     js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts],  fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, serve);

// EXPORT
exports.html    = html;
exports.css     = css;
exports.js      = js;
exports.images  = images;
exports.fonts   = fonts;
exports.clean   = clean;
exports.build   = build;
exports.watch   = watch;
exports.default = watch;