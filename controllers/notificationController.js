const supabase = require('../config/supabaseClient');
const role = require('../data/role');

const getAllNotification = async (req, res) => {
    const roleid = req.roleid;
    try {
        let notifications;
        if (roleid === role.SALESMAN) {
            notifications = (await supabase.from('notification').select().eq('status', false).eq('roleid', roleid).eq('userid', req.id)).data;

        } else {
            notifications = (await supabase.from('notification').select().eq('status', false).eq('roleid', roleid)).data;
        }
        res.send(notifications);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);

    }
}

const getSeenNotification = async (req, res) => {
    const roleid = req.roleid;
    const index = req.params.index;
    console.log('run');
    
    try {
        let notifications;
        if (roleid === role.SALESMAN) {
            notifications = (await supabase.from('notification').select().eq('status', true).eq('roleid', roleid).eq('userid', req.id).order('created_at', { ascending: false }).limit(Number(index) + 5)).data;
        } else {
            notifications = (await supabase.from('notification').select().eq('status', true).eq('roleid', roleid).order('created_at', { ascending: false }).limit(Number(index) + 5)).data;
        }
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
    seenNotification,
    getSeenNotification
}