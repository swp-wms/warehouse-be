const supabase = require("../config/supabaseClient");

const getCatalog = async (req, res) => {
  const catalog = await supabase.from("catalog").select().order('steeltype');

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
  const result = await supabase.from("catalog").insert(newCatalog).select();
  console.log(result.data)
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

// const updateCatalog = async (req, res) => {
//   try{
//     const catalogList = req.body;
//     const resultList = [];

//     for (const catalog of catalogList){
//       const result = await supabase
//       .from('catalog')
//       .update(catalog)
//       .match({
//         steeltype : catalog.steeltype,
//         brandname : catalog.brandname
//       })

//       if(result.error){
//         console.log("Error updating data", result.error);
//         resultList.push({error: result.error, item:catalog})
//       }else{
//         resultList.push({success: true, data: result.data})
//       }

//     }

//     res.json(resultList);
//   }catch(error){
//     console.error('Batch update error:', error);
//     res.status(500).json({ error: 'Failed to update catalog batch',error });
//   }

// }
//}

const updateCatalog = async (req,res) => {
   try {
    const catalogUpdates = req.body; 
    
    // Ensure each object has an ID or unique identifier
    const result = await supabase
      .from('catalog')
      .upsert(catalogUpdates, { 
        onConflict: ['brandname', 'steeltype'] // Composite key
      });
    
    if (result.error) {
      console.error('Upsert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ error: 'Failed to update catalog batch' });
  }
};


const getCatalogBrands = async (req, res) => {
   const result = await supabase
   .from('catalogbrands')
   .select('*')
    if(result.error){
      console.error(result.error);
      return res.status(500).send("Error retrieving catalog brands");
    }
    console.log(result.data);

  res.send(result.data);
}

const getCatalogPrimaryKeys = async (req,res) => {
  const result = await supabase
  .from('catalogprimarykey')
  .select();

  if(result.error){
    console.error(result.error);
    return res.status(500).send({error: result.error});
  }

  // console.log(result.data);
  res.send(result.data);
}

module.exports = {  getCatalog, 
                    postCatalog, 
                    putCatalog, 
                    getCatalogBrands,
                    getCatalogPrimaryKeys,
                    updateCatalog };
