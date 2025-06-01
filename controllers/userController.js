const supabase = require('../config/supabaseClient');

const getUser = async (req, res) => {
    const {username} = req.params;
    const user = await supabase.from("user").select().filter('username', 'eq', username);

    if (user.error) {
        return res.status(404).send({ message: "Not found!" });
    }
    res.send(user.data[0]);
}

module.exports = {
    getUser
}