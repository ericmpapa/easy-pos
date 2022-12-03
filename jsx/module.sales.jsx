class SalesScreen extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            receipts:[    
            ],
            items:[],
            receiptToPrint:{items:[]},
            receiptsToPrint:[],
            selectedItems:[],
            receiptTotal:0,
            currPageItemStart: 1,
            currPageItemEnd:1,
            totalPageCount:1000, 
            pageOffset:100,
            settings:{
                currency:{name:"USD",symbol:"$"}
            },
            printTotal:0,
            reportDate:""      
       };
       this.newPrintModal = null;
       this.currentReceiptSeq = 1;
       this.offset = 0;
       this.limit = 10;
       this.searchCriteria = ""; 
       const date = new Date();
       this.currDate = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
    }

    showPrintModal = (event) => {      
        this.newPrintModal = new bootstrap.Modal(document.getElementById('newPrintModal'), {
            keyboard: false
        });
        this.newPrintModal.show();
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
        let obj =  document.getElementById('receiptUI');
        obj.classList.remove('p-none');
        obj =  document.getElementById('sitUI');
        obj.classList.add('p-none');
        this.print(Number(event.target.getAttribute("data")));
    }

    printSituation = (event) => {        
        let obj =  document.getElementById('receiptUI');
        obj.classList.add('p-none');
        obj =  document.getElementById('sitUI');
        obj.classList.remove('p-none');        
        const date = new Date(document.getElementById('reportDate').value);        
        const reportDate = date.getDate().toString().padStart(2,'0')+'-'+(date.getMonth()+1).toString().padStart(2,'0')+'-'+date.getFullYear();        
        const context = this;
        window.sqldb.getReceiptsByDate(reportDate).then(function(data){
            context.setState({receiptsToPrint:data.receipts,printTotal:data.total,reportDate:reportDate});
            context.newPrintModal.hide();
            window.print();
        });
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
            window.sqldb.getReceipts(this.limit,this.offset).then(function(data){
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
                window.sqldb.getReceipts(this.limit,this.offset).then(function(data){
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

        window.sqldb.getReceipts(this.limit,0).then(function(data){
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
            window.sqldb.getReceipts(this.limit,(this.state.currPageItemStart - 1)).then(function(data){
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                if(limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({receipts:data.receipts,currPageItemStart:context.state.currPageItemStart,currPageItemEnd:context.state.currPageItemEnd,totalPageCount:context.state.totalPageCount});
            });
        } else {
            window.sqldb.getSearchReceipts(Number(event.target.value),this.limit,0).then(function(data){
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

    render(){
        return (
            <div>
                <div className="modal fade d-print-none" id="newPrintModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Imprimer la situation</h5>
                            </div>
                            <div className="modal-body">            
                                <input type="date" defaultValue={this.currDate}  class="form-control" id="reportDate"/>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default text-black text-center form-control" onClick={this.printSituation}>imprimer</button>                     
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="container-fluid print-UI" id="sitUI">
                    <div>
                        <p className="m-0">SITUATION MENUSUELLE</p>
                        <p className="m-0">Date: {this.state.reportDate}</p>
                    </div>
                    <div>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Numero</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Montant payé</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.receiptsToPrint.map((receipt) => (
                                        <tr>
                                            <td>{receipt.number}</td>
                                            <td>{receipt.creationDate}</td>
                                            <td>{receipt.menu}</td>
                                            <td>{receipt.amount} {this.state.settings.currency.symbol}</td>
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
                                        {this.state.printTotal} {this.state.settings.currency.symbol}
                                    </td>
                                </tr>                                
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="container-fluid print-UI" id="receiptUI">
                    <div className="row">
                        <div className="col text-start">{this.state.receiptToPrint.creationDate}</div>
                        <div className="col text-end fw-bold text-capitalize">reçu n°: {this.state.receiptToPrint.number}</div>
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
                                    <th>Qté</th>
                                    <th>Prix U.</th>
                                    <th>Prix T.</th>
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
                            <p className="m-0 text-uppercase">TOTAL A PAYER: {this.state.receiptToPrint.amount} Fc</p>                        
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
                        <div className="col-7 col-lg-9 pt-2">
                            <input type="search" className="form-control" placeholder="search by number..." onKeyUp={this.searchReceipt}/>
                        </div>
                        <div className="col-2 col-lg-1 text-right pt-2 pr-0">
                            <button style={{width:"100%"}} className="btn btn-secondary text-black text-center"
                                    onClick={this.showPrintModal}>Report</button>
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
                        <div className="col-5 text-left  bg-dark text-white p-1">Menu</div>
                        <div className="col-2 text-right  bg-dark  text-white p-1">Amount Paid</div>
                        <div className="col-2 text-left  bg-dark text-white p-2"></div>
                        {/* <div className="col-1 text-left  bg-dark text-white p-1"></div> */}
                    </div>
                    
                </div>
                <div className="container default-ui" style={{marginTop: '7.5em'}}>
                    {
                        this.state.receipts.map((receipt,index) =>(
                            <div className="row" style={{borderBottom:'1px dashed black'}}>
                                <div className="col-1 text-left p-1">{receipt.number}</div>
                                <div className="col-2 text-left p-1">{receipt.creationDate}</div>
                                <div className="col-5 text-left p-1">{receipt.menu}</div>
                                <div className="col-2 text-right p-1">{receipt.amount} {this.settings.currency.symbol}</div>
                                <div className="col-2 text-right p-2">
                                    <a href="#" data={index}  onClick={this.printReceipt}><i data={index} className="fa fa-print"></i></a>
                                </div>
                                {/* <div className="col-1 text-center p-2">
                                    <a href="#" data={receipt.number}  onClick={this.removeReceipt}><i data={receipt.number} className="fa fa-times"></i></a>
                                </div> */}
                            </div>
                        ))
                    }
                </div>   
            </div>
       );
    }
}