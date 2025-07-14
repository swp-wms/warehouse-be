const supabase = require('../config/supabaseClient');


const getAllImportOrders = async(req, res) => {
  const { data, error } = await supabase
  .from('order')
  .select(`*,partner(*),orderdetail:orderdetail(*)`)
  .eq('type', 'I'); // Assuming 'I' is for import orders
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
  .eq('type', 'E'); // Assuming 'E' is for export orders
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

const updateOrder = async(req,res) =>{


  const order = req.body;

  if (order) {
    const dbOrderDetail = await getOrderDetailById(req.params.id);
    const newOrderDetail = order.orderdetail || [];
    if (newOrderDetail.length === 0) {
      return res.status(400).json({ error: 'orderdetail must be a non-empty array' });
    }

    for (let i = 0; i < newOrderDetail.length; i++) {
      if (!validateOrderDetail(newOrderDetail[i])) {
        return res.status(400).json({ error: 'Missing either productid, quantity or price in orderdetail' });
      }
    }

    // Prepare batch operations
    const updates = [];
    const inserts = [];
    const newOrderDetailIds = newOrderDetail.map(detail => detail.id);

    newOrderDetail.forEach(detail => {
      if (detail.id && isSubmittedOrderDetailExistsInDatabase(dbOrderDetail, detail)) {
        updates.push({
          id: detail.id,
          productid: detail.productid,
          numberofbars: detail.numberofbars,
          weight: detail.weight
        });
      } else if (!isSubmittedOrderDetailExistsInDatabase(dbOrderDetail, detail)) {
        inserts.push({
          productid: detail.productid,
          numberofbars: detail.numberofbars,
          weight: detail.weight,
          orderid: req.params.id
        });
      }
    });

    const deleteOrderDetailList = dbOrderDetail.filter(detail => !newOrderDetailIds.includes(detail.id));
    const deleteIds = deleteOrderDetailList.map(detail => detail.id).filter(id => id !== null);

    // Only one {data, error} for all DB operations
    let data = null, error = null;

    // Batch update
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
    }

    // Batch insert
    if (!error && inserts.length > 0) {
      ({ data, error } = await supabase
        .from('orderdetail')
        .insert(inserts)
        .select('*'));
    }

    // Batch delete
    if (!error && deleteIds.length > 0) {
      ({ data, error } = await supabase
        .from('orderdetail')
        .delete()
        .in('id', deleteIds)
        .select('*'));
    }
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ message: 'Cập nhật đơn hàng thành công' });
  }
  else{
    return res.status(400).json({ error: 'Missing order data' });
  }
}

const getOrderDetail = async (req,res) => {
  const id = req.params.orderId;
  if(!id){
    return res.status(400).json({ error: 'missing order id' });
  }

  const {data, error} = await supabase
  .from('order')
  .select(`*, partner(*), orderdetail(*,product:product(*,catalog(*)))`)
  .eq('id',id)

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
    getDeliveryDetailForOrder
}