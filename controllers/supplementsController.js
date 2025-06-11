const supabase = require("../config/supabaseClient");

const getSupplements = async (req, res) => {
  try {
    const supplements = await supabase.from("supplementorder").select();
    if(supplements.error) throw new Error(supplements.error);
    res.send(supplements.data);
  } catch (error) {
    res.sendStatus(500);
  }
};

const createSupplements = async (req, res) => {
  const {
    type,
    orderid,
    note,
    status,
    iscarneeded,
  } = req.body;
  const newSupplement = {
    type: type,
    warehousekeeperid: req.id,
    orderid: orderid,
    note: note,
    status: status,
    createdate: new Date(),
    iscarneeded: iscarneeded,
  };
  const result = await supabase.from("supplementorder").insert(newSupplement);
  res.send(result);
};

module.exports = { getSupplements, createSupplements };