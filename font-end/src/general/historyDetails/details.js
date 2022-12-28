import React, { Fragment } from "react";

class Details extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.back = this.back.bind(this);
    }

    back() {
        this.props.changeTypeProfile(this.props.backType);
    }

    /*
        Thay đổi content hiển thị bằng cách gọi function đc cha là FunctionManage truyền vào
    */
    show(event) {
        // Lấy value mục status để xác định xem là khách hàng hay là kho
        var status = event.parentNode.firstChild.innerHTML;
        switch (status) {
            case 'Đã bán': case 'Lỗi cần triệu hồi': case 'Đã trả lại cho khách hàng': {
                this.props.changeTypeProfile("Khách hàng");
                break;
            }
            default: {
                var userName = event.previousSibling.innerHTML;
                this.props.changeUserName(userName);
                this.props.changeTypeProfile("Vị trí kho");
            }
        }
    }

    componentDidMount() {
        var root = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText);
                    if (data === null) return;
                    var arrInput = document.querySelectorAll('input');

                    if (data.name) arrInput[0].value = data.name;
                    else arrInput[0].value = '';

                    if (data.batch) arrInput[1].value = data.batch;
                    else arrInput[1].value = '';
                    
                    arrInput[2].value = root.props.productId;

                    if (data.color) arrInput[3].value = data.color;
                    else arrInput[3].value = '';
                    
                    if (data.status) arrInput[4].value = data.status;
                    else arrInput[4].value = '';
                    
                    if (data.DoM) arrInput[5].value = data.DoM;
                    else arrInput[5].value = '';

                    if (data.ToS) arrInput[6].value = data.ToS + ' tháng';
                    else arrInput[6].value = '';
                    
                    if (data.st_service) arrInput[7].value = data.st_service;
                    else arrInput[7].value = '';
                    
                    if (data.namspace) arrInput[8].value = data.namspace;
                    else arrInput[8].value = '';

                    if (data.capacity) arrInput[9].value = data.capacity;
                    else arrInput[9].value = '';

                    if (data.bio) document.querySelector('textarea').value = data.bio;
                    else document.querySelector('textarea').value = '';
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/infor_product?id_product=' + this.props.productId, false);
        xmlHttp.send(null);

        const xmlHttpHistory = new XMLHttpRequest();
        xmlHttpHistory.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).arr;
                    var tbody = document.querySelector('tbody');
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] === null) continue;

                        var tr = document.createElement('tr');
                        var status = document.createElement('td');
                        var time = document.createElement('td');
                        var location = document.createElement('td');
                        var show = document.createElement('td');

                        if (data[i].status) status.innerHTML = data[i].status;
                        else status.innerHTML = '';

                        if (data[i].time) time.innerHTML = data[i].time;
                        else time.innerHTML = '';

                        if (data[i].where) location.innerHTML = data[i].where;
                        else location.innerHTML = '';

                        if (i === 0) show.innerHTML = '';
                        else show.innerHTML = 'Xem';

                        tr.appendChild(status);
                        tr.appendChild(time);
                        tr.appendChild(location);
                        tr.appendChild(show);
                        tbody.appendChild(tr);

                        if (i !== 0) {
                            show.style.cursor = 'pointer';
                            show.onclick = function() {
                                root.show(this);
                            }
                        }
                    }
                }
            }
        }
        xmlHttpHistory.open('GET', 'http://localhost:8000/auth/history?id_product=' + this.props.productId, false);
        xmlHttpHistory.send(null);
    }

    render() {

        /*
            UI profile chi tiết lịch sử của từng sản phẩm để user vào xem
        */
        return(
            <Fragment>
                <form className="profile">
                    <h1>Thông tin sản phẩm</h1>
                    
                    <label htmlFor='name'>Tên</label>
                    <input type='text' id='name' readOnly></input>
                    <br></br>

                    <label htmlFor='batch'>Lô</label>
                    <input type='text' id='batch' readOnly></input>
                    <br></br>
                    
                    <label htmlFor='productId'>Id</label>
                    <input type='text' id='productId' readOnly></input>
                    <br></br>

                    <label htmlFor='color'>Màu sắc</label>
                    <input type='text' id='color' readOnly></input>
                    <br></br>

                    <label htmlFor='status'>Trạng thái</label>
                    <input type='text' id='status' readOnly></input>
                    <br></br>

                    <label htmlFor='dom'>NSX</label>
                    <input type='text' id='dom' readOnly></input>
                    <br></br>

                    <label htmlFor='tos'>Bảo hành</label>
                    <input type='text' id='tos' readOnly></input>
                    <br></br>

                    <label htmlFor='serviceStatus'>Trạng thái bảo hành</label>
                    <input type='text' id='serviceStatus' readOnly></input>
                    <br></br>

                    <label htmlFor='namespace'>Vị trí</label>
                    <input type='text' id='namespace' readOnly></input>
                    <br></br>

                    <label htmlFor='capacity'>Dung lượng</label>
                    <input type='text' id='capacity' readOnly></input>
                    <br></br>

                    <label htmlFor='description'>Thông số</label>
                    <textarea id="description" readOnly></textarea>
                    <br></br>

                    <label>Lịch sử</label>
                    <table className='tableProductLine'>
                        <thead>
                            <tr>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                                <th>Vị trí sản phẩm</th>
                                <th>Xem</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </form>
                <i className='fas fa-arrow-circle-left' onClick={this.back}></i>
            </Fragment>
        )
    }
}

export default Details