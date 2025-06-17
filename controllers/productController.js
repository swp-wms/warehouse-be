const supabase = require('../config/supabaseClient');

const getAllProduct = async (req, res) => {
    const { data, error } = await supabase.from('product').select('*, catalog(*), partner(*)');
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
}

const getOneProductById = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        
        const product = await supabase.from('product').select('*').eq('id', id);
        console.log(product);
        
        res.status(200).json(product.data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createNewProduct = async (req, res) => {
    const newProduct = req.body;
    const { data, error } = await supabase.from('product').insert(newProduct);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    console.log(data);
    res.status(200).json(data);
}

const updateProductInformationById = async (req, res) => {
    try {
        const id = req.params.id;
        const newProduct = req.body;


        
        const product = await supabase.from('product').update(newProduct).eq('id', id).select('*');

        res.status(200).json(product.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateProductQuantityById = async (req, res) => {
    const id = req.params.id;
    const newProduct = req.body;
    const { data, error } = await supabase.from('product').update(newProduct).eq('id', id);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
}

module.exports = { getAllProduct, getOneProductById, createNewProduct, updateProductInformationById, updateProductQuantityById };