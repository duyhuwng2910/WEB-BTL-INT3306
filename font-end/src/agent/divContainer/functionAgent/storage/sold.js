import React, {Fragment} from "react";

class Sold extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.recall = this.recall.bind(this);
        this.service = this.service.bind(this);
        this.changeBackgorund = this.changeBackgorund.bind(this);
        this.searchAgent = this.searchAgent.bind(this);
    }

    searchAgent(event) {
        if (event.keyCode === 13) {
            var keyWord = event.target.value;
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        const data = JSON.parse(this.responseText).users;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i] === null) continue;
                            const serviceName = data[i].name;
                            var option = document.createElement('option');
                            option.value = serviceName;
                            
                            var datalist = document.querySelector('datalist');
                            datalist.appendChild(option);
                        }
                    }
                }
            }
            xmlHttp.open('POST', 'http://localhost:8000/auth/search_user_by_keyword', false);
            xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlHttp.send(
                'type_user=sc'
                + '&keyword=' + keyWord
            )
        }
    }

    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha truyền vào
    */
    show(event) {
        const productId = event.parentNode.firstChild.nextSibling.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Đã bán');
        this.props.changeTypeProfile('Xem');
    }

    /*
        Xử lý event khi đại lý click vào triệu hồi, product đc thay đổi trạng thái trong csdl và chuyển vào mục triệu hồi
    */
    recall(event) {
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
                xmlHttp.open('POST', 'http://localhost:8000/agent/recall', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                )
                countChecked++;
            }
        }
        if (countChecked === 0) error1.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else {
            alert("Thành công!\nSản phẩm đã được chuyển vào mục triệu hồi");
            var tbody = document.querySelector('tbody');
            for (var j = tr.length - 1; j > 0; j--) {
                if (tr[j].firstChild.firstChild.checked) {
                    tbody.removeChild(tr[j]);
                }
            }
        }
    }

    /*
        Xử lý event khi đại lý click vào bảo hành, product đc thay đổi trạng thái trong csdl và chuyển vào mục đem đi bảo hành
    */
    service(event) {
        event.preventDefault();
        var error1 = document.getElementsByClassName('errRepair1')[0];
        var error2 = document.getElementsByClassName('errRepair2')[0];
        error1.innerHTML = '';
        error2.innerHTML = '';
        const serviceName = document.getElementById('servicename').value;
        if (!serviceName) {
            error2.innerHTML = 'Bạn chưa chọn TTBH'
            return;
        }
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
                            
                        } else error2.innerHTML = 'Không tìm thấy TTBH'
                    }
                }
                xmlHttp.open('POST', 'http://localhost:8000/agent/service_product', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                    + '&service_name=' + serviceName
                )
                countChecked++;
            }
        }
        if (countChecked === 0) error2.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else if (error2.innerHTML === '') {
            alert("Thành công!\nSản phẩm đã được chuyển vào mục đem đi bảo hành\nBạn hãy chờ trung tâm bảo hành xác nhận");
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
                        var statusService = document.createElement('td');
                        var description = document.createElement('td');

                        checkbox.appendChild(input);
                        id.innerHTML = data[i]._id;
                        name.innerHTML = data[i].name;
                        batch.innerHTML = data[i].batch;
                        color.innerHTML = data[i].color;
                        statusService.innerHTML = data[i].st_Service;
                        description.innerHTML = 'Xem';

                        tr.appendChild(checkbox);
                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(color);
                        tr.appendChild(statusService);
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
        xmlHttp.open('GET', 'http://localhost:8000/agent/list_sold?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI danh sách all product đã bán của đại lý và đại lý có thể tick chọn để triệu hồi hoặc đem đi bảo hành
    */
    render() {

        return(
            <Fragment>
                <table className='tableProductLine'>
                    <caption>Sản phẩm đã bán - Không gồm sản phẩm lỗi</caption>
                    <thead>
                        <tr>
                            <th></th>
                            <th className="columnId">Id</th>
                            <th>Tên</th>
                            <th>Lô</th>
                            <th>Màu sắc</th>
                            <th>Trạng thái</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div className="divRepair">
                    <form className="repair" onSubmit={this.recall}>
                        <label htmlFor="select">Triệu hồi sản phẩm: </label>
                        <span className='errRepair1'></span>
                        <input type='submit' value='Triệu hồi'></input>
                    </form>
                    <div className="repair">
                        <label htmlFor="select">Đưa đi bảo hành: </label>
                        <input id="servicename" list="searchAgent" placeholder="Tìm kiếm TTBH" onKeyUp={this.searchAgent}></input>
                        <datalist id="searchAgent">
                        </datalist>
                        <form onSubmit={this.service}>
                            <span className='errRepair2'></span>
                            <input type='submit' value='Bảo hành' id="special"></input>
                        </form>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default Sold