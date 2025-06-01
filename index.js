require("dotenv").config();
const cookieParser = require('cookie-parser');

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

// app.get('/users/:username', require('./controllers/userController').getUser);

app.use('/register', require('./routers/register'));
app.use('/login', require('./routers/login'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});