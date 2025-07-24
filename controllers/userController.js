const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');

const getAllUser = async (req, res) => {
    try {
        const users = (await supabase.from('user').select('username, roleid, fullname, role(rolename),id')).data;

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
    const id = req.params.id

    if (req.id !== id && req.roleid !== 1) {
        return res.status(401).json({ message: "Không có quyền cập nhật thông tin người dùng này." })
    }

    try {
        const { data: user, error: selectError } = await supabase.from("user").select("*").eq("id", id)
        if (selectError) {
            console.log("Supabase error:", selectError)
            return res.status(400).json({ message: selectError.message })
        }
        if (!user || user.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại." })
        }

        const { username, fullname, image, phonenumber, address, dateofbirth, gender, status, roleid, password } = req.body

        if (req.roleid === 1 && id !== req.id) {
            // Admin cập nhật cho user khác
            const updateData = {}

            if (username !== undefined) updateData.username = username
            if (fullname !== undefined) updateData.fullname = fullname
            if (image !== undefined) updateData.image = image
            if (phonenumber !== undefined) updateData.phonenumber = phonenumber
            if (address !== undefined) updateData.address = address
            if (dateofbirth !== undefined) updateData.dateofbirth = dateofbirth
            if (gender !== undefined) updateData.gender = gender
            if (status !== undefined) updateData.status = status
            if (roleid !== undefined) updateData.roleid = roleid

            if (password !== undefined && password !== "") {
                const saltRounds = 10
                const hashedPassword = await bcrypt.hash(password, saltRounds)
                updateData.password = hashedPassword
            }

            const { error: updateError } = await supabase.from("user").update(updateData).eq("id", id)
            if (updateError) {
                console.log("Supabase error:", updateError)
                return res.status(400).json({ message: updateError.message })
            }
        } else {

            // User cập nhật thông tin của chính mình
            const updateData = {}

            if (username !== undefined) updateData.username = username
            if (fullname !== undefined) updateData.fullname = fullname
            if (image !== undefined) updateData.image = image
            if (phonenumber !== undefined) updateData.phonenumber = phonenumber
            if (address !== undefined) updateData.address = address
            if (dateofbirth !== undefined) updateData.dateofbirth = dateofbirth
            if (gender !== undefined) updateData.gender = gender
            if (status !== undefined) updateData.status = status

            if (password !== undefined && password !== "") {
                const saltRounds = 10
                const hashedPassword = await bcrypt.hash(password, saltRounds)
                updateData.password = hashedPassword
            }

            const { error: updateError } = await supabase.from("user").update(updateData).eq("id", id)
            if (updateError) {
                console.log("Supabase error:", updateError)
                return res.status(400).json({ message: updateError.message })
            }
        }

        return res.status(200).json({ message: "Cập nhật thông tin người dùng thành công!" })
    } catch (error) {
        console.log("Server error:", error)
        res.status(500).json({ message: "Hệ thống xảy ra lỗi. Vui lòng thử lại sau!" })
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