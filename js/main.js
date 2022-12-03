window.localStorage.setItem('currencyEnabled', true);
var scId = "sales";
var changeScreen = function changeScreen(screenId) {
    this.scId = screenId;
    var content = document.getElementById("content");
    switch (screenId) {
        case "pos":
            ReactDOM.render(React.createElement(
                React.StrictMode,
                null,
                React.createElement(PosScreen, null)
            ), content);
            break;
        case "sales":
            ReactDOM.render(React.createElement(
                React.StrictMode,
                null,
                React.createElement(SalesScreen, null)
            ), content);
            break;
        case "items":
            ReactDOM.render(React.createElement(
                React.StrictMode,
                null,
                React.createElement(ItemsScreen, null)
            ), content);
            break;
        case "settings":
            ReactDOM.render(React.createElement(React.StrictMode, null, React.createElement(SettingsScreen, null)), content);
            break;
    }

    var activeMenu = document.querySelector("a.nav-link.active");
    activeMenu.classList.remove("active");
    var menu = document.getElementById(screenId + "-menu");
    menu.classList.add("active");
};

ReactDOM.render(React.createElement(
    React.StrictMode,
    null,
    React.createElement(PosScreen, null)
), content);