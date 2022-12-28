import React from "react";

class MessageFromAgent extends React.Component {

    constructor(props) {
        super(props);
        this.receiveProduct = this.receiveProduct.bind(this);
        this.show = this.show.bind(this);
    }

    /*
        Xử lý event producer click xác nhận là đã nhận đc sản phẩm lỗi từ service
    */
    receiveProduct(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.responseText === 4) {
                if (this.status === 200) {
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/service/take_service_product', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_product=' + productId
        );
        alert('Nhận sản phẩm thành công!\nSản phẩm đã được chuyển vào trong kho');
        var tbody = document.querySelector('tbody');
        tbody.removeChild(event.parentNode);
    }

    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha là FunctionManage truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Thông báo bảo hành');
        this.props.changeTypeProfile('Xem');
    }


    componentDidMount() {
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    const agName = JSON.parse(this.responseText).listAgentName;
                    var tbody = document.querySelector('tbody');
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] === null) continue;
                        var tr = document.createElement('tr');
                        var id = document.createElement('td');
                        id.className = 'columnId';
                        var name = document.createElement('td');
                        var batch = document.createElement('td');
                        var from = document.createElement('td');
                        var description = document.createElement('td');
                        var receive = document.createElement('td');

                        if (data[i]._id) id.innerHTML = data[i]._id;
                        else id.innerHTML = '';
                        
                        if (data[i].name) name.innerHTML = data[i].name;
                        else name.innerHTML = '';
                        
                        if (data[i].batch) batch.innerHTML = data[i].batch;
                        else batch.innerHTML = '';
                        
                        if (agName[i].ag_name) from.innerHTML = agName[i].ag_name;
                        else from.innerHTML = '';

                        description.innerHTML = 'Xem';
                        receive.innerHTML = 'Nhận';

                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(from);
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
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/service_product?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI thông báo sản phẩm lỗi cho producer
    */
    render() {
        return(
            <table className='tableProductLine'>
                <caption>Thông báo sản phẩm lỗi</caption>
                <thead>
                    <tr>
                        <th className="columnId">Id</th>
                        <th>Tên</th>
                        <th>Lô</th>
                        <th>Từ</th>
                        <th>Chi tiết</th>
                        <th>Nhận</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        )
    }
}

export default MessageFromAgent