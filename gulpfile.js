var del = require("del");
var gulp = require("gulp");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var prefix = require("gulp-autoprefixer");
var minifyCSS = require("gulp-minify-css");
var notify = require("gulp-notify");

var notifyError = notify.onError(function (error) {
  return "Error: " + error.message;
});

const paths = {
   styles: {
      dir:  "./ringo-webapp/assets/scss/**",
      main: "./ringo-webapp/assets/scss/main.scss",
      dest: "./ringo-webapp/assets/build/"
   },
   clean: "./ringo-webapp/assets/build/*"
};

gulp.task("sass", function (){
   return gulp.src([paths.styles.main])
      .pipe(sass())
      .on("error", notify.onError(notifyError))
      .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
      .pipe(concat("editorslab.css"))
      .pipe(minifyCSS({keepBreaks:true}))
      .pipe(gulp.dest(paths.styles.dest));
});

gulp.task("watch", function() {
   var logger = function(event) {
     console.log("File " + event.path + " was " + event.type);
   };

   var sassWatcher = gulp.watch(paths.styles.dir, ["sass"]);
   sassWatcher.on("change", logger);
});

gulp.task("clean", function() {
   del.sync([paths.clean]);
});

gulp.task("default", ["clean", "sass", "watch"]);