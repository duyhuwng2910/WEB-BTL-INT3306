import React from "react";

class Fixed extends React.Component {

    constructor(props) {
        super(props);
        this.receiveProduct = this.receiveProduct.bind(this);
        this.show = this.show.bind(this);
    }

    /*
        Xử lý event đại lý click xác nhận là đã nhận đc sản phẩm đã bảo hành xong từ trung tâm bảo hành
    */
   receiveProduct(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    
                }
            }
        }
        xmlHttp.open('POST', 'http://localhost:8000/agent/receive_fixed', false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(
            'id_product=' + productId
        )
        alert("Nhận thành công!\nSản phẩm đã được chuyển vào mục trả lại cho khách hàng");
        var tbody = document.querySelector('tbody');
        tbody.removeChild(event.parentNode);
    }

    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha là FunctionManage truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Sản phẩm bảo hành');
        this.props.changeTypeProfile('Xem');
    }

    componentDidMount() {
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    const svName = JSON.parse(this.responseText).listServiceName;
                    var tbody = document.querySelector('tbody');
                    for (var i = 0; i < data.length; i++) {
                        var tr = document.createElement('tr');
                        var id = document.createElement('td');
                        id.className = 'columnId';
                        var name = document.createElement('td');
                        var from = document.createElement('td');
                        var description = document.createElement('td');
                        var receive = document.createElement('td');

                        id.innerHTML = data[i]._id;
                        name.innerHTML = data[i].name;
                        from.innerHTML = svName[i].sv_name;
                        description.innerHTML = 'Xem';
                        receive.innerHTML = 'Nhận';

                        tr.appendChild(id);
                        tr.appendChild(name);
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
        xmlHttp.open('GET', 'http://localhost:8000/agent/list_fixed_product_nc?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI thông báo sản phẩm đã bảo hành xong và trung tâm bảo hành gửi về đại lý
    */
    render() {
        return(
            <table className='tableProductLine'>
                <caption>Sản phẩm đã bảo hành xong</caption>
                <thead>
                    <tr>
                        <th className="columnId">Id</th>
                        <th>Tên</th>
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

export default Fixed