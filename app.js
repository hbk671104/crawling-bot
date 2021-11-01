const cron = require('node-cron')
const {
    getProjectIDs,
    getProjectDetail,
    getProjectCodeFrequency,
    saveProject,
    saveDevData,
} = require('./task')

const startCrawling = async () => {
    console.log('Crawling Begins...')

    try {
        const ids = await getProjectIDs()
        for (const id of ids) {
            try {
                const detail = await getProjectDetail(id)
                await saveProject(detail)

                // request and save github repo code frequency
                // const {
                //     links: {
                //         repos_url: { github },
                //     },
                // } = detail
                // if (github && github.length > 0) {
                //     const [main_github_repo_url] = github
                //     const codeFrequency = await getProjectCodeFrequency(
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

    console.log('Crawling Completes.')
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

module.exports = { startCrawling, saveProject }
