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

const getOrgCodeFrequency = async (organization) => {
    try {
        const repos = await getOrgRepos(organization)
        for (const repo of repos) {
            const codeFrequency = await getRepoCodeFrequency(
                `https://github.com/${repo}`
            )

            // merge all repo frequency together

            await sleep(1)
        }
    } catch (error) {
        return Promise.reject(error)
    }
}

const getOrgRepos = async (organization) => {
    try {
        let result = await got(
            `https://api.github.com/orgs/${organization}/repos`
        ).json()
        result = result.map((item) => item.full_name)
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

const getRepoCodeFrequency = async (github_url) => {
    try {
        const { pathname } = new URL(github_url)
        if (pathname.split('/').length !== 3) {
            return Promise.reject(`invalid pathname: ${github_url}`)
        }
        const result = await got(
            `https://api.github.com/repos${pathname}/stats/code_frequency`
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

const getPublicTreasury = async (id = 'bitcoin') => {
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

const saveProject = async ({
    id,
    name,
    symbol,
    market_cap_rank,
    links: { repos_url, twitter_screen_name },
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
            code_additions_deletions_4_weeks: { additions, deletions },
        } = developer_data
        if (additions && deletions) {
            dataObject.set(
                'code_net_additions_per_week',
                Math.round((additions + deletions) / 4)
            )
        }

        const result = await dataObject.save()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

const saveDevData = async ({ id, name, symbol, code_frequency }) => {
    try {
        const dataObject = new AV.Object('Development')
        dataObject.set('project_id', id)
        dataObject.set('name', name)
        dataObject.set('symbol', symbol.toUpperCase())
        dataObject.set('code_frequency', code_frequency)

        const result = await dataObject.save()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

const saveTrendingData = async ({ id, name, symbol, market_cap_rank }) => {
    try {
        const dataObject = new AV.Object('Trending')
        dataObject.set('project_id', id)
        dataObject.set('name', name)
        dataObject.set('symbol', symbol.toUpperCase())
        dataObject.set('market_cap_rank', market_cap_rank)

        const result = await dataObject.save()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

const savePublicTreasuryData = async ({ id, data }) => {
    try {
        const dataObject = new AV.Object('Public_Treasury')
        dataObject.set('project_id', id)
        dataObject.set(data)

        const result = await dataObject.save()
        return Promise.resolve(result)
    } catch (error) {
        return Promise.reject(error)
    }
}

module.exports = {
    getTopProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    getTrendingToday,
    getPublicTreasury,
    saveProject,
    saveDevData,
    saveTrendingData,
    savePublicTreasuryData,
}
