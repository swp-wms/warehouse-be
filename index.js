require("dotenv").config();
const cookieParser = require('cookie-parser');
const verifyJwt = require('./middlewares/authMiddleware');

const express = require('express');
const app = express();
require('./config/supabaseClient');

const PORT = 3800;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send("Hello World!");
})

//no verify jwt
app.use('/login', require('./routers/login'));

// verify jwt
app.use(verifyJwt);
app.use('/register', require('./routers/register'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});