const http = require('http');
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
const { initSocket } = require('./socket/socket.js');

const PORT = 3800;
app.use(cors(corOptions));

const server = http.createServer(app);
initSocket(server);

app.use(credentials);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))


app.get('/', (req, res) => {
    res.send("Hello World!");
})
//no verify jwt
app.use('/login', require('./routers/login'));
app.use('/logout', require('./routers/logout'));
app.use('/reset-password', require('./routers/resetPassword'));

// verify jwt
app.use(verifyJwt);
//get orders 
app.use('/detail', require('./routers/api/orderDetail'));
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

// get partner
app.use('/partners', require('./routers/api/partner'));

// get product
app.use('/products', require('./routers/api/product'));

// get total weight of warehouse
app.use('/warehouse', require('./routers/api/warehouse'));

// get notificaiton
app.use('/notification', require('./routers/api/notification.js'));

// get product catalog
app.use('/product-catalog', require('./routers/api/productCatalog'));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});