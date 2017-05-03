const gulp        = require('gulp');
const browserify  = require('browserify');
const watchify    = require('watchify');
const source      = require('vinyl-source-stream');
const sass        = require('gulp-sass');
const pug         = require('gulp-pug');
const plumber     = require('gulp-plumber');
const notify      = require('gulp-notify');
const sourcemaps  = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');

/** Compile & Bundle TypeScript sources by Watchify */
gulp.task('script', () => {
    const b = browserify({
        cache: {},
        packageCache: {},
        debug: true
    });
    const w = watchify(b);
    const bundle = () => {
        return w
            .add('./src/scripts/main.ts')
            .plugin('tsify')
            .bundle()
            .pipe(source('main.js'))
            .pipe(gulp.dest('./public/'))
            .pipe(browserSync.reload({
                stream: true
            }));
    };
    w.on('update', bundle);
    return bundle();
});

gulp.task('style', () => {
    return gulp.src([`src/styles/**/*.scss`])
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public'))
    .pipe(browserSync.reload({
        stream: true
    }));
});

/** Compile Pug sources  */
gulp.task('template', () => {
    return gulp.src(`src/templates/**/*.pug`)
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest('public'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/** Run Web server */
gulp.task('serve', () => {
    return browserSync.init(null, {
        server: {
            baseDir: './public/'
        },
        reloadDelay: 1000
    })
});

/** Watch sources */
gulp.task('watch', () => {
    gulp.watch('src/**/*.scss', ['style']);
    return gulp.watch('src/**/*.pug', ['template']);
});

gulp.task('default', () => runSequence(['script', 'style', 'template'], ['serve', 'watch']));
