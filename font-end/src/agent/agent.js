import React, { Fragment } from "react"
import DivContainer from "./divContainer/divContainer"
import MenuAgent from "./menuAgent/menuAgent"

class Agent extends React.Component {
    constructor(props) {
        super(props);
        /*
            typeFunction: để xác định UI sẽ hiển thị mục nào trong menu
            arrProduct: use để storage truyền danh sách sản phẩm đc chọn từ trong kho vào customerInput
        */
        this.state = {
            typeFunction: "Sản phẩm mới về",
            arrProduct: []
        }
        this.changeTypeFunction = this.changeTypeFunction.bind(this);
        this.productsSellForCustomer = this.productsSellForCustomer.bind(this);
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
        Thay đổi giá trị của state.arrProduct
    */
    productsSellForCustomer(arr) {
        this.setState({
            arrProduct: arr
        })
    }

    /*
      Trang UI của đại lý gồm:
        + 1 div container chứa all information của trang, nó đc truyền vào 1 tham số để thay đổi UI hiển thị
         tùy theo user chọn mục nào trong menu và 1 hàm (hàm này use để thay đổi tham số)
        + 1 menu chung cho ban quản lý, nó đc truyền vào 1 hàm (hàm này use để thay đổi tham số)
        Note: hàm truyền vào trong <div> và menu là chung và nó là changetypeFunction()
    */
    render() {
        return(
            <Fragment>
                <DivContainer typeFunc={this.state.typeFunction} arrProduct={this.state.arrProduct}
                changeTypeFunc={this.changeTypeFunction} changeProducts={this.productsSellForCustomer} id={this.props.id}/>
                <MenuAgent changeTypeFunc={this.changeTypeFunction}/>
            </Fragment>
        )
    }
}

export default Agent