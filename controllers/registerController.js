const supabase = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
    const { roleId, username, password } = req.body;
    if (!username || !password || !roleId) {
        return res.status(400).json({
            message: 'All field must be filled!'
        });
    }

    try {
        const dupplicate = await supabase.from('user').select().filter('username', 'eq', username);
        if (dupplicate.data[0]) {
            return res.status(409).json({
                message: 'Username has existed!'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await supabase.from('user').insert({
            username,
            password: hashedPassword,
            roleid: roleId
        });
        if (result.error) {
            return res.send(result.error);
        }
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500);
    }
}

module.exports = register;