import {task, series} from "gulp"
import shell from "gulp-shell"

task('lint', shell.task(['npx eslint ./src']))
task('test', shell.task(['npm run test']))
task('build', shell.task([
    'npm run build',
    'cp -r ./src/server/* ./build'
]))
task('server-start', shell.task(['node -r graphql-import-node/register ./build/app.js']))

export default series('lint','test','build', 'server-start')
