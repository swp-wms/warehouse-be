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
    
    const supplementId = supplementResult.data[0].id;

    /*************************
     *detail{                *
     * orderid : number      *
     * productid: number,    *
     * numberofbars: number, *
     * weight: number        *
     *}                      *
    *************************/

    const detailWithSupplementId = detail.map(detailBit => ({
      ...detailBit, supplementorderid: supplementId 
    })); 

    /******************************* 
     * detailWithSupplementId: {   *
     *   orderid : number          *
     *   supplementorderid: number,*
     *   productid: number,        *
     *   numberofbars: number,     *
     *   weight: number            *
     * }
    ********************************/



    if (supplementResult.error) {
      return res.status(400).json({ error: supplementResult.error.message });
    }
    
    //insert order detail
    if (detail && detail.length > 0) {
      const detailResult = await supabase
      .from("orderdetail")
      .insert(detailWithSupplementId)
      
      
      if (detailResult.error) {
        console.log(detailResult.error.message)
        await supabase
        .from("supplementorder")
        .delete()
        .eq("id",supplementId)
        return res.status(400).json({ error: detailResult.error.message });
      }

      //update product totalbar and totalweight
      else{
        
        const productIdArray = detail.map(d =>  d.productid)
      /************************************
       * productIdArray: [1,2,3]
       *************************************/

        const productToUpdate = await supabase
        .from("product")
        .select(`*`)
        .in("id", productIdArray);

        /*********************************************
         * productToUpdate: [                        *
         *  { id: 1, totalbar: 0, totalweight: 0 },  *
         *  { id: 2, totalbar: 0, totalweight: 0 },  *
         *  { id: 3, totalbar: 0, totalweight: 0 } ] *
         *********************************************/

        // Find and update product totalbar and totalweight
        productToUpdate.data.forEach(element => {
          detail.forEach(e => {
            if (element.id === e.productid) {
              if (type === "I") {
          element.totalbar += e.numberofbars;
          element.totalweight += e.weight;
              } else if (type === "E") {
          element.totalbar -= e.numberofbars;
          element.totalweight -= e.weight;
              }
            }
          });
        });
        console.log("productToUpdate", productToUpdate.data);
        
        //upsert product
        const updatedProducts = await supabase
        .from("product")
        .upsert(productToUpdate.data, { onConflict: "id" })
        .select();
        if (updatedProducts.error) {
          //if failed then delete supplement order
          console.log("Error: ",updatedProducts.error.message)
          await supabase
          .from("supplementorder")
          .delete()
          .eq("id",supplementId)
          return res.status(400).json({ error: updatedProducts.error.message });
        }

        console.log("updatedProducts: ", updatedProducts.data);
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
    .select("*,creator:user(fullname),detail:orderdetail(*)")
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

const getSupplementById = async (req,res) =>{
  try{
    const {id} = req.params
    const result = await supabase
    .from("supplementorder")
    .select(`*,creator:user(fullname),detail:orderdetail(*,product:product(*,catalog(*)))`)
    .eq('id',id);
     if(result.error) {
      console.log(result.error.message)
      throw new Error(result.error.message);
    }
    console.log(result.data[0])
    res.send(result.data[0])

  }catch (error){
    console.log("error: ", error)
    return res.status(500).json({error: error.message})
  }
}

module.exports = { getSupplements, createSupplements, getSupplementsByOrderId,getSupplementById };