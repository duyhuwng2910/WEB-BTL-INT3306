import React, { Fragment } from "react";
import { Navigate } from 'react-router-dom';

class ConfirmEmail extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            confirm: false
        }
        this.enterEmail = this.enterEmail.bind(this);
        this.enterOtp = this.enterOtp.bind(this);
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
        xmlHttp.open('POST', 'http://localhost:8000/auth/confirm_email', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_user=' + this.props.id
            + '&email=' + email
        )
    }

    enterOtp(event) {
        event.preventDefault();
        var otp = document.getElementById('otp').value;
        var error = document.getElementsByClassName('errLogin')[1];
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
                        confirm: true
                    })
                } else error.innerHTML = 'Mã OTP không chính xác'
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/auth/regit_email', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_user=' + this.props.id
            + '&otp=' + otp
        )
    }

    render() {

        if (this.state.confirm) return <Navigate to={this.props.accountType}/>;

        return (
            <Fragment>
                <form className='login' onSubmit={this.enterEmail}>
                    <div>
                        <h1>Xác minh email</h1>
                        <input type='text' id='email' placeholder='Nhập email'></input>
                        <span className='errLogin'></span>
                        <input type='submit' value='Tiếp theo'></input>
                        <a href='#!' onClick={this.login}>Đăng nhập</a>
                    </div>
                </form>
                <form className='login' onSubmit={this.enterOtp}>
                    <div>
                        <h1>Xác minh email</h1>
                        <input type='text' id='otp' placeholder='Nhập mã OTP'></input>
                        <span className='errLogin'></span>
                        <input type='submit' value='Nhập'></input>
                        <a href='#!' onClick={this.login}>Đăng nhập</a>
                    </div>
                </form>
            </Fragment>
        );
    }
}

export default ConfirmEmail