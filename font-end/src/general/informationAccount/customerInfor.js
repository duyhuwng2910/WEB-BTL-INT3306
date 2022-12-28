import React, { Fragment } from "react";

class CustomerInfor extends React.Component {

    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
    }

    back() {
        this.props.changeTypeProfile('Xem');
    }

    componentDidMount() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText);
                    if (data === null) return;
                    var arrInput = document.querySelectorAll('input');

                    if (data.name) arrInput[0].value = data.name;
                    else arrInput[0].value = '';

                    if (data.address) arrInput[1].value = data.address;
                    else arrInput[1].value = '';
                    
                    if (data.phone) arrInput[2].value = data.phone;
                    else arrInput[2].value = '';
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/infor_customer?id_product=' + this.props.productId, false);
        xmlHttp.send(null);
    }

    render() {
        /*
            UI profile sơ bộ của tài khoản cho tài khoản khác xem
        */
        return(
            <Fragment>
                <form className="profile">
                    <h1>Thông tin khách hàng</h1>

                    <label htmlFor='name'>Họ tên</label>
                    <input type='text' id='name' readOnly></input>
                    <br></br>

                    <label htmlFor='address'>Địa chỉ</label>
                    <input type='text' id='address' readOnly></input>
                    <br></br>

                    <label htmlFor='phone'>Số điện thoại</label>
                    <input type='phone' id='phone' readOnly></input>
                    <br></br>

                    {/* <label htmlFor='description'>Thông tin thêm</label>
                    <textarea id="description" readOnly></textarea>
                    <br></br> */}
                </form>
                <i className='fas fa-arrow-circle-left' onClick={this.back}></i>
            </Fragment>
        )
    }
}

export default CustomerInfor