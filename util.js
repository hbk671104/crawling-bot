const sleep = (second) =>
    new Promise((resolve) => setTimeout(resolve, second * 1000))

module.exports = {
    sleep,
}
