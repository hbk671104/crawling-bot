const cron = require('node-cron')
const {
    collectProject,
    collectTrending,
    collectPublicTreasury,
} = require('./job')

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
    collectPublicTreasury()

    console.log('crawling completes.')
}
