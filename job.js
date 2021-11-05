const {
    getTopProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    getTrendingToday,
    getPublicTreasury,
    saveProject,
    saveDevData,
    saveTrendingData,
    savePublicTreasuryData,
} = require('./task')
const { sleep } = require('./util')

const collectProject = async () => {
    try {
        console.log('getting top projects...')
        const ids = await getTopProjectIDs()
        console.log(`${ids.length} projects found.`)
        for (const id of ids) {
            try {
                console.log(`${id}...`)
                const detail = await getProjectDetail(id)
                await saveProject(detail)
                console.log(`${id} saved.`)

                await sleep(1)
            } catch (error) {
                console.error(error)
            }
        }
        console.log('getting top projects done.')
    } catch (error) {
        console.error(error)
    }
}

const collectTrending = async () => {
    try {
        console.log('getting trending today...')
        const items = await getTrendingToday()
        for (const item of items) {
            try {
                console.log(`${item.id}...`)
                await saveTrendingData(item)
                console.log(`${item.id} saved.`)

                await sleep(1)
            } catch (error) {
                console.error(error)
            }
        }
        console.log('getting trending today done.')
    } catch (error) {
        console.error(error)
    }
}

const collectPublicTreasury = async () => {
    try {
        console.log('getting public treasury...')
        const bitcoin = await getPublicTreasury()
        await savePublicTreasuryData({ id: 'bitcoin', data: bitcoin })
        const ethereum = await getPublicTreasury('ethereum')
        await savePublicTreasuryData({ id: 'ethereum', data: ethereum })
        console.log('getting public treasury done.')
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    collectProject,
    collectTrending,
    collectPublicTreasury,
}
