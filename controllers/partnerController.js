const supabase = require('../config/supabaseClient');

const getAllPartner = async (req, res) => {
    try {
        const partners = await supabase.from('partner').select('*');
        res.status(200).json(partners.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getPartnerById = async (req, res) => {
    try {
        const id = req.params.id;
        const partner = await supabase.from('partner').select('*').eq('id', id);
        res.status(200).json(partner.data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createNewPartner = async (req, res) => {
    try {
        const newPartner = req.body;
        console.log(newPartner);
        
        const partner = await supabase.from('partner').insert(newPartner).select('*');
        console.log(partner);
        
        res.status(200).json(partner.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updatePartnerByID = async (req, res) => {
    try {
        const id = req.params.id;
        const newPartner = req.body;
        const partner = await supabase.from('partner').update(newPartner).eq('id', id).select('*');
        res.status(200).json(partner.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllPartner, getPartnerById, createNewPartner, updatePartnerByID };