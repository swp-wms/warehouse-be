const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
console.log("Connect DB sucessful!");

module.exports = { sql };