const supabase = require('../config/supabaseClient');

const getRole = async (req,res) => {
    const role = await supabase.from('role').select();
    res.send(role.data);
}  

const postRole = async (req,res) => {
    const { id, rolename } = req.body;
    const newRole = {
        id: id,
        rolename: rolename
    }
    const result = await supabase.from('role').insert(newRole);
    res.send(result);
}

module.exports = { getRole, postRole };