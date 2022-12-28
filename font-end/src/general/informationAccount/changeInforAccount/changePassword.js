import React from "react"

class ChangePassword extends React.Component {
    
    constructor(props) {
        super(props);
        this.changePassword = this.changePassword.bind(this);
    }

    changePassword(event) {
        event.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const repassword = document.getElementById('repassword').value;
        var error = document.getElementsByClassName('errProfile')[0];
        error.innerHTML = '';
        if (!newPassword || !repassword) {
            error.innerHTML = 'Bạn chưa nhập đầy đủ thông tin';
            return;
        } else if (newPassword !== repassword) {
            error.innerHTML = 'Mật khẩu nhập lại chưa chính xác';
            return;
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert('Thay đổi mật khẩu thành công')
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/auth/change_password', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_user=' + this.props.id
            + '&password=' + newPassword
            + '&repassword=' + repassword
        )
    }

    render() {
        /*
            UI profile sơ bộ của tài khoản cho tài khoản khác xem
        */
        return(
            <form className="profile" onSubmit={this.changePassword}>
                <h1>Thay đổi mật khẩu</h1>

                {/* <label htmlFor='oldPassword'>Mật khẩu cũ</label>
                <input type='password' id='oldPassword' required></input>
                <br></br> */}

                <label htmlFor='newPassword'>Mật khẩu mới</label>
                <input type='password' id='newPassword'></input>
                <br></br>

                <label htmlFor='repassword'>Nhập lại</label>
                <input type='password' id='repassword'></input>
                <br></br>
                <span className='errProfile'></span>
                <input type='submit' value='Thay đổi'></input>
            </form>
        )
    }
}

export default ChangePassword