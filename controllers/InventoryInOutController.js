
const supabase = require('../config/supabaseClient');


const IOReportItemForm = {
    id: '',
    name:'',
    namedetail: '',
    unit1:'cây',
    OpStockUnit1:0,
    QantityInUnit1:0,
    QantityOutUnit1:0,
    EdStockUnit1:0,
    unit2:'KG',
    OpStockUnit2:0,
    QantityInUnit2:0,
    QantityOutUnit2:0,
    EdStockUnit2:0,


}


const caculateOpStock = (product,startDate,endDate, deliveryData, supplementData) => {
     const today = new Date().toISOString().split('T')[0]; //  today's date in YYYY-MM-DD format
    product.OpStockUnit1 = product.totalbar;        //get current stock quantity for both Op/EdStockUnit
    product.OpStockUnit2 = product.totalweight;     //to calculate 'em later

    product.EdStockUnit1 = product.totalbar
    product.EdStockUnit1 = product.totalweight;


    //filter delivery and supplement data by product and date range
    deliveryRecordByProduct = startDate == undefined ? deliveryData.filter(d => product.id == d.productid) : deliveryData.filter(d => product.id == d.productid && d.deliverydate >= startDate && d.deliverydate <= today);
    console.log("deliveryRecordByProduct", deliveryRecordByProduct);
    supplementRecordByProduct = startDate == undefined? supplementData.filter(s => product.id == s.productid) : supplementData.filter(s => product.id == s.productid && s.createdate >= startDate && s.createdate <= today);
    console.log("supplementRecordByProduct", supplementRecordByProduct);

    //if endDate is today then, the Tồn cuối will be the current stock
    
    if (endDate && endDate < today) {
        const deliveryAfterEndDate = endDate == undefined? []: deliveryData.filter(d => product.id == d.productid && d.deliverydate >= endDate && d.deliverydate <= today);
        console.log("deliveryAfterEndDate", deliveryAfterEndDate);
        const supplementAfterEndDate = endDate == undefined? []: supplementData.filter(s => product.id == s.productid && s.createdate >= endDate && s.createdate <= today);
        console.log("supplementAfterEndDate", supplementAfterEndDate);

        deliveryAfterEndDate.forEach(d => {
            if(d.type === "I"){
                product.EdStockUnit1 -= d.realnumberofbars;
                product.EdStockUnit2 -= d.realtotalweight;
            }
            if(d.type === "E"){
                product.EdStockUnit1 += d.realnumberofbars;
                product.EdStockUnit2 += d.realtotalweight;
            }
        });

        supplementAfterEndDate.forEach(s => {
            if(s.type === "I"){
                product.EdStockUnit1 -= s.numberofbars;
                product.EdStockUnit2 -= s.weight;
            }
            if(s.type === "E"){
                product.EdStockUnit1 += s.numberofbars;
                product.EdStockUnit2 += s.weight;
            }
        });

    }
       //caculate Opstock Unit
        deliveryRecordByProduct.forEach(d =>{
            if(d.type === "I"){
                product.OpStockUnit1 -= d.realnumberofbars;
                product.OpStockUnit2 -= d.realtotalweight;
            }
            if(d.type === "E"){
                product.OpStockUnit1 += d.realnumberofbars;
                product.OpStockUnit2 += d.realtotalweight;
            }
        })

        supplementRecordByProduct.forEach(s =>{
            if(s.type === "I"){
                product.OpStockUnit1 -= s.numberofbars;
                product.OpStockUnit2 -= s.weight;
            }
            if(s.type === "E"){
                product.OpStockUnit1 += s.numberofbars;
                product.OpStockUnit2 += s.weight;
            }
        })
        
    
        return {
            OpStockUnit1: product.OpStockUnit1,
            OpStockUnit2: product.OpStockUnit2,
            EdStockUnit1: product.EdStockUnit1,
            EdStockUnit2: product.EdStockUnit2,
        }

}

const caculateQuantityInOut = (product, startDate, endDate, deliveryData, supplementData) => {
    const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
    product.QantityInUnit1 = 0;
    product.QantityOutUnit1 = 0;
    product.QantityInUnit2 = 0;
    product.QantityOutUnit2 = 0;

    // startDate == undefined ? startDate = today : startDate;
    // endDate == undefined ? endDate = today : endDate;

    
    //filter delivery and supplement data by product and date range
    deliveryRecordedForCountingQuantity = startDate == undefined ? deliveryData.filter(d => product.id == d.productid): deliveryData.filter(d => product.id == d.productid && d.deliverydate >= startDate && d.deliverydate <= endDate);
    console.log("deliveryRecordedForCountingQuantity", deliveryRecordedForCountingQuantity);

    supplementRecordedForCountingQuantity = startDate == undefined ? supplementData.filter(s => product.id == s.productid): supplementData.filter(s => product.id == s.productid && s.createdate >= startDate && s.createdate <= endDate);
    console.log("supplementRecordedForCountingQuantity", supplementRecordedForCountingQuantity);

    deliveryRecordedForCountingQuantity.forEach(d =>{
        if(d.type === "I"){
            product.QantityInUnit1 += d.realnumberofbars;
            product.QantityInUnit2 += d.realtotalweight;
        }
        if(d.type === "E"){
            product.QantityOutUnit1 += d.realnumberofbars;
            product.QantityOutUnit2 += d.realtotalweight;
        }
    })

    supplementRecordedForCountingQuantity.forEach(s =>{
        if(s.type === "I"){
            product.QantityInUnit1 += s.numberofbars;
            product.QantityInUnit2 += s.weight;
        }
        if(s.type === "E"){
            product.QantityOutUnit1 += s.numberofbars;
            product.QantityOutUnit2 += s.weight;
        }
    })

    return {
        QantityInUnit1: product.QantityInUnit1,
        QantityOutUnit1: product.QantityOutUnit1,
        QantityInUnit2: product.QantityInUnit2,
        QantityOutUnit2: product.QantityOutUnit2,
    }
}

