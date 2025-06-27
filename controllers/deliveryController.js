const supabase = require("../config/supabaseClient");
const deliveryStatus = require('../data/deliveryStatus');
const orderStatus = require('../data/orderStatus');
const role = require("../data/role");

const getOneDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId)).data[0];
        if (!delivery) {
            return res.sendStatus(404);
        }

        const deliveryDetail = (await supabase.rpc('get_delivery_detail', { searchid: delivery.id })).data;
        let sum = 0;
        let realsum = 0;
        if (deliveryDetail.length > 0) {
            for (let index = 0; index < deliveryDetail.length; index++) {
                sum += deliveryDetail[index].totalweight;
                realsum += deliveryDetail[index].realtotalweight;

            }
        }
        res.send({
            deliveryDetail,
            sum, realsum
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const getDeliveryByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        let delivery = (await supabase.from('delivery').select().eq('orderid', orderId)).data;
        if (delivery.length === 0) {
            return res.send({ message: 'Không tìm thấy thông tin giao hàng!' });
        }
        if (req.roleid === role.WAREHOUSE_KEEPER) {
            delivery = delivery.filter(d => Number(d.deliverystatus) >= 3);
        }
        res.send(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const createDeliveryForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = (await supabase.from('order').select("*, user(id)").eq('id', orderId).single()).data;

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
        }

        if(order.user.id !== req.id) {
            return res.status(401).json({ message: 'Bạn không phải người tạo đơn hàng. Bạn không có quyền thêm vận chuyển!' });    
        }

        const { deliverydate, deliverytime, gettime, getdate, note, listDeliveryDetail } = req.body.newDelivery;

        if (!deliverydate || !deliverytime) {
            return res.status(400).json({ message: 'Ngày vận chuyển và thời gian vận chuyển là bắt buộc!' });
        }
        if (listDeliveryDetail === null || listDeliveryDetail.length < 1) {
            return res.status(400).json({ message: 'Một xe hàng không thể để trống!' });
        }

        const delivery = await supabase.from('delivery').insert({ orderid: order.id, deliverydate, deliverytime, gettime, getdate, note, deliverystatus: deliveryStatus.CHO_GAN_XE }).select();

        const deliveryid = delivery.data[0].id;

        const standardList = [];
        for (let index = 0; index < listDeliveryDetail.length; index++) {
            standardList.push({
                deliveryid: deliveryid,
                orderdetailid: listDeliveryDetail[index].orderdetailid,
                numberofbars: listDeliveryDetail[index].numberofbars,
                totalweight: listDeliveryDetail[index].totalweight,
                note: listDeliveryDetail[index].note ? listDeliveryDetail[index].note : ''
            })
        }
        console.log(standardList);


        await supabase.from('deliverydetail').insert(standardList);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
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
//                 res.status(500).json({message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!'};
//     }
// }

const addTruckForDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;

        if (!delivery) {
            return res.status(404).json({
                message: 'Không tìm thấy giao hàng!'
            })
        }
        console.log(req.body);

        const { drivername, drivercode, driverphonenumber, licenseplate, note } = req.body.driver;
        if (!drivername || !drivercode || !driverphonenumber || !licenseplate) {
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin tài xế và xe!' });
        }
        await supabase.from('delivery').update(
            {
                drivername,
                drivercode,
                driverphonenumber,
                licenseplate,
                deliverystatus: deliveryStatus.CHO_DUYET_XE,
                note
            }).eq('id', deliveryId);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const approveDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;

        if (!delivery) {
            return res.sendStatus(404);
        }

        if (delivery.deliverystatus !== deliveryStatus.CHO_DUYET_XE) {
            return res.sendStatus(400);
        }

        const { deliverystatus } = req.body;

        await supabase.from('delivery').update({ 'deliverystatus': deliverystatus ? deliveryStatus.CHO : deliveryStatus.TU_CHOI_XE }).eq('id', deliveryId);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}
const confirmNotEnoughCarDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;

        if (!delivery) {
            return res.sendStatus(404);
        }

        if (delivery.deliverystatus !== deliveryStatus.CHO_GAN_XE) {
            return res.sendStatus(400);
        }

        await supabase.from('delivery').update({ 'deliverystatus': deliveryStatus.HET_XE }).eq('id', deliveryId);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}
