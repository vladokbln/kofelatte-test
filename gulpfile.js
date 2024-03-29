"use strict";

/* параметры для gulp-autoprefixer */
var autoprefixerList = [
  'Chrome >= 45',
  'Firefox ESR',
  'Edge >= 12',
  'Explorer >= 10',
  'iOS >= 9',
  'Safari >= 9',
  'Android >= 4.4',
  'Opera >= 30'
];
/* пути к исходным файлам (src), к готовым файлам (build), файлам (watch) */
var path = {
  build: {
    html:  'build/',
    js:    'build/js/',
    css:   'build/css/',
    img:   'build/img/',
		fonts: 'build/fonts/',
    webFonts: 'build/webfonts/'		
  },
  src: {
    html:  'src/*.html',
    js:    'src/js/main.js',
    style: 'src/style/main.less',
    img:   'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
    webFonts: 'src/bower_components/components-font-awesome/webfonts/**/*.*'
  },
  watch: {
    html:  'src/**/*.html',
    js:    'src/js/**/*.js',
    css:   'src/style/**/*.less',
    img:   'src/img/**/*.*',
		fonts: 'srs/fonts/**/*.*',
		webFonts: 'src/bower_components/components-font-awesome/webfonts/**/*.*'
  },
  clean:     './build'
};
/* настройки сервера */
var config = {
  server: {
    baseDir: './build'
  },
  notify: false
};

/* подключаем gulp и плагины */
var gulp = require('gulp'),  // подключаем Gulp
  webserver = require('browser-sync'), // сервер для работы и автоматического обновления страниц
  plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
  rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
  sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
  less = require('gulp-less'), // модуль для компиляции less в CSS
  autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
  cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
  uglify = require('gulp-uglify'), // модуль для минимизации JavaScript
  cache = require('gulp-cache'), // модуль для кэширования
	imagemin = require('gulp-imagemin'), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
	jpegrecompress = require('imagemin-jpeg-recompress'), // плагин для сжатия jpeg	
  pngquant = require('imagemin-pngquant'), // плагин для сжатия png
  del = require('del'), // плагин для удаления файлов и каталогов
  notify = require('gulp-notify'), // уведомления ошибок
  run = require('run-sequence'),
	cheerio = require('gulp-cheerio'), // удаление атрибутов
	rename = require("gulp-rename");


/* задачи */

// запуск сервера
gulp.task('webserver', function () {
  webserver(config);
});

// сбор html
gulp.task('html:build', function () {
  gulp.src(path.src.html) 
    .pipe(plumber()) 
    .pipe(rigger()) 
    .pipe(gulp.dest(path.build.html)) 
    .pipe(webserver.reload({stream: true})); 
});

// сбор стилей
gulp.task('css:build', function () {
  gulp.src(path.src.style) 
    .pipe(plumber()) 
    .pipe(sourcemaps.init()) 
    .pipe(less().on("error", notify.onError(function (error) {
      return "Message to the notifier: " + error.message;
    })))  
    .pipe(autoprefixer({ 
      browsers: autoprefixerList
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('./')) 
    .pipe(gulp.dest(path.build.css)) 
    .pipe(webserver.reload({stream: true,logSnippet:false})); 
});

// сбор js
gulp.task('js:build', function () {
  gulp.src(path.src.js) 
    .pipe(plumber()) 
    .pipe(rigger()) 
    .pipe(sourcemaps.init()) 
    .pipe(uglify()) 
    .pipe(sourcemaps.write('./')) 
    .pipe(gulp.dest(path.build.js)) 
    .pipe(webserver.reload({stream: true})); 
});

// перенос шрифтов
gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
});

// перенос web-шрифтов
gulp.task('webFonts:build', function() {
  gulp.src(path.src.webFonts)
    .pipe(gulp.dest(path.build.webFonts));
});

// обработка картинок
gulp.task('image:build', function () {
  gulp.src(path.src.img) 
    .pipe(cache(imagemin([ 
      imagemin.gifsicle({interlaced: true}),
        jpegrecompress({
          progressive: true,
          max: 90,
          min: 80
        }),
        pngquant()
  	])))
    .pipe(gulp.dest(path.build.img)); 
});

// удаление каталога build 
gulp.task('clean:build', function () {
  del.sync(path.clean);
});

// очистка кэша
gulp.task('cache:clear', function () {
  cache.clearAll();
});

// сборка
gulp.task('build', function(fn) {
  run(
  'clean:build',
  'html:build',
  'css:build',
  'js:build',
	'fonts:build',
	'webFonts:build',
  'image:build',
  fn  
  );
});

// запуск задач при изменении файлов
gulp.task('watch', function() {
  gulp.watch(path.watch.html, ['html:build']);
  gulp.watch(path.watch.css, ['css:build']);
  gulp.watch(path.watch.js, ['js:build']);
  gulp.watch(path.watch.img, ['image:build']);
	gulp.watch(path.watch.fonts, ['fonts:build']);
	gulp.watch(path.watch.webFonts, ['webFonts:build']);
});
 
// задача по умолчанию
gulp.task('default', function (fn){
  run(
    'build',
    'webserver',
    'watch',
    fn
  );
});