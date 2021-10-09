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
            let { community_data, developer_data } = await queryProject(id)

            // Flatten the object
            community_data = flatten(community_data, { delimiter: '_' })
            developer_data = flatten(developer_data, { delimiter: '_' })

            // Construct a new data object
            const dataObject = new AV.Object('Data')
            dataObject.set('project_id', id)

            // Set community data
            for (const key in community_data) {
                dataObject.set(key, community_data[key])
            }

            // Set developer data
            for (const key in developer_data) {
                dataObject.set(key, developer_data[key])
            }

            // Save data object
            await dataObject.save()

            await sleep(1)
        }
    } catch (error) {
        console.error(error)
    }

    console.log('END')
}

cron.schedule('* 0 * * *', () => {
    console.log('running at 12 a.m every day.')
    startCrawling()
})
