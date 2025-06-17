const supabase = require("../config/supabaseClient");

const getCatalog = async (req, res) => {
  const catalog = await supabase.from("catalog").select();
  res.send(catalog.data);
};

const postCatalog = async (req, res) => {
  const {
    brandname,
    steeltype,
    standard,
    barsperbundle,
    length,
    weightpermeter,
    weightperbundle,
    type,
    weightperroll,
  } = req.body;
  const newCatalog = {
    brandname: brandname,
    steeltype: steeltype,
    standard: standard,
    barsperbundle: barsperbundle,
    length: length,
    weightpermeter: weightpermeter,
    weightperbundle: weightperbundle,
    type: type,
    weightperroll: weightperroll,
  };
  const result = await supabase.from("catalog").insert(newCatalog);
  res.send(result);
};

const putCatalog = async (req, res) => {
  const { brandname } = req.body;
  const catalog = await supabase
    .from("catalog")
    .select()
    .filter("brandname", "eq", brandname)
    .filter("steeltype", "eq", steeltype);
    
};

const searchcatalog = async (req, res) => {
  
}

module.exports = { getCatalog, postCatalog, putCatalog };
