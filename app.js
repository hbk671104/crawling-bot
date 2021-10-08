const cron = require('node-cron')
const got = require('got')

// const { data } = (async () =>
//     await got(
//         'https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&market_data=false&sparkline=false'
//     ).json())()

// console.log(data)

cron.schedule('* 0 * * *', () => {
    console.log('running at 12 a.m every day.')
})
