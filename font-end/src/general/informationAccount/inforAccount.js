import React from "react";

class InforAccount extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            constName: '',
            constAddress: '',
            constPhone: '',
            constDes: ''
        }
        this.update = this.update.bind(this);
        this.edit = this.edit.bind(this);
    }

    edit(event) {
        var inputEdit = event.target.previousSibling;
        inputEdit.readOnly = false;
    }

    update(event) {
        event.preventDefault();
        var root = this;
        var error = document.getElementsByClassName('errProfile')[0];
        error.innerHTML = '';
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const description = document.getElementById('description').value;

        if (!name || !address || !phone || !description) {
            error.innerHTML = 'Bạn chưa nhập hết các thông tin cần chỉnh sửa';
            return;
        }
        if (name === this.state.constName && address === this.state.constAddress && phone === this.state.constPhone
            && description === this.state.constDes) {
                error.innerHTML = 'Bạn chưa thay đổi thông tin nào';
                return;
        }

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.responseText === 4) {
                if (this.status === 200) {
                    error.innerHTML = '';
                    root.setState({
                        constName: name,
                        constAddress: address,
                        constPhone: phone,
                        constDes: description
                    })
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/auth/edit_profile', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_user=' + this.props.id
            + '&name=' + name
            + '&address=' + address
            + '&phone=' + phone
            + '&bio=' + description
        )
        alert('Thay đổi thông tin thành công')
    }

    componentDidMount() {
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText);
                    if (data === null) return;
                    var name = '', address = '', phone = '', description = '';
                    if (data.name) {
                        name = data.name;
                        document.getElementById('name').value = name;
                    }
                    if (data.username) document.getElementById('username').value = data.username;
                    else document.getElementById('username').value = '';
                    if (data.type_user) document.getElementById('type').value = data.type_user;
                    else document.getElementById('type').value = '';
                    if (data.email) document.getElementById('email').value = data.email;
                    else document.getElementById('email').value = '';
                    if (data.address) {
                        address = data.address;
                        document.getElementById('address').value = address;
                    }
                    if (data.phone) {
                        phone = data.phone;
                        document.getElementById('phone').value = phone;
                    }
                    if (data.bio) {
                        description = data.bio;
                        document.getElementById('description').value = description;
                    }
                    root.setState({
                        constName: name,
                        constAddress: address,
                        constPhone: phone,
                        constDes: description
                    })
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/my_profile?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    render() {

        return(
            <form className="profile" method="" action="" onReset={this.componentDidMount} onSubmit={this.update}>
                <h1>Thông tin tài khoản</h1>
                
                <label htmlFor='name'>Tên</label>
                <input type='text' id='name' name='name' readOnly></input><i className="fas fa-edit" onClick={this.edit}></i>
                <br></br>
                
                <label htmlFor='username'>Tên tài khoản</label>
                <input type='text' id='username' name='username' readOnly></input>
                <br></br>
                
                <label htmlFor='type'>Loại tài khoản</label>
                <input type='text' id='type' name='type' readOnly></input>
                <br></br>

                <label htmlFor='id'>Id</label>
                <input type='text' id='id' value={this.props.id} name='id' readOnly></input>
                <br></br>

                <label htmlFor='email'>Email</label>
                <input type='text' id='email' name='email' readOnly></input>
                <br></br>

                <label htmlFor='address'>Địa chỉ</label>
                <input type='text' id='address' name='address' readOnly></input><i className="fas fa-edit" onClick={this.edit}></i>
                <br></br>

                <label htmlFor='phone'>Số điện thoại</label>
                <input type='phone' id='phone' name='phone' readOnly></input><i className="fas fa-edit" onClick={this.edit}></i>
                <br></br>

                <label htmlFor='description'>Thông tin thêm</label>
                <textarea id="description" name='description' readOnly></textarea><i className="fas fa-edit" onClick={this.edit}></i>
                <br></br>

                <span className='errProfile'></span>
                <input type='submit' value='Thay đổi thông tin'></input>
            </form>
        )
    }
}

export default InforAccount