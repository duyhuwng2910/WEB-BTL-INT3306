import React from "react";

class CreateAccount extends React.Component {

    constructor(props) {
        super(props);
        this.create = this.create.bind(this);
    }

    create(event) {
        event.preventDefault();
        const arrInput = document.querySelectorAll('input');
        const username = arrInput[0].value;
        const password = arrInput[1].value;
        const repassword = arrInput[2].value;
        const user_type = document.querySelector('select').value;
        var error = document.getElementsByClassName('errProfile')[0];
        error.innerHTML = '';
        if (!username || !password || !repassword) {
            error.innerHTML = 'Bạn chưa nhập đầy đủ thông tin';
            return;
        } else if (password !== repassword) {
            error.innerHTML = 'Mật khẩu nhập lại chưa chính xác';
            return;
        }
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert("Tạo tài khoản thành công");
                } else {
                    const data = JSON.parse(this.responseText);
                    error.innerHTML = data.errorMessage;
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/manager/create_account', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'username=' + username
            + '&password=' + password
            + '&repassword=' + repassword
            + '&user_type=' + user_type
        )
    }

    /*
      UI cấp tài khoản (ứng với mục cấp tài khoản (mục này là mục con của mục quản lý tài khoản trong thanh menu))  
    */
    render() {
        return (
            <form className="createAccount" onSubmit={this.create}>
                <h1>Tạo tài khoản</h1>
                <input type='text' name='userName' placeholder='Tài khoản'></input>
                <input type='password' name='passWord' placeholder='Mật khẩu'></input>
                <input type='password' name='repassWord' placeholder='Nhập lại mật khẩu'></input>
                <label htmlFor='type'>Loại tài khoản:  </label>
                <select id="type">
                    <option value='pu'>Cơ sở sản xuất</option>
                    <option value='ag'>Đại lý phân phối</option>
                    <option value='sc'>Trung tâm bảo hành</option>
                </select>
                <span className='errProfile'></span>
                <input type='submit' value='Tạo'></input>
            </form>
        )
    }
}

export default CreateAccount