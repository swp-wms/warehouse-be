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

        if (!product || product.data.length === 0) {
            res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product.data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createNewProduct = async (req, res) => {
    try {
        const newProduct = req.body;
        const product = await supabase.from('product').insert(newProduct).select('*');
        console.log(product);
        res.status(200).json("Created: " + product.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

    console.log(data);
    res.status(200).json(data);

}

const updateProductInformationById = async (req, res) => {
    try {
        const id = req.params.id;
        const { totalbar, ...productInfo } = req.body; // Dùng destructuring để bỏ qua trường totalbar nếu nó được gửi từ client

        const allowedFields = ['name', 'partner_id', 'type', 'brandname', 'steeltype', 'namedetail', 'totalweight'];

        const updates = Object.keys(productInfo).reduce((acc, key) => {
            const value = productInfo[key];
            // Bỏ qua cập nhật các trường không có dữ liệu mới
            if ( allowedFields.includes(key) &&
                 value !== undefined &&
                 value !== null &&
                 !(typeof value === 'string' && value.trim() === '')
            ) {
                acc[key] = value;
            }
            return acc;
        }, {});

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No information to update" });
        }

        const { data, error } = await supabase
            .from('product')
            .update(updates)
            .eq('id', id)
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No product founded !!!" });
        }

        res.status(200).json({ message: "Updated successfully", updated: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProductQuantityById = async (req, res) => {
    try {
        const id = req.params.id;
        const { totalbar } = req.body; // Chỉ update totalbar

        if (totalbar === undefined) {
            return res.status(400).json({ error: 'Quantity (totalbar) is required for update' });
        }

        const { data, error } = await supabase
            .from('product')
            .update({ totalbar })
            .eq('id', id)
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({message: "Updated successfully", updated: data[0]});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { getAllProduct, getOneProductById, createNewProduct, updateProductInformationById, updateProductQuantityById };