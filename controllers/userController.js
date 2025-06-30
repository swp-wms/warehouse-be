const supabase = require('../config/supabaseClient');

const getAllUser = async (req, res) => {
    try {
        const users = (await supabase.from('user').select('username, roleid, fullname, role(rolename)')).data;

        return res.send(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const getUser = async (req, res) => {
    const id = req.id;

    try {
        const user = (await supabase.from('user').select('*, role(rolename)').eq('id', id)).data[0];
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        return res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const getUserForAdmin = async (req, res) => {
    const id = req.params.id;

    try {
        const user = (await supabase.from('user').select('username, roleid, role(rolename)').eq('id', id)).data[0];
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        return res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const updateUser = async (req, res) => {
    const id = req.params.id;
    if (req.id !== id && req.roleid !== 1) {
        return res.sendStaus(401);
    }
    try {
        const user = (await supabase.from('user').select('').eq('id', id)).data[0];
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        if (req.roleid === 1 && id !== req.id) {
            const { error } = await supabase.from('user').update({ 'roleid': req.body.roleid, 'status': req.body.status, 'username': username }).eq('id', id);
            if (error) {
                return res.status(400).json({ message: error.message });
            }
        }

        // const { username, fullname, image, phonenumber, address, dateofbirth, gender } = req.body;
        // const { error } = await supabase.from('user').update({ username, fullname, image, phonenumber, address, dateofbirth, gender }).eq('id', id);
        const { username, fullname, image, phonenumber, address, dateofbirth, gender, status } = req.body;
        const { error } = await supabase.from('user').update({ username, fullname, image, phonenumber, address, dateofbirth, gender, status }).eq('id', id);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(200).json({ message: `Cập nhật thông tin người dùng thành công!` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const getAllUserForAdmin = async (req, res) => {
    try {
        const users = (await supabase.from('user').select('id, username, fullname, role(rolename), status')).data;

        return res.send(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const createNewUser = async (req, res) => {
    try {
        const newUser = req.body;
        console.log(newUser);
        
        const user = await supabase.from('user').insert(newUser).select('*');
        console.log(user);
        
        res.status(200).json(user.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllUser, getUser, getUserForAdmin, updateUser, getAllUserForAdmin, createNewUser };