const supabase = require("../config/supabaseClient");

const getOneDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId)).data[0];
        if (!delivery) {
            return res.sendStatus(404);
        }

        const deliveryDetail = await supabase.rpc('get_delivery_detail', { searchid: delivery.id });

        res.send({ delivery, deliveryDetail: deliveryDetail.data });
    } catch (error) {
        res.sendStatus(500);
    }
}

const getDeliveryByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('orderid', orderId)).data;
        if (delivery.length === 0) {
            return res.send({ message: 'Không tìm thấy thông tin giao hàng!' });
        }
        res.send(delivery);
    } catch (error) {
        res.sendStatus(500);
    }
}

const createDeliveryForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = (await supabase.from('order').select().eq('id', orderId).single()).data;
        console.log(order);

        const { deliverydate, deliverytime, gettime, getdate, note } = req.body;
        if (!deliverydate || !deliverytime) {
            return res.status(400).json({ message: 'Ngày vận chuyển và thời gian vận chuyển là bắt buộc!' });
        }
        await supabase.from('delivery').insert({ orderid: order.id, deliverydate, deliverytime, gettime, getdate, note });

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

module.exports = {
    getOneDelivery, getDeliveryByOrder, createDeliveryForOrder
}