var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SalesScreen = function (_React$Component) {
    _inherits(SalesScreen, _React$Component);

    function SalesScreen(props) {
        _classCallCheck(this, SalesScreen);

        var _this = _possibleConstructorReturn(this, (SalesScreen.__proto__ || Object.getPrototypeOf(SalesScreen)).call(this, props));

        _initialiseProps.call(_this);

        _this.state = {
            receipts: [],
            items: [],
            receiptToPrint: { items: [] },
            receiptsToPrint: [],
            selectedItems: [],
            receiptTotal: 0,
            currPageItemStart: 1,
            currPageItemEnd: 1,
            totalPageCount: 1000,
            pageOffset: 100,
            settings: {
                currency: { name: "USD", symbol: "$" }
            },
            printTotal: 0,
            reportDate: ""
        };
        _this.newPrintModal = null;
        _this.currentReceiptSeq = 1;
        _this.offset = 0;
        _this.limit = 10;
        _this.searchCriteria = "";
        var date = new Date();
        _this.currDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        return _this;
    }

    _createClass(SalesScreen, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "modal fade d-print-none", id: "newPrintModal", tabIndex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true" },
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
                                    "Imprimer la situation"
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-body" },
                                React.createElement("input", { type: "date", defaultValue: this.currDate, "class": "form-control", id: "reportDate" })
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-footer" },
                                React.createElement(
                                    "button",
                                    { type: "button", className: "btn btn-default text-black text-center form-control", onClick: this.printSituation },
                                    "imprimer"
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "container-fluid print-UI", id: "sitUI" },
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "p",
                            { className: "m-0" },
                            "SITUATION MENUSUELLE"
                        ),
                        React.createElement(
                            "p",
                            { className: "m-0" },
                            "Date: ",
                            this.state.reportDate
                        )
                    ),
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "table",
                            { className: "table table-striped" },
                            React.createElement(
                                "thead",
                                null,
                                React.createElement(
                                    "tr",
                                    null,
                                    React.createElement(
                                        "th",
                                        null,
                                        "Numero"
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Date"
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Items"
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Montant pay\xE9"
                                    )
                                )
                            ),
                            React.createElement(
                                "tbody",
                                null,
                                this.state.receiptsToPrint.map(function (receipt) {
                                    return React.createElement(
                                        "tr",
                                        null,
                                        React.createElement(
                                            "td",
                                            null,
                                            receipt.number
                                        ),
                                        React.createElement(
                                            "td",
                                            null,
                                            receipt.creationDate
                                        ),
                                        React.createElement(
                                            "td",
                                            null,
                                            receipt.menu
                                        ),
                                        React.createElement(
                                            "td",
                                            null,
                                            receipt.amount,
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
                                        this.state.printTotal,
                                        " ",
                                        this.state.settings.currency.symbol
                                    )
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "container-fluid print-UI", id: "receiptUI" },
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
                            "re\xE7u n\xB0: ",
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
                                        "Qt\xE9"
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Prix U."
                                    ),
                                    React.createElement(
                                        "th",
                                        null,
                                        "Prix T."
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
                                "TOTAL A PAYER: ",
                                this.state.receiptToPrint.amount,
                                " Fc"
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
                            { className: "col-7 col-lg-9 pt-2" },
                            React.createElement("input", { type: "search", className: "form-control", placeholder: "search by number...", onKeyUp: this.searchReceipt })
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 col-lg-1 text-right pt-2 pr-0" },
                            React.createElement(
                                "button",
                                { style: { width: "100%" }, className: "btn btn-secondary text-black text-center",
                                    onClick: this.showPrintModal },
                                "Report"
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
                            "Menu"
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 text-right  bg-dark  text-white p-1" },
                            "Amount Paid"
                        ),
                        React.createElement("div", { className: "col-2 text-left  bg-dark text-white p-2" })
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
                                _this2.settings.currency.symbol
                            ),
                            React.createElement(
                                "div",
                                { className: "col-2 text-right p-2" },
                                React.createElement(
                                    "a",
                                    { href: "#", data: index, onClick: _this2.printReceipt },
                                    React.createElement("i", { data: index, className: "fa fa-print" })
                                )
                            )
                        );
                    })
                )
            );
        }
    }]);

    return SalesScreen;
}(React.Component);

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.showPrintModal = function (event) {
        _this3.newPrintModal = new bootstrap.Modal(document.getElementById('newPrintModal'), {
            keyboard: false
        });
        _this3.newPrintModal.show();
    };

    this.print = function (index) {
        var data = _this3.state.receipts[index];
        _this3.setState({ receiptToPrint: data });

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

    this.printReceipt = function (event) {
        var obj = document.getElementById('receiptUI');
        obj.classList.remove('p-none');
        obj = document.getElementById('sitUI');
        obj.classList.add('p-none');
        _this3.print(Number(event.target.getAttribute("data")));
    };

    this.printSituation = function (event) {
        var obj = document.getElementById('receiptUI');
        obj.classList.add('p-none');
        obj = document.getElementById('sitUI');
        obj.classList.remove('p-none');
        var date = new Date(document.getElementById('reportDate').value);
        var reportDate = date.getDate().toString().padStart(2, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear();
        var context = _this3;
        window.sqldb.getReceiptsByDate(reportDate).then(function (data) {
            context.setState({ receiptsToPrint: data.receipts, printTotal: data.total, reportDate: reportDate });
            context.newPrintModal.hide();
            window.print();
        });
    };

    this.pageBackward = function () {
        if (_this3.searchCriteria == "") {
            var limit = _this3.limit;
            if (_this3.offset - limit > 0) _this3.offset = _this3.offset - limit;else _this3.offset = 0;
            _this3.state.currPageItemStart = _this3.offset + 1;
            _this3.state.currPageItemEnd = _this3.state.currPageItemStart + limit;
            if (_this3.state.currPageItemEnd > _this3.state.totalPageCount) _this3.state.currPageItemEnd = _this3.state.totalPageCount;
            var context = _this3;
            window.sqldb.getReceipts(_this3.limit, _this3.offset).then(function (data) {
                context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        }
    };

    this.pageForward = function () {
        if (_this3.searchCriteria == "") {
            var limit = _this3.limit;
            if (_this3.offset + limit < _this3.state.totalPageCount) {
                _this3.offset = _this3.offset + limit;
                _this3.state.currPageItemStart = _this3.offset + 1;
                _this3.state.currPageItemEnd = _this3.state.currPageItemStart + limit;
                if (_this3.state.currPageItemEnd > _this3.state.totalPageCount) _this3.state.currPageItemEnd = _this3.state.totalPageCount;
                var context = _this3;
                window.sqldb.getReceipts(_this3.limit, _this3.offset).then(function (data) {
                    context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            }
        }
    };

    this.initPagination = function () {
        _this3.state.currPageItemStart = 1;
        var limit = _this3.limit;
        if (limit > _this3.state.totalPageCount) limit = _this3.state.totalPageCount;
        _this3.state.currPageItemEnd = limit;
        _this3.setState({ currPageItemStart: _this3.state.currPageItemStart, currPageItemEnd: _this3.state.currPageItemEnd, totalPageCount: _this3.state.totalPageCount });
    };

    this.componentDidMount = function () {
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
        var context = _this3;

        window.sqldb.getReceipts(_this3.limit, 0).then(function (data) {
            context.currentReceiptSeq = data.maxSeq + 1;
            context.state.totalPageCount = data.count;
            var limit = context.limit;
            if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
            context.state.currPageItemEnd = limit;
            window.localStorage.setItem('currencyEnabled', data.receipts.length == 0);
            context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount, settings: settings });
        });
    };

    this.searchReceipt = function (event) {
        var context = _this3;
        _this3.searchCriteria = event.target.value.trim();
        if (event.target.value.trim() == "") {
            window.sqldb.getReceipts(_this3.limit, _this3.state.currPageItemStart - 1).then(function (data) {
                context.state.currPageItemStart = 1;
                context.currentReceiptSeq = data.maxSeq + 1;
                context.state.totalPageCount = data.count;
                var limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ receipts: data.receipts, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        } else {
            window.sqldb.getSearchReceipts(Number(event.target.value), _this3.limit, 0).then(function (data) {
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
};