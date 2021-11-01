const cron = require('node-cron')
const { getProjectIDs, getProjectDetail, saveProject } = require('./task')

const startCrawling = async () => {
    console.log('Crawling Begins...')

    try {
        const ids = await getProjectIDs()
        for (const id of ids) {
            const detail = await getProjectDetail(id)
            await saveProject(detail)
            await sleep(1)
        }
    } catch (error) {
        console.error(error)
    }

    console.log('Crawling Completes.')
}

cron.schedule(
    '0 8 * * *',
    () => {
        startCrawling()
    },
    {
        timezone: 'Asia/Shanghai',
    }
)

console.log('Crawler is running...')

module.exports = { startCrawling, saveProject }
