const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        trim: true
    },

    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema)