const supabase = require('../config/supabaseClient');

const fetchImportOrderWeight = async (req, res) => {
  const { data, error } = await supabase
    .from('orderweight')
    .select('*')
    .eq('type', 'I')
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

const fetchExportOrderWeight = async (req, res) => {
  const { data, error } = await supabase
    .from('orderweight')
    .select('*')
    .eq('type', 'E')
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

const getAllImportOrders = async(req, res) => {
  const { data, error } = await supabase
  .from('order')
  .select(`*,partner(*),orderdetail:orderdetail(*)`)
  .eq('type', 'I') // Assuming 'I' is for import orders
  .is('orderdetail.supplementorderid', null)
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  // updatedData = await updateOrderStatus(data);
  // res.json(updatedData);
  res.json(data);  
}


const getAllExportOrders = async(req, res) => {
  const { data, error } = await supabase
  .from('order')
  .select(`*,partner(*),orderdetail:orderdetail(*)`)
  .eq('type', 'E') // Assuming 'E' is for export orders
  .is('orderdetail.supplementorderid', null)
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  // updatedData = await updateOrderStatus(data);
  // res.json(updatedData);
  res.json(data);
}

// Helper to validate required fields
const validateOrderFields = (order) => {
  return (
    order.type !== null &&
    order.partnerid !== null &&
    order.salesmanid !== null
  );
};

const validateOrderDetail = (orderdetail) => {



  return (
    orderdetail.productid !== null &&
    orderdetail.numberofbars !== undefined && orderdetail.numberofbars !== null &&
    orderdetail.weight !== undefined && orderdetail.weight !== null
  );
};

// Helper to build new order object
const buildNewOrder = (body) => {
  return {
    type: body.type,
    partnerid: body.partnerid,
    salesmanid: body.salesmanid,
    address: body.address || '',
    status: 0,
    createdate: new Date().toISOString().split('T')[0],
    note: body.note || '',
  };
}

// Helper to build order detail array
const buildOrderDetailArray = (orderdetail, orderId) => {
  return orderdetail.map(item => ({
    ...item,
    orderid: orderId
  }));
}



const createNewOrder = async (req, res) => {
  const newOrder = buildNewOrder(req.body);
  const { orderdetail } = req.body;
  if (!orderdetail || !Array.isArray(orderdetail) || orderdetail.length === 0) {
    return res.status(400).json({ error: 'orderdetail must be a non-empty array' });
  }
  if (!validateOrderFields(newOrder)) {
    return res.status(400).json({ error: 'Missing either of these required fields (type, partnerid, salesman, totalbars, totalweight) please try again!' });
  }
  for(let i = 0; i < orderdetail.length; i++){
    if(!validateOrderDetail(orderdetail[i])){
      return res.json({ error: 'Missing either productid, quantity or price in orderdetail' });
    }
  }

  // Insert order and get the generated id
  const { data: orderData, error: orderError } = await supabase
    .from('order')
    .insert(newOrder)
    .select('id')
    .single();

  if (orderError) {
    return res.status(500).json({ error: orderError.message });
  }
  const orderId = orderData.id;
  console.log("Order ID: ", orderData.id);
  const orderDetailArray = buildOrderDetailArray(orderdetail, orderId);
  const { data: orderDetailData, error: orderDetailError } = await supabase
    .from('orderdetail')
    .insert(orderDetailArray);
  if (orderDetailError) {
    return res.status(500).json({ error: orderDetailError.message });
  }
  const orderInfo = {
    id: orderId,
    ...newOrder,
    orderdetail: orderDetailData
  };
  res.status(201).json({ order: orderInfo });
};

const searchOrder = async (req,res) => {
  const id = req.params.id; 
   if (!id) {
    return res.status(400).json({ error: 'Missing order id' });
  }
  const { data, error } = await supabase
  .from('order')
  .select('*')
  .eq('id',id)
  .single();
  if(error){
    return res.status(500).json({error: error.message});
  }
  if(!data){
    return res.status(404).json({ error: 'Order not found' });
  }
  res.status(200).json(data);
}

const getOrderDetailById = async (id) => {
  const { data, error } = await supabase
  .from('orderdetail')
  .select('*')
  .eq('orderid', id);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

const isSubmittedOrderDetailExistsInDatabase = (dbOrderDetail, newOrderDetail) => {
  
  return dbOrderDetail.some(detail =>
    detail.id === newOrderDetail.id
  );
};



const updateOrder = async(req, res) => {
  try {
    const order = req.body;
    const orderId = req.params.id;

    if (!order) {
      return res.status(400).json({ error: 'Missing order data' });
    }

    // Validate order fields if they exist
    if (order.type || order.partnerid || order.salesmanid) {
      const orderToValidate = {
        type: order.type,
        partnerid: order.partnerid,
        salesmanid: order.salesmanid
      };
      if (!validateOrderFields(orderToValidate)) {
        return res.status(400).json({ error: 'Invalid order fields' });
      }
    }

    // UPDATE THE MAIN ORDER RECORD FIRST
    const orderUpdateData = {};
    if (order.type !== undefined) orderUpdateData.type = order.type;
    if (order.partnerid !== undefined) orderUpdateData.partnerid = order.partnerid;
    if (order.salesmanid !== undefined) orderUpdateData.salesmanid = order.salesmanid;
    if (order.address !== undefined) orderUpdateData.address = order.address;
    if (order.note !== undefined) orderUpdateData.note = order.note;
    if (order.status !== undefined) orderUpdateData.status = order.status;

    // Update main order if there are fields to update
    if (Object.keys(orderUpdateData).length > 0) {
      const { data: updatedOrderData, error: orderUpdateError } = await supabase
        .from('order')
        .update(orderUpdateData)
        .eq('id', orderId)
        .select('*');

      if (orderUpdateError) {
        return res.status(500).json({ error: `Order update failed: ${orderUpdateError.message}` });
      }

      console.log('Order updated successfully:', updatedOrderData);
    }

    // NOW UPDATE ORDER DETAILS (your existing logic)
    const newOrderDetail = order.orderdetail || [];
    if (newOrderDetail.length === 0) {
      return res.status(400).json({ error: 'orderdetail must be a non-empty array' });
    }

    for (let i = 0; i < newOrderDetail.length; i++) {
      if (!validateOrderDetail(newOrderDetail[i])) {
        return res.status(400).json({ error: 'Missing either productid, numberofbars or weight in orderdetail' });
      }
    }

    const dbOrderDetail = await getOrderDetailById(orderId);

    // Prepare batch operations for order details
    const updates = [];
    const inserts = [];
    const newOrderDetailIds = newOrderDetail.map(detail => detail.id).filter(id => id !== undefined);

    newOrderDetail.forEach(detail => {
      if (detail.id && isSubmittedOrderDetailExistsInDatabase(dbOrderDetail, detail)) {
        // Update existing order detail
        updates.push({
          id: detail.id,
          productid: detail.productid,
          numberofbars: detail.numberofbars,
          weight: detail.weight
        });
      } else if (!detail.id || !isSubmittedOrderDetailExistsInDatabase(dbOrderDetail, detail)) {
        // Insert new order detail
        inserts.push({
          productid: detail.productid,
          numberofbars: detail.numberofbars,
          weight: detail.weight,
          orderid: orderId
        });
      }
    });

    const deleteOrderDetailList = dbOrderDetail.filter(detail => !newOrderDetailIds.includes(detail.id));
    const deleteIds = deleteOrderDetailList.map(detail => detail.id).filter(id => id !== null);

    let data = null, error = null;

    // Batch update order details
    if (updates.length > 0) {
      for (const upd of updates) {
        ({ data, error } = await supabase
          .from('orderdetail')
          .update({
            productid: upd.productid,
            numberofbars: upd.numberofbars,
            weight: upd.weight
          })
          .eq('id', upd.id)
          .select('*'));
        if (error) break;
      }
      if (error) {
        return res.status(500).json({ error: `Order detail update failed: ${error.message}` });
      }
    }

    // Batch insert new order details
    if (!error && inserts.length > 0) {
      ({ data, error } = await supabase
        .from('orderdetail')
        .insert(inserts)
        .select('*'));
      if (error) {
        return res.status(500).json({ error: `Order detail insert failed: ${error.message}` });
      }
    }

    // Batch delete removed order details
    if (!error && deleteIds.length > 0) {
      ({ data, error } = await supabase
        .from('orderdetail')
        .delete()
        .in('id', deleteIds)
        .select('*'));
      if (error) {
        return res.status(500).json({ error: `Order detail delete failed: ${error.message}` });
      }
    }

    // Get the complete updated order with details
    const { data: completeOrder, error: fetchError } = await supabase
      .from('order')
      .select(`*, partner(*), orderdetail(*)`)
      .eq('id', orderId)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: `Failed to fetch updated order: ${fetchError.message}` });
    }

    return res.status(200).json({ 
      message: 'Cập nhật đơn hàng thành công',
      order: completeOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrderDetail = async (req,res) => {
  const id = req.params.orderId;
  if(!id){
    return res.status(400).json({ error: 'missing order id' });
  }

  const {data, error} = await supabase
  .from('order')
  .select(`*, partner(*), orderdetail(*,product:product(*,catalog(*)))`)
  .eq('id',id)
  .is('orderdetail.supplementorderid', null)
  if( error ){
    return res.json({error: error.message});
  }

  if(!data || data.length === 0){
    return res.status(404).json({error: 'No details found'})
  }
  //  const [order, orderDetail] = await Promise.all([
  //   supabase .from('order').select(`*,partner:partnerid(*)`).eq('id', id),
  //   supabase .from('orderdetailfullinfo').select('*').eq('orderid', id)
  // ]);

  // const orderdata = order.data[0];
  // const orderdetail = orderDetail.data;
  // if (!orderdata) {
  //   return res.status(404).json({ error: 'Order not found' });
  // }

  // const data = {
  //   ...orderdata,
  //   detail: orderdetail
  // }
  res.status(200).json(data);
}


const getDeliveryDetailForOrder = async(req, res) => {
    const {id} = req.params;
    if(!id){
      return res.status(400).json({message: 'Thiếu thông tin đơn hàng'});
    }

    const { data, error } = await supabase
    .from('delivery')
    .select('id,orderid,deliverydetail(*)')
    .eq('orderid', id)
    .neq('deliverystatus', 0); // Add more .eq, .neq, .like, etc. for more conditions
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng cho đơn hàng này.' });
    }
    return res.json(data);
}


const getPercentByOrder = async () => {
  const result = await supabase
  .from('percentperorder')
  .select('orderid, percent')

  if(result.error){
    console.log("Error: ",result.error)
    return result.error;
  }
  return result.data;
}


const updateOrderStatus = async (orderList) => {
  try{
    const percentageList = await getPercentByOrder();
    const updatedOrders = orderList.map(order =>{
      const item = percentageList.find(p => p.orderid === order.id)
      const percentage = item && order.status !=="Hủy"? item.percent:order.status;
      
      return {
        ...order,
        status: percentage === "Hủy"? "Hủy":parseFloat(percentage).toFixed(1)
      };
    })
    setTimeout(() => {
      console.log("order: ", updatedOrders);
    }, 1000);


    return updatedOrders
  }catch(error){
    console.error(`Exception updating order status: ${error}`)
  }
}



module.exports ={
    getAllImportOrders,
    getAllExportOrders,
    createNewOrder,
    searchOrder,
    updateOrder,
    getOrderDetail,
    getDeliveryDetailForOrder,
    fetchExportOrderWeight,
    fetchImportOrderWeight
}