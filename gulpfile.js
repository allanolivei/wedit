const 
gulp        = require("gulp"),
istanbul    = require("gulp-istanbul"),

// apagar pasta
clean = require('gulp-clean'),

// view in browser and check updates
browserSync = require('browser-sync').create(),

// sass
sass = require('gulp-sass'),

// check code
tslint      = require("gulp-tslint"),

// test
mocha       = require("gulp-mocha"),

// generate typescript for tests
tsc          = require("gulp-typescript"),      // generate separated files to test

// generate typescript in one file
browserify  = require('browserify'),           // include files by import/require
tsify       = require('tsify'),                // plugin for browserify to support typescript
source      = require('vinyl-source-stream'),  // browserify to gulp
buffer      = require("vinyl-buffer"),         // convert to corrent buffer to debug in browser and view typescript
sourcemaps  = require("gulp-sourcemaps");      // debug in browser and view typescript



function errorHandler(err) 
{
    console.error(err.message);
    browserSync.notify(err.message, 3000);
    this.emit('end');
}

gulp.task('clean', function () {
    return gulp.src('tmp', {read: false})
        .pipe(clean());
});

gulp.task("html", function()
{
    return gulp.src("./src/views/**/*.html")
        .pipe(gulp.dest("./tmp/"))
        .pipe(browserSync.stream());
});

gulp.task("ts", function() 
{
    return browserify({
        debug: true,
        //insertGlobals: true,
        //insertGlobalVars: true
        standalone: "main.ts"
        //require: "main.ts"
    })
    .add('src/scripts/main.ts')
    .plugin(tsify)
    .bundle()
    .on('error', errorHandler)

    .pipe(source("main.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    //.pipe(uglify())
    .pipe(sourcemaps.write('./'))

    .pipe(gulp.dest("tmp/js"))
    .pipe(browserSync.stream());

});

gulp.task("lint", function() {
    return gulp.src([
        "src/scripts/**/*.ts"
    ])
    .pipe(tslint({ 
        formatter: "verbose" 
    }))
    .pipe(tslint.report( {emitError: false} ));
});

gulp.task("ts-test", function()
{
    var tsProject = tsc.createProject("tsconfig.json");
    return gulp.src([
        "src/scripts/**/*.ts"
    ])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(tsProject())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("tmp/js/"));
    //.js.pipe(gulp.dest("tmp/js/"));
});

gulp.task("report", ["ts-test"], function() 
{
    return gulp.src(['tmp/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", ["report"], function() 
{
    return gulp.src('./test/**/*.test.js')
        .pipe(mocha({ui: 'bdd'}))
        //.pipe(mocha({}))
        .once('error', err => {
			//console.error(err);
			//process.exit(1);
		})
		.once('end', () => {
			//process.exit();
		})
        .pipe(istanbul.writeReports());
});

gulp.task('sass', function() 
{
	var autoprefixerOptions = {
		browsers: ['last 2 versions'],
	};

	return gulp.src("src/sass/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}).on('error', errorHandler))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest("tmp/css/"))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('img', function ()
{
    return gulp.src("src/images/**/*")
        .pipe(gulp.dest("tmp/img/"))
        .pipe(browserSync.stream());
});

gulp.task('others', function ()
{
    return gulp.src('src/others/**/*')
        .pipe(gulp.dest("tmp"))
        .pipe(browserSync.stream());
});

gulp.task("default", ["clean", "html", "ts", "sass", "img", "others"]);

gulp.task("watch", ["default"], function ()
{
    browserSync.init({
        server: {
            baseDir: ["./tmp", "./node_modules"],
            index: "index.html"
        },
        logLevel: "info",
        logConnections: false,
        logFileChanges: false,
        notify: false,
        port: 9000,
        scrollProportionally: false,
        browser: 'google chrome',
        ui: { port: 9001 }
    });

    gulp.watch(["src/scripts/**/*.ts"], ["ts"]);
    gulp.watch(["src/views/**/*.html"], ["html"]);
    gulp.watch(["src/img/**/*"], ["img"]);
    gulp.watch(["src/sass/**/*.scss"], ["sass"]);
    gulp.watch(["src/others/**/*"], ["others"]);
    //gulp.watch("tmp/**/**").on('change', browserSync.reload); 
});