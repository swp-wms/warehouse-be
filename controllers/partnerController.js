const partnerService = require('../Services/partnerServices');

let createPartner = async (req, res) => {
    let data = req.body;
    let result = await partnerService.createPartnerServices(data);
    return res.status(200).json({ result });
}
let getOnePartner = async (req, res) => {
    let data = req.body.id; 
    let result = await partnerService.getOnePartnerServices(data);
    return res.status(200).json({ result });
}
let getAllPartner = async (req, res) => {
    let data = req.body;
    let result = await partnerService.getAllPartnerServices(data);
    return res.status(200).json({ result });
}
let updatePartner = async (req, res) => {
    let data = req.body;
    let result = await partnerService.updatePartnerServices(data);
    return res.status(200).json({ result });
}
module.exports = {
    createPartner,
    getOnePartner,
    getAllPartner,
    updatePartner
}