const cron = require('node-cron')
const got = require('got')
const AV = require('leancloud-storage')
const flatten = require('flat')

const sleep = (second) =>
    new Promise((resolve) => setTimeout(resolve, second * 1000))

AV.init({
    appId: 'YFVy0m3NHd2Ovv2ffwDOg2JX-gzGzoHsz',
    appKey: 'WzWbVb8nS5dbWqA3jVtSDJmN',
    serverURL: 'https://yfvy0m3n.lc-cn-n1-shared.com',
})

const saveProject = async (id) => {
    console.log(`${id}`)
    try {
        let { symbol, name, market_cap_rank, community_data, developer_data } =
            await got(
                `https://api.coingecko.com/api/v3/coins/${id}?tickers=false&market_data=false&sparkline=false`
            ).json()

        // Flatten the object
        community_data = flatten(community_data, {
            delimiter: '_',
            safe: true,
        })
        developer_data = flatten(developer_data, {
            delimiter: '_',
            safe: true,
        })

        // Construct a new data object
        const dataObject = new AV.Object('Data')
        dataObject.set('project_id', id)
        dataObject.set('symbol', symbol.toUpperCase())
        dataObject.set('name', name)
        dataObject.set('market_cap_rank', market_cap_rank)

        // Set community data
        dataObject.set(community_data)

        // Set developer data
        dataObject.set(developer_data)

        // Save data object
        return await dataObject.save()
    } catch (error) {
        console.error(error)
    }
}

const startCrawling = async () => {
    console.log('BEGIN')

    try {
        // Query project id
        const query = new AV.Query('Project')
        const projects = await query.find()

        for (const p of projects) {
            const { id } = p.toJSON()

            // Save a new project
            await saveProject(id)

            // Sleep for 1 second
            await sleep(1)
        }
    } catch (error) {
        console.error(error)
    }

    console.log('END')
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
