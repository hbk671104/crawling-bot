const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { argv } = yargs(hideBin(process.argv))

const { getProjectIDs, getProjectDetail, saveProject } = require('./task')

if (argv.startAll) {
    console.log('test crawl all...')
    startCrawling()
}

if (argv.id) {
    console.log(`test get project detail: ${argv.id}...`)
    ;(async () => {
        try {
            const result = await getProjectDetail(argv.id)
            console.log(result)
            if (argv.save) {
                await saveProject(result)
                console.log(`${argv.id} object saved.`)
            }
        } catch (error) {
            console.error(error)
        }
    })()
}

if (argv.getIDs) {
    console.log('test get project ids...')
    ;(async () => {
        try {
            const ids = await getProjectIDs()
            console.log(ids.length)
        } catch (error) {
            console.error(error)
        }
    })()
}
