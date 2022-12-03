const sqlite3 = require('sqlite3').verbose();
const db = require('./db.js');

const data = {};

data.init = async () => {
    await db.run(`CREATE TABLE IF NOT EXISTS receipts(
        number INTEGER PRIMARY KEY AUTOINCREMENT,
        menu VARCHAR(250),
        amount DOUBLE,
        creationDate CHAR(16),
        status CHAR(3)
    )`);
    await db.run(`CREATE TABLE IF NOT EXISTS items (
        name VARCHAR(250) PRIMARY KEY,
        unit_price DOUBLE
    )`);
    await db.run(`CREATE TABLE IF NOT EXISTS receipt_items (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_number INTEGER,
        name VARCHAR(250),
        qty INTERGER,
        unit_price DOUBLE,
        total_price DOUBLE GENERATED ALWAYS AS (unit_price * qty) VIRTUAL,
        FOREIGN KEY(receipt_number) REFERENCES receipts(number) ON DELETE CASCADE
    )`);
    /* TODO delete test data */
   /* await db.run(`DELETE FROM items`);
    await db.run(`DELETE FROM receipts`);
    await db.run(`INSERT INTO receipts(menu,amount,creationDate,status) VALUES('coca cola - frittes',6200, '21-11-2022 13:30','ACT')`);
    await db.run(`INSERT INTO receipts(menu,amount,creationDate,status) VALUES('coca cola - poulet',9200, '21-11-2022 13:30','ACT')`);
    await db.run(`INSERT INTO receipt_items(receipt_number,name,qty,unit_price) VALUES(1,'coca cola',1, 1200)`);
    await db.run(`INSERT INTO receipt_items(receipt_number,name,qty,unit_price) VALUES(1,'frittes',1, 5000)`);
    await db.run(`INSERT INTO receipt_items(receipt_number,name,qty,unit_price) VALUES(2,'coca cola',1, 1200)`);
    await db.run(`INSERT INTO receipt_items(receipt_number,name,qty,unit_price) VALUES(2,'poulet',1, 8000)`);
    await db.run(`INSERT INTO items VALUES('coca cola',1200)`);
    await db.run(`INSERT INTO items VALUES('mirinda',1200)`);
    await db.run(`INSERT INTO items VALUES('frittes',5000)`);
    await db.run(`INSERT INTO items VALUES('poulet',8000)`);*/
}

data.newItem = async (item) =>{
    const rows = await db.all(`SELECT * FROM items WHERE name = ?`,[item.name]);
    let ret = rows.length == 0;
    let message = ""
    if(item.name.trim() == ""){
        message = "Erreur: le nom ne peut être nul.";
        ret = false;
    } else if(ret) await db.run(`INSERT INTO items VALUES(?,?)`,[item.name,item.unit_price]);
    else message = "Erreur: cet élèment existe déjà."
    return {error:!ret,message:message};
}

data.updateItem = async (item) =>{
    await db.run(`UPDATE items SET price = ? WHERE name = ? `,[item.price,item.name]);
}

data.deleteItem = async (name) =>{
    console.log("name",name);
    await db.run(`DELETE FROM items WHERE name = ? `,[name]);
}

data.newReceipt = async(receipt) =>{
    await db.run(`INSERT INTO receipts(menu,amount,creationDate,status) VALUES(?,?,?,'ACT')`,[receipt.menu,receipt.amount,receipt.creationDate]);
    for(const item of receipt.items){
        await db.run(`INSERT INTO receipt_items(receipt_number,name,qty,unit_price) VALUES(?,?,?,?)`,[receipt.number,item.name,item.qty,item.unit_price]);
    }
}

data.deleteReceipt = async (number) =>{
    await db.run(`DELETE FROM receipts WHERE number = ?`,[number]);
}

data.getReceiptsMaxSeq = async () => {
    const rows = await db.all(`SELECT MAX(number) AS max_number FROM receipts`);
    return rows[0]?rows[0].max_number:0;
}

data.getReceiptsCount = async () => {
    const rows = await db.all(`SELECT COUNT(*) AS total FROM receipts WHERE status='CLT'`);
    return rows[0]?rows[0].total:0;
}

data.getReceipts = async (limit,offset) => {
    let rows = await db.all(`SELECT MAX(number) AS maxSeq FROM receipts WHERE status='CLT'`);
    const maxSeq =  rows[0]?rows[0].maxSeq:0;
    rows = await db.all(`SELECT COUNT(*) AS total FROM receipts WHERE status='CLT'`);
    const count = rows[0]?rows[0].total:0;
    const receipts = await db.all(`SELECT printf('%04d',number) as number,menu,amount,creationDate FROM receipts WHERE status='CLT' ORDER BY number DESC LIMIT ? OFFSET ?`,[limit,offset]);
    for(const receipt of receipts){
        receipt.items = [];
        receipt.items = await db.all(`SELECT * FROM receipt_items WHERE receipt_number = ?`,[receipt.number]);
    }
    return {receipts:receipts,maxSeq:maxSeq,count:count};
}

