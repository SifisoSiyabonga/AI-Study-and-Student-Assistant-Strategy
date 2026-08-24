const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/User');


// ==========================================
// REGISTER ROUTE
// ==========================================

router.post('/register', async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            termsAccepted
        } = req.body;


        // ==========================================
        // VALIDATE FIELDS
        // ==========================================

        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    'Please fill in all fields.'

            });

        }


        // ==========================================
        // CHECK TERMS
        // ==========================================

        if (termsAccepted !== true) {

            return res.status(400).json({

                success: false,

                message:
                    'You must accept the Terms and Conditions before creating an account.'

            });

        }


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const existingUser =
            await User.findOne({

                email:
                    email.trim().toLowerCase()

            });


        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    'An account with this email already exists.'

            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==========================================
        // CREATE USER
        // ==========================================

        const user = new User({

            name:
                name.trim(),

            email:
                email.trim().toLowerCase(),

            password:
                hashedPassword,

            termsAccepted:
                true

        });


        await user.save();


        // ==========================================
        // SUCCESS
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                'Account created successfully!'

        });


    } catch (error) {

        console.error(
            'Registration Error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Server error during registration.'

        });

    }

});


// ==========================================
// LOGIN ROUTE
// ==========================================

router.post('/login', async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findOne({

                email:
                    email.trim().toLowerCase()

            });


        if (!user) {

            return res.status(400).json({

                success: false,

                error:
                    'Invalid email or password.'

            });

        }


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({

                success: false,

                error:
                    'Invalid email or password.'

            });

        }


        // ==========================================
        // CREATE JWT
        // ==========================================

        const token =
            jwt.sign(

                {
                    id: user._id,

                    name: user.name,

                    email: user.email

                },

                process.env.JWT_SECRET ||
                'fallback_secret',

                {
                    expiresIn: '1h'
                }

            );


        // ==========================================
        // SEND USER DATA
        // ==========================================

        res.json({

            success: true,

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            'Login Error:',
            error
        );


        res.status(500).json({

            success: false,

            error:
                'Server error'

        });

    }

});


module.exports = router;