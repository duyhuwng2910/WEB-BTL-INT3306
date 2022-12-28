import React from "react"
import Storage from './functionAgent/storage/inStorage/storage'
import Sold from './functionAgent/storage/sold'
import Repairing from './functionAgent/storage/repairing'
import Recall from './functionAgent/storage/recall'
import NewProduct from './functionAgent/message/newProduct'
import Fixed from "./functionAgent/message/fixed"
import InforAccount from '../../general/informationAccount/inforAccount'
import Details from "../../general/historyDetails/details"
import PreliminaryInfor from "../../general/informationAccount/preliminaryInfor"
import CustomerInfor from "../../general/informationAccount/customerInfor"
import CustomerInput from "./functionAgent/storage/inStorage/customerInput"
import Fail from "./functionAgent/message/fail"
import ReturnCustomer from "./functionAgent/storage/returnCustomer"
import ReturnProducer from "./functionAgent/storage/returnProducer"
import SoldStatistical from "./functionAgent/statistical/soldStatistical"
import StatusStatistical from "./functionAgent/statistical/statusStatistical"
import ChangeEmail from "../../general/informationAccount/changeInforAccount/changeEmail"
import ChangePassword from "../../general/informationAccount/changeInforAccount/changePassword"

class DivContainer extends React.Component {


    /*
      UI của đại lý:
      <FunctionManage> được truyền vào 1 tham số để xác định xem sẽ hiển thị ra content gì (content này tương ứng với
        mục gì đang được chọn trên thanh menu) và 1 hàm để thay đổi giá trị của tham số đó
    */
    render() {
        return(
            <div className="container">
                <header></header>
                <main>
                    <FunctionAgent typeFunction={this.props.typeFunc} arrProduct={this.props.arrProduct}
                    changeType={this.props.changeTypeFunc} changeProducts={this.props.changeProducts} id={this.props.id}/>
                </main>
            </div>
        )
    }
}
    
/*
    Lựa chọn component sẽ hiện thị thông qua tham số mà component khác truyền vào cho nó        
*/
class FunctionAgent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            productId: 'none',
            userName: 'none',
            backType: 'none'
        }
        this.changeProductId = this.changeProductId.bind(this);
        this.changeUserName = this.changeUserName.bind(this);
        this.changeBackType = this.changeBackType.bind(this);
    }

    changeBackType(type) {
        this.setState({
            backType: type
        })
    }

    changeProductId(id) {
        this.setState({
            productId: id
        })
    }

    changeUserName(name) {
        this.setState({
            userName: name
        })
    }

    render() {
        var type = this.props.typeFunction;

        switch(type) {
            case "Sản phẩm mới": return <Storage changeTypeProfile={this.props.changeType} id={this.props.id}
                changeProductId={this.changeProductId} changeProducts={this.props.changeProducts}
                changeBackType={this.changeBackType}/>
            case "Đã bán": return <Sold changeTypeProfile={this.props.changeType} id={this.props.id}
                changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Trả lại cho khách hàng": return <ReturnCustomer changeTypeProfile={this.props.changeType}
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Trả lại cơ sở sản xuất": return <ReturnProducer changeTypeProfile={this.props.changeType}
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Đem đi bảo hành": return <Repairing changeTypeProfile={this.props.changeType}
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Triệu hồi": return <Recall changeTypeProfile={this.props.changeType} id={this.props.id}
                changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Sản phẩm mới về": return <NewProduct changeTypeProfile={this.props.changeType} id={this.props.id}
                changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Sản phẩm bảo hành": return <Fixed changeTypeProfile={this.props.changeType} id={this.props.id}
                changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Xem": return <Details changeTypeProfile={this.props.changeType} productId={this.state.productId}
                changeUserName={this.changeUserName} backType={this.state.backType}/>
            case "Sản phẩm lỗi": return <Fail changeTypeProfile={this.props.changeType} id={this.props.id}
                changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Vị trí kho": return <PreliminaryInfor userName={this.state.userName} changeTypeProfile={this.props.changeType}/>
            case "Khách hàng": return <CustomerInfor productId={this.state.productId} changeTypeProfile={this.props.changeType}/>
            case "Nhập thông tin khách hàng": return <CustomerInput arrProduct={this.props.arrProduct}
                changeTypeProfile={this.props.changeType}/>
            case "Nhập về": return <StatusStatistical id={this.props.id}/>
            case "Bán ra": return <SoldStatistical id={this.props.id}/>
            case "Thay đổi email": return <ChangeEmail id={this.props.id}/>
            case "Thay đổi mật khẩu": return <ChangePassword id={this.props.id}/>
            default: return <InforAccount id={this.props.id}/>
        }
    }
}

export default DivContainer