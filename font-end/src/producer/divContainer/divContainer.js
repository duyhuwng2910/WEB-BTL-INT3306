import React from "react"
import Storage from "./functionProducer/storage/storage"
import ImportProductBatch from "./functionProducer/storage/importProductBatch"
import Message from "./functionProducer/defectiveProductFromService/message"
import Received from "./functionProducer/defectiveProductFromService/received"
import InforAccount from "../../general/informationAccount/inforAccount"
import Details from "../../general/historyDetails/details"
import PreliminaryInfor from "../../general/informationAccount/preliminaryInfor"
import CustomerInfor from "../../general/informationAccount/customerInfor"
import ExportForAgent from "./functionProducer/storage/exportForAgent"
import ProduceStatistical from "./functionProducer/statistical/produceStatistical"
import SoldStatistical from "./functionProducer/statistical/soldStatistical"
import ErrorStatistical from "./functionProducer/statistical/errorStatistical"
import OldStatistical from "./functionProducer/statistical/oldStatistical"
import ChangeEmail from "../../general/informationAccount/changeInforAccount/changeEmail"
import ChangePassword from "../../general/informationAccount/changeInforAccount/changePassword"

class DivContainer extends React.Component {

    /*
      UI của cơ sở sản xuất:
      <FunctionManage> được truyền vào 1 tham số để xác định xem sẽ hiển thị ra content gì (content này tương ứng với
        mục gì đang được chọn trên thanh menu) và 1 hàm để thay đổi giá trị của tham số đó
    */
    render() {
        return(
            <div className="container">
                <header></header>
                <main>
                    <FunctionProducer typeFunction={this.props.typeFunc} changeType={this.props.changeTypeFunc} id={this.props.id}/>
                </main>
                <footer></footer>
            </div>
        )
    }
}

/*
    Lựa chọn component sẽ hiện thị thông qua tham số mà component khác truyền vào cho nó        
*/
class FunctionProducer extends React.Component {

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
            case "Trong kho": return <Storage changeTypeProfile={this.props.changeType} 
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Xuất đi": return <ExportForAgent changeTypeProfile={this.props.changeType}
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Nhập vào kho": return <ImportProductBatch id={this.props.id}/>
            case "Thông báo": return <Message changeTypeProfile={this.props.changeType} 
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
            case "Thông tin tài khoản": return <InforAccount id={this.props.id}/>
            case "Xem": return <Details changeTypeProfile={this.props.changeType} 
                productId={this.state.productId} changeUserName={this.changeUserName} backType={this.state.backType}/>
            case "Vị trí kho": return <PreliminaryInfor userName={this.state.userName} changeTypeProfile={this.props.changeType}/>
            case "Khách hàng": return <CustomerInfor productId={this.state.productId} changeTypeProfile={this.props.changeType}/>
            case "Sản xuất": return <ProduceStatistical id={this.props.id}/>
            case "Đã bán": return <SoldStatistical id={this.props.id}/>
            case "Lỗi": return <ErrorStatistical id={this.props.id}/>
            case "Cũ": return <OldStatistical id={this.props.id}/>
            case "Thay đổi email": return <ChangeEmail id={this.props.id}/>
            case "Thay đổi mật khẩu": return <ChangePassword id={this.props.id}/>
            default: return <Received changeTypeProfile={this.props.changeType} 
                id={this.props.id} changeProductId={this.changeProductId} changeBackType={this.changeBackType}/>
        }
    }
}


export default DivContainer