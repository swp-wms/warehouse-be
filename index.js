require("dotenv").config();

const express = require('express');
const app = express();
const {sql} = require('./config/connectDB');

const PORT = 3800;

app.get('/', async (req, res) => {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.send({
        message: "Hello world",
        dbVersion: version
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});