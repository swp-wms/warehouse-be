const supabase = require("../config/supabaseClient");

const getSupplements = async (req, res) => {
    const supplements = await supabase.from("supplementorder").select();
    res.sent(supplements.data);
  };

const createSupplements = async (req, res) => {
  const {
    id,
    type,
    warehousekeeper,
    orderid,
    note,
    status,
    createdate,
    incarneeded,
  } = req.body;
  const newSupplement = {
    id: id,
    type: type,
    warehousekeeper: warehousekeeper,
    orderid: orderid,
    note: note,
    status: status,
    createdate: createdate,
    incarneeded: incarneeded,
  };
  const result = await supabase.from("supplementorder").insert(newSupplement);
  res.send(result);
};

module.exports = { createSupplements };