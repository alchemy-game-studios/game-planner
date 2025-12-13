import {task, series} from "gulp"
import shell from "gulp-shell"

task('lint', shell.task(['npx eslint ./src']))
task('test', shell.task(['npm run test']))
task('build', shell.task([
    'npm run build',
    'cp -r ./src/server/* ./build'
]))
task('server-start', shell.task(['NODE_DEBUG=http node -r graphql-import-node/register ./build/app.js']))
task('client-developement', shell.task(["webpack serve --mode development"]))

task('start', shell.task(['concurrently \"gulp server-start\" \"gulp client-developement\"']))

export default series('lint','test','build', 'start')
