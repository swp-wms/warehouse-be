const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required!'
        });
    }

    try {
        const result = await supabase.from('user').select().filter('username', 'eq', username);
        if(result.error) {
            console.log(result.error);
            throw new Error(result.error);
        }

        const match = result.data[0];
        if (!match) {
            return res.status(401).json({
                message: "User does not exist!"
            });
        }

        const checkPass = await bcrypt.compare(password, match.password);
        if (!checkPass) {
            return res.status(401).json({
                message: 'Password is incorrect!'
            });
        }

        const refreshToken = jwt.sign(
            {
                username: match.username,
                role: match.role
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '1d'
            }
        );

        const accessToken = jwt.sign(
            {
                username: match.username,
                role: match.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.cookie('jwt', refreshToken, { maxAge: 24 * 60 * 1000, httpOnly: true, sameSite: 'None' });

        res.status(200).json({
            message: 'Login successful!',
            accessToken,
            role: match.role
        });
    } catch (error) {
        console.log(error);
        
        res.sendStatus(500);
    }

}

module.exports = { login };