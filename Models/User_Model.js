const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    displayName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    photoURL: { type: String },
    authType: { type: String },
    role: { type: String }
})

module.exports = mongoose.model('users', UserSchema)