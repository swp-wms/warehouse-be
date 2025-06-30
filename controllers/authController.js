const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Tên đăng nhập và mật khẩu là bắt buộc!'
        });
    }

    try {
        const result = await supabase.from('user').select().filter('username', 'eq', username);
        if (result.error) {
            console.log(result.error);
            throw new Error(result.error);
        }

        const match = result.data[0];
        if (!match) {
            return res.status(401).json({
                message: "Người dùng không tồn tại!"
            });
        }

        const checkPass = await bcrypt.compare(password, match.password);
        if (!checkPass) {
            return res.status(401).json({
                message: 'Mật khẩu không chính xác!'
            });
        }

        const refreshToken = jwt.sign(
            {
                id: match.id,
                username: match.username,
                roleid: match.roleid
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '1d'
            }
        );

        const accessToken = jwt.sign(
            {
                id: match.id,
                username: match.username,
                roleid: match.roleid
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '2h'
            }
        );

        res.cookie('jwt', refreshToken, { maxAge: 24 * 60 * 1000, httpOnly: true, sameSite: 'None' });

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            accessToken,
            roleid: match.roleid
        });
    } catch (error) {
        console.log(error);

        res.sendStatus(500);
    }
}

const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({
            message: 'Có lỗi xảy ra. Vui lòng thử lại!'
        });
    }

    if (!password) {
        return res.status(400).json({
            message: 'Mật khẩu là bắt buộc!'
        });
    }

    try {
        const result = await supabase.from('user').select().filter('username', 'eq', email);
        if (result.error) {
            console.log(result.error);
            throw new Error(result.error);
        }

        const match = result.data[0];
        if (!match) {
            return res.status(401).json({
                message: "Người dùng không tồn tại!"
            });
        }

        const otp = (await supabase.from('otp').select().filter('email', 'eq', email).single()).data;
        console.log(otp);
        
        if (!otp || !otp.verified || new Date() > otp.expire) {
            return res.status(401).json({
                message: "Bạn chưa xác nhận OTP hoặc OTP đã hết hạn! Vui lòng thử lại!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const resultUpdate = await supabase.from('user').update({ password: hashedPassword }).eq('username', email);
        if (resultUpdate.error) {
            console.log(resultUpdate.error);
            throw new Error(resultUpdate.error);
        }
        await supabase.from('otp').delete().eq('email', email);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);

        res.sendStatus(500);
    }
}

const resetPasswordByAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!password || !username) {
        return res.status(400).json({
            message: 'Tên đăng nhập và mật khẩu là bắt buộc!'
        });
    }

    try {
        const result = await supabase.from('user').select().filter('username', 'eq', username);
        if (result.error) {
            console.log(result.error);
            throw new Error(result.error);
        }

        const match = result.data[0];
        if (!match) {
            return res.status(401).json({
                message: "Người dùng không tồn tại!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const resultUpdate = await supabase.from('user').update({ password: hashedPassword }).eq('username', username);
        if (resultUpdate.error) {
            console.log(resultUpdate.error);
            throw new Error(resultUpdate.error);
        }

        res.status(200).json({ message: `${username} đổi mật khẩu thành công!` });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

const changePassword = async (req, res) => {
    const username = req.username;
    const { oldPassword, newPassword } = req.body;

    if (!username) {
        return res.status(400).json({
            message: 'Có vẻ bạn chưa đăng nhập! Vui lòng đăng nhập lại và thử lại!'
        });
    }

    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            message: 'Mật khẩu cũ và mật khẩu mới là bắt buộc!'
        });
    }

    try {
        const result = await supabase.from('user').select().filter('username', 'eq', username);
        if (result.error) {
            console.log(result.error);
            throw new Error(result.error);
        }

        const match = result.data[0];
        if (!match) {
            return res.status(401).json({
                message: "Người dùng không tồn tại!"
            });
        }

        const checkPass = await bcrypt.compare(oldPassword, match.password);

        if(!checkPass) {
            return res.status(401).json({message: 'Mật khẩu cũ không chính xác!'});
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "Mật khẩu mới và cũ không có sự khác biệt!" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const resultUpdate = await supabase.from('user').update({ password: hashedPassword }).eq('username', username);
        if (resultUpdate.error) {
            console.log(resultUpdate.error);
            throw new Error(resultUpdate.error);
        }

        res.status(200).json({ message: `${username} thay đổi mật khẩu thành công!` });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

const logout = async (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
    res.sendStatus(204);

}

module.exports = { login, logout, resetPassword, resetPasswordByAdmin, changePassword };