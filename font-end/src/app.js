import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./homePage/home"
import Management from "./management/management"
import Producer from "./producer/producer"
import Service from "./service/service"
import Agent from "./agent/agent"

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            /*
                id: account id 
            */
            id: "none"
        }
        this.changeId = this.changeId.bind(this);
    }

    changeId(event) {
        this.setState({
            id: event
        })
    }

    render() {
        return (
            <Routes>
                <Route path="/" element={<Home changeId={this.changeId} id={this.state.id}/>} />
                <Route path="/management/*" element={<Management id={this.state.id}/>} />
                <Route path="/producer/*" element={<Producer id={this.state.id}/>} />
                <Route path="/service/*" element={<Service id={this.state.id}/>} />
                <Route path="/agent/*" element={<Agent id={this.state.id}/>} />
            </Routes>
        )
    }
}

export default App