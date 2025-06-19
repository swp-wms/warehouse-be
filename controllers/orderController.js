const supabase = require('../config/supabaseClient');


const getAllImportOrders = async(req, res) => {
  const { data, error } = await supabase
  .from('order')
  .select(`*,partner(*),orderdetail:orderdetail(*)`)
  .eq('type', 'I'); // Assuming 'I' is for import orders
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
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
  console.log(data);
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
    status: "0%",
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




const updateOrder = async(req,res) =>{
  const {orderdetail}  = req.body;
  /**************************
   * Unfinished, need both accessibility from delivery backend and product backend
   */
  
  // for(let i = 0; i < orderdetail.length; i++){

  // }
  
  const {data, error} = await supabase
  .from('order')
  .update({
    
      type: req.body.type,
      partnerid : req.body.partnerid,
      totalbars: req.body.totalbars,
      totalweight: req.body.totalweight,
      address: req.body.address || '',
      note: req.body.note || ''
    
  })
  .eq('id',req.params.id)
  .select('*,partner(*)');


  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if(!data) {
    return res.status(404).json({ error: 'No order matched the given ID' });
  
  }

  return res.status(200).json(
    data[0]
  );
}

const getOrderDetail = async (req,res) => {
  const id = req.params.orderId;
  if(!id){
    return res.status(400).json({ error: 'missing order id' });
  }

  // const {data, error} = await supabase
  // .from('order')
  // .select(`*, partner:partnerid(*), orderdetail:orderdetail(*,product:productid(*))`)
  // .eq('id',id)

  // if( error ){
  //   res.json({error: error.message});
  // }

  // if(!data || data.length === 0){
  //   return res.status(404).json({error: 'No details found'})
  // }
   const [order, orderDetail] = await Promise.all([
    supabase .from('order').select(`*,partner:partnerid(*)`).eq('id', id),
    supabase .from('orderdetailfullinfo').select('*').eq('orderid', id)
  ]);

  const orderdata = order.data[0];
  const orderdetail = orderDetail.data;
  if (!orderdata) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const data = {
    ...orderdata,
    detail: orderdetail
  }

    


  res.status(200).json(data);
}


module.exports ={
    getAllImportOrders,
    getAllExportOrders,
    createNewOrder,
    searchOrder,
    updateOrder,
    getOrderDetail
}