import React from "react";
import ProductLine from "./functionManage/productLine"
import CreateAccount from "./functionManage/account/createAccount"
import ManageAccount from "./functionManage/account/manageAccount/manageAccount"
import FollowProduct from "./functionManage/followProduct"
import Statistical from "./functionManage/statistical";
import Profile from "./functionManage/account/manageAccount/profile"
import InforAccount from "../../general/informationAccount/inforAccount"
import ChangeEmail from "../../general/informationAccount/changeInforAccount/changeEmail"
import ChangePassword from "../../general/informationAccount/changeInforAccount/changePassword"

class DivContainer extends React.Component {

    /*
      UI của ban quản lý:
      <FunctionManage> được truyền vào 1 tham số để xác định xem sẽ hiển thị ra content gì (content này tương ứng với
        mục gì đang được chọn trên thanh menu) và 1 hàm để thay đổi giá trị của tham số đó
    */
    render() {
        return(
            <div className="container">
                <header></header>
                <main>
                    <FunctionManage typeFunction={this.props.typeFunc} changeType={this.props.changeTypeFunc} id={this.props.id}/>
                </main>
                <footer></footer>
            </div>
        )
    }
}

/*
    Lựa chọn component sẽ hiện thị thông qua tham số mà component khác truyền vào cho nó        
*/
class FunctionManage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userName: ''
        }
        this.changeUserName = this.changeUserName.bind(this);
    }

    changeUserName(id) {
        this.setState({
            userName: id
        })
    }

    render() {
        var type = this.props.typeFunction;

        switch(type) {
            case "Dòng sản phẩm": return <ProductLine id={this.props.id}/>
            case "Cấp tài khoản": return <CreateAccount id={this.props.id}/>
            // Truyền vào 1 function là changeType, function này nhận đc từ cha là DivContainer
            case "Quản lý": return <ManageAccount changeTypeProfile={this.props.changeType} id={this.props.id}
                changeUserName={this.changeUserName}/>
            case "Theo dõi": return <FollowProduct id={this.props.id}/>
            case "Thống kê": return <Statistical id={this.props.id}/>
            case "Xem": return <Profile userName={this.state.userName} changeTypeProfile={this.props.changeType}/>
            case "Thay đổi email": return <ChangeEmail id={this.props.id}/>
            case "Thay đổi mật khẩu": return <ChangePassword id={this.props.id}/>
            default: return <InforAccount id={this.props.id}/>
        }
    }
}

export default DivContainer