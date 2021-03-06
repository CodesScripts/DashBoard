/* jshint node: true */
import {spawn} from 'child_process';

import BrowserSync from 'browser-sync';
import del from 'del';
import extend from 'xtend';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import concat from 'gulp-concat';
import browserify from 'gulp-browserify';
import rename from 'gulp-rename';

const $ = gulpLoadPlugins();
const browserSync = BrowserSync.create();

const src = {
  scripts: {
    // Ignore Flycheck temporary files, until
    // https://github.com/flycheck/flycheck/pull/673 is merged.
    main: ['main.js', '!**/flycheck_*.js'],
    renderer: ['renderer.js', '!**/flycheck_*.js'],
    app: ['app/**/*.js']
    },
    html: ['*.html'],
    css: ['assets/css/*.css'],
    view: ['app/**/*.html'],
    static: ['*.json']
  };
  const dest = 'build';

  gulp.task('clean', cb => {
    del([`${dest}/\*`], {dot: true}, cb);
    });

  gulp.task('build', ['copy', 'scripts']);

  gulp.task('copy', ['copy:html', 'copy:static', 'copy:css', 'copy:view']);

  gulp.task('copy:css', () => {
    return gulp.src(src.css)
    .pipe($.if(process.env.NODE_ENV === 'production', $.useref()))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(dest + '/assets/css'));
    });

  gulp.task('copy:html', () => {
    return gulp.src(src.html)
    .pipe($.if(process.env.NODE_ENV === 'production', $.useref()))
    .pipe(gulp.dest(dest));
    });

  gulp.task('copy:static', () => {
    return gulp.src(src.static)
    .pipe($.changed(dest))
    .pipe(gulp.dest(dest));
    });

  gulp.task('copy:view', () => {
    return gulp.src(src.view)
    .pipe($.changed(dest))
    //.pipe(rename({dirname: ''}))
    .pipe(gulp.dest(dest + '/view'));
    });

  gulp.task('scripts', ['scripts:main', 'scripts:renderer']);

  gulp.task('scripts:main', () => {
    return gulp.src(src.scripts.main)
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(gulp.dest(dest));
    });

  gulp.task('scripts:renderer', () => {
    return gulp.src(src.scripts.renderer)
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(browserify({
      insertGlobals: true
      }))
    .pipe(gulp.dest(dest))
    .pipe($.if(browserSync.active, browserSync.stream()));
    });

  gulp.task('scripts:browserify', () => {
    gulp.src(src.scripts.app)
    .pipe(browserify({
      insertGlobals: true
      }))
    .pipe(gulp.dest(dest))
    });

  function runElectronApp(path, env={}) {
    const electron = require('electron-prebuilt');
    const options = {
      env: extend({NODE_ENV: 'development'}, env, process.env),
      stdio: 'inherit'
    };
    return spawn(electron, [path], options);
  }

  gulp.task('serve', ['build'], () => {
    runElectronApp(dest);
    });

  gulp.task('watch', ['build'], cb => {

    function getRootUrl(options) {
      const port = options.get('port');
    return `http://localhost:${port}`;
  }

  function getClientUrl(options) {
    const connectUtils = require('browser-sync/lib/connect-utils');
    const pathname = connectUtils.clientScript(options);
    return getRootUrl(options) + pathname;
  }

  const options = {
    ui: false,
    // Port 35829 = LiveReload's default port 35729 + 100.
    // If the port is occupied, Browsersync uses next free port automatically.
    port: 35829,
    ghostMode: false,
    open: false,
    notify: false,
    logSnippet: false,
    socket: {
      // Use the actual port here.
      domain: getRootUrl
    }
  };

  browserSync.init(options, (err, bs) => {
    if (err) {
      return cb(err);
    }

    runElectronApp(dest, {
      BROWSER_SYNC_CLIENT_URL: getClientUrl(bs.options)
      });

    // gaze 0.5.1 (used by gulp.watch) is not Emacs friendly.
    // See https://github.com/shama/gaze/issues/45.
    // Instead, use browserSync.watch here.
    browserSync.watch(src.scripts.app)
    .on('change', () => gulp.start('scripts:renderer'));
    browserSync.watch(src.scripts.renderer)
    .on('change', () => gulp.start('scripts:renderer'));
    browserSync.watch(src.html)
    .on('change', () => gulp.start('copy:html', browserSync.reload));
    browserSync.watch(src.view)
    .on('change', () => gulp.start('copy:view', browserSync.reload));

    cb();
    });
  });
