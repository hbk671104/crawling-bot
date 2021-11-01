const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { argv } = yargs(hideBin(process.argv))

// const { startCrawling, saveProject } = require('./app')
const { getProjectIDs } = require('./task')

// if (argv.saveAll) {
//     startCrawling()
// }

// if (argv.id) {
//     saveProject(argv.id)
// }

if (argv.getIDs) {
    console.log('test get projects...')
    ;(async () => {
        try {
            const list = await getProjectIDs()
            console.log(list.length)
        } catch (error) {
            console.error(error)
        }
    })()
}
