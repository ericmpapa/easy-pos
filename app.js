const { app, BrowserWindow } = require('electron');
const path = require('path');
const {ipcMain} = require('electron');
const data = require('./api/data');
const settings = require('./api/settings');

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });
    win.setMenu(null);
    win.maximize();

    ipcMain.on('print', (event,item) =>{
        win.webContents.print(printOptions, (success, failureReason) => {
            if (!success) console.log(failureReason);      
        });
    });
    win.loadFile('index.html')
 }

app.whenReady().then(async () => {
    data.init();
    ipcMain.on('close-day', (event,creationDate) =>{
        data.closeDay(creationDate);
    });
    ipcMain.handle('new-item', async (event,item) =>{
        return await data.newItem(item);
    });
    ipcMain.on('update-item', (event,name) =>{
      data.updateItem(name);
    });
    ipcMain.on('delete-item', (event,name) =>{
        data.deleteItem(name);
    });
    ipcMain.on('new-receipt', (event,receipt) =>{
        data.newReceipt(receipt);
    });
    ipcMain.on('delete-receipt', (event,item) =>{
        data.deleteReceipt(item);
    });
    ipcMain.handle('get-pos-receipts', async (event,limit,offset) =>{
        return await data.getPosReceipts(limit,offset);
    });
    ipcMain.handle('get-pos-receipts-count', async (event,limit,offset) =>{        
        return await data.getPosReceiptsCount(limit,offset);
    });
    ipcMain.handle('get-search-pos-receipts', async (event,number) =>{
        return await data.getSearchPosReceipts(number);
    });

    ipcMain.handle('get-receipts', async (event,limit,offset) =>{
        return await data.getReceipts(limit,offset);
    });

    ipcMain.handle('get-items', async (event,limit,offset) =>{
        return await data.getItems(limit,offset);
    });

    ipcMain.handle('get-search-items', async (event,name) =>{
        return await data.getSearchItems(name);
    });

    ipcMain.handle('get-receipts-by-date', async (event,reportDate) =>{
        return await data.getReceiptsByDate(reportDate);
    });

    ipcMain.handle('get-receipts-count', async (event,limit,offset) =>{        
        return await data.getPosReceiptsCount(limit,offset);
    });

    ipcMain.handle('get-search-receipts', async (event,number) =>{
        return await data.getSearchReceipts(number);
    });

    ipcMain.handle('get-pos-items', async (event) =>{
        return await data.getPosItems();
    });

    ipcMain.handle('get-receipts-max-seq', async (event) =>{
        return await data.getReceiptsMaxSeq();
    });
    
    createWindow();
});