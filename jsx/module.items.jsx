class ItemsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            itemModalError: "",
            receiptToPrint: { items: [] },
            selectedItems: [],
            receiptTotal: 0,
            currPageItemStart: 1,
            currPageItemEnd: 1,
            totalPageCount: 1000,
            pageOffset: 100,
            settings: {
                currency:{name:"USD",symbol:"$"}
            }
        };
        this.newModal = null;
        this.currentReceiptSeq = 1;
        this.offset = 0;
        this.limit = 10;
        this.searchCriteria = "";
    }

    showNewModal = (event) => {
        const obj = document.getElementById('itemModalError');
        obj.classList.replace('d-block', 'd-none');
        this.newModal = new bootstrap.Modal(document.getElementById('newItemModal'), {
            keyboard: false
        });
        this.newModal.show();
    }

    pageBackward = () => {
        if (this.searchCriteria == "") {
            let limit = this.limit;
            if ((this.offset - limit) > 0) this.offset = this.offset - limit;
            else this.offset = 0;
            this.state.currPageItemStart = this.offset + 1;
            this.state.currPageItemEnd = this.state.currPageItemStart + limit;
            if (this.state.currPageItemEnd > this.state.totalPageCount) this.state.currPageItemEnd = this.state.totalPageCount;
            const context = this;
            window.sqldb.getItems(this.limit, this.offset).then(function (data) {
                context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        }
    }

    pageForward = () => {
        if (this.searchCriteria == "") {
            let limit = this.limit;
            if ((this.offset + limit) < this.state.totalPageCount) {
                this.offset = this.offset + limit;
                this.state.currPageItemStart = this.offset + 1;
                this.state.currPageItemEnd = this.state.currPageItemStart + limit;
                if (this.state.currPageItemEnd > this.state.totalPageCount) this.state.currPageItemEnd = this.state.totalPageCount;
                const context = this;
                window.sqldb.getItems(this.limit, this.offset).then(function (data) {
                    context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            }
        }
    }

    initPagination = () => {
        this.state.currPageItemStart = 1;
        let limit = this.limit;
        if (limit > this.state.totalPageCount) limit = this.state.totalPageCount;
        this.state.currPageItemEnd = limit;
        this.setState({ currPageItemStart: this.state.currPageItemStart, currPageItemEnd: this.state.currPageItemEnd, totalPageCount: this.state.totalPageCount });
    }

    componentDidMount = () => {
        const context = this;
        const settings={}
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
        window.sqldb.getItems(this.limit, 0).then(function (data) {
            context.state.totalPageCount = data.count;
            let limit = context.limit;
            if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
            context.state.currPageItemEnd = limit;
            window.localStorage.setItem('currencyEnabled',data.items.length==0);
            context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount,settings:settings });
        });
    }

    searchItem = (event) => {
        const context = this;
        this.searchCriteria = event.target.value.trim();
        if (event.target.value.trim() == "") {
            window.sqldb.getItems(this.limit, (this.state.currPageItemStart - 1)).then(function (data) {
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        } else {
            window.sqldb.getItems(this.limit, 0).then(function (data) {
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
            window.sqldb.getSearchItems(event.target.value, this.limit, 0).then(function (data) {
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                let limit = context.limit;
                this.offset = 0;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        }
    }

    removeItem = (event) => {
        const context = this;
        window.sqldb.deleteItem(event.target.getAttribute("data"));
        window.sqldb.getItems(context.limit, 0).then(function (data) {
            context.state.totalPageCount = data.count;
            let limit = context.limit;
            if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
            context.state.currPageItemEnd = limit;
            context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
        });
    }

    addItem = () => {
        const obj = document.getElementById('itemModalError');
        obj.classList.replace('d-block', 'd-none');
        const item = {};
        item.name = document.getElementById('itemName').value;
        item.unit_price = document.getElementById('itemPrice').value;
        item.unit_price = item.unit_price ? item.unit_price : 0;
        const context = this;
        window.sqldb.newItem(item).then(function (result) {
            if (result.error) {
                const obj = document.getElementById('itemModalError');
                obj.classList.replace('d-none', 'd-block');
                document.getElementById('itemModalError').textContent = result.message;
            } else {
                window.sqldb.getItems(context.limit, 0).then(function (data) {
                    context.newModal.hide();
                    context.state.totalPageCount = data.count;
                    let limit = context.limit;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;
                    context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            }
        });
    }

    render() {
        return (
            <div>
                <div className="modal fade d-print-none" id="newItemModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">New Item</h5>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-danger d-none" id="itemModalError"></div>
                                <div className="mb-3">
                                    <label htmlFor="">Name</label>
                                    <input type="text" className="form-control" id="itemName" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="">Price</label>
                                    <input type="number" min="0" defaultValue="0" class="form-control" id="itemPrice" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default text-black text-center form-control" onClick={this.addItem}>valider</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container fixed-top default-ui" style={{ backgroundColor: '#fbf6f0' }}>
                    <div className="row mb-3">
                        <div className="col-3 p-2 col-lg-2 pt-3"> <img src="img/logo.svg" alt="" height="20" /></div>
                        <div className="col-7 col-lg-9 pt-2">
                            <input type="search" className="form-control" placeholder="search by number..." onKeyUp={this.searchItem} />
                        </div>
                        <div className="col-2 col-lg-1 text-right pt-2 pr-0">
                            <button style={{width:"100%"}} className="btn btn-default text-black text-center"
                                onClick={this.showNewModal}>New</button>
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
                        <div className="col text-left  bg-dark text-white p-1">Name</div>
                        <div className="col text-left  bg-dark text-white p-1">Price</div>
                        <div className="col text-right  bg-dark  text-white p-1"></div>
                    </div>
                </div>
                <div className="container default-ui" style={{ marginTop: '7.5em' }}>
                    {
                        this.state.items.map((item, index) => (
                            <div className="row" style={{ borderBottom: '1px dashed black' }}>
                                <div className="col text-left p-1">{item.name}</div>
                                <div className="col text-left p-1">{item.unit_price} {this.state.settings.currency.symbol}</div>
                                <div className="col text-center p-2">
                                    <a href="#" data={item.name} onClick={this.removeItem}><i data={item.name} className="fa fa-times"></i></a>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}