var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
var streamqueue = require('streamqueue');
var ftp         = require('vinyl-ftp');
var clean       = require('gulp-clean');

gulp.task('clean', function(){
  return gulp.src('application/', {read: false})
  .pipe(clean());
});

gulp.task('html', function(){
  var index = gulp.src('assets/html/index.html')
  .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}))

  var views = gulp.src('assets/views/**/*.html')
  .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}));

  return streamqueue({ objectMode: true}, index )
  .pipe(gulp.dest('application/'))
  .pipe(reload({stream: true}));

});

gulp.task('views', function(){

  var views = gulp.src('assets/views/**/*.html')
  .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}));

  return streamqueue({ objectMode: true}, views )
  .pipe(gulp.dest('application/views/'))
  .pipe(reload({stream: true}));
});

gulp.task('images', function(){

  var views = gulp.src('assets/images/**');

  return streamqueue({ objectMode: true}, views )
  .pipe(gulp.dest('application/images/'))
  .pipe(reload({stream: true}));
});

gulp.task('fonts', function(){

  var views = gulp.src('assets/fonts/**');

  return streamqueue({ objectMode: true}, views )
  .pipe(gulp.dest('application/fonts/'))
  .pipe(reload({stream: true}));
});

gulp.task('css', function(){
  var stylesheet = gulp.src('assets/styles/app.scss')
  .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}))
  .pipe($.sass())
  .pipe($.autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
  .pipe($.minifyCss());
  
  return streamqueue({ objectMode: true }, stylesheet)
  .pipe($.concat('eventri.css'))
  .pipe(gulp.dest('application'))
  .pipe(reload({stream: true}));
});

gulp.task('js', function(){
  
  var app = gulp.src('src/main.js')
  .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}))
  .pipe($.browserify());

  return streamqueue({ objectMode: true }, app)
  .pipe($.concat('eventri.js'))
  .pipe(gulp.dest('application'))
  .pipe(reload({stream: true}));
});

gulp.task('serve', function(){
  browserSync.init({
    server: {
      baseDir: "./application"
    }
  });
});

gulp.task('watch', function(){
    gulp.watch('assets/html/**/*.html', ['html']);
    gulp.watch('assets/views/**/*.html', ['views'])
    gulp.watch('src/**', ['js']);
    gulp.watch('assets/styles/**/*.scss', ['css']);
    gulp.watch('assets/images/**/*', ['images']);
    gulp.watch('assets/fonts/**/*', ['fonts']);
});

gulp.task('upload', function(){
  var conn = ftp.create( {
        host:     'eventri.de',
        user:     'eventri',
        password: 'TimoHatNenKleinen:-)',
        parallel: 10,
        log: $.util.log
    } );

    return gulp.src( '**/*', { cwd: 'application/', buffer: false } ).pipe( conn.newer( '/public_html/konfigurator' ) ).pipe( conn.dest( '/public_html/konfigurator' ) );
});

gulp.task('default', [ 'build', 'serve', 'watch' ] );
gulp.task('build', [ 'html', 'views', 'images', 'fonts', 'css', 'js' ]);
