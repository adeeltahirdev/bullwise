const watchlistService = require('../services/watchlistService')

const getWatchlist = async (req, res, next) => {
    try {
        const symbols = await watchlistService.getWatchlist(
            req.user.uid
        )

        res.status(200).json({
            success: true,
            data: { symbols }
        })
    } catch (error) {
        next(error)
    }
}

const addToWatchlist = async (req, res, next) => {
    try {
        const symbols = await watchlistService.addToWatchlist(
            req.user.uid,
            req.body.symbol
        )

        res.status(200).json({
            success: true,
            message: 'Stock added to watchlist',
            data: { symbols }
        })
    } catch (error) {
        next(error)
    }
}

const removeFromWatchlist = async (req, res, next) => {
    try {
        const symbols = await watchlistService.removeFromWatchlist(
            req.user.uid,
            req.params.symbol
        )

        res.status(200).json({
            success: true,
            message: 'Stock removed from watchlist',
            data: { symbols }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
}
