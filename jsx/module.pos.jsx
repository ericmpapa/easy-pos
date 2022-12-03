class PosScreen extends React.Component {
    
    constructor(props){
        super(props);  
        this.state = {
            receipts:[    
            ],
            items:[],
            receiptToPrint:{items:[]},
            selectedItems:[],
            receiptTotal:0,
            currPageItemStart: 1,
            currPageItemEnd:1,
            totalPageCount:1000, 
            pageOffset:100,
            settings:{
                currency:{name:"USD",symbol:"$"}
            }       
       };            
       this.newReceiptModal = null;
       this.currentReceiptSeq = 1;
       this.offset = 0;
       this.limit = 10;
       this.newCloseModal = null;
       this.searchCriteria = "";   
       this.currency = window.localStorage.getItem("currency");
       if(!this.currency){
          window.localStorage.setItem("currency",{name:"USD",symbol:"$"});
       }    
    }

    print = (index)=>{
        const data = this.state.receipts[index];    
        this.setState({receiptToPrint:data});

        setTimeout(function(){
            window.print();
        },500);   
        
        JsBarcode("#barcode", data.number, {
            format: "itf",
            lineColor: "black",
            width: 2,
            height: 40,
            displayValue: false
        });
    }
    
    printReceipt = (event) => {
        this.print(Number(event.target.getAttribute("data")));
    }

    addItem = ()=>{
        const itemSelect = document.getElementById("itemSelect");
        if(itemSelect.options.length>0){
            const index = Number(itemSelect.options[itemSelect.selectedIndex].getAttribute("value"));
            const item = this.state.items[index];
            const selectedItems = this.state.selectedItems;
            item.qty = 1;
            item.total_price = item.unit_price * item.qty;
            this.state.receiptTotal = Number((this.state.receiptTotal + item.total_price).toFixed(2));
            selectedItems.push(item);
            this.state.items[index].selected = true;
            this.setState({selectedItems:selectedItems,items:this.state.items,receiptTotal:this.state.receiptTotal});
        }
    }

    removeReceipt = (event) => {
        const context = this;
        window.sqldb.deleteReceipt(Number(event.target.getAttribute("data")));
        window.sqldb.getPosReceipts(this.limit,0).then(function(data){            
            context.currentReceiptSeq = data.maxSeq + 1;
            context.state.totalPageCount = data.count;
            let limit = context.limit;
            if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
            context.state.currPageItemEnd = limit;
            context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});            
        });       
    }

    removeItemFromModal = (event) =>{
        this.state.selectedItems = this.state.selectedItems.filter((item,index)=>{
            this.state.items[index].selected = false;
            if(item.name != event.target.getAttribute("data")){                
                this.state.items[index].selected = true;
                return item;
            } else this.state.receiptTotal = Number((this.state.receiptTotal - item.total_price).toFixed(2));
        });
        this.setState({selectedItems:this.state.selectedItems,receiptTotal:this.state.receiptTotal});
    }

    handleQtyChange = (event)=>{
        const item = this.state.selectedItems[Number(event.target.getAttribute("data"))];
        this.state.receiptTotal -= item.total_price;
        item.qty = event.target.value;
        item.total_price = item.unit_price * item.qty;
        this.state.receiptTotal += item.total_price;
        this.setState({selectedItems:this.state.selectedItems,receiptTotal:this.state.receiptTotal});
    }

    showReceiptModal = (event) =>{      
        this.state.items.map(item =>{
            item.selected = false;
        });

        this.newReceiptModal = new bootstrap.Modal(document.getElementById('newReceiptModal'), {
            keyboard: false
        });

        this.setState({selectedItems:[],items:this.state.items,receiptTotal:0});
        this.newReceiptModal.show();
    }

    showCloseModal = (event) =>{      
        this.newCloseModal = new bootstrap.Modal(document.getElementById('newCloseModal'), {
            keyboard: false
        });
        this.newCloseModal.show();
    }

    saveAndPrint = (event) => {
        const context = this;
        if(this.state.selectedItems.length>0){
            const receipt = {menu:""};
            receipt.number = this.currentReceiptSeq.toString().padStart(4,'0');
            receipt.items = this.state.selectedItems;
            receipt.amount = this.state.receiptTotal;
            const date = new Date();
            receipt.creationDate = date.getDate().toString().padStart(2,'0')+'-'+(date.getMonth()+1).toString().padStart(2,'0')+'-'+date.getFullYear()+' '+date.getHours().toString().padStart(2,'0')+':'+date.getMinutes().toString().padStart(2,'0');
            this.state.selectedItems.map((item,index)=>{
                receipt.menu += item.name;
                if(index < this.state.selectedItems.length-1){
                    receipt.menu += " - ";
                }
            });
            window.sqldb.newReceipt(receipt);            
            window.sqldb.getPosReceipts(this.limit,0).then(function(data){
                context.newReceiptModal.hide();                
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                
                context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount}); 
                context.print(0); 
            });
        }        
    }

    pageBackward = () => {
        if(this.searchCriteria ==""){
            let limit = this.limit;
            if((this.offset - limit) > 0) this.offset = this.offset - limit;
            else this.offset = 0;    
            this.state.currPageItemStart = this.offset + 1;
            this.state.currPageItemEnd = this.state.currPageItemStart + limit;
            if(this.state.currPageItemEnd > this.state.totalPageCount) this.state.currPageItemEnd = this.state.totalPageCount;
            const context = this;
            window.sqldb.getPosReceipts(this.limit,this.offset).then(function(data){
                context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});
            });
        }        
    }

    pageForward = () => {
        if(this.searchCriteria ==""){
            let limit = this.limit;
            if((this.offset + limit) < this.state.totalPageCount){
                this.offset = this.offset + limit;
                this.state.currPageItemStart = this.offset + 1;
                this.state.currPageItemEnd = this.state.currPageItemStart + limit;
                if(this.state.currPageItemEnd > this.state.totalPageCount) this.state.currPageItemEnd = this.state.totalPageCount;
                const context = this;
                window.sqldb.getPosReceipts(this.limit,this.offset).then(function(data){
                    context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});
                });
            }
        }                 
    }

    initPagination = () => {
        this.state.currPageItemStart = 1;
        let limit = this.limit;
        if(limit > this.state.totalPageCount) limit = this.state.totalPageCount;
        this.state.currPageItemEnd = limit;
        this.setState({currPageItemStart:this.state.currPageItemStart,currPageItemEnd:this.state.currPageItemEnd,totalPageCount:this.state.totalPageCount});
    }

    componentDidMount = ()=>{
        const settings = {};
        const currency={name:"USD",symbol:'$'}
        if(window.localStorage.getItem('currencyName')){
            currency.name = window.localStorage.getItem('currencyName');
            currency.symbol = window.localStorage.getItem('currencySymbol');    
        } 
        settings.currency = currency;
        settings.companyName = window.localStorage.getItem('companyName');
        settings.companyAddress = window.localStorage.getItem('companyAddress');
        settings.companyId = window.localStorage.getItem('companyId');
        settings.companyTel = window.localStorage.getItem('companyTel');
        const context = this;

        window.sqldb.getPosItems().then(function(items){
            if(items.length>0)window.localStorage.setItem('currencyEnabled',true);
            context.setState({items:items});
        });

        window.sqldb.getPosReceipts(this.limit,0).then(function(data){
            context.currentReceiptSeq = data.maxSeq + 1;
            context.state.totalPageCount = data.count;
            let limit = context.limit;
            if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
            context.state.currPageItemEnd = limit;
            window.localStorage.setItem('currencyEnabled',data.receipts.length==0);
            context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount,settings:settings});
        });
    }

    searchReceipt = (event)=>{
        const context = this;
        this.searchCriteria = event.target.value.trim();
        if(event.target.value.trim() == ""){            
            window.sqldb.getPosReceipts(this.limit,(this.state.currPageItemStart - 1)).then(function(data){
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});
            });
        } else {
            window.sqldb.getSearchPosReceipts(Number(event.target.value),this.limit,0).then(function(data){
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                this.offset = 0;
                if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});
            });
        }        
    }

    closeDay = ()=>{
        const context = this;
        const date = new Date(document.getElementById('closeDate').value);
        const closeDate = date.getDate().toString().padStart(2,'0')+'-'+(date.getMonth()+1).toString().padStart(2,'0')+'-'+date.getFullYear();
        window.sqldb.closeDay(closeDate);
        window.sqldb.getPosReceipts(this.limit,(this.state.currPageItemStart - 1)).then(function(data){
            context.state.currPageItemStart = 1;
            context.currentReceiptSeq = data.maxSeq + 1;
            context.state.totalPageCount = data.count;
            let limit = context.limit;
            if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
            context.state.currPageItemEnd = limit;
            context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});
            context.newCloseModal.hide();            
        });
    }

    render(){        
        return (
            <div>
                <div className="modal fade d-print-none" id="newCloseModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Close the day</h5>
                            </div>
                            <div className="modal-body">            
                                <input type="date"  class="form-control" id="closeDate"/>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default text-black text-center form-control" onClick={this.closeDay}>valider</button>                     
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade d-print-none" id="newReceiptModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">New Receipt</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3 row">
                            <div className="col-9">
                                <label htmlFor="">Item</label>
                                <select className="form-control" name="" id="itemSelect">                                    
                                {
                                    this.state.items.map((item,index) => 
                                        item.selected?(""):(<option value={index}>{item.name}</option>)                                        
                                    )
                                }
                                </select>
                            </div>
                            <div className="col-3 text-end">
                                <button className="btn btn-secondary mt-4" onClick={this.addItem}>ajouter</button>
                            </div>
                        </div>
                        <div className="mb-3">
                        <table className="table table-print-dashed">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit P.</th>
                                    <th>Total P.</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.selectedItems.map((item,index) => (
                                        <tr>
                                            <td>{item.name}</td>
                                            <td><input type="number" data={index} className="form-control" style={{width:"70px",paddingTop:"0.2em",paddingBottom:"0.2em"}} defaultValue={item.qty} min="1" onChange={this.handleQtyChange}/></td>
                                            <td>{item.unit_price} {this.state.settings.currency.symbol}</td>
                                            <td>{item.total_price} {this.state.settings.currency.symbol}</td>
                                            <td style={{paddingTop:"0.7rem"}}><a data={item.name} href="#"><i data={item.name} onClick={this.removeItemFromModal} className="fa fa-times"></i></a></td>
                                        </tr>
                                    ))
                                }                                                    
                            </tbody>
                        </table>
                        
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div className="col text-start text-uppercase">
                               amount due <span className="fw-bold"> {this.state.receiptTotal}</span> {this.state.settings.currency.symbol} 
                            </div>
                            <div className="col text-end">
                                <button type="button" className="btn btn-default text-black text-center" onClick={this.saveAndPrint}>Enregistrer</button>
                            </div>                        
                    </div>
                    </div>
                </div>
                </div>
                <div className="container-fluid print-ui">
                    <div className="row">
                        <div className="col text-start">{this.state.receiptToPrint.creationDate}</div>
                        <div className="col text-end fw-bold text-capitalize">receipt n°: {this.state.receiptToPrint.number}</div>
                    </div>
                    <div className="row text-center mt-2">
                        <div className="col">
                            <img src="img/logo.svg" height="28"/>
                        </div>                        
                    </div>
                    <div className="row text-center mt-3">
                        <div className="col">
                            <p className="m-0">{this.state.settings.companyAddress}</p>
                            <p className="m-0">{this.state.settings.companyId}</p>
                            <p className="m-0">{this.state.settings.companyTel}</p>
                        </div>                   
                    </div>
                    <div className="row text-center mt-3">
                        <table className="table table-print-dashed">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit P.</th>
                                    <th>Total P.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.receiptToPrint.items.map((item) => (
                                        <tr>
                                            <td>{item.name}</td>
                                            <td>{item.qty}</td>
                                            <td>{item.unit_price} {this.state.settings.currency.symbol}</td>
                                            <td>{item.total_price} {this.state.settings.currency.symbol}</td>
                                        </tr>
                                    ))
                                }                                                    
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-end" style={{borderBottom:"none"}}>
                                        TOTAL
                                    </td>
                                    <td style={{borderBottom:"none"}}>
                                        {this.state.receiptToPrint.amount} {this.state.settings.currency.symbol}
                                    </td>
                                </tr>                                
                            </tfoot>
                        </table>                  
                    </div>
                    <div className="row text-center mt-3">
                        <div className="col">
                            <p className="m-0 text-uppercase">TOTAL: {this.state.receiptToPrint.amount} {this.state.settings.currency.symbol}</p>                        
                        </div>                   
                    </div>
                    <div className="row text-center mt-3">
                        <div className="col">
                            <svg id="barcode"></svg>  
                            <p>{this.state.receiptToPrint.number}</p>                    
                        </div>                  
                    </div>
                    <div className="row text-center mt-1">
                        <div className="col">
                            <small>2022 - 2023</small> 
                        </div>                
                    </div>                
                </div>

                <div className="container fixed-top default-ui" style={{backgroundColor: '#fbf6f0'}}>
                    <div className="row mb-3">
                        <div className="col-3 p-2 col-lg-2 pt-3"> <img src="img/logo.svg" alt="" height="20"/></div>
                        <div className="col-5 col-lg-8 pt-2">
                            <input type="search" className="form-control" placeholder="search by number..." onKeyUp={this.searchReceipt}/>
                        </div>
                        <div className="col-2 col-lg-1 text-right pt-2 pr-0">
                            <button style={{width:"100%"}} className="btn btn-default text-black text-center"
                                onClick={this.showReceiptModal}>New</button>
                        </div>
                        <div className="col-2 col-lg-1 text-right pt-2 pr-0">
                            <button style={{width:"100%"}} className="btn btn-secondary text-black text-center"
                                    onClick={this.showCloseModal}>Close</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6 text-start"></div>
                        <div className="col-6 text-end pr-2">{this.state.currPageItemStart} - {this.state.currPageItemEnd} / {this.state.totalPageCount}   
                            <a href="#" className="ms-2 text-decoration-none text-secondary ml-2 mr-2" onClick={this.pageBackward}><i className="fa fa-angle-left"></i></a>   
                            <a href="#" className="ms-2 text-decoration-none text-secondary" onClick={this.pageForward}><i className="fa fa-angle-right"></i></a>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-1 text-left bg-dark text-white p-1">#</div>
                        <div className="col-2 text-left  bg-dark text-white p-1">Date</div>
                        <div className="col-5 text-left  bg-dark text-white p-1">Items</div>
                        <div className="col-2 text-right  bg-dark  text-white p-1">Amount paid</div>
                        <div className="col-1 text-left  bg-dark text-white p-1"></div>
                        <div className="col-1 text-left  bg-dark text-white p-1"></div>
                    </div>
                    
                </div>
                <div className="container default-ui" style={{marginTop: '7.5em'}}>
                    {
                        this.state.receipts.map((receipt,index) =>(
                                <div className="row" style={{borderBottom:'1px dashed black'}}>
                                <div className="col-1 text-left p-1">{receipt.number}</div>
                                <div className="col-2 text-left p-1">{receipt.creationDate}</div>
                                <div className="col-5 text-left p-1">{receipt.menu}</div>
                                <div className="col-2 text-right p-1">{receipt.amount} {this.state.settings.currency.symbol}</div>
                                <div className="col-1 text-right p-2">
                                    <a href="#" data={index}  onClick={this.printReceipt}><i data={index} className="fa fa-print"></i></a>
                                </div>
                                <div className="col-1 text-center p-2">
                                    <a href="#" data={receipt.number}  onClick={this.removeReceipt}><i data={receipt.number} className="fa fa-times"></i></a>
                                </div>
                            </div>
                        ))
                    }
                </div>   
        </div>
        );
    }
}