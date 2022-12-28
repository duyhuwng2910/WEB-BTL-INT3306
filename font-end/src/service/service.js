import React, { Fragment } from "react"
import MenuService from "./menuService/menuService"
import DivContainer from "./divContainer/divContainer";

class Service extends React.Component {
    constructor(props) {
        super(props);
        /*
            typeFunction: để xác định UI sẽ hiển thị mục nào trong menu
        */
        this.state = {
            typeFunction: "Trong kho"
        }
        this.changeTypeFunction = this.changeTypeFunction.bind(this);
    }

    /*
      Thay đổi giá trị của state.typeFunction  
    */
    changeTypeFunction(type) {
        this.setState({
            typeFunction: type
        })
    }

    /*
      Trang UI của cơ sở sản xuất gồm:
        + 1 div container chứa all information của trang, nó đc truyền vào 1 tham số để thay đổi UI hiển thị
         tùy theo user chọn mục nào trong menu và 1 hàm (hàm này use để thay đổi tham số)
        + 1 menu chung cho ban quản lý, nó đc truyền vào 1 hàm (hàm này use để thay đổi tham số)
        Note: hàm truyền vào trong <div> và menu là chung và nó là changetypeFunction()
    */
    render() {
        return(
            <Fragment>
                <DivContainer typeFunc={this.state.typeFunction} changeTypeFunc={this.changeTypeFunction} id={this.props.id}/>
                <MenuService changeTypeFunc={this.changeTypeFunction}/>
            </Fragment>
        )
    }
}

export default Service