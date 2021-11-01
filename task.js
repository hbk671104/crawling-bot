const got = require('got')
const { sleep } = require('./util')

const getProjectIDs = async ({ per_page = 250, max_page = 4 } = {}) => {
    try {
        let list = []
        for (let i = 0; i < max_page; i++) {
            let tempList = await got(
                'https://api.coingecko.com/api/v3/coins/markets',
                {
                    searchParams: {
                        vs_currency: 'usd',
                        order: 'market_cap_desc',
                        per_page,
                        page: i + 1,
                    },
                }
            ).json()

            tempList = tempList.map((item) => item.id)
            list = list.concat(tempList)

            await sleep(1)
        }
        return Promise.resolve(list)
    } catch (error) {
        return Promise.reject(error)
    }
}

const getProjectDetail = async (id) => {
    try {
        const result = await got(
            `https://api.coingecko.com/api/v3/coins/${id}`,
            {
                searchParams: {
                    tickers: false,
                    localization: false,
                    market_data: false,
                    community_data: true,
                    developer_data: true,
                },
            }
        ).json()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

const AV = require('leancloud-storage')
const flatten = require('flat')

AV.init({
    appId: 'YFVy0m3NHd2Ovv2ffwDOg2JX-gzGzoHsz',
    appKey: 'WzWbVb8nS5dbWqA3jVtSDJmN',
    serverURL: 'https://yfvy0m3n.lc-cn-n1-shared.com',
})

const saveProject = async ({
    id,
    symbol,
    name,
    market_cap_rank,
    links,
    community_data,
    developer_data,
}) => {
    try {
        // Flatten the object
        community_data = flatten(community_data, {
            delimiter: '_',
            safe: true,
        })
        developer_data = flatten(developer_data, {
            delimiter: '_',
            safe: true,
        })
        repos_url = flatten(links.repos_url, {
            delimiter: '_',
            safe: true,
        })

        const dataObject = new AV.Object('Data')
        dataObject.set('project_id', id)
        dataObject.set('symbol', symbol.toUpperCase())
        dataObject.set('name', name)
        dataObject.set('market_cap_rank', market_cap_rank)
        dataObject.set(community_data)
        dataObject.set(developer_data)
        dataObject.set(repos_url)

        const result = await dataObject.save()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

module.exports = {
    getProjectIDs,
    getProjectDetail,
    saveProject,
}