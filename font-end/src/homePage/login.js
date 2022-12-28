import React from 'react';
import '../general/css/login.css';
import { Navigate } from 'react-router-dom';

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            /*
                access: xác định xem đăng nhập thành công hay chưa (false: chưa, true: thành công), khởi tạo là false
            */
            access: false
        }
        this.login = this.login.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
    }

    forgotPassword(event) {
        this.props.changeInterfaceType(event.target.innerHTML);
    }

    /*
      Kiểm tra đăng nhập, thành công thì thay đổi giá trị của state.access thành true và account đã cập nhật email thì
      chuyển state.email thành true
    */
    login(event) {
        event.preventDefault();
        var root = this;
        var arrInput = document.getElementsByTagName('input');
        var userName = arrInput[0].value;
        var password = arrInput[1].value;
        var error = document.getElementsByClassName('errLogin')[0];
        error.innerHTML = '';
        if (!userName || !password) {
            error.innerHTML = 'Bạn chưa nhập đầy đủ thông tin';
            return;
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                const data = JSON.parse(this.responseText);
                if (this.status === 200) {
                    const id = data.id;
                    root.props.changeId(id); // account id
                    var type;
                    switch(data.type) {
                        case "mg": {
                            type = '/management';
                            break;
                        }
                        case "pu": {
                            type = '/producer';
                            break;
                        }
                        case "sc": {
                            type = '/service';
                            break;
                        }
                        default: {
                            type = '/agent';
                        }
                    }
                    root.props.changeAccountType(type);
                    const cfEmail = data.verified;
                    if (!cfEmail) {
                        root.props.changeInterfaceType("Xác minh email");
                        return;
                    }
                    root.setState({
                        access: true
                    })
                } else error.innerHTML = data.errorMessage;
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/login?username=' + userName + '&password=' + password, false);
        xmlHttp.send(null);
    }

    render() {

        /*
            If để kiểm tra xem state.access là true hay false, nếu true thì nó sẽ điều hướng user đến trang chủ
        */
        if (this.state.access) return <Navigate to={this.props.accountType}/>;

        return (
            <form className='login' onSubmit={this.login}>
                {/* <div>
                    <input type='text' name='accountType' value={this.state.accountType} readOnly></input>
                    <LiTypeAccount textType={'Tài khoản ban điều hành'} valueType={'/management'} change={this.changeAccountType}/>
                    <LiTypeAccount textType={'Tài khoản cơ sở sản xuất'} valueType={'/producer'} change={this.changeAccountType}/>
                    <LiTypeAccount textType={'Tài khoản đại lý'} valueType={'/agent'} change={this.changeAccountType}/>
                    <LiTypeAccount textType={'Tài khoản trung tâm bảo hành'} valueType={'/service'} change={this.changeAccountType}/>
                </div> */}
                <div>
                    <h1>Đăng nhập</h1>
                    <input type='text' name='userName' placeholder='Tài khoản'></input>
                    <input type='password' name='password' placeholder='Mật khẩu'></input>
                    <span className='errLogin'></span>
                    <input type='submit' value='Đăng nhập'></input>
                    <a href='#!' onClick={this.forgotPassword}>Quên mật khẩu</a>
                </div>
            </form>
        );
    }
}

// class LiTypeAccount extends React.Component {

//     constructor(props) {
//         super(props);
//         this.changeType = this.changeType.bind(this);
//     }

//     /*
//         1, Xử lý event onClick vào <li> trong form đăng nhập (<li> là các thẻ có innerHTML là kiểu tài khoản đăng nhập)
//         Các steps:
//             Step 1: Khi onClick vào 1 <li> thì thẻ đó sẽ chuyển backgroundColor thành màu trắng, các <li> còn lại màu #39f
//             Step 2: update giá trị của state.account thành innerHTML của <li> vừa click
//         2, Gọi hàm change() do component cha là Login truyền vào để thay đổi state.accountType của cha
//     */
//     changeType(event) {
//         var arrLi = document.querySelectorAll("li");
//         for (var i = 0; i < arrLi.length; i++) {
//             if (arrLi[i].innerHTML === event.target.innerHTML) arrLi[i].style.backgroundColor = "white";
//             else arrLi[i].style.backgroundColor = "#39f";
//         }
//         this.props.change(this.props.valueType)
//     }

//     render() {
//         return(
//             <li onClick={this.changeType}>{this.props.textType}</li>
//         )
//     }
// }

export default Login