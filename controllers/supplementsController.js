const supabase = require("../config/supabaseClient");

const getSupplements = async (req, res) => {
  try {
    const supplements = await supabase.from("supplementorder").select("*,detail:orderdetail(*)");
    if(supplements.error) throw new Error(supplements.error);
    res.send(supplements.data);
  } catch (error) {
    res.sendStatus(500);
  }
};

const createSupplements = async (req, res) => {
  try {
    let {
      type,
      warehousekeeperid,
      orderid,
      note,
      status,
      iscarneeded,
      detail
    } = req.body;
    
    const newSupplement = {
      type: type,
      warehousekeeperid: warehousekeeperid,
      orderid: orderid,
      note: note,
      status: status,
      createdate: new Date(),
      iscarneeded: iscarneeded ? 1: 0,
    };
    
    // Insert supplement first
    const supplementResult = await supabase
    .from("supplementorder")
    .insert(newSupplement)
    .select();
    console.log(supplementResult);
    const supplementId = supplementResult.data[0].id;


    // { supplementorderid: supplementResult.data[0].id }];
    const detailWithSupplementId = detail.map(detailBit => ({
      ...detailBit, supplementorderid: supplementId 
    })); 
    if (supplementResult.error) {
      return res.status(400).json({ error: supplementResult.error.message });
    }
    
    
    if (detail && detail.length > 0) {
      const detailResult = await supabase.from("orderdetail").insert(detailWithSupplementId);
      
      if (detailResult.error) {
        console.log(detailResult.error.message)
        await supabase
        .from("supplementorder")
        .delete()
        .eq("id",supplementId)
        return res.status(400).json({ error: detailResult.error.message });
      }
    }
    
    return res.json({ success: true, message: "Supplement and details created successfully" });
    
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("error",error)
  }
};

const getSupplementsByOrderId = async (req, res) => {
  try{
    const id = req.params.orderId
    const result = await supabase
    .from("supplementorder")
    .select("*,detail:orderdetail(*)")
    .eq("orderid",id)
    
    if(result.error) {
      console.log(result.error.message)
      throw new Error(result.error.message);
    }

    res.send(result.data);
  }catch{
    res.sendStatus(500);
  }
}

module.exports = { getSupplements, createSupplements, getSupplementsByOrderId };