const User = require('../models/userModel')
const AppError = require('../utils/AppError')

const createProfile = async ({uid, email, firstName, lastName}) => {

    if (!uid || !email) {
        throw new AppError('Authenticated user information is missing', 400)
    }

    const existingUser = await User.findOne({firebaseUid: uid})

    if (existingUser) {
        return existingUser
    }

    const user = await User.create({
        firebaseUid: uid,
        email,
        firstName,
        lastName
    })

    return user
}

module.exports = {
    createProfile
}