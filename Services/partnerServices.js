const supabase = require('../config/supabaseClient');

let createPartnerServices = (data) => {
    return new Promise(async (resolve, reject) => { 
        try{
            let result = await supabase.from('partner').insert([{
                id: data.id,
                name: data.name,
                address: data.address,
                taxcode: data.taxcode,
                phonenumber: data.phonenumber,
                email: data.email,
                bankaccount: data.bankaccount,
                bankname: data.bankname,
                note: data.note,
            }]).select();
            console.log(result);
            resolve({
                status: 200,
                data: result
            });
        }catch(e){
            reject(e);
        }
    });
}
let getAllPartnerServices = (data) => {
    return new Promise(async (resolve, reject) => { 
        try{
            let result = await supabase.from('partner').select("*");
            console.log(result);
            resolve({
                status: 200,
                data: result
            });
        }catch(e){
            reject(e);
        }
    });
}
let getOnePartnerServices = (data) => {
    return new Promise(async (resolve, reject) => { 
        try{
            let result = await supabase.from('partner').select('*').eq('id', data);
            console.log(result);
            resolve({
                status: 200,
                data: result
            });
        }catch(e){
            reject(e);
        }
    });
}
let updatePartnerServices = (data) => {
    return new Promise(async (resolve, reject) => { 
        try{    
            let result = await supabase
                .from('partner')
                .update({ 
                    name: data.name,
                    address: data.address,
                    taxcode: data.taxcode,
                    phonenumber: data.phonenumber,
                    email: data.email,
                    bankaccount: data.bankaccount,
                    bankname: data.bankname,
                    note: data.note,
                }).eq('id', data.id);
            console.log(result);
            resolve({
                status: 200,
                data: result,
                message: "Update successfully"
            });
        }catch(e){
            reject(e);
        }
    });
}
module.exports = { 
    createPartnerServices,
    getAllPartnerServices,
    getOnePartnerServices,
    updatePartnerServices 
}