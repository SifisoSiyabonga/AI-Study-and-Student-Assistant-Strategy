const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);


// ==========================================
// DATABASE CONNECTION
// ==========================================

mongoose.connect(process.env.MONGO_URI)

    .then(() =>
        console.log('MongoDB Connected Successfully')
    )

    .catch(err =>
        console.error(
            'MongoDB Connection Error:',
            err
        )
    );


// ==========================================
// ROUTES
// ==========================================

app.use(
    '/api/auth',
    require('./routes/auth')
);

app.use(
    '/api/ai',
    require('./routes/ai')
);

app.use(
    '/api/documents',
    require('./routes/documents')
);


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    () =>
        console.log(
            `Server running on http://localhost:${PORT}`
        )
);