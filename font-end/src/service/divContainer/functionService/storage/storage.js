import React, {Fragment} from "react";

class Storage extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.returnAgent = this.returnAgent.bind(this);
        this.sendToProducer = this.sendToProducer.bind(this);
        this.changeBackgorund = this.changeBackgorund.bind(this);
    }
    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha là FunctionManage truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.nextSibling.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Trong kho');
        this.props.changeTypeProfile('Xem');
    }

    /*
        Xử lý event khi trung tâm bảo hành click vào chuyển đi
    */
    sendToProducer(event) {
        event.preventDefault();
        var error1 = document.getElementsByClassName('errRepair1')[0];
        var error2 = document.getElementsByClassName('errRepair2')[0];
        error1.innerHTML = '';
        error2.innerHTML = '';
        // Mảng tr có phần tử đầu tiên là th
        var tr = document.querySelectorAll("tr");
        var countChecked = 0;
        for (var i = 1; i < tr.length; i++) {
            if (tr[i].firstChild.firstChild.checked) {
                const prId = tr[i].firstChild.nextSibling.innerHTML;
                const xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            
                        }
                    }
                }
                xmlHttp.open('POST', 'http://localhost:8000/service/send_product_to_factory', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                )
                countChecked++;
            }
        }
        if (countChecked === 0) error2.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else {
            alert("Chuyển hàng thành công!\nSản phẩm đã được chuyển vào mục không thể sửa\nBạn hãy chờ cơ sở sản xuất xác nhận");
            var tbody = document.querySelector('tbody');
            for (var j = tr.length - 1; j > 0; j--) {
                if (tr[j].firstChild.firstChild.checked) {
                    tbody.removeChild(tr[j]);
                }
            }
        }
    }

    /*
        Xử lý event khi trung tâm bảo hành click vào trả về
    */
    returnAgent(event) {
        event.preventDefault();
        var error1 = document.getElementsByClassName('errRepair1')[0];
        var error2 = document.getElementsByClassName('errRepair2')[0];
        error1.innerHTML = '';
        error2.innerHTML = '';
        // Mảng tr có phần tử đầu tiên là th
        var tr = document.querySelectorAll("tr");
        var countChecked = 0;
        for (var i = 1; i < tr.length; i++) {
            if (tr[i].firstChild.firstChild.checked) {
                const prId = tr[i].firstChild.nextSibling.innerHTML;
                const xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            
                        }
                    }
                }
                xmlHttp.open('POST', 'http://localhost:8000/service/send_product_to_agent', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                )
                countChecked++;
            }
        }
        if (countChecked === 0) error1.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else {
            alert("Trả hàng thành công!\nSản phẩm đã được chuyển vào mục sửa chữa xong\nBạn hãy chờ đại lý xác nhận");
            var tbody = document.querySelector('tbody');
            for (var j = tr.length - 1; j > 0; j--) {
                if (tr[j].firstChild.firstChild.checked) {
                    tbody.removeChild(tr[j]);
                }
            }
        }
    }

    /*
        Xử lý event khi 1 row đc checked thì chuyển màu vàng ngược lại chuyển về màu ban đầu
    */
    changeBackgorund(event) {
        var input = event
        var td = event.parentNode
        if (input.checked) td.parentNode.style.background = "yellow";
        else if (Number(td.nextSibling.innerHTML) % 2 === 1) td.parentNode.style.background = "rgba(0,0,21,.05)";
        else td.parentNode.style.background = "white";
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
                        var checkbox = document.createElement('td');
                        var input = document.createElement('input');
                        input.type = 'checkbox';
                        var id = document.createElement('td');
                        id.className = 'columnId';
                        var name = document.createElement('td');
                        var batch = document.createElement('td');
                        var description = document.createElement('td');

                        checkbox.appendChild(input);
                        if (data[i]._id) id.innerHTML = data[i]._id;
                        else id.innerHTML = '';
                        
                        if (data[i].name) name.innerHTML = data[i].name;
                        else name.innerHTML = '';
                        
                        if (data[i].batch) batch.innerHTML = data[i].batch;
                        else batch.innerHTML = '';
                        
                        description.innerHTML = 'Xem';

                        tr.appendChild(checkbox);
                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(description);
                        tbody.appendChild(tr);

                        input.onchange = function() {
                            root.changeBackgorund(this);
                        }

                        description.style.cursor = 'pointer';
                        description.onclick = function() {
                            root.show(this);
                        }
                    }
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/all_fixing_product?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI danh sách all product trong storage of producer và producer có thể tick chọn để xuất hàng cho đại lý
    */
    render() {
        return(
            <Fragment>
                <table className='tableProductLine'>
                    <caption>Sản phẩm đang được sửa chữa</caption>
                    <thead>
                        <tr>
                            <th></th>
                            <th className="columnId">Id</th>
                            <th>Tên</th>
                            <th>Lô</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div className="divRepair">
                    <form className="repair" onSubmit={this.returnAgent}>
                        <label htmlFor="select">Trả về đại lý: </label>
                        <span className='errRepair1'></span>
                        <input type='submit' value='Trả về'></input>
                    </form>
                    <form className="repair" onSubmit={this.sendToProducer}>
                        <label htmlFor="select">Chuyển về cơ sở: </label>
                        <span className='errRepair2'></span>
                        <input type='submit' value='Chuyển đi'></input>
                    </form>
                </div>
            </Fragment>
        )
    }
}

export default Storage