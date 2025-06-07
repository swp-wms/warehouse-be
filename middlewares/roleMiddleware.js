const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const roleid = req.roleid;
        if (!roleid) {            
            console.log("huhu");
            
            return res.sendStatus(401);
        }
        const rolesArray = [...allowedRoles];
        
        const result = rolesArray.includes(req.roleid);
        if(!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyRoles;