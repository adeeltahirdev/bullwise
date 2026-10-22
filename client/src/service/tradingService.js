import apiFetch from "./api";

const tradingService = {
    async getAccount() {
        const result = await apiFetch('/trading/account')
        return result.data
    }
}

export default tradingService