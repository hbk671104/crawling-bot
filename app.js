const cron = require('node-cron')
const { collectProject, collectTrending } = require('./job')

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

const startCrawling = () => {
    console.log('crawling begins...')

    collectProject()
    collectTrending()

    console.log('crawling completes.')
}
