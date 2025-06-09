const supabase = require('../config/supabaseClient');

const getAllUser = async (req, res) => {
    try {
        const users = (await supabase.from('user').select('username, roleid, email, role(rolename)')).data;

        return res.send(users);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

const getUser = async (req, res) => {
    const username = req.username;

    try {
        const user = (await supabase.from('user').select('*, role(rolename)').eq('username', username)).data[0];
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        return res.send(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

const getUserForAdmin = async (req, res) => {
    const username = req.params.username;

    try {
        const user = (await supabase.from('user').select('username, roleid, email, role(rolename)').eq('username', username)).data[0];
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        return res.send(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

module.exports = { getAllUser, getUser, getUserForAdmin }