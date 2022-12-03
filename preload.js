const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sqldb', {
  newItem: (item) => ipcRenderer.invoke('new-item',item),
  updateItem: (item) => ipcRenderer.send('update-item',item),
  deleteItem: (name) => ipcRenderer.send('delete-item',name),
  newReceipt: (receipt) => ipcRenderer.send('new-receipt',receipt),
  deleteReceipt: (receipt) => ipcRenderer.send('delete-receipt',receipt),
  getPosItems: () => ipcRenderer.invoke('get-pos-items'),
  getItems: (limit,offset) => ipcRenderer.invoke('get-items',limit,offset),
  getSearchItems: (name) => ipcRenderer.invoke('get-search-items',name),
  getReceiptsMaxSeq:()=> ipcRenderer.invoke('get-receipts-max-seq'),
  getReceiptsCount: () => ipcRenderer.invoke('get-receipts-count'),
  getReceipts: (limit,offset) => ipcRenderer.invoke('get-receipts',limit,offset),
  getSearchReceipts:(number)=> ipcRenderer.invoke('get-search-receipts',number),
  getPosReceiptsCount: () => ipcRenderer.invoke('get-pos-receipts-count'),
  getPosReceipts: (limit,offset) => ipcRenderer.invoke('get-pos-receipts',limit,offset),
  getReceiptsByDate: (reportDate) => ipcRenderer.invoke('get-receipts-by-date',reportDate),
  getSearchPosReceipts:(number)=> ipcRenderer.invoke('get-search-pos-receipts',number),
  closeDay:(creationDate) => ipcRenderer.send('close-day',creationDate),
  print: () => ipcRenderer.send('print')
})