const supabase = require('../config/supabaseClient');

const getAllNotification = async (req, res) => {
    const roleid = req.roleid;
    try {
        let notifications = (await supabase.from('notification').select()).data;
        notifications = notifications.filter((n) => ((String(n.roleid)).includes(roleid)) && !n.status);
        res.send(notifications);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);

    }
}

const seenNotification = async (req, res) => {
    const id = req.params.id;
    try {
        await supabase.from('notification').update({ 'status': true }).eq('id', id);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);

    }
}

module.exports = {
    getAllNotification,
    seenNotification
}