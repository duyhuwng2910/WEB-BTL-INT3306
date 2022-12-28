import React, {Fragment} from "react";

class Storage extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.customerInput = this.customerInput.bind(this);
        this.returnProducer = this.returnProducer.bind(this);
        this.changeBackgorund = this.changeBackgorund.bind(this);
    }
    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.nextSibling.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Sản phẩm mới');
        this.props.changeTypeProfile('Xem');
    }

    /*
        Lấy ra các row đã được checked để trả lại cơ sở sản xuất (do lâu không bán được)
    */
    returnProducer(event) {
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
                xmlHttp.open('POST', 'http://localhost:8000/agent/return_old_product', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                )
                countChecked++;
            }
        }
        if (countChecked === 0) error1.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else {
            alert("Thành công!\nSản phẩm đã chuyển vào mục trả lại cơ sở sản xuất");
            var tbody = document.querySelector('tbody');
            for (var j = tr.length - 1; j > 0; j--) {
                if (tr[j].firstChild.firstChild.checked) {
                    tbody.removeChild(tr[j]);
                }
            }
        }
    }

    /*
        Xử lý event khi đại lý phân phối nhấn vào tiếp theo để nhập thông tin khách hàng
    */
    customerInput(event) {
        event.preventDefault();
        var error1 = document.getElementsByClassName('errRepair1')[0];
        var error2 = document.getElementsByClassName('errRepair2')[0];
        error1.innerHTML = '';
        error2.innerHTML = '';
        // Mảng tr có phần tử đầu tiên là th
        var tr = document.querySelectorAll("tr");
        var countChecked = 0;
        var products = [];
        var index = 0;
        for (var i = 1; i < tr.length; i++) {
            if (tr[i].firstChild.firstChild.checked) {
                var productAttributes = [];
                for(var j = 1; j < tr[i].childNodes.length - 1; j++) {
                    productAttributes[j - 1] = tr[i].childNodes[j].innerHTML;
                }
                countChecked++;
                products[index] = productAttributes;
                index++;    
            }
        }
        if (countChecked === 0) error2.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else {
            this.props.changeProducts(products);
            this.props.changeTypeProfile("Nhập thông tin khách hàng");
        }
    }

    /*
        Xử lý event khi 1 row đc checked thì chuyển màu vàng ngược lại chuyển về màu ban đầu
    */
    changeBackgorund(event) {
        var input = event;
        var td = event.parentNode;
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
                        var color = document.createElement('td');
                        var description = document.createElement('td');

                        checkbox.appendChild(input);
                        id.innerHTML = data[i]._id;
                        name.innerHTML = data[i].name;
                        batch.innerHTML = data[i].batch;
                        color.innerHTML = data[i].color;
                        description.innerHTML = 'Xem';

                        tr.appendChild(checkbox);
                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(color);
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

                } else alert("ERROR!\n" + this.status);
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/agent/list_new_product_ic?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI danh sách all product trong storage of đại lý và đại lý có thể tick chọn để nhập thông tin khách hàng và bán sản phẩm
    */
    render() {
        return(
            <Fragment>
                <table className='tableProductLine'>
                    <caption>Sản phẩm mới</caption>
                    <thead>
                        <tr>
                            <th></th>
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
                <div className="divRepair">
                    <form className="repair" onSubmit={this.returnProducer}>
                        <label htmlFor="select">Trả lại cơ sở sản xuất: </label>
                        <span className='errRepair1'></span>
                        <input type='submit' value='Trả lại'></input>
                    </form>
                    <form className="repair" onSubmit={this.customerInput}>
                        <label htmlFor="select">Nhập thông tin khách hàng mua: </label>
                        <span className='errRepair2'></span>
                        <input type='submit' value='Tiếp theo'></input>
                    </form>
                </div>
            </Fragment>
        )
    }
}

export default Storage