const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({

    // ==========================================
    // USER NAME
    // ==========================================

    name: {

        type: String,

        required: true,

        trim: true

    },


    // ==========================================
    // EMAIL
    // ==========================================

    email: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true

    },


    // ==========================================
    // PASSWORD
    // ==========================================

    password: {

        type: String,

        required: true

    },


    // ==========================================
    // TERMS & CONDITIONS
    // ==========================================

    termsAccepted: {

        type: Boolean,

        required: true,

        default: false

    },


    // ==========================================
    // ACCOUNT CREATION DATE
    // ==========================================

    createdAt: {

        type: Date,

        default: Date.now,

        expires: '160d'

    }

});


module.exports =
    mongoose.model(
        'User',
        userSchema
    );