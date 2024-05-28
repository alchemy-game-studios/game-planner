const {task, series} = require('gulp')
const shell = require('gulp-shell')

task('lint', shell.task(['eslint *.js']))
task('test', shell.task(['npm test']))
task('server-start', shell.task(['node index.js']))

exports.default = series('lint', 'test', 'server-start')
