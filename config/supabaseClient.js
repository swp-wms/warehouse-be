const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Đảm bảo có dòng này để nạp biến môi trường


const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
console.log("Connect Supabase successfull!");


module.exports = supabase;