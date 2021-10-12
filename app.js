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

const queryProject = async (id) => {
    console.log(`${id}`)
    try {
        const data = await got(
            `https://api.coingecko.com/api/v3/coins/${id}?tickers=false&market_data=false&sparkline=false`
        ).json()
        return data
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
            let {
                symbol,
                name,
                market_cap_rank,
                community_data,
                developer_data,
            } = await queryProject(id)

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
            dataObject.set('symbol', symbol)
            dataObject.set('name', name)
            dataObject.set('market_cap_rank', market_cap_rank)

            // Set community data
            dataObject.set(community_data)

            // Set developer data
            dataObject.set(developer_data)

            // Save data object
            await dataObject.save()

            // Sleep for 1 second
            await sleep(1)
        }
    } catch (error) {
        console.error(error)
    }

    console.log('END')
}

cron.schedule('0 0 * * *', () => {
    console.log('running at 12 a.m every day.')
    startCrawling()
})

module.exports = { startCrawling }
