require("dotenv").config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const verifyJwt = require('./middlewares/authMiddleware');
const credentials = require('./middlewares/credentials');
const corOptions = require('./config/allowedOrigins');

const express = require('express');
const app = express();
require('./config/supabaseClient');

const PORT = 3800;

app.use(credentials);
app.use(cors(corOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send("Hello World!");
})

//no verify jwt
app.use('/login', require('./routers/login'));
app.use('/reset-password', require('./routers/resetPassword'));

// verify jwt
app.use(verifyJwt);
app.use('/register', require('./routers/register'));

//get roles
app.use('/role', require('./routers/api/roles'));

//get catalog
app.use('/catalog', require('./routers/api/catalog'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});