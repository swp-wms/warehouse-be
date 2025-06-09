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

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
        }

        const { deliverydate, deliverytime, gettime, getdate, note, listDeliveryDetail } = req.body;
        if (!deliverydate || !deliverytime) {
            return res.status(400).json({ message: 'Ngày vận chuyển và thời gian vận chuyển là bắt buộc!' });
        }
        if (listDeliveryDetail === null || listDeliveryDetail.length < 1) {
            return res.status(400).json({ message: 'Một xe hàng không thể để trống!' });
        }

        const delivery = await supabase.from('delivery').insert({ orderid: order.id, deliverydate, deliverytime, gettime, getdate, note, deliverystatus: 'Chờ gán xe' }).select();

        const deliveryid = delivery.data[0].id;

        listDeliveryDetail.map(item => {
            item.deliveryid = deliveryid;
        });

        await supabase.from('deliverydetail').insert(listDeliveryDetail);

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

// const updateDeliveryList = async (req, res) => {
//     try {
//         const { deliveryId } = req.params;
//         const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;
        
//         const { drivername, drivercode, driverphonenumber, licenseplate } = req.body;
//         if (!drivername || !drivercode || !driverphonenumber || !licenseplate) {
//             return res.status(400).json({ message: 'Vui lòng điền đủ thông tin tài xế và xe!' });
//         }
//         await supabase.from('delivery').update(
//             {
//                 drivername,
//                 drivercode,
//                 driverphonenumber,
//                 licenseplate,
//                 deliverystatus: 'Chờ duyệt'
//             }).eq('id', deliveryId);

//         res.sendStatus(200);
//     } catch (error) {
//         res.sendStatus(500);
//     }
// }

const addTruckForDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;
        
        if(!delivery) {
            return res.status(404).json({
                message: 'Không tìm thấy giao hàng!'
            })
        }
        const { drivername, drivercode, driverphonenumber, licenseplate } = req.body;
        if (!drivername || !drivercode || !driverphonenumber || !licenseplate) {
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin tài xế và xe!' });
        }
        await supabase.from('delivery').update(
            {
                drivername,
                drivercode,
                driverphonenumber,
                licenseplate,
                deliverystatus: 'Chờ duyệt'
            }).eq('id', deliveryId);

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

const approveDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;

        if (!delivery) {
            return res.sendStatus(404);
        }

        if (delivery.deliverystatus !== 'Chờ duyệt') {
            return res.sendStatus(400);
        }

        const { deliverystatus } = req.body;

        await supabase.from('delivery').update({ 'deliverystatus': deliverystatus ? "Chờ" : "Từ chối xe" }).eq('id', deliveryId);

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

module.exports = {
    getOneDelivery,
    getDeliveryByOrder,
    createDeliveryForOrder,
    addTruckForDelivery,
    approveDelivery
}