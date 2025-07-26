
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

const getProductChange = async (startDate, endDate, req, res) => {
    let product_change_query= supabase.from("product_change").select("*")

    if(startDate){
        const startDateTime = new Date(startDate).toISOString();
        product_change_query.gte('update_time', startDateTime);
    }
    if(endDate){
         const endDateTime = new Date(endDate + ' 23:59:59').toISOString();
        product_change_query.lte('update_time', endDateTime);
    }
    product_change = await product_change_query;
    if(product_change.error) {
        console.error("Error fetching product change data:", product_change.error);
    }

    return product_change.data;
}

const caculateOpStock = (product,inventoryData,startDate,endDate,startDateData,endDateData) => {
    const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
    
    
    const dataOnStartDate= startDateData.find(d => d.productid == product.id);
    console.log("Start date data:", dataOnStartDate);
    product.OpStockUnit1 = dataOnStartDate?.totalbar || 0

    product.OpStockUnit2 = dataOnStartDate?.totalweight || 0;
    
    
    if(endDate === today){
        const dataOnEndDate = inventoryData.find(d => d.id == product.id)
        product.EdStockUnit1 = dataOnEndDate?.totalbar || 0;
        product.EdStockUnit2 = dataOnEndDate?.totalweight || 0;
    }
    else{
       

        const dataOnEndDate = endDateData.filter(d => d.productid == product.id);
        console.log("End date data:", dataOnEndDate);
        product.EdStockUnit1 = dataOnEndDate?.totalbar || 0;
        product.EdStockUnit2 = dataOnEndDate?.totalweight || 0;
    }
        return {
            OpStockUnit1: product.OpStockUnit1,
            OpStockUnit2: product.OpStockUnit2,
            EdStockUnit1: product.EdStockUnit1,
            EdStockUnit2: product.EdStockUnit2,
        }

}

const caculateQuantityInOut = (product, startDate, endDate, deliveryData, supplementData, product_change_data) => {
    const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
    product.QantityInUnit1 = 0;
    product.QantityOutUnit1 = 0;
    product.QantityInUnit2 = 0;
    product.QantityOutUnit2 = 0;

    // startDate == undefined ? startDate = today : startDate;
    // endDate == undefined ? endDate = today : endDate;
    let productChangeForCountingQuantity = [];
    if(product_change_data){
        productChangeForCountingQuantity = startDate == undefined? product_change_data.filter(p => product.id == p.productid) : product_change_data.filter(p => product.id == p.productid && p.update_time.split("T")[0] >= startDate && p.update_time.split("T")[0] <= endDate);
    }
    
    //filter delivery and supplement data by product and date range
    let deliveryRecordedForCountingQuantity = [];
    if(deliveryData) {
        deliveryRecordedForCountingQuantity = startDate == undefined ? deliveryData.filter(d => product.id == d.productid && product.partnerid == d.partnerid): deliveryData.filter(d => product.id == d.productid && product.partnerid == d.partnerid && d.deliverydate >= startDate && d.deliverydate <= endDate);
    }
    // console.log("deliveryRecordedForCountingQuantity", deliveryRecordedForCountingQuantity);

    let supplementRecordedForCountingQuantity = [];
    if (supplementData) {
        supplementRecordedForCountingQuantity = startDate == undefined
            ? supplementData.filter(s => product.id == s.productid && s.partnerid == product.partnerid)
            : supplementData.filter(s => product.id == s.productid && s.partnerid == product.partnerid && s.createdate >= startDate && s.createdate <= endDate);
    }
    // console.log("supplementRecordedForCountingQuantity", supplementRecordedForCountingQuantity);

    productChangeForCountingQuantity.forEach(p => {
        if(p.new_bars-p.old_bars > 0){
            product.QantityInUnit1 += (p.new_bars-p.old_bars);
        }
        else{
            product.QantityOutUnit1 += (p.old_bars-p.new_bars);
        }

        
        if(p.new_weight-p.old_weight > 0){
            product.QantityInUnit2 += (p.new_weight-p.old_weight);
        }
        else{
            product.QantityOutUnit2 += (p.old_weight-p.new_weight);
        }
    });

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
    let {startDate, endDate, partnerid, searchKeyword} = req.query;
    console.log("received parameters:", {startDate, endDate, partnerid, searchKeyword});

    const today = new Date().toISOString().split('T')[0];
    startDate = startDate || today;
    endDate = endDate || today;

   

    const {data:inventoryData , error:inventoryError} = await supabase
    .from("product")
    .select("*");

    if (inventoryError) {
        console.error("Error fetching product data:", inventoryError);
        return res.status(500).json({ error: "Failed to fetch product data" });
    }
    //get record from delivery history
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

    //get record from supplement order list
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

    //get record from product change history


    const product_change_data = await getProductChange(startDate, endDate, req, res);
   

    const historyStartDate = startDate;
    const historyEndDate = endDate;

    
        const prevDate = new Date(historyStartDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const actualHistoryStartDate = prevDate.toISOString().split('T')[0];
    

    //Get start and end date data from product_history
    const {data:startDateData, error:startDateError} = await supabase
    .from("product_history")
    .select("*")
    .gte('recorded_at' ,actualHistoryStartDate + ' 00:00:00')
    .lte('recorded_at', actualHistoryStartDate + ' 23:59:59');

    console.log("Start date:", actualHistoryStartDate);
    console.log("End date:", actualHistoryStartDate);


    if(startDateError) {
        console.error("Error fetching start date data:", startDateError);
    }

     const {data:endDateData, error:endDateError} = await supabase
        .from("product_history")
        .select("*")
        .gte('recorded_at', historyEndDate + ' 00:00:00')
        .lte('recorded_at', historyEndDate + ' 23:59:59');

        if(endDateError) {
            console.error("Error fetching end date data:", endDateError);
        }
//==================================================================================================        



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
                    OpStockUnit2: item.OpStockUnit2 == null? item.OpStockUnit2.toFixed(1) : 0,
                    QantityInUnit2: item.QantityInUnit2 == null? item.QantityInUnit2.toFixed(1) : 0,
                    QantityOutUnit2: item.QantityOutUnit2 == null? item.QantityOutUnit2.toFixed(1) : 0,
                    EdStockUnit2: item.EdStockUnit2 == null? item.EdStockUnit2.toFixed(1) : 0
                })
            }
            return acc;
        },[])
        console.log("Grouped");
        return grouped; 
    }
    let rawReport = [];
    inventoryData.forEach(product => {
        let item = JSON.parse(JSON.stringify(IOReportItemForm));
        const quantityInOut = caculateQuantityInOut(product, startDate, endDate, deliveryData, supplementData, product_change_data);
        const caculatedStock = caculateOpStock(product, inventoryData, startDate, endDate,startDateData, endDateData);
        item.id = rawReport.length <= 0 ? 1 : rawReport[rawReport.length - 1].id + 1;
        item.partnerid = product.partnerid;
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


    let overallReport = rawReport.filter(item => item.QantityInUnit1!=0 || item.QantityOutUnit1!=0 || item.QantityInUnit2!=0 || item.QantityOutUnit2!=0);
    if(partnerid){
        overallReport = overallReport.filter(item => item.partnerid && item.partnerid.trim().toLowerCase() == partnerid.trim().toLowerCase());
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