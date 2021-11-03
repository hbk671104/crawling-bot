const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { argv } = yargs(hideBin(process.argv))

const {
    getTopProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    saveProject,
    saveDevData,
} = require('./task')
const {
    collectProject,
    collectTrending,
    collectPublicTreasury,
} = require('./job')

if (argv.collectProject) {
    console.log('test get projects...')
    collectProject()
}

if (argv.collectTrending) {
    console.log('test get trending...')
    collectTrending()
}

if (argv.collectPublicTreasury) {
    console.log('test get public treasury...')
    collectPublicTreasury()
}

if (argv.id) {
    console.log(`${argv.id}: `)
    if (argv.code_frequency) {
        console.log(`test code_frequency...`)
        ;(async () => {
            try {
                const detail = await getProjectDetail(argv.id)
                // request and save github repo code frequency
                const {
                    id,
                    symbol,
                    links: {
                        repos_url: { github },
                    },
                } = detail
                if (github && github.length > 0) {
                    const [main_github_repo_url] = github
                    const codeFrequency = await getRepoCodeFrequency(
                        main_github_repo_url
                    )
                    if (argv.save) {
                        await saveDevData({ id, symbol, codeFrequency })
                        console.log(`saved.`)
                    }
                } else {
                    console.log('no github repo')
                }
            } catch (error) {
                console.error(error)
            }
        })()
    } else {
        console.log(`test get project detail...`)
        ;(async () => {
            try {
                const result = await getProjectDetail(argv.id)
                console.log(result)
                if (argv.save) {
                    await saveProject(result)
                    console.log(`saved.`)
                }
            } catch (error) {
                console.error(error)
            }
        })()
    }
}

if (argv.getIDs) {
    console.log('test get project ids...')
    ;(async () => {
        try {
            const ids = await getTopProjectIDs()
            console.log(ids.length)
        } catch (error) {
            console.error(error)
        }
    })()
}
