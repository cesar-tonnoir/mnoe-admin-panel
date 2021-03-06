const gulp = require('gulp');
const filter = require('gulp-filter');
const useref = require('gulp-useref');
const lazypipe = require('lazypipe');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');
const uglifySaveLicense = require('uglify-save-license');
const inject = require('gulp-inject');
const ngAnnotate = require('gulp-ng-annotate');
const replace = require('gulp-replace');
const header = require('gulp-header');

const conf = require('../conf/gulp.conf');
const path = require('path');

gulp.task('build', build);

var pkg = require('../bower.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @git <%= pkg.repository.url %>',
  ' */',
  ''].join('\n');

function build() {
  const partialsInjectFile = gulp.src(conf.path.tmp('templateCacheHtml.js'), {read: false});
  const partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: conf.paths.tmp,
    addRootSlash: false
  };

  const htmlFilter = filter(conf.path.tmp('*.html'), {restore: true});
  const jsFilter = filter(conf.path.tmp('**/*.js'), {restore: true});
  const cssFilter = filter(conf.path.tmp('**/*.css'), {restore: true});

  impac()

  return gulp.src(conf.path.tmp('/index.html'))
    .pipe(inject(partialsInjectFile, partialsInjectOptions))
    .pipe(useref({}, lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
    .pipe(jsFilter)
    .pipe(header(banner, { pkg: pkg } ))
    .pipe(ngAnnotate())
    .pipe(uglify({preserveComments: uglifySaveLicense})).on('error', conf.errorHandler('Uglify'))
    .pipe(rev())
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(replace('../../bower_components/bootstrap/fonts/', '../fonts/'))
    .pipe(replace('../../bower_components/font-awesome/fonts', '../fonts'))
    .pipe(cssnano())
    .pipe(rev())
    .pipe(cssFilter.restore)
    .pipe(revReplace())
    .pipe(sourcemaps.write('maps'))
    .pipe(htmlFilter)
    .pipe(htmlmin())
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(conf.path.dist()));
}

gulp.task('impac', impac);

function impac() {
  return gulp.src('bower_components/impac-angular/dist/locales/*')
    .pipe(gulp.dest(path.join(conf.path.dist(), '/locales/impac/')));
}
