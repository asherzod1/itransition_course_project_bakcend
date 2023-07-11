require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');
const routes = require('./routes');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());
// Configure CORS
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));



app.use('', routes)


app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
