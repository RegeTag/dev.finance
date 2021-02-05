function modalOverlay(){ //Open and close modalOverlay
    document.querySelector(".modal-overlay").classList.toggle("activated")

}

const LStorage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {//functions to update balance cards
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

        Transaction.all.forEach(transaction =>{
            if(transaction.amount > 0){
                income += transaction.amount
            }
            else return 0
        })


        return income
    },

    expenses(){
        let expense = 0;

        Transaction.all.forEach(transaction =>{
            if(transaction.amount < 0){
                expense += transaction.amount
            }
            else return 0
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
    
    innerHTMLTransaction(transaction, index){//functions to add td on DOM

        const amount = Utils.formatCurrencyBrl(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class ="${transaction.amount < 0 ? 'expense' : 'income'}">${amount}</td>
            <td class ="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" style="cursor: pointer;" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalance(){
        document.querySelector("#income-display").innerHTML = Utils.formatCurrencyBrl(Transaction.incomes())
        document.querySelector("#expense-display").innerHTML = Utils.formatCurrencyBrl(Transaction.expenses())
        document.querySelector("#total-display").innerHTML = Utils.formatCurrencyBrl(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
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

    formatCurrencyBrl(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatCurrencyUsd(){
        console.log("hello World")
    }

}  

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date} = Form.getValues()
        description = Utils.formatDescription(description)
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return{
            description,
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
    
    submit(event){//when the user clicks on "salvar" on forms page
        event.preventDefault()

        try {
            Form.validateFields()
            const transactionData = Form.formatValues()
            Form.saveTransaction(transactionData)
            Form.clearFields()
            modalOverlay()
            
            
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
        
        DOM.updateBalance()
    },

    reload(){

        DOM.clearTransactions()
        App.init()
    }
}

App.init()