const cron = require('node-cron')
const { getProject, getTrending } = require('./job')

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

    getProject()
    getTrending()

    console.log('crawling completes.')
}
