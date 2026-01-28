const nodemailer = require('nodemailer');
const supabase = require('../config/supabaseClient');

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS
    }
});

// Tạo mã OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpByEmail = async (email, res) => {
    const user = (await supabase.from('user').select().filter('username', 'eq', email).single()).data;

    if (!user) {
        return res.status(401).json({ message: 'Email người dùng không tồn tại. Vui lòng liên hệ admin để được hỗ trợ.' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // Hết hạn sau 2 phút

    const dupplicate = await supabase.from("otp").select().filter('email', 'eq', email).data;
    if (dupplicate) {
        await supabase.from('otp').update({ otp, 'expire': expiresAt }).eq('email', email);
    } else {
        await supabase.from('otp').insert({ email, otp, 'expire': expiresAt });
    }

    await transporter.sendMail({
        from: process.env.EMAIL_ADMIN,
        to: email,
        subject: 'Mã OTP của bạn',
        text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 2 phút. \nSau khi bạn xác nhận mã OTP thành công, bạn có 5 phút để đổi mật khẩu.`
    });
};


const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp || otp.length !== 6) {
        return res.status(400).json({ message: 'OTP không hợp lệ, vui lòng thử lại!' });
    }

    try {
        const storedOtp = (await supabase.from("otp").select().filter('email', 'eq', email).single()).data;

        if (!storedOtp) {
            return res.status(400).json({ message: 'Email không tồn tại hoặc OTP đã hết hạn.' });
        }

        // Kiểm tra thời hạn trước khi so sánh OTP
        if (new Date() > storedOtp.expire) {
            console.log('het han');

            return res.status(400).json({ message: 'OTP đã hết hạn.' });
        }

        if (Number(storedOtp.otp) === Number(otp)) {
            console.log(storedOtp, otp);
            
            return res.status(400).json({ message: 'OTP không chính xác.' });
        }

        await supabase.from("otp").update({ 'verified': true, 'expire': new Date(Date.now() + 5 * 60 * 1000) }).filter('email', 'eq', email);

        res.status(200).json({ message: 'Xác nhận gmail thành công.' });

    } catch (error) {
        res.sendStatus(500);
    }
};

const refreshOtp = async (req, res) => {
    const { email } = req.body;
    await sendOtpByEmail(email, res);
    res.status(200).json({ message: 'Check mail để lấy mã OTP!' });
}

module.exports = { verifyOtp, refreshOtp };