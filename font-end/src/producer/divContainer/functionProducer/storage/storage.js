import React, { Fragment } from "react"
import '../../../../general/css/storage.css'

class Storage extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.exportProduct = this.exportProduct.bind(this);
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
                            const agentName = data[i].name;
                            var option = document.createElement('option');
                            option.value = agentName;
                            
                            var datalist = document.querySelector('datalist');
                            datalist.appendChild(option);
                        }
                    }
                }
            }
            xmlHttp.open('POST', 'http://localhost:8000/auth/search_user_by_keyword', false);
            xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlHttp.send(
                'type_user=ag'
                + '&keyword=' + keyWord
            )
        }
    }

    show(event) {
        const productId = event.parentNode.firstChild.nextSibling.innerHTML;
        this.props.changeProductId(productId);
        this.props.changeBackType('Trong kho');
        this.props.changeTypeProfile('Xem');
    }

    /*
        Xử lý event khi producer click vào xuất hàng
    */
    exportProduct(event) {
        event.preventDefault();
        const agentName = document.getElementById('agentName').value;
        var error = document.getElementsByClassName('errRepair2')[0];
        error.innerHTML = '';
        if (!agentName) {
            error.innerHTML = 'Bạn chưa chọn đại lý'
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
                            
                        } else error.innerHTML = 'Không tìm thấy đại lý'
                    }
                }
                xmlHttp.open('POST', 'http://localhost:8000/factory/send_product_to_agent', false);
                xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlHttp.send(
                    'id_product=' + prId
                    + '&agent_name=' + agentName
                )

                countChecked++;
            }
        }
        if (countChecked === 0) error.innerHTML = 'Bạn chưa chọn sản phẩm nào';
        else if (error.innerHTML === '') {
            alert("Xuất hàng thành công!\nSản phẩm đã được chuyển vào mục xuất đi\nBạn hãy chờ đại lý xác nhận");
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
                        var description = document.createElement('td');

                        checkbox.appendChild(input);
                        if (data[i]._id) id.innerHTML = data[i]._id;
                        else id.innerHTML = '';
                        
                        if (data[i].name) name.innerHTML = data[i].name;
                        else name.innerHTML = '';
                        
                        if (data[i].batch) batch.innerHTML = data[i].batch;
                        else batch.innerHTML = '';
                        
                        if (data[i].color) color.innerHTML = data[i].color;
                        else color.innerHTML = '';
                        
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
        xmlHttp.open('GET', 'http://localhost:8000/factory/list_new_product?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI danh sách all product trong storage of producer và producer có thể tick chọn để xuất hàng cho đại lý
    */
    render() {

        return(
            <Fragment>
                <table className='tableProductLine'>
                    <caption>Danh sách sản phẩm mới trong kho</caption>
                    <thead>
                        <tr>
                            <th></th>
                            <th className="columnId">Id</th>
                            <th>Tên</th>
                            <th>Lô</th>
                            <th>Màu săc</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div className="divRepair">
                    <form className="repair">
                    </form>
                    <div className="repair">
                        <label htmlFor="select">Xuất cho đại lý: </label>
                        <input id="agentName" list="searchAgent" placeholder="Tìm kiếm đại lý" onKeyUp={this.searchAgent}></input>
                        <datalist id="searchAgent">
                        </datalist>
                        <form onSubmit={this.exportProduct}>
                            <span className='errRepair2'></span>
                            <input type='submit' value='Xuất' id="special"></input>
                        </form>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default Storage