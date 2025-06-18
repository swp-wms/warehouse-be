const supabase = require("../config/supabaseClient");

const totalWeightofWH = async (req, res) => {
    try {
        const totalweight = (await supabase.from('totalweightwh').select('')).data;
        res.json(totalweight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const sumImport = async (req, res) => {
    try {
        const sumImport = (await supabase.from('sumimport').select('')).data;
        res.json(sumImport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const sumExport = async (req, res) => {
    try {
        const sumExport = (await supabase.from('sumexport').select('')).data;
        res.json(sumExport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = { totalWeightofWH, sumImport, sumExport };