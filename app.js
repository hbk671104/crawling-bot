const cron = require('node-cron')
const {
    getProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    saveProject,
    saveDevData,
} = require('./task')
const { sleep } = require('./util')

const startCrawling = async () => {
    console.log('crawling begins...')

    try {
        const ids = await getProjectIDs()
        for (const id of ids) {
            console.log(`${id}...`)
            try {
                const detail = await getProjectDetail(id)
                await saveProject(detail)
                console.log(`${id} saved.`)

                // request and save github repo code frequency
                // const {
                //     links: {
                //         repos_url: { github },
                //     },
                // } = detail
                // if (github && github.length > 0) {
                //     const [main_github_repo_url] = github
                //     const codeFrequency = await getRepoCodeFrequency(
                //         main_github_repo_url
                //     )
                //     const { id, symbol } = detail
                //     await saveDevData({ id, symbol, codeFrequency })
                // }

                await sleep(1)
            } catch (error) {
                console.error(error)
            }
        }
    } catch (error) {
        console.error(error)
    }

    console.log('crawling completes.')
}

cron.schedule(
    '0 2 * * *',
    () => {
        startCrawling()
    },
    {
        timezone: 'Asia/Shanghai',
    }
)

console.log('Crawler is running...')

module.exports = { startCrawling }
