const supabase = require("../config/supabaseClient");

const getProductList = async (req, res) => {
  try {
    const list = (await supabase.from("productlist").select("")).data;
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    console.log(req.body);
    
      const product = await supabase.from('product').insert(
          {
              name: req.body.pd,
              namedetail: req.body.namedetail,
              brandname: req.body.brandname,
              partnerid: req.body.partner,
              type: req.body.type,
              steeltype: req.body.steeltype,
              totalbar: req.body.totalbar,
              totalweight: req.body.totalweight
          }
      ).select('*');
      console.log(product);
      res.status(200).json(product.data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }

}

const updateProductInformationById = async (req, res) => {
    const roleid = req.roleid;
  try {
    const id = req.params.id;
    const updateInfo = req.body; // Dùng destructuring để bỏ qua trường totalbar nếu nó được gửi từ client
    console.log(updateInfo);

    const product = (await supabase.from('product').select().eq('id', id).single()).data;
    console.log(product);

    const response = await supabase.from('product').update({
        name: roleid === 3 ? updateInfo.pd : product.name,
        namedetail: roleid === 3 ?updateInfo.namedetail : product.namedetail,
        brandname: roleid === 3 ? updateInfo.brandname : product.brandname,
        partnerid: roleid === 3 ? updateInfo.partnerid : product.partnerid,
        type: roleid ===3 ? updateInfo.type : product.type,
        steeltype: roleid ===3 ? updateInfo.steeltype : product.steeltype,
        totalbar: roleid === 4 ? updateInfo.totalbar : product.totalbar,
        totalweight: roleid === 4 ? updateInfo.totalweight : product.totalweight
    }).eq('id', updateInfo.productid);
    console.log(response);
    
    

    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewProductHistory = async (req, res) => {
  try {
    const id = Number(req.params.productid);
    const product = (await supabase.from('product_change').select().eq('productid', id));
    console.log(product);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProductList, addProduct, updateProductInformationById, viewProductHistory };
