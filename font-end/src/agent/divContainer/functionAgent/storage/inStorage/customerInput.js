import React, { Fragment } from "react";

class CustomerInput extends React.Component {

    constructor(props) {
        super(props);
        this.customerInput = this.customerInput.bind(this);
        this.delete = this.delete.bind(this);
        this.back = this.back.bind(this);
    }

    back() {
        this.props.changeTypeProfile('Sản phẩm mới');
    }


    /*
        Nhập xong thông tin khách hàng và nhấn vào nút xong thì sản phẩm sẽ thay đổi trạng thái trong csdl và chuyển vào mục
        đã bán
    */
    customerInput(event) {
        event.preventDefault();
        // products[0] là th
        var products = document.querySelectorAll("tr");
        if (products.length === 1) alert("Bạn đã bỏ chọn hết sản phẩm");
        else {
            var arrInput = document.querySelectorAll('input');
            for (var i = 1; i < products.length; i++) {
                var prId = products[i].firstChild.innerHTML;
                const xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            
                        }
                    }
                }
                xmlHttp.open('POST', 'http://localhost:8000/agent/sell_product', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                    + '&customer=' + arrInput[0].value
                    + '&address=' + arrInput[1].value
                    + '&phoneNumber=' + arrInput[2].value
                )
            }
            alert("Sản phẩm đã được chuyển vào mục đã bán");
            var tbody = document.querySelector('tbody');
            for (var j = products.length - 1; j > 0; j--) {
                tbody.removeChild(products[j]);
            }
        }
    }

    /*
        Khi nhấn vào bỏ 1 sản phẩm trong giỏ hàng của khách hàng thì sản phẩm ấy bị xóa khỏi giỏ hàng
    */
    delete(event) {
        var tr = event.parentNode;
        tr.parentNode.removeChild(tr);
    }

    /*
        Hàm thực hiện khi component CustomerInput mới được render. Mục đích là để hiển thị các sản phẩm đã được chọn
        ở trang trước để bán cho khách hàng
    */
    componentDidMount() {
        var root = this;
        var tbody = document.querySelector("tbody");
        var arr = this.props.arrProduct;
        for (var i = 0; i < arr.length; i++) {
            var tr = document.createElement("tr");
            for (var j = 0; j < arr[i].length; j++) {
                var td = document.createElement("td");
                var html = document.createTextNode(arr[i][j]);
                td.appendChild(html);
                tr.appendChild(td);
            }
            var tdDelete = document.createElement("td");
            tdDelete.innerHTML = 'Bỏ';
            tr.appendChild(tdDelete);
            tbody.appendChild(tr);

            tdDelete.style.cursor = 'pointer';
            tdDelete.onclick = function() {
                root.delete(this);
            }
        }
    }

    /*
      UI nhập thông tin customer 
    */
    render() {

        return (
            <Fragment>
                <table className="tableProductLine">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Tên</th>
                            <th>Lô</th>
                            <th>Màu sắc</th>
                            <th>Bỏ chọn</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div>
                    <form className="createAccount" onSubmit={this.customerInput}>
                        <h1>Nhập thông tin khách hàng</h1>
                        <input type='text' placeholder='Họ và tên' required></input>
                        <input type='text' placeholder='Địa chỉ' required></input>
                        <input type='phone' placeholder='Số điện thoại' required></input>
                        <input type='submit' value='Xong'></input>
                    </form>
                </div>
                <i className='fas fa-arrow-circle-left' onClick={this.back}></i>
            </Fragment>
        )
    }
}

export default CustomerInput