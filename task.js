const got = require('got')
const { sleep } = require('./util')

const getAllProjectIDs = async () => {
    try {
        const list = await got('https://api.coingecko.com/api/v3/coins/list')
            .json()
            .map((item) => item.id)
        return Promise.resolve(list)
    } catch (error) {
        return Promise.reject(error)
    }
}

const getTopProjectIDs = async ({ per_page = 250, max_page = 4 } = {}) => {
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

const getTopOrgRepo = async (organization) => {
    try {
        let result = await got(
            `https://api.github.com/orgs/${organization}/repos`
        ).json()
        result = result.sort((a, b) => a.stargazers_count > b.stargazers_count)
        return Promise.resolve(result[0].full_name)
    } catch (error) {
        return Promise.reject(error)
    }
}

const getRepoCodeFrequency = async (github_url) => {
    try {
        let { pathname } = new URL(github_url)
        const paths = pathname.split('/')
        if (paths.length === 2) {
            return
            pathname = `/${await getTopOrgRepo(paths[1])}`
            await sleep(1)
        }
        const result = await got(
            `https://api.github.com/repos${pathname}/stats/code_frequency`,
            {
                headers: {
                    Authorization:
                        'token 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',
                },
            }
        ).json()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

const getTrendingToday = async () => {
    try {
        let { coins } = await got(
            'https://api.coingecko.com/api/v3/search/trending'
        ).json()
        coins = coins.map((coin) => coin.item)
        return Promise.resolve(coins)
    } catch (error) {
        return Promise.reject(error)
    }
}

const getPublicTreasury = async (id) => {
    try {
        const result = await got(
            `https://api.coingecko.com/api/v3/companies/public_treasury/${id}`
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

const saveAllObjects = async (objects) => {
    try {
        return Promise.resolve(await AV.Object.saveAll(objects))
    } catch {
        return Promise.reject(error)
    }
}

const dayjs = require('dayjs')

const createProjectObject = ({
    id,
    name,
    symbol,
    market_cap_rank,
    links: { repos_url, twitter_screen_name },
    community_data,
    developer_data,
    code_frequency,
}) => {
    // Flatten the object
    community_data = flatten(community_data, {
        delimiter: '_',
        safe: true,
    })
    developer_data = flatten(developer_data, {
        delimiter: '_',
        safe: true,
    })

    const dataObject = new AV.Object('Data')
    dataObject.set('project_id', id)
    dataObject.set('name', name)
    dataObject.set('symbol', symbol.toUpperCase())
    dataObject.set('market_cap_rank', market_cap_rank)
    dataObject.set(community_data)
    dataObject.set(developer_data)
    dataObject.set('github_url', repos_url.github)
    dataObject.set('twitter_screen_name', twitter_screen_name)

    // code net additions per week
    const {
        code_additions_deletions_4_weeks_additions: additions,
        code_additions_deletions_4_weeks_deletions: deletions,
    } = developer_data
    dataObject.set(
        'code_net_additions_per_week',
        Math.round((additions + deletions) / 4)
    )

    if (code_frequency) {
        const reducer = (acc, [_, additions, deletions]) =>
            acc + (additions + deletions)

        // code frequencies three months
        const code_frequency_three_months = code_frequency.filter(
            ([timestamp]) =>
                dayjs.unix(timestamp).isAfter(dayjs().subtract(3, 'month'))
        )
        dataObject.set(
            'code_net_additions_per_week_three_months',
            Math.round(
                code_frequency_three_months.reduce(reducer, 0) /
                    code_frequency_three_months.length
            )
        )

        // code frequencies six months
        const code_frequency_six_months = code_frequency.filter(([timestamp]) =>
            dayjs.unix(timestamp).isAfter(dayjs().subtract(6, 'month'))
        )
        dataObject.set(
            'code_net_additions_per_week_six_months',
            Math.round(
                code_frequency_six_months.reduce(reducer, 0) /
                    code_frequency_six_months.length
            )
        )

        // code frequencies one year
        const code_frequency_one_year = code_frequency.filter(([timestamp]) =>
            dayjs.unix(timestamp).isAfter(dayjs().subtract(1, 'year'))
        )
        dataObject.set(
            'code_net_additions_per_week_one_year',
            Math.round(
                code_frequency_one_year.reduce(reducer, 0) /
                    code_frequency_one_year.length
            )
        )

        // code frequencies all
        dataObject.set(
            'code_net_additions_per_week_all',
            Math.round(
                code_frequency.reduce(reducer, 0) / code_frequency.length
            )
        )
    }

    return dataObject
}

const createDevDataObject = ({ id, name, symbol, code_frequency }) => {
    const dataObject = new AV.Object('Development')
    dataObject.set('project_id', id)
    dataObject.set('name', name)
    dataObject.set('symbol', symbol.toUpperCase())
    dataObject.set('code_frequency', code_frequency)

    return dataObject
}

const createTrendingDataObject = ({ id, name, symbol, market_cap_rank }) => {
    const dataObject = new AV.Object('Trending')
    dataObject.set('project_id', id)
    dataObject.set('name', name)
    dataObject.set('symbol', symbol.toUpperCase())
    dataObject.set('market_cap_rank', market_cap_rank)

    return dataObject
}

const createPublicTreasuryDataObject = async ({ id, data }) => {
    const dataObject = new AV.Object('Public_Treasury')
    dataObject.set('project_id', id)
    dataObject.set(data)

    return dataObject
}

module.exports = {
    getTopProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    getTrendingToday,
    getPublicTreasury,
    createProjectObject,
    createDevDataObject,
    createTrendingDataObject,
    createPublicTreasuryDataObject,
    saveAllObjects,
}
