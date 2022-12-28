import React, {Fragment} from "react";

class Fail extends React.Component {

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
        this.props.changeBackType('Sản phẩm lỗi');
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
                        var tr = document.createElement('tr');
                        var id = document.createElement('td');
                        id.className = 'columnId';
                        var name = document.createElement('td');
                        var batch = document.createElement('td');
                        var color = document.createElement('td');
                        var description = document.createElement('td');

                        id.innerHTML = data[i]._id;
                        name.innerHTML = data[i].name;
                        batch.innerHTML = data[i].batch;
                        color.innerHTML = data[i].color;
                        description.innerHTML = 'Xem';

                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(color);
                        tr.appendChild(description);
                        tbody.appendChild(tr);

                        description.style.cursor = 'pointer';
                        description.onclick = function() {
                            root.show(this);
                        }
                    }
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/agent/list_error_product?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI danh sách all product đại lý gửi cho trung tâm bảo hành mà trung tâm bảo hành không sửa chữa được (bị lỗi) thì
        trung tâm bảo hành sẽ gửi lại cơ sở sản xuất
    */
    render() {

        return(
            <Fragment>
                <table className='tableProductLine'>
                    <caption>Sản phẩm lỗi đã trả về cơ sở sản xuất</caption>
                    <thead>
                        <tr>
                            <th className="columnId">Id</th>
                            <th>Tên</th>
                            <th>Lô</th>
                            <th>Màu sắc</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </Fragment>
        )
    }
}

export default Fail