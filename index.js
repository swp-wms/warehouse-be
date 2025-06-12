
const cookieParser = require('cookie-parser');
const cors = require('cors');
const verifyJwt = require('./middlewares/authMiddleware');
const credentials = require('./middlewares/credentials');
const corOptions = require('./config/allowedOrigins');
const partner = require('./controllers/partnerController');
const express = require('express');
const app = express();
require("dotenv").config();
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




// API for partner
app.post('/partners', partner.createPartner); // addNew
app.get('/readOnePartner', partner.getOnePartner); //getOne
app.get('/partners', partner.getAllPartner); //getAll
app.put('/updatePartner', partner.updatePartner); //update



//no verify jwt
app.use('/login', require('./routers/login'));
app.use('/logout', require('./routers/logout'));
app.use('/reset-password', require('./routers/resetPassword'));

// verify jwt
app.use(verifyJwt);
//get orders 
app.use('/detail' ,require('./routers/api/orderDetail'));
app.use('/orders', require('./routers/api/order'));
// app.use('/register', require('./routers/register'));
app.use('/admin', require('./routers/api/admin'));
app.use('/change-password', require('./routers/api/changePassword'));
app.use('/delivery', require('./routers/api/delivery'));
app.use('/users', require('./routers/api/user'));


//get roles
app.use('/role', require('./routers/api/roles'));

//get catalog
app.use('/catalog', require('./routers/api/catalog'));

//get supplements
app.use('/supplement', require('./routers/api/supplement'));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});