const confirmIsDeliverying = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { act } = req.body;

        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;

        if (!delivery) {
            return res.sendStatus(404);
        }

        if (act !== 'nhap' || delivery.deliverystatus !== deliveryStatus.CHO) {
            return res.status(400).json({ message: 'Bạn không được quyền thay đổi trạng thái giao hàng!' });
        }

        const { error, data } = (await supabase.from('delivery').update({ 'deliverystatus': deliveryStatus.DANG_VAN_CHUYEN }).eq('id', deliveryId));

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const confirmCompleteDeliverying = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { act } = req.body;

        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;

        if (!delivery) {
            return res.sendStatus(404);
        }

        if (act !== 'xuat' || delivery.deliverystatus !== deliveryStatus.DANG_VAN_CHUYEN) {
            return res.status(400).json({ message: 'Bạn không được quyền thay đổi trạng thái giao hàng!' });
        }

        const { error, data } = (await supabase.from('delivery').update({ 'deliverystatus': deliveryStatus.XONG }).eq('id', deliveryId));

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const updateRealQuantityAndWeight = async (req, res) => {
    const { deliveryId } = req.params;
    try {
        const delivery = (await supabase.from('delivery').select().eq('id', deliveryId).single()).data;
        if (!delivery || Number(delivery.deliverystatus) < 3 || Number(delivery.deliverystatus) === 5) {
            return res.status(400).json({ message: 'Bạn không được update thông tin của đơn vận chuyển này!' });
        }
        const deliveryDetail = (await supabase.rpc('get_delivery_detail', { searchid: deliveryId })).data;
        let { realData, act } = req.body;
        console.log(req.body);

        if (act === 'nhap' && delivery.deliverystatus !== deliveryStatus.DANG_VAN_CHUYEN) {
            return res.status(400).json({ message: 'Bạn chưa được update thông tin của đơn vận chuyển này!' });
        }
        if (act === 'xuat' && delivery.deliverystatus !== deliveryStatus.CHO) {
            return res.status(400).json({ message: 'Bạn chưa được update thông tin của đơn vận chuyển này!' });
        }

        for (let index = 0; index < deliveryDetail.length; index++) {
            let check = false;

            for (let j = 0; j < realData.length; j++) {
                if (Number(realData[j].productid) === Number(deliveryDetail[index].productid)) {
                    check = true;
                    realData[j].orderdetailid = deliveryDetail[index].orderdetailid;
                }
            }
            if (!check) {
                return res.status(400).json({ message: 'Bạn cần cung cấp đầy đủ thông tin thực tế của hàng hóa.' });
            }
        }

        realData = realData.map(e => {
            return {
                deliveryid: deliveryId,
                realnumberofbars: e.realnumberofbars,
                realtotalweight: e.realtotalweight,
                orderdetailid: e.orderdetailid
            }
        });

        await supabase
            .from('deliverydetail')
            .upsert(realData, {
                onConflict: 'deliveryid, orderdetailid', // Specify your primary key column here
                ignoreDuplicates: false, // Set to true if you only want to insert new rows and ignore existing ones. For updates, keep it false.
            })
            .select();

        await supabase.from('delivery').update({ "deliverystatus": act === 'nhap' ? deliveryStatus.XONG : deliveryStatus.DANG_VAN_CHUYEN }).eq("id", deliveryId);

        res.json({ message: `Cập nhật đơn vận chuyển ${deliveryId} thành công!` });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const checkOrderComplete = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = (await supabase.from('percentperorder').select().eq('orderid', orderId).single()).data;
        if (!order) {
            return res.sendStatus(404);
        }
        if (order.percent < 90) {
            return res.status(400).json({ message: 'Đơn hàng phải hoàn thành ít nhất 90% trước khi cập nhật trạng thái Xong.' })
        }

        const { data, error } = await supabase.from('order').update({ "status": orderStatus.COMPLETE }).eq("id", orderId);
        console.log(data, error);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const cancelDelivery = async (req, res) => {
    const { deliveryId } = req.params;
    try {
        const delivery = (await supabase.from('delivery').select().eq("id", deliveryId).single()).data;

        if (delivery.deliverystatus === deliveryStatus.XONG) {
            return res.status(400).json({ message: 'Đơn hàng này đã hoàn thành. Bạn không thể hủy.' });
        }
        if (delivery.deliverystatus === deliveryStatus.DANG_VAN_CHUYEN) {
            return res.status(400).json({ message: 'Đơn hàng này đang trên đường vận chuyển. Bạn không thể hủy.' });
        }

        await supabase.from('delivery').update({ "deliverystatus": deliveryStatus.HUY }).eq("id", deliveryId);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Hệ thông xảy ra lỗi. Vui lòng thử lại sau!' });
    }
}

const getDeliveryListForExportOrderList = async (req, res) => {
    const orders = (await supabase.from('percentperorder').select().eq('type', 'E')).data;
    if (orders.length === 0) {
        return res.json({
            message: "Không có đơn xuất hàng nào."
        });
    }
    return res.send(orders);
}
const getDeliveryListForImportOrderList = async (req, res) => {
    const orders = (await supabase.from('percentperorder').select().eq('type', 'I')).data;
    if (orders.length === 0) {
        return res.json({
            message: "Không có đơn nhập hàng nào."
        });
    }
    return res.send(orders);
}


module.exports = {
    getOneDelivery,
    getDeliveryByOrder,
    createDeliveryForOrder,
    addTruckForDelivery,
    approveDelivery,
    confirmNotEnoughCarDelivery,
    confirmIsDeliverying,
    updateRealQuantityAndWeight,
    getDeliveryListForImportOrderList,
    getDeliveryListForExportOrderList,
    checkOrderComplete,
    cancelDelivery,
    confirmCompleteDeliverying
}