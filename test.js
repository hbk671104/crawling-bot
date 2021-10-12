const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { argv } = yargs(hideBin(process.argv))

const { startCrawling, saveProject } = require('./app')

if (argv.all) {
    startCrawling()
}

if (argv.id) {
    saveProject(argv.id)
}
