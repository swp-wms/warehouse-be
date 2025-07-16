const supabase = require("../config/supabaseClient");

const totalWeightofWH = async (req, res) => {
  try {
    const totalweight = (await supabase.from("totalweightwh").select("")).data;
    res.json(totalweight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const totalFutureWeightofWH = async (req, res) => {
  try {
    const { createdate } = req.params;
    const weight = (await supabase.rpc("get_weight_by_date", { delivery_date: createdate })).data[0];
    const totalweight = (await supabase.from("totalweightwh").select("")).data;
    const totalFuture = totalweight[0].sum - weight.total_weight_by_date;
    const percent_future = totalFuture/15000000*100; 
    res.send({ 
      totalFuture,
      percent_future
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const sumImport = async (req, res) => {
  try {
    const sumImport = (await supabase.from("sumimport").select("")).data;
    res.json(sumImport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sumExport = async (req, res) => {
  try {
    const sumExport = (await supabase.from("sumexport").select("")).data;
    res.json(sumExport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const total_weight_by_brandname = async (req, res) => {
  try {
    const brandname_weight = (await supabase.from("total_weight_by_brandname").select("")).data;
    res.json(brandname_weight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const total_weight_by_type = async (req, res) => {
  try {
    const type_weight = (await supabase.from("total_weight_by_type").select("")).data;
    res.json(type_weight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const total_weight_by_partner = async (req, res) => {
  try {
    const brandname_weight = (await supabase.from("total_weight_by_partner").select("")).data;
    res.json(brandname_weight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { totalWeightofWH, totalFutureWeightofWH, sumImport, sumExport, total_weight_by_brandname, total_weight_by_type, total_weight_by_partner };
