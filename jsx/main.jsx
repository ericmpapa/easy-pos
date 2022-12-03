window.localStorage.setItem('currencyEnabled',true);
let scId = "sales";
const changeScreen = function(screenId){
    this.scId = screenId;
    const content = document.getElementById("content");
    switch(screenId){
        case "pos":
            ReactDOM.render( 
                <React.StrictMode>
                    <PosScreen /> 
                </React.StrictMode>,
            content);
            break;
        case "sales":
            ReactDOM.render( 
                <React.StrictMode>
                    <SalesScreen /> 
                </React.StrictMode>,
            content);
            break;
        case "items":
            ReactDOM.render( 
                <React.StrictMode>
                    <ItemsScreen /> 
                </React.StrictMode>,
            content);
            break;
        case "settings":
            ReactDOM.render(React.createElement(
                React.StrictMode,
                null,
                React.createElement(SettingsScreen, null)
            ), content);
            break;
    }
    
    const activeMenu = document.querySelector("a.nav-link.active");
    activeMenu.classList.remove("active");
    const menu  = document.getElementById(screenId+"-menu");
    menu.classList.add("active");
}

ReactDOM.render( 
    <React.StrictMode>
        <PosScreen /> 
    </React.StrictMode>,
content);