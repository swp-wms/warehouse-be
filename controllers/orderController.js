const supabase = require('../config/supabaseClient');


const getAllImportOrders = async(req, res) => {
  const { data, error } = await supabase
  .from('order')
  .select(`*,partner(*)`)
  .eq('type', 'I'); // Assuming 'I' is for import orders
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
}


const getAllExportOrders = async(req, res) => {
  const { data, error } = await supabase
  .from('order')
  .select(`*,partner(*)`)
  .eq('type', 'E'); // Assuming 'E' is for export orders
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

const createNewOrder = async(req,res) => {
  const newOrder = {
    type: req.body.type,
    partnerid : req.body.partnerid,
    salesman : req.body.salesman,
    totalbars: req.body.totalbars,
    totalweight: req.body.totalweight,
    address: req.body.address || '',
    status: "0%",
    createdate: new Date().toISOString().split('T')[0],
    note: req.body.note || '',
  }

  console.log(`Creating new order: ${JSON.stringify(newOrder)}`);
  res.json(newOrder);

  if(
    !newOrder.type ||
    !newOrder.partnerid ||
    !newOrder.salesman ||
    newOrder.totalbars === undefined || newOrder.totalbars === null ||
    newOrder.totalweight === undefined || newOrder.totalweight === null
  ) {
    return res.status(400).json({ error: 'Missing either of these required fields (type, partnerid, salesman, totalbars, totalweight) please try again!' });
  }

  const { data, error } = await supabase
    .from('order')
    .insert(newOrder);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
}

const searchOrder = async (req,res) => {
  const id = req.params.id; 

   if (!id) {
    return res.status(400).json({ error: error.message });
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



module.exports ={
    getAllImportOrders,
    getAllExportOrders,
    createNewOrder,
    searchOrder,
    updateOrder
}