const Overall = async (req, res) => {
    const {startDate, endDate, partnerid, searchKeyword} = req.query;
    console.log("received parameters:", {startDate, endDate, partnerid, searchKeyword});

    const {data:inventoryData , error:inventoryError} = await supabase
    .from("product")
    .select("*");

    if (inventoryError) {
        console.error("Error fetching product data:", inventoryError);
        return res.status(500).json({ error: "Failed to fetch product data" });
    }

    const deliveryQuery = supabase
    .from("delivery_for_io_report")
    .select("*");
    
    if(startDate){
        deliveryQuery.gte('getdate',startDate);
    }

    // if(endDate){
    //     deliveryQuery.lte('getdate', endDate);  
    // }

    const {data:deliveryData, error:deliveryError} = await deliveryQuery;

    const supplementQuery = supabase
    .from("supplement_list_for_io_report")
    .select("*");

    
    if(startDate){
        supplementQuery.gte('getdate',startDate);
    }

    // if(endDate){
    //     supplementQuery.lte('getdate', endDate);  
    // }

    const {data:supplementData, error:supplementError} = await supplementQuery;


    const joinSimilarProducts = (productList) =>{
        const grouped = productList.reduce((acc,item) => {
            const existingItem = acc.find(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());

            if(existingItem){
                existingItem.OpStockUnit1 += item.OpStockUnit1;
                existingItem.QantityInUnit1 += item.QantityInUnit1;
                existingItem.QantityOutUnit1 += item.QantityOutUnit1;
                existingItem.EdStockUnit1 += item.EdStockUnit1;
                existingItem.OpStockUnit2 += item.OpStockUnit2;
                existingItem.QantityInUnit2 += item.QantityInUnit2;
                existingItem.QantityOutUnit2 += item.QantityOutUnit2;
                existingItem.EdStockUnit2 += item.EdStockUnit2;
            }
            else{
                acc.push({
                    id: acc.length + 1, // New sequential ID
                    name: item.name,
                    namedetail: item.namedetail,
                    unit1: item.unit1,
                    unit2: item.unit2,
                    OpStockUnit1: item.OpStockUnit1,
                    QantityInUnit1: item.QantityInUnit1,
                    QantityOutUnit1: item.QantityOutUnit1,
                    EdStockUnit1: item.EdStockUnit1,
                    OpStockUnit2: item.OpStockUnit2,
                    QantityInUnit2: item.QantityInUnit2,
                    QantityOutUnit2: item.QantityOutUnit2,
                    EdStockUnit2: item.EdStockUnit2
                })
            }
            return acc;
        },[])

        return grouped; 
    }
    let rawReport = [];
    inventoryData.forEach(product => {
        let item = JSON.parse(JSON.stringify(IOReportItemForm));
        const quantityInOut = caculateQuantityInOut(product, startDate, endDate, deliveryData, supplementData);
        const caculatedStock = caculateOpStock(product, startDate, endDate, deliveryData, supplementData);
        item.id = rawReport.length <= 0 ? 1 : rawReport[rawReport.length - 1].id + 1;
        item.name = product.name;
        item.namedetail = product.namedetail;
        item.OpStockUnit1 = caculatedStock.OpStockUnit1;

        item.QantityInUnit1 = quantityInOut.QantityInUnit1;
        item.QantityOutUnit1 = quantityInOut.QantityOutUnit1;
        item.EdStockUnit1 = caculatedStock.EdStockUnit1;

        item.OpStockUnit2 = caculatedStock.OpStockUnit2;
        item.QantityInUnit2 = quantityInOut.QantityInUnit2;
        item.QantityOutUnit2 = quantityInOut.QantityOutUnit2;
        item.EdStockUnit2 = caculatedStock.EdStockUnit2;

        rawReport.push(item);
    });


    let overallReport = rawReport.filter(item => item.QantityInUnit1 || item.QantityOutUnit1 || item.QantityInUnit2 || item.QantityOutUnit2);
    if(partnerid){
        overallReport = overallReport.filter(item => item.id.trim().toLowerCase() == partnerid.trim().toLowerCase());
    }
    else{
        overallReport = joinSimilarProducts(overallReport);
    }

    if(searchKeyword){
        overallReport = overallReport.filter(item => item.name.trim().toLowerCase().includes(searchKeyword.trim().toLowerCase())
                                                  || item.namedetail.trim().toLowerCase().includes(searchKeyword.trim().toLowerCase()));
        overallReport = joinSimilarProducts(overallReport);
    }

    res.send({ data: overallReport })
}

module.exports = {
    Overall
}