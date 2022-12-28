import React, { Fragment } from "react";

class ForgotPass extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: 'none'
        }
        this.enterEmail = this.enterEmail.bind(this);
        this.enterOtp = this.enterOtp.bind(this);
        this.enterPassword = this.enterPassword.bind(this);
        this.login = this.login.bind(this);
        this.verificationEmail = this.verificationEmail.bind(this);
    }

    verificationEmail(email) {
        var mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if(email.match(mailformat)) return true;
        else return false;
    }

    login(event) {
        this.props.changeInterfaceType(event.target.innerHTML);
    }

    enterEmail(event) {
        event.preventDefault();
        var email = document.getElementById('email').value;
        var error = document.getElementsByClassName('errLogin')[0];
        error.innerHTML = '';
        if (!email) {
            error.innerHTML = 'Bạn chưa nhập email';
            return;
        } else {
            if (!this.verificationEmail(email)) {
                error.innerHTML = 'Email không đúng định dạng';
                return;
            }
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert('Mã OTP đã được gửi đến email của bạn');
                    var formChild1 = document.getElementById('root').firstChild;
                    formChild1.style.display = 'none';
                    formChild1.nextSibling.style.display = 'block';
                } else {
                    const data = JSON.parse(this.responseText);
                    error.innerHTML = data.errorMessage;
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/auth/forget_password', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'email=' + email
        )
    }

    enterOtp(event) {
        event.preventDefault();
        var otp = document.getElementById('otp').value;
        var error = document.getElementsByClassName('errLogin')[0];
        error.innerHTML = '';
        if (!otp) {
            error.innerHTML = 'Bạn chưa nhập mã OTP';
            return;
        }
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    root.setState({
                        id: JSON.parse(this.responseText).id_user
                    })
                    var formChild2 = document.getElementById('root').firstChild.nextSibling;
                    formChild2.style.display = 'none';
                    formChild2.nextSibling.style.display = 'block';
                } else error.innerHTML = 'Mã OTP không chính xác'
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/check_passwordrc?otp=' + otp, false);
        xmlHttp.send(null)
    }

    enterPassword(event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        const repassword = document.getElementById('repassword').value;
        var error = document.getElementsByClassName('errLogin')[0];
        error.innerHTML = '';
        if (!password || !repassword) {
            error.innerHTML = 'Bạn chưa nhập đầy đủ thông tin';
            return;
        } else if (password !== repassword) {
            error.innerHTML = 'Mật khẩu nhập lại chưa chính xác';
            return;
        }
        const xmlHttp = new XMLHttpRequest();
        var root = this;
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    root.login();
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/auth/change_password', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_user=' + this.state.id
            + '&password=' + password
            + '&repassword=' + repassword
        )
    }

    render() {
        return (
            <Fragment>
                <form className='login' onSubmit={this.enterEmail}>
                    <div>
                        <h1>Tìm mật khẩu</h1>
                        <input type='text' id='email' placeholder='Nhập email để tìm lại mật khẩu'></input>
                        <span className='errLogin'></span>
                        <input type='submit' value='Tiếp theo'></input>
                        <a href='#!' onClick={this.login}>Đăng nhập</a>
                    </div>
                </form>
                <form className='login' onSubmit={this.enterOtp}>
                    <div>
                        <h1>Tìm mật khẩu</h1>
                        <input type='text' id='otp' placeholder='Nhập mã OTP'></input>
                        <span className='errLogin'></span>
                        <input type='submit' value='Tiếp theo'></input>
                        <a href='#!' onClick={this.login}>Đăng nhập</a>
                    </div>
                </form>
                <form className='login' onSubmit={this.enterPassword}>
                    <div>
                        <h1>Tìm mật khẩu</h1>
                        <input type='text' id='passowrd' placeholder='Nhập mật khẩu mới'></input>
                        <input type='text' id='repassword' placeholder='Nhập lại'></input>
                        <span className='errLogin'></span>
                        <input type='submit' value='Nhập'></input>
                        <a href='#!' onClick={this.login}>Đăng nhập</a>
                    </div>
                </form>
            </Fragment>
        );
    }
}

export default ForgotPass