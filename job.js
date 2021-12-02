const {
    getTopProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    getTrendingToday,
    getPublicTreasury,
    createProjectObject,
    createTrendingDataObject,
    createPublicTreasuryDataObject,
    saveAllObjects,
} = require('./task')
const { sleep } = require('./util')

const collectProject = async () => {
    try {
        console.log('start getting top projects...')
        const ids = await getTopProjectIDs()
        let projectObjects = []
        for (const id of ids) {
            try {
                console.log(`${id}...`)
                const detail = await getProjectDetail(id)
                const {
                    links: { repos_url },
                } = detail
                if (repos_url && repos_url.length > 0) {
                    const code_frequency = await getRepoCodeFrequency(
                        repos_url.github[0]
                    )
                    projectObjects.push(
                        createProjectObject({ ...detail, code_frequency })
                    )
                } else {
                    projectObjects.push(createProjectObject(detail))
                }

                await sleep(1)
            } catch (error) {
                console.error(error)
            }
        }
        await saveAllObjects(projectObjects)
        console.log('all project saved.')
    } catch (error) {
        console.error(error)
    }
}

const collectTrending = async () => {
    try {
        console.log('getting trending today...')
        const items = await getTrendingToday()
        await saveAllObjects(
            items.map((item) => createTrendingDataObject(item))
        )
        console.log('all today trendings saved.')
    } catch (error) {
        console.error(error)
    }
}

const collectPublicTreasury = async () => {
    try {
        console.log('getting public treasury...')
        await createPublicTreasuryDataObject({
            id: 'bitcoin',
            data: await getPublicTreasury('bitcoin'),
        }).save()
        await createPublicTreasuryDataObject({
            id: 'ethereum',
            data: await getPublicTreasury('ethereum'),
        }).save()
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
