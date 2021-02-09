function modalOverlay(){ //Open and close modalOverlay
    document.querySelector(".modal-overlay").classList.toggle("activated")
}

/*  async function getDolarInfoAPI (){
    urlAPI = 'https://api.exchangeratesapi.io/latest?base=USD'
    const response = await fetch(urlAPI)
    const json = await response.json()

    return ({
        amount: Number(json.rates.BRL),
        date: String(json.date)
    });
} */

const LStorage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },

    setTheme(booleanValue){
        localStorage.setItem("dev.finances:theme", booleanValue)
    },

    getTheme(){
        return JSON.parse(localStorage.getItem("dev.finances:theme")) || false
    },

    /* setDolarInfo(dolarInfo){
        localStorage.setItem("dev.finances:dolarInfo", dolarInfo)
    }, */
 
}

const Transaction = {
    all:LStorage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                if(transaction.currency == "USD"){//convert USD to BRL
                    income += Utils.convertCurrency(transaction.amount)
                }
                else{
                    income += transaction.amount
                }
                return income
            }
        })
        return income
            
    },

    expenses(){
        let expense = 0;

        Transaction.all.forEach(transaction =>{
            if(transaction.amount < 0){
                if(transaction.currency === "USD"){//convert USD to BRL
                    expense += Utils.convertCurrency(transaction.amount)
                }
                else{
                    expense += transaction.amount
                }
                return expense
            }
        })

        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    }

}

const DOM = {

    transactionContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index){
        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    addFooterInfo(){
        const footer = document.querySelector("footer div#info")
        footer.innerHTML = DOM.footerInfo()
    },
    
    innerHTMLTransaction(transaction, index){//functions to add td on DOM
        let info = ""
        let brlInfoHTML = ""
        let checkClass = transaction.amount < 0 ? 'expense' : 'income'
        function smallInfo(){
            if(transaction.currency === "USD"){
                return brlInfoHTML = `
                <small>${Utils.formatCurrencyBrl(Utils.convertCurrency(transaction.amount))}</small>
                `
            }
            else return ""
            
        }
        const html = `
            <td class="description">${transaction.description}</td>
            <td class ="${checkClass} amount">${Utils.getCurrencyFormat(transaction.currency, transaction.amount)} ${smallInfo()}</td>
            <td class ="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" style="cursor: pointer;" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalanceBrl(){
        document.querySelector("#income-display").innerHTML = Utils.formatCurrencyBrl(Transaction.incomes())
        document.querySelector("#expense-display").innerHTML = Utils.formatCurrencyBrl(Transaction.expenses())
        document.querySelector("#total-display").innerHTML = Utils.formatCurrencyBrl(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionContainer.innerHTML = ""
    },

    toggleDarkTheme(saveIfTrue){
        document.querySelector("body.dark-theme").classList.toggle("on")        
        document.querySelector("main.container section.dark-theme").classList.toggle("on")        
        document.querySelector("#data-table").classList.toggle("on")
        document.querySelector("#select-currency .dark-theme").classList.toggle("on")       
        document.querySelector("div.modal-overlay div.dark-theme").classList.toggle("on")        
        document.querySelector("footer.dark-theme").classList.toggle("on")
        
        if(saveIfTrue === true){
            DOM.saveTheme()
        }
    },

    saveTheme(){
        if(document.querySelector(".toggle").checked){
            LStorage.setTheme(true)
        }
        else{
            LStorage.setTheme(false)
        }
    },

    getInitialTheme(){
        if(LStorage.getTheme() == true){
            DOM.toggleDarkTheme(false)
            document.querySelector(".toggle").checked = true
        }
    },

    footerInfo(){
        const html = `
            <small class="footer currency">1 USD = ${Utils.dolarInfo.amount.toFixed(3)} BRL</small>
            <br>
            <small>Atualizado ${Utils.formatDate(Utils.dolarInfo.date)}</small>
        `
        return html
    }
}

const Utils = {
    dolarInfo: {
        amount:5.4016632017,
        date: "2021-02-08"
    },

    formatAmount(value){
        value = Number(value) * 100
        return value
    },

    formatDate(value){
        const splittedDate = value.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    
    formatDescription(value){
        value = value.toLowerCase()
        return value
    },

    getCurrencyFormat(value, amount){//Check currency from transaction
        if(value == "USD"){ 
            return Utils.formatCurrencyUsd(amount)
        }
        else{
            return Utils.formatCurrencyBrl(amount)
        }
    },

    formatCurrencyBrl(value){//Format to BRL
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatCurrencyUsd(value){//format to USD
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "USD"
        })

        return signal + value
    },

    convertCurrency(usdAmount){//Return USD to BRL with only 2 decimals
        Array.prototype.insert = function ( index, item ) {
            this.splice( index, 0, item )
            return this
        }
        
        let brl = Utils.dolarInfo.amount
        let length = String(usdAmount).length

        length = Number(length) - 2
        
        usdAmount = [...String(usdAmount)]

        usdAmount = usdAmount.insert(length, ".")

        usdAmount = Array(usdAmount).toString().replace(/,/g, "")

        usdAmount = Number(usdAmount * brl).toFixed(2)

        usdAmount = String(usdAmount).replace(".", "")

        return Number(usdAmount)
    }

}  

const Form = {
    description: document.querySelector("input#description"),
    currency: document.querySelector("select.currencys"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return {
            description: Form.description.value,
            currency: Form.currency.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Preencha todos os campos!")
        }
    },

    formatValues(){
        let { description, amount, date, currency} = Form.getValues()
        description = Utils.formatDescription(description)
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return{
            description,
            currency,
            amount,
            date
        }
    },

    saveTransaction(value){
        Transaction.add(value)
    },
    
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    placeholderCurrencyChanger(){
        const placeholder = document.querySelector("input#amount")

        if(document.querySelector("select.currencys option#brl-option").selected){
            placeholder.placeholder = "R$"
        }
        else{
            placeholder.placeholder ="US$"
        }
    },
    
    submit(event){//when the user clicks on "salvar" button on forms page
        event.preventDefault()

        try {
            Form.validateFields()//check if any field is empty
            const transactionData = Form.formatValues()
            Form.saveTransaction(transactionData)//send data to LocalStorage
            Form.clearFields()//clear fields after submit
            modalOverlay()//close modal
            
            
        } catch (error) {
            alert(error.message)
            
        }

    }

}


const App = {
    init(){
        
        Transaction.all.forEach((transaction, index) =>{
            DOM.addTransaction(transaction, index)
        })

        LStorage.set(Transaction.all)

        DOM.getInitialTheme()
        
        DOM.updateBalanceBrl()
    },

    reload(){
        DOM.getInitialTheme()
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
DOM.addFooterInfo()
