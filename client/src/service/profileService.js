import apiFetch from "./api";

const profileService = {
    async getProfile() {
        const result = await apiFetch('/auth/profile')

        return result.data
    }
}

export default profileService