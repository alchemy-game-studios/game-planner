import {task, series} from "gulp"
import shell from "gulp-shell"

task('lint', shell.task(['npx eslint ./src']))
task('test', shell.task(['npm run test']))
task('build', shell.task([
    'npm run build',
    'cp -r ./src/server/* ./build'
]))
task('server-start', shell.task(['node -r graphql-import-node/register ./build/app.js']))
task('client-developement', shell.task(["webpack serve --mode development"]))

task('start', shell.task(['concurrently \"gulp server-start\" \"gulp client-developement\"']))

const neo4jDocker = () => {
    const command = "docker run -d --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/password \
    -v neo4j_data:/data \
    -e NEO4JLABS_PLUGINS='[\"apoc\"]' \
    -e NEO4J_apoc_export_file_enabled=true \
    -e NEO4J_apoc_import_file_enabled=true \
    -e NEO4J_apoc_import_file_use__neo4j__config=true \
    neo4j:latest"

    task('neo', shell.task([command]))

    const cliCommand = "docker exec -it neo4j cypher-shell -u neo4j -p password"
    task('neo-cli', shell.task([cliCommand]))
}
neo4jDocker()

export default series('lint','test','build', 'start')
