const sqlite3 = require('sqlite3').verbose();
const sqldb = new sqlite3.Database('data.sqldb'); //new sqlite3.Database(':memory:');

const db = {};

db.run = (sql,binding) => {
    return new Promise((resolve,reject)=>{
        sqldb.serialize(()=>{
            sqldb.run(sql,binding,(err,row)=> {
                if (err) reject(err);
                resolve(row);
            });
        });
    });
}

db.all = (sql,binding) => {
    return new Promise((resolve,reject)=>{
        sqldb.serialize(()=>{
            sqldb.all(sql,binding,(err,rows)=> {
                if (err) reject(err);
                resolve(rows);
            });
        });
    });
}

db.close = () =>{
    return new Promise((resolve,reject)=>{
        sqldb.close((err,row)=>{
            if (err) reject(err);
            resolve(row);
        });
    });
}

module.exports = db;