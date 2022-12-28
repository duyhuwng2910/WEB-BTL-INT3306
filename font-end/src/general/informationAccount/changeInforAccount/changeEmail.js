import React, { Fragment } from "react"

class ChangeEmail extends React.Component {

    constructor(props) {
        super(props);
        this.require = this.require.bind(this);
        this.enterOtp = this.enterOtp.bind(this);
        this.newEmail = this.newEmail.bind(this);
        this.done = this.done.bind(this);
        this.verificationEmail = this.verificationEmail.bind(this);
    }

    verificationEmail(email) {
        var mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if(email.match(mailformat)) return true;
        else return false;
    }

    require(event) {
        event.preventDefault();
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert('Mã OTP đã được gửi đến email của bạn');
                    var formChild1 = document.querySelector('main').firstChild;
                    formChild1.style.display = 'none';
                    formChild1.nextSibling.style.display = 'block';
                } else alert(this.status);
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/auth/req_change_email', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_user=' + this.props.id
        )
    }

    enterOtp(event) {
        event.preventDefault();
        var otp = document.getElementById('otp').value;
        var error = document.getElementsByClassName('errProfile')[0];
        error.innerHTML = '';
        if (!otp) {
            error.innerHTML = 'Bạn chưa nhập mã OTP';
            return;
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var formChild2 = document.querySelector('main').firstChild.nextSibling;
                    formChild2.style.display = 'none';
                    formChild2.nextSibling.style.display = 'block';
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

    newEmail(event) {
        event.preventDefault();
        var newEmail = document.getElementById('newEmail').value;
        var error = document.getElementsByClassName('errProfile')[0];
        error.innerHTML = '';
        if (!newEmail) {
            error.innerHTML = 'Bạn chưa nhập email';
            return;
        } else {
            if (!this.verificationEmail(newEmail)) {
                error.innerHTML = 'Email không đúng định dạng';
                return;
            }
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert('Mã OTP đã được gửi đến email của bạn');
                    var formChild3 = document.querySelector('main').firstChild.nextSibling.nextSibling;
                    formChild3.style.display = 'none';
                    formChild3.nextSibling.style.display = 'block';
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
            + '&email=' + newEmail
        )
    }

    done(event) {
        event.preventDefault();
        var otp = document.getElementById('otp2').value;
        var error = document.getElementsByClassName('errProfile')[0];
        error.innerHTML = '';
        if (!otp) {
            error.innerHTML = 'Bạn chưa nhập mã OTP';
            return;
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert('Thay đổi email thành công')
                    var main = document.querySelector('main');
                    main.lastChild.style.display = 'none';
                    main.firstChild.nextSibling.style.display = 'block';
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
        /*
            UI profile sơ bộ của tài khoản cho tài khoản khác xem
        */
        return(
           <Fragment>
                <form className="profile" onSubmit={this.require}>
                    <h1>Thay đổi email</h1>
                    <input type='submit' value='Gửi mã OTP'></input>
                </form>
                <form className="profile" onSubmit={this.enterOtp}>
                    <h1>Thay đổi email</h1>
    
                    <label htmlFor='otp'>Nhập mã OTP</label>
                    <input type='text' id='otp'></input>
                    <br></br>
                    <span className='errProfile'></span>
                    <input type='submit' value='Nhập'></input>
                </form>
                <form className="profile" onSubmit={this.newEmail}>
                    <h1>Thay đổi email</h1>

                    <label htmlFor='newEmail'>Nhập email mới</label>
                    <input type='text' id='newEmail'></input>
                    <br></br>
                    <span className='errProfile'></span>
                    <input type='submit' value='Nhập'></input>
                </form>
                <form className="profile" onSubmit={this.done}>
                    <h1>Thay đổi email</h1>
    
                    <label htmlFor='otp2'>Nhập mã OTP</label>
                    <input type='text' id='otp2'></input>
                    <br></br>
                    <span className='errProfile'></span>
                    <input type='submit' value='Nhập'></input>
                </form>
           </Fragment>
        )
    }
}

export default ChangeEmail