data.getItems = async (limit,offset) => {   
    const items = await db.all(`SELECT * FROM items ORDER BY name ASC LIMIT ? OFFSET ?`,[limit,offset]);
    const rows = await db.all(`SELECT COUNT(*) as total FROM items ORDER BY name`);
    const count = rows[0]?rows[0].total:0;
    return {items:items,count:count};
}

data.getSearchItems = async (name) => {   
    const items = await db.all(`SELECT * FROM items WHERE name=? ORDER BY name DESC`,[name]);
    const rows = await db.all(`SELECT COUNT(*) as total FROM items WHERE name=?`,[name]);
    const count = rows[0]?rows[0].total:0;
    return {items:items,count:count};
}

data.getReceiptsByDate = async (reportDate) => {
    const receipts = await db.all(`SELECT printf('%04d',number) as number,menu,amount,creationDate FROM receipts WHERE status='CLT' ORDER BY number`,[]);
    const rows = await db.all(`SELECT SUM(amount) as total FROM receipts WHERE status='CLT' AND substr(creationDate,0,11)=? ORDER BY number`,[reportDate]);    
    let total = rows[0].total?rows[0].total:0;
    return {receipts:receipts,total:total};
}

data.getSearchReceipts = async (number) => { 
    let rows = await db.all(`SELECT MAX(number) AS maxSeq FROM receipts WHERE status='CLT' AND number=?`,[number]);
    const maxSeq =  rows[0]?rows[0].maxSeq:0;
    rows = await db.all(`SELECT COUNT(*) AS total FROM receipts WHERE status='CLT' AND number=?`,[number]);
    const count = rows[0]?rows[0].total:0;   
    const receipts = await db.all(`SELECT printf('%04d',number) as number,menu,amount,creationDate FROM receipts WHERE status='CLT' AND number=?`,[number]);
    for(const receipt of receipts){
        receipt.items = [];
        receipt.items = await db.all(`SELECT * FROM receipt_items WHERE receipt_number = ?`,[receipt.number]);
    }
    return {receipts:receipts,maxSeq:maxSeq,count:count};
}

data.getPosReceiptsCount = async () => {
    const rows = await db.all(`SELECT COUNT(*) AS total FROM receipts WHERE status='ACT'`);
    return rows[0]?rows[0].total:0;
}

data.getPosReceipts = async (limit,offset) => {
    let rows = await db.all(`SELECT MAX(number) AS maxSeq FROM receipts WHERE status='ACT'`);
    const maxSeq =  rows[0]?rows[0].maxSeq:0;
    rows = await db.all(`SELECT COUNT(*) AS total FROM receipts WHERE status='ACT'`);
    const count = rows[0]?rows[0].total:0;
    const receipts = await db.all(`SELECT printf('%04d',number) as number,menu,amount,creationDate FROM receipts WHERE status='ACT' ORDER BY number DESC LIMIT ? OFFSET ?`,[limit,offset]);
    for(const receipt of receipts){
        receipt.items = [];
        receipt.items = await db.all(`SELECT * FROM receipt_items WHERE receipt_number = ?`,[receipt.number]);
    }
    return {receipts:receipts,maxSeq:maxSeq,count:count};
}

data.getSearchPosReceipts = async (number) => { 
    let rows = await db.all(`SELECT MAX(number) AS maxSeq FROM receipts WHERE status='ACT' AND number=?`,[number]);
    const maxSeq =  rows[0]?rows[0].maxSeq:0;
    rows = await db.all(`SELECT COUNT(*) AS total FROM receipts WHERE status='ACT' AND number=?`,[number]);
    const count = rows[0]?rows[0].total:0;   
    const receipts = await db.all(`SELECT printf('%04d',number) as number,menu,amount,creationDate FROM receipts WHERE status='ACT' AND number=?`,[number]);
    for(const receipt of receipts){
        receipt.items = [];
        receipt.items = await db.all(`SELECT * FROM receipt_items WHERE receipt_number = ?`,[receipt.number]);
    }
    return {receipts:receipts,maxSeq:maxSeq,count:count};
}

data.getPosItems = async () => {
    const rows = await db.all(`SELECT * FROM items`);
    return rows;
}

data.closeDay = async (creationDate)=>{
    await db.run(`UPDATE receipts SET status = 'CLT' WHERE substr(creationDate,0,11)=?`,[creationDate]);
}

data.close = () =>{
    db.close();
}

module.exports =  data;