const supabase = require('../config/supabaseClient');

const getRemainWeightOfBars = async (req, res) => {
    const orderid = req.params.orderid;
    try {
        const remains = (await supabase.from('remainweight').select().eq('orderid', orderid).gt('remain', 0)).data;
        res.json(remains);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

module.exports = { getRemainWeightOfBars }