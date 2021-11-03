const {
    getTopProjectIDs,
    getProjectDetail,
    getRepoCodeFrequency,
    getTrendingToday,
    saveProject,
    saveDevData,
    saveTrendingData,
} = require('./task')
const { sleep } = require('./util')

const getProject = async () => {
    try {
        console.log('getting top projects...')
        const ids = await getTopProjectIDs()
        for (const id of ids) {
            try {
                console.log(`${id}...`)
                const detail = await getProjectDetail(id)
                await saveProject(detail)
                console.log(`${id} saved.`)

                // request and save github repo code frequency
                // const {
                //     id,
                //     symbol,
                //     links: {
                //         repos_url: { github },
                //     },
                // } = detail
                // if (github && github.length > 0) {
                //     const [main_github_repo_url] = github
                //     const codeFrequency = await getRepoCodeFrequency(
                //         main_github_repo_url
                //     )
                //     await saveDevData({ id, symbol, codeFrequency })
                // }

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

const getTrending = async () => {
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

module.exports = {
    getProject,
    getTrending,
}
