class SettingsScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            disableButton:true,
            settings:{
                currency: { name:"USD",symbol:"$"}
            }
        };  
        
        this.currencies = [
            { name:"USD",symbol:"$"},
            { name:"EUR",symbol:"€"},
            { name:"GBP",symbol:"£"}
        ];

        this.currencyEnabled = window.localStorage.getItem('currencyEnabled')?true:false;
    }

    saveSettings = (event)=>{
        if(this.currencyEnabled){
            const currencyList = document.getElementById('currency');
            const currency = currencyList.options[currencyList.selectedIndex].value;
            window.localStorage.setItem('currency',currency);
        }
        window.localStorage.setItem('companyName',document.getElementById('companyName').value);
        window.localStorage.setItem('companyAddress',document.getElementById('companyAddress').value);
        window.localStorage.setItem('companyId',document.getElementById('companyId').value);
        window.localStorage.setItem('companyTel',document.getElementById('companyTel').value);
        this.setState({disableButton:true});
    }

    handleInputChange = () =>{
        this.setState({disableButton:false});
    }

    componentDidMount = ()=>{
        const settings = {};
        const currency={}
        currency.name = window.localStorage.getItem('currencyName');
        currency.symbol = window.localStorage.getItem('currencySymbol');
        settings.currency = currency;
        settings.companyName = window.localStorage.getItem('companyName');
        settings.companyAddress = window.localStorage.getItem('companyAddress');
        settings.companyId = window.localStorage.getItem('companyId');
        settings.companyTel = window.localStorage.getItem('companyTel');        
        this.setState({settings:settings});
    }
    render(){
        return (
            <div>
                <div className="container" style={{backgroundColor: '#fbf6f0'}}>
                    <div className="row mb-3 mt-4">
                        <div style={{margin:'0 auto',width:"40%"}}>
                            <form action="">
                                <div className="mb-3 text-center"> 
                                    <img src="img/logo.svg" alt="" height="24"/>
                                </div>
                                <div className="mb-3">
                                
                                    <label htmlFor="">Currency</label>
                                    {
                                        this.currencyEnabled ? ( 
                                            <select className="form-control" id="currency">
                                                 {
                                                     this.currencies.map((currency,index)=>(
                                                         <option value={index}>{currency.name}</option>
                                                     ))
                                                 }
                                            </select>                                       
                                        ):( <input type="text" className="form-control" defaultValue={this.state.settings.currency.name}  id="currency" disabled/>)
                                    }                                   
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="">Company Name</label>
                                    <input type="text" className="form-control" defaultValue={this.state.settings.companyName} id="companyName" onKeyUp={this.handleInputChange}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="">Adress</label>
                                    <input type="text" className="form-control" defaultValue={this.state.settings.companyAddress} id="companyAddress" onKeyUp={this.handleInputChange}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="">ID Number</label>
                                    <input type="text" className="form-control" defaultValue={this.state.settings.companyId} id="companyId" onKeyUp={this.handleInputChange}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="">Phone</label>
                                    <input type="text" className="form-control" defaultValue={this.state.settings.companyTel} id="companyTel" onKeyUp={this.handleInputChange} />
                                </div>
                                <div className="mb-3 row">                                   
                                   <div className="col">
                                        <button className="btn btn-success form-control" disabled={this.state.disableButton} onClick={this.saveSettings}>Save</button>
                                   </div>
                                </div>
                            </form>
                        </div>                        
                    </div>                    
                </div>
        </div>
       );
    }
}