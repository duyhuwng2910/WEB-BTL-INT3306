import React from "react";

class Received extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
    }
    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha là FunctionManage truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Đã tiếp nhận');
        this.props.changeTypeProfile('Xem');
    }

    componentDidMount() {
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var tbody = document.querySelector('tbody');
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] === null) continue;
                        var tr = document.createElement('tr');
                        var id = document.createElement('td');
                        id.className = 'columnId';
                        var name = document.createElement('td');
                        var batch = document.createElement('td');
                        var color = document.createElement('td');
                        var status = document.createElement('td');
                        var description = document.createElement('td');

                        if (data[i]._id) id.innerHTML = data[i]._id;
                        else id.innerHTML = '';
                        
                        if (data[i].name) name.innerHTML = data[i].name;
                        else name.innerHTML = '';
                        
                        if (data[i].batch) batch.innerHTML = data[i].batch;
                        else batch.innerHTML = '';
                        
                        if (data[i].color) color.innerHTML = data[i].color;
                        else color.innerHTML = '';
                        
                        if (data[i].status === 'er_back_factory' || data[i].status === 'er_back_production') status.innerHTML = 'Lỗi';
                        else status.innerHTML = 'Cũ';
                        description.innerHTML = 'Xem';

                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(color);
                        tr.appendChild(status);
                        tr.appendChild(description);
                        tbody.appendChild(tr);

                        description.style.cursor = 'pointer'
                        description.onclick = function() {
                            root.show(this);
                        }
                    }
                } else alert("ERROR!\n" + this.status);
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/factory/list_error_or_old_ic?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI danh sách sản phẩm lỗi mà producer đã tiếp nhận từ service
    */
    render() {
        return(
            <table className='tableProductLine'>
                <caption>Sản phẩm lỗi - cũ đã nhận</caption>
                <thead>
                    <tr>
                        <th className="columnId">Id</th>
                        <th>Tên</th>
                        <th>Lô</th>
                        <th>Màu săc</th>
                        <th>Trạng thái</th>
                        <th>Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        )
    }
}

export default Received