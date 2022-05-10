const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { argv } = yargs(hideBin(process.argv))

const { collectProject, collectTrending } = require('./job')

if (argv.collectProject) {
    console.log('test get projects...')
    collectProject()
}

if (argv.collectTrending) {
    console.log('test get trending...')
    collectTrending()
}
