const jwt = require('jsonwebtoken');

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    
    if(!authHeader?.startsWith('Bearer ')) {
        return res.sendStatus(401);
    }
    
    const token = authHeader.split(' ')[1];    
    
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {            
            if(err) {
                return res.status(403).json({message: "Your token has expired or you hasn't logged in!"});
            }

            req.username = decoded.username;
            req.roleid = decoded.roleid;
            next();
        }
    );
}

module.exports = verifyJwt;