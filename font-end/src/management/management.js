import React, { Fragment } from 'react'
import MenuManage from './menuManage/menuManage'
import DivContainer from './divContainer/divContainer'
import '../general/css/manage.css'
import '../general/css/menu.css'
import '../general/css/general.css'

class Management extends React.Component {
    
    constructor(props) {
        super(props);
        /*
            typeFunction: để xác định UI sẽ hiển thị mục nào trong menu
        */
        this.state = {
            typeFunction: "Dòng sản phẩm"
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
      Trang UI của ban điều hành công ty BigCorp gồm:
        + 1 div container chứa all information của trang, nó đc truyền vào 1 tham số để thay đổi UI hiển thị
         tùy theo user chọn mục nào trong menu và 1 hàm (hàm này use để thay đổi tham số)
        + 1 menu chung cho ban quản lý, nó đc truyền vào 1 hàm (hàm này use để thay đổi tham số)
        Note: hàm truyền vào trong <div> và menu là chung và nó là changetypeFunction()
    */
    render() {
        return(
            <Fragment>
                <DivContainer typeFunc={this.state.typeFunction} changeTypeFunc={this.changeTypeFunction} id={this.props.id}/>
                <MenuManage changeTypeFunc={this.changeTypeFunction}/>
            </Fragment>
        )
    }
}

export default Management