var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PosScreen = function (_React$Component) {
    _inherits(PosScreen, _React$Component);

    function PosScreen(props) {
        _classCallCheck(this, PosScreen);

        var _this = _possibleConstructorReturn(this, (PosScreen.__proto__ || Object.getPrototypeOf(PosScreen)).call(this, props));

        _this.print = function (index) {
            var data = _this.state.receipts[index];
            _this.setState({ receiptToPrint: data });

            setTimeout(function () {
                window.print();
            }, 500);

            JsBarcode("#barcode", data.number, {
                format: "itf",
                lineColor: "black",
                width: 2,
                height: 40,
                displayValue: false
            });
        };

        _this.printReceipt = function (event) {
            _this.print(Number(event.target.getAttribute("data")));
        };

        _this.addItem = function () {
            var itemSelect = document.getElementById("itemSelect");
            if (itemSelect.options.length > 0) {
                var index = Number(itemSelect.options[itemSelect.selectedIndex].getAttribute("value"));
                var item = _this.state.items[index];
                var selectedItems = _this.state.selectedItems;
                item.qty = 1;
                item.total_price = item.unit_price * item.qty;
                _this.state.receiptTotal = Number((_this.state.receiptTotal + item.total_price).toFixed(2));
                selectedItems.push(item);
                _this.state.items[index].selected = true;
                _this.setState({ selectedItems: selectedItems, items: _this.state.items, receiptTotal: _this.state.receiptTotal });
            }
        };

        _this.removeReceipt = function (event) {
            var context = _this;
            window.sqldb.deleteReceipt(Number(event.target.getAttribute("data")));
            window.sqldb.getPosReceipts(_this.limit, 0).then(function (data) {
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                var limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        };

        _this.removeItemFromModal = function (event) {
            _this.state.selectedItems = _this.state.selectedItems.filter(function (item, index) {
                _this.state.items[index].selected = false;
                if (item.name != event.target.getAttribute("data")) {
                    _this.state.items[index].selected = true;
                    return item;
                } else _this.state.receiptTotal = Number((_this.state.receiptTotal - item.total_price).toFixed(2));
            });
            _this.setState({ selectedItems: _this.state.selectedItems, receiptTotal: _this.state.receiptTotal });
        };

        _this.handleQtyChange = function (event) {
            var item = _this.state.selectedItems[Number(event.target.getAttribute("data"))];
            _this.state.receiptTotal -= item.total_price;
            item.qty = event.target.value;
            item.total_price = item.unit_price * item.qty;
            _this.state.receiptTotal += item.total_price;
            _this.setState({ selectedItems: _this.state.selectedItems, receiptTotal: _this.state.receiptTotal });
        };

        _this.showReceiptModal = function (event) {
            _this.state.items.map(function (item) {
                item.selected = false;
            });

            _this.newReceiptModal = new bootstrap.Modal(document.getElementById('newReceiptModal'), {
                keyboard: false
            });

            _this.setState({ selectedItems: [], items: _this.state.items, receiptTotal: 0 });
            _this.newReceiptModal.show();
        };

        _this.showCloseModal = function (event) {
            _this.newCloseModal = new bootstrap.Modal(document.getElementById('newCloseModal'), {
                keyboard: false
            });
            _this.newCloseModal.show();
        };

        _this.saveAndPrint = function (event) {
            var context = _this;
            if (_this.state.selectedItems.length > 0) {
                var receipt = { menu: "" };
                receipt.number = _this.currentReceiptSeq.toString().padStart(4, '0');
                receipt.items = _this.state.selectedItems;
                receipt.amount = _this.state.receiptTotal;
                var date = new Date();
                receipt.creationDate = date.getDate().toString().padStart(2, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear() + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
                _this.state.selectedItems.map(function (item, index) {
                    receipt.menu += item.name;
                    if (index < _this.state.selectedItems.length - 1) {
                        receipt.menu += " - ";
                    }
                });
                window.sqldb.newReceipt(receipt);
                window.sqldb.getPosReceipts(_this.limit, 0).then(function (data) {
                    context.newReceiptModal.hide();
                    context.currentReceiptSeq = data.maxSeq + 1;
                    context.state.totalPageCount = data.count;
                    var limit = context.limit;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;

                    context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                    context.print(0);
                });
            }
        };

        _this.pageBackward = function () {
            if (_this.searchCriteria == "") {
                var limit = _this.limit;
                if (_this.offset - limit > 0) _this.offset = _this.offset - limit;else _this.offset = 0;
                _this.state.currPageItemStart = _this.offset + 1;
                _this.state.currPageItemEnd = _this.state.currPageItemStart + limit;
                if (_this.state.currPageItemEnd > _this.state.totalPageCount) _this.state.currPageItemEnd = _this.state.totalPageCount;
                var context = _this;
                window.sqldb.getPosReceipts(_this.limit, _this.offset).then(function (data) {
                    context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            }
        };

        _this.pageForward = function () {
            if (_this.searchCriteria == "") {
                var limit = _this.limit;
                if (_this.offset + limit < _this.state.totalPageCount) {
                    _this.offset = _this.offset + limit;
                    _this.state.currPageItemStart = _this.offset + 1;
                    _this.state.currPageItemEnd = _this.state.currPageItemStart + limit;
                    if (_this.state.currPageItemEnd > _this.state.totalPageCount) _this.state.currPageItemEnd = _this.state.totalPageCount;
                    var context = _this;
                    window.sqldb.getPosReceipts(_this.limit, _this.offset).then(function (data) {
                        context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                    });
                }
            }
        };

        _this.initPagination = function () {
            _this.state.currPageItemStart = 1;
            var limit = _this.limit;
            if (limit > _this.state.totalPageCount) limit = _this.state.totalPageCount;
            _this.state.currPageItemEnd = limit;
            _this.setState({ currPageItemStart: _this.state.currPageItemStart, currPageItemEnd: _this.state.currPageItemEnd, totalPageCount: _this.state.totalPageCount });
        };

        _this.componentDidMount = function () {
            var settings = {};
            var currency = { name: "USD", symbol: '$' };
            if (window.localStorage.getItem('currencyName')) {
                currency.name = window.localStorage.getItem('currencyName');
                currency.symbol = window.localStorage.getItem('currencySymbol');
            }
            settings.currency = currency;
            settings.companyName = window.localStorage.getItem('companyName');
            settings.companyAddress = window.localStorage.getItem('companyAddress');
            settings.companyId = window.localStorage.getItem('companyId');
            settings.companyTel = window.localStorage.getItem('companyTel');
            var context = _this;

            window.sqldb.getPosItems().then(function (items) {
                if (items.length > 0) window.localStorage.setItem('currencyEnabled', true);
                context.setState({ items: items });
            });

            window.sqldb.getPosReceipts(_this.limit, 0).then(function (data) {
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                var limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                window.localStorage.setItem('currencyEnabled', data.receipts.length == 0);
                context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount, settings: settings });
            });
        };

        _this.searchReceipt = function (event) {
            var context = _this;
            _this.searchCriteria = event.target.value.trim();
            if (event.target.value.trim() == "") {
                window.sqldb.getPosReceipts(_this.limit, _this.state.currPageItemStart - 1).then(function (data) {
                    context.state.currPageItemStart = 1;
                    context.currentReceiptSeq = data.maxSeq + 1;
                    context.state.totalPageCount = data.count;
                    var limit = context.limit;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;
                    context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            } else {
                window.sqldb.getSearchPosReceipts(Number(event.target.value), _this.limit, 0).then(function (data) {
                    context.state.currPageItemStart = 1;
                    context.currentReceiptSeq = data.maxSeq + 1;
                    context.state.totalPageCount = data.count;
                    var limit = context.limit;
                    this.offset = 0;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;
                    context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            }
        };

        _this.closeDay = function () {
            var context = _this;
            var date = new Date(document.getElementById('closeDate').value);
            var closeDate = date.getDate().toString().padStart(2, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear();
            window.sqldb.closeDay(closeDate);
            window.sqldb.getPosReceipts(_this.limit, _this.state.currPageItemStart - 1).then(function (data) {
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                var limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                context.newCloseModal.hide();
            });
        };

        _this.state = {
            receipts: [],
            items: [],
            receiptToPrint: { items: [] },
            selectedItems: [],
            receiptTotal: 0,
            currPageItemStart: 1,
            currPageItemEnd: 1,
            totalPageCount: 1000,
            pageOffset: 100,
            settings: {
                currency: { name: "USD", symbol: "$" }
            }
        };
        _this.newReceiptModal = null;
        _this.currentReceiptSeq = 1;
        _this.offset = 0;
        _this.limit = 10;
        _this.newCloseModal = null;
        _this.searchCriteria = "";
        _this.currency = window.localStorage.getItem("currency");
        if (!_this.currency) {
            window.localStorage.setItem("currency", { name: "USD", symbol: "$" });
        }
        return _this;
    }

    _createClass(PosScreen, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "modal fade d-print-none", id: "newCloseModal", tabIndex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true" },
                    React.createElement(
                        "div",
                        { className: "modal-dialog modal-sm" },
                        React.createElement(
                            "div",
                            { className: "modal-content" },
                            React.createElement(
                                "div",
                                { className: "modal-header" },
                                React.createElement(
                                    "h5",
                                    { className: "modal-title", id: "exampleModalLabel" },
                                    "Close the day"
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-body" },
                                React.createElement("input", { type: "date", "class": "form-control", id: "closeDate" })
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-footer" },
                                React.createElement(
                                    "button",
                                    { type: "button", className: "btn btn-default text-black text-center form-control", onClick: this.closeDay },
                                    "valider"
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "modal fade d-print-none", id: "newReceiptModal", tabIndex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true" },
                    React.createElement(
                        "div",
                        { className: "modal-dialog modal-dialog-scrollable" },
                        React.createElement(
                            "div",
                            { className: "modal-content" },
                            React.createElement(
                                "div",
                                { className: "modal-header" },
                                React.createElement(
                                    "h5",
                                    { className: "modal-title", id: "exampleModalLabel" },
                                    "New Receipt"
                                ),
                                React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" })
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-body" },
                                React.createElement(
                                    "div",
                                    { className: "mb-3 row" },
                                    React.createElement(
                                        "div",
                                        { className: "col-9" },
                                        React.createElement(
                                            "label",
                                            { htmlFor: "" },
                                            "Item"
                                        ),
                                        React.createElement(
                                            "select",
                                            { className: "form-control", name: "", id: "itemSelect" },
                                            this.state.items.map(function (item, index) {
                                                return item.selected ? "" : React.createElement(
                                                    "option",
                                                    { value: index },
                                                    item.name
                                                );
                                            })
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "col-3 text-end" },
                                        React.createElement(
                                            "button",
                                            { className: "btn btn-secondary mt-4", onClick: this.addItem },
                                            "ajouter"
                                        )
                                    )
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "table",
                                        { className: "table table-print-dashed" },
                                        React.createElement(
                                            "thead",
                                            null,
                                            React.createElement(
                                                "tr",
                                                null,
                                                React.createElement(
                                                    "th",
                                                    null,
                                                    "Item"
                                                ),
                                                React.createElement(
                                                    "th",
                                                    null,
                                                    "Qty"
                                                ),
                                                React.createElement(
                                                    "th",
                                                    null,
                                                    "Unit P."
                                                ),
                                                React.createElement(
                                                    "th",
                                                    null,
                                                    "Total P."
                                                ),
                                                React.createElement("th", null)
                                            )
                                        ),
                                        React.createElement(
                                            "tbody",
                                            null,
                                            this.state.selectedItems.map(function (item, index) {
                                                return React.createElement(
                                                    "tr",
                                                    null,
                                                    React.createElement(
                                                        "td",
                                                        null,
                                                        item.name
                                                    ),
                                                    React.createElement(
                                                        "td",
                                                        null,
                                                        React.createElement("input", { type: "number", data: index, className: "form-control", style: { width: "70px", paddingTop: "0.2em", paddingBottom: "0.2em" }, defaultValue: item.qty, min: "1", onChange: _this2.handleQtyChange })
                                                    ),
                                                    React.createElement(
                                                        "td",
                                                        null,
                                                        item.unit_price,
                                                        " ",
                                                        _this2.state.settings.currency.symbol
                                                    ),
                                                    React.createElement(
                                                        "td",
                                                        null,
                                                        item.total_price,
                                                        " ",
                                                        _this2.state.settings.currency.symbol
                                                    ),
                                                    React.createElement(
                                                        "td",
                                                        { style: { paddingTop: "0.7rem" } },
                                                        React.createElement(
                                                            "a",
                                                            { data: item.name, href: "#" },
                                                            React.createElement("i", { data: item.name, onClick: _this2.removeItemFromModal, className: "fa fa-times" })
                                                        )
                                                    )
                                                );
                                            })
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-footer" },
                                React.createElement(
                                    "div",
                                    { className: "col text-start text-uppercase" },
                                    "amount due ",
                                    React.createElement(
                                        "span",
                                        { className: "fw-bold" },
                                        " ",
                                        this.state.receiptTotal
                                    ),
                                    " ",
                                    this.state.settings.currency.symbol
                                ),
                                React.createElement(
                                    "div",
                                    { className: "col text-end" },
                                    React.createElement(
                                        "button",
                                        { type: "button", className: "btn btn-default text-black text-center", onClick: this.saveAndPrint },
                                        "Enregistrer"
                                    )
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "container-fluid print-ui" },
                    React.createElement(
                        "div",
                        { className: "row" },
                        React.createElement(
                            "div",
                            { className: "col text-start" },
                            this.state.receiptToPrint.creationDate
                        ),
                        React.createElement(
                            "div",
                            { className: "col text-end fw-bold text-capitalize" },
                            "receipt n\xB0: ",
                            this.state.receiptToPrint.number
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row text-center mt-2" },
                        React.createElement(
                            "div",
                            { className: "col" },
                            React.createElement("img", { src: "img/logo.svg", height: "28" })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row text-center mt-3" },
                        React.createElement(
                            "div",
                            { className: "col" },
                            React.createElement(
                                "p",
                                { className: "m-0" },
                                this.state.settings.companyAddress
                            ),
                            React.createElement(
                                "p",
                                { className: "m-0" },
                                this.state.settings.companyId
                            ),
                            React.createElement(
                                "p",
                                { className: "m-0" },
                                this.state.settings.companyTel
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row text-center mt-3" },
                        React.createElement(
                            "table",
                            { className: "table table-print-dashed" },
                            React.createElement(
                                "thead",
                                null,
                                React.createElement(
                                    "tr",
                                    null,
                                    React.createElement(
                                        "th",
                                        null,
                                        "Item"
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Qty"
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Unit P."
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Total P."
                                    )
                                )
                            ),
                            React.createElement(
                                "tbody",
                                null,
                                this.state.receiptToPrint.items.map(function (item) {
                                    return React.createElement(
                                        "tr",
                                        null,
                                        React.createElement(
                                            "td",
                                            null,
                                            item.name
                                        ),
                                        React.createElement(
                                            "td",
                                            null,
                                            item.qty
                                        ),
                                        React.createElement(
                                            "td",
                                            null,
                                            item.unit_price,
                                            " ",
                                            _this2.state.settings.currency.symbol
                                        ),
                                        React.createElement(
                                            "td",
                                            null,
                                            item.total_price,
                                            " ",
                                            _this2.state.settings.currency.symbol
                                        )
                                    );
                                })
                            ),
                            React.createElement(
                                "tfoot",
                                null,
                                React.createElement(
                                    "tr",
                                    null,
                                    React.createElement(
                                        "td",
                                        { colSpan: "3", className: "text-end", style: { borderBottom: "none" } },
                                        "TOTAL"
                                    ),
                                    React.createElement(
                                        "td",
                                        { style: { borderBottom: "none" } },
                                        this.state.receiptToPrint.amount,
                                        " ",
                                        this.state.settings.currency.symbol
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row text-center mt-3" },
                        React.createElement(
                            "div",
                            { className: "col" },
                            React.createElement(
                                "p",
                                { className: "m-0 text-uppercase" },
                                "TOTAL: ",
                                this.state.receiptToPrint.amount,
                                " ",
                                this.state.settings.currency.symbol
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row text-center mt-3" },
                        React.createElement(
                            "div",
                            { className: "col" },
                            React.createElement("svg", { id: "barcode" }),
                            React.createElement(
                                "p",
                                null,
                                this.state.receiptToPrint.number
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row text-center mt-1" },
                        React.createElement(
                            "div",
                            { className: "col" },
                            React.createElement(
                                "small",
                                null,
                                "2022 - 2023"
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "container fixed-top default-ui", style: { backgroundColor: '#fbf6f0' } },
                    React.createElement(
                        "div",
                        { className: "row mb-3" },
                        React.createElement(
                            "div",
                            { className: "col-3 p-2 col-lg-2 pt-3" },
                            " ",
                            React.createElement("img", { src: "img/logo.svg", alt: "", height: "20" })
                        ),
                        React.createElement(
                            "div",
                            { className: "col-5 col-lg-8 pt-2" },
                            React.createElement("input", { type: "search", className: "form-control", placeholder: "search by number...", onKeyUp: this.searchReceipt })
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 col-lg-1 text-right pt-2 pr-0" },
                            React.createElement(
                                "button",
                                { style: { width: "100%" }, className: "btn btn-default text-black text-center",
                                    onClick: this.showReceiptModal },
                                "New"
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 col-lg-1 text-right pt-2 pr-0" },
                            React.createElement(
                                "button",
                                { style: { width: "100%" }, className: "btn btn-secondary text-black text-center",
                                    onClick: this.showCloseModal },
                                "Close"
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row" },
                        React.createElement("div", { className: "col-6 text-start" }),
                        React.createElement(
                            "div",
                            { className: "col-6 text-end pr-2" },
                            this.state.currPageItemStart,
                            " - ",
                            this.state.currPageItemEnd,
                            " / ",
                            this.state.totalPageCount,
                            React.createElement(
                                "a",
                                { href: "#", className: "ms-2 text-decoration-none text-secondary ml-2 mr-2", onClick: this.pageBackward },
                                React.createElement("i", { className: "fa fa-angle-left" })
                            ),
                            React.createElement(
                                "a",
                                { href: "#", className: "ms-2 text-decoration-none text-secondary", onClick: this.pageForward },
                                React.createElement("i", { className: "fa fa-angle-right" })
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row" },
                        React.createElement(
                            "div",
                            { className: "col-1 text-left bg-dark text-white p-1" },
                            "#"
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 text-left  bg-dark text-white p-1" },
                            "Date"
                        ),
                        React.createElement(
                            "div",
                            { className: "col-5 text-left  bg-dark text-white p-1" },
                            "Items"
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 text-right  bg-dark  text-white p-1" },
                            "Amount paid"
                        ),
                        React.createElement("div", { className: "col-1 text-left  bg-dark text-white p-1" }),
                        React.createElement("div", { className: "col-1 text-left  bg-dark text-white p-1" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "container default-ui", style: { marginTop: '7.5em' } },
                    this.state.receipts.map(function (receipt, index) {
                        return React.createElement(
                            "div",
                            { className: "row", style: { borderBottom: '1px dashed black' } },
                            React.createElement(
                                "div",
                                { className: "col-1 text-left p-1" },
                                receipt.number
                            ),
                            React.createElement(
                                "div",
                                { className: "col-2 text-left p-1" },
                                receipt.creationDate
                            ),
                            React.createElement(
                                "div",
                                { className: "col-5 text-left p-1" },
                                receipt.menu
                            ),
                            React.createElement(
                                "div",
                                { className: "col-2 text-right p-1" },
                                receipt.amount,
                                " ",
                                _this2.state.settings.currency.symbol
                            ),
                            React.createElement(
                                "div",
                                { className: "col-1 text-right p-2" },
                                React.createElement(
                                    "a",
                                    { href: "#", data: index, onClick: _this2.printReceipt },
                                    React.createElement("i", { data: index, className: "fa fa-print" })
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "col-1 text-center p-2" },
                                React.createElement(
                                    "a",
                                    { href: "#", data: receipt.number, onClick: _this2.removeReceipt },
                                    React.createElement("i", { data: receipt.number, className: "fa fa-times" })
                                )
                            )
                        );
                    })
                )
            );
        }
    }]);

    return PosScreen;
}(React.Component);