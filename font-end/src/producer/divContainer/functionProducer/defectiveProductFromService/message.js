import React from "react";

class Message extends React.Component {

    constructor(props) {
        super(props);
        this.receiveProduct = this.receiveProduct.bind(this);
        this.show = this.show.bind(this);
    }

    /*
        Xử lý event producer click xác nhận là đã nhận đc sản phẩm lỗi/cũ từ service
    */
    receiveProduct(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        var status = event.previousSibling.previousSibling.innerHTML;
        var link = 'take_old_product';
        if (status === 'Lỗi') link = 'take_err_product';
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/factory/' + link, false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_product=' + productId
        );
        alert("Nhận thành công!\nSản phẩm đã được chuyển vào mục đã tiếp nhận");
        var tr = event.parentNode;
        tr.parentNode.removeChild(tr);
    }

    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha là FunctionManage truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Thông báo');
        this.props.changeTypeProfile('Xem');
    }

    componentDidMount() {
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    const listName = JSON.parse(this.responseText).listName;
                    var tbody = document.querySelector('tbody');
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] === null) continue;
                        var tr = document.createElement('tr');
                        var id = document.createElement('td');
                        id.className = 'columnId';
                        var name = document.createElement('td');
                        var from = document.createElement('td');
                        var status = document.createElement('td');
                        var description = document.createElement('td');
                        var receive = document.createElement('td');

                        if (data[i]._id) id.innerHTML = data[i]._id;
                        else id.innerHTML = '';
                        
                        if (data[i].name) name.innerHTML = data[i].name;
                        else name.innerHTML = '';
                        
                        if (listName[i].name) from.innerHTML = listName[i].name;
                        else from.innerHTML = '';

                        if (data[i].status === 'er_back_factory') status.innerHTML = 'Lỗi';
                        else status.innerHTML = 'Cũ';
                        
                        description.innerHTML = 'Xem';
                        receive.innerHTML = 'Nhận';

                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(from);
                        tr.appendChild(status);
                        tr.appendChild(description);
                        tr.appendChild(receive);
                        tbody.appendChild(tr);

                        description.style.cursor = 'pointer';
                        description.onclick = function() {
                            root.show(this);
                        }

                        receive.style.cursor = 'pointer';
                        receive.onclick = function() {
                            root.receiveProduct(this);
                        }
                    }
                } else alert("ERROR!\n" + this.status);
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/factory/list_error_or_old_nc?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI thông báo sản phẩm lỗi cho producer
    */
    render() {
        return(
            <table className='tableProductLine'>
                <caption>Thông báo sản phẩm lỗi - cũ</caption>
                <thead>
                    <tr>
                        <th className="columnId">Id</th>
                        <th>Tên</th>
                        <th>Từ</th>
                        <th>Trạng thái</th>
                        <th>Chi tiết</th>
                        <th>Nhận sản phẩm</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        )
    }
}

export default Message