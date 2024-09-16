class InMemoryStore {

    static store = { 
        cache: { 
            articles : {  } ,
            env : {}
        } 
    }

    static subscribers = []

    static publish = () => this.subscribers.map(handler => { console.log(handler);handler()})
    
    static subscribe = (handler) => this.subscribers.push(handler)
    
}

export default InMemoryStore