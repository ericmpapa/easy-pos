var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SettingsScreen = function (_React$Component) {
    _inherits(SettingsScreen, _React$Component);

    function SettingsScreen(props) {
        _classCallCheck(this, SettingsScreen);

        var _this = _possibleConstructorReturn(this, (SettingsScreen.__proto__ || Object.getPrototypeOf(SettingsScreen)).call(this, props));

        _this.saveSettings = function (event) {
            if (_this.currencyEnabled) {
                var currencyList = document.getElementById('currency');
                var currency = currencyList.options[currencyList.selectedIndex].value;
                window.localStorage.setItem('currency', currency);
            }
            window.localStorage.setItem('companyName', document.getElementById('companyName').value);
            window.localStorage.setItem('companyAddress', document.getElementById('companyAddress').value);
            window.localStorage.setItem('companyId', document.getElementById('companyId').value);
            window.localStorage.setItem('companyTel', document.getElementById('companyTel').value);
            _this.setState({ disableButton: true });
        };

        _this.handleInputChange = function () {
            _this.setState({ disableButton: false });
        };

        _this.componentDidMount = function () {
            var settings = {};
            var currency = {};
            currency.name = window.localStorage.getItem('currencyName');
            currency.symbol = window.localStorage.getItem('currencySymbol');
            settings.currency = currency;
            settings.companyName = window.localStorage.getItem('companyName');
            settings.companyAddress = window.localStorage.getItem('companyAddress');
            settings.companyId = window.localStorage.getItem('companyId');
            settings.companyTel = window.localStorage.getItem('companyTel');
            _this.setState({ settings: settings });
        };

        _this.state = {
            disableButton: true,
            settings: {
                currency: { name: "USD", symbol: "$" }
            }
        };

        _this.currencies = [{ name: "USD", symbol: "$" }, { name: "EUR", symbol: "€" }, { name: "GBP", symbol: "£" }];

        _this.currencyEnabled = window.localStorage.getItem('currencyEnabled') ? true : false;
        return _this;
    }

    _createClass(SettingsScreen, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "container", style: { backgroundColor: '#fbf6f0' } },
                    React.createElement(
                        "div",
                        { className: "row mb-3 mt-4" },
                        React.createElement(
                            "div",
                            { style: { margin: '0 auto', width: "40%" } },
                            React.createElement(
                                "form",
                                { action: "" },
                                React.createElement(
                                    "div",
                                    { className: "mb-3 text-center" },
                                    React.createElement("img", { src: "img/logo.svg", alt: "", height: "24" })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "Currency"
                                    ),
                                    this.currencyEnabled ? React.createElement(
                                        "select",
                                        { className: "form-control", id: "currency" },
                                        this.currencies.map(function (currency, index) {
                                            return React.createElement(
                                                "option",
                                                { value: index },
                                                currency.name
                                            );
                                        })
                                    ) : React.createElement("input", { type: "text", className: "form-control", defaultValue: this.state.settings.currency.name, id: "currency", disabled: true })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "Company Name"
                                    ),
                                    React.createElement("input", { type: "text", className: "form-control", defaultValue: this.state.settings.companyName, id: "companyName", onKeyUp: this.handleInputChange })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "Adress"
                                    ),
                                    React.createElement("input", { type: "text", className: "form-control", defaultValue: this.state.settings.companyAddress, id: "companyAddress", onKeyUp: this.handleInputChange })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "ID Number"
                                    ),
                                    React.createElement("input", { type: "text", className: "form-control", defaultValue: this.state.settings.companyId, id: "companyId", onKeyUp: this.handleInputChange })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3" },
                                    React.createElement(
                                        "label",
                                        { htmlFor: "" },
                                        "Phone"
                                    ),
                                    React.createElement("input", { type: "text", className: "form-control", defaultValue: this.state.settings.companyTel, id: "companyTel", onKeyUp: this.handleInputChange })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "mb-3 row" },
                                    React.createElement(
                                        "div",
                                        { className: "col" },
                                        React.createElement(
                                            "button",
                                            { className: "btn btn-success form-control", disabled: this.state.disableButton, onClick: this.saveSettings },
                                            "Save"
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return SettingsScreen;
}(React.Component);