var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ItemsScreen = function (_React$Component) {
    _inherits(ItemsScreen, _React$Component);

    function ItemsScreen(props) {
        _classCallCheck(this, ItemsScreen);

        var _this = _possibleConstructorReturn(this, (ItemsScreen.__proto__ || Object.getPrototypeOf(ItemsScreen)).call(this, props));

        _this.showNewModal = function (event) {
            var obj = document.getElementById('itemModalError');
            obj.classList.replace('d-block', 'd-none');
            _this.newModal = new bootstrap.Modal(document.getElementById('newItemModal'), {
                keyboard: false
            });
            _this.newModal.show();
        };

        _this.pageBackward = function () {
            if (_this.searchCriteria == "") {
                var limit = _this.limit;
                if (_this.offset - limit > 0) _this.offset = _this.offset - limit;else _this.offset = 0;
                _this.state.currPageItemStart = _this.offset + 1;
                _this.state.currPageItemEnd = _this.state.currPageItemStart + limit;
                if (_this.state.currPageItemEnd > _this.state.totalPageCount) _this.state.currPageItemEnd = _this.state.totalPageCount;
                var context = _this;
                window.sqldb.getItems(_this.limit, _this.offset).then(function (data) {
                    context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
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
                    window.sqldb.getItems(_this.limit, _this.offset).then(function (data) {
                        context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
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
            var context = _this;
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
            window.sqldb.getItems(_this.limit, 0).then(function (data) {
                context.state.totalPageCount = data.count;
                var limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                window.localStorage.setItem('currencyEnabled', data.items.length == 0);
                context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount, settings: settings });
            });
        };

        _this.searchItem = function (event) {
            var context = _this;
            _this.searchCriteria = event.target.value.trim();
            if (event.target.value.trim() == "") {
                window.sqldb.getItems(_this.limit, _this.state.currPageItemStart - 1).then(function (data) {
                    context.state.currPageItemStart = 1;
                    context.currentReceiptSeq = data.maxSeq + 1;
                    context.state.totalPageCount = data.count;
                    var limit = context.limit;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;
                    context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            } else {
                window.sqldb.getItems(_this.limit, 0).then(function (data) {
                    context.state.totalPageCount = data.count;
                    var limit = context.limit;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;
                    context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
                window.sqldb.getSearchItems(event.target.value, _this.limit, 0).then(function (data) {
                    context.state.currPageItemStart = 1;
                    context.currentReceiptSeq = data.maxSeq + 1;
                    context.state.totalPageCount = data.count;
                    var limit = context.limit;
                    this.offset = 0;
                    if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                    context.state.currPageItemEnd = limit;
                    context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                });
            }
        };

        _this.removeItem = function (event) {
            var context = _this;
            window.sqldb.deleteItem(event.target.getAttribute("data"));
            window.sqldb.getItems(context.limit, 0).then(function (data) {
                context.state.totalPageCount = data.count;
                var limit = context.limit;
                if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                context.state.currPageItemEnd = limit;
                context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
            });
        };

        _this.addItem = function () {
            var obj = document.getElementById('itemModalError');
            obj.classList.replace('d-block', 'd-none');
            var item = {};
            item.name = document.getElementById('itemName').value;
            item.unit_price = document.getElementById('itemPrice').value;
            item.unit_price = item.unit_price ? item.unit_price : 0;
            var context = _this;
            window.sqldb.newItem(item).then(function (result) {
                if (result.error) {
                    var _obj = document.getElementById('itemModalError');
                    _obj.classList.replace('d-none', 'd-block');
                    document.getElementById('itemModalError').textContent = result.message;
                } else {
                    window.sqldb.getItems(context.limit, 0).then(function (data) {
                        context.newModal.hide();
                        context.state.totalPageCount = data.count;
                        var limit = context.limit;
                        if (limit > context.state.totalPageCount) limit = context.state.totalPageCount;
                        context.state.currPageItemEnd = limit;
                        context.setState({ items: data.items, currPageItemStart: context.state.currPageItemStart, currPageItemEnd: context.state.currPageItemEnd, totalPageCount: context.state.totalPageCount });
                    });
                }
            });
        };

        _this.state = {
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
                currency: { name: "USD", symbol: "$" }
            }
        };
        _this.newModal = null;
        _this.currentReceiptSeq = 1;
        _this.offset = 0;
        _this.limit = 10;
        _this.searchCriteria = "";
        return _this;
    }

    _createClass(ItemsScreen, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "modal fade d-print-none", id: "newItemModal", tabIndex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true" },
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
                                    "New Item"
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-body" },
                                React.createElement("div", { className: "alert alert-danger d-none", id: "itemModalError" }),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "Name"
                                    ),
                                    React.createElement("input", { type: "text", className: "form-control", id: "itemName" })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "Price"
                                    ),
                                    React.createElement("input", { type: "number", min: "0", defaultValue: "0", "class": "form-control", id: "itemPrice" })
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "modal-footer" },
                                React.createElement(
                                    "button",
                                    { type: "button", className: "btn btn-default text-black text-center form-control", onClick: this.addItem },
                                    "valider"
                                )
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
                            React.createElement("input", { type: "search", className: "form-control", placeholder: "search by number...", onKeyUp: this.searchItem })
                        ),
                        React.createElement(
                            "div",
                            { className: "col-2 col-lg-1 text-right pt-2 pr-0" },
                            React.createElement(
                                "button",
                                { style: { width: "100%" }, className: "btn btn-default text-black text-center",
                                    onClick: this.showNewModal },
                                "New"
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
                            { className: "col text-left  bg-dark text-white p-1" },
                            "Name"
                        ),
                        React.createElement(
                            "div",
                            { className: "col text-left  bg-dark text-white p-1" },
                            "Price"
                        ),
                        React.createElement("div", { className: "col text-right  bg-dark  text-white p-1" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "container default-ui", style: { marginTop: '7.5em' } },
                    this.state.items.map(function (item, index) {
                        return React.createElement(
                            "div",
                            { className: "row", style: { borderBottom: '1px dashed black' } },
                            React.createElement(
                                "div",
                                { className: "col text-left p-1" },
                                item.name
                            ),
                            React.createElement(
                                "div",
                                { className: "col text-left p-1" },
                                item.unit_price,
                                " ",
                                _this2.state.settings.currency.symbol
                            ),
                            React.createElement(
                                "div",
                                { className: "col text-center p-2" },
                                React.createElement(
                                    "a",
                                    { href: "#", data: item.name, onClick: _this2.removeItem },
                                    React.createElement("i", { data: item.name, className: "fa fa-times" })
                                )
                            )
                        );
                    })
                )
            );
        }
    }]);

    return ItemsScreen;
}(React.Component);