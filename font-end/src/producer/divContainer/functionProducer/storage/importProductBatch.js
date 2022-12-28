import React, { Fragment } from "react";

class ImportProductBatch extends React.Component {

    constructor(props) {
        super(props);
        this.importStorage = this.importStorage.bind(this);
        this.update = this.update.bind(this);
    }

    /*
        Thêm lô mà producer vừa nhập vào bảng để nhập các lô vào kho
    */
    update(event) {
        event.preventDefault();
        var error = document.getElementsByClassName('errProfile')[1];
        error.innerHTML = '';
        
        var batch = document.getElementById("batch");
        var name = document.getElementById("name");
        var color = document.getElementById("color");
        var amount = document.getElementById("amount");
        var dom = document.getElementById("dom");
        var tos = document.getElementById("tos");
        var capacity = document.getElementById("capacity");
        var bio = document.getElementById("bio");

        var tr = document.createElement("tr");
        var tdBatch = document.createElement("td");
        var tdName = document.createElement("td");
        var tdColor = document.createElement("td");
        var tdAmount = document.createElement("td");
        var tdDom = document.createElement("td");
        var tdTos = document.createElement("td");
        var tdCapacity = document.createElement("td");
        var tdBio = document.createElement("td");
        var tdDelete = document.createElement("td");

        if (!batch.value || !name.value || !color.value || !amount.value || !dom.value || !tos.value || !capacity.value || !bio.value) {
            error.innerHTML = 'Bạn chưa nhập đầy đủ thông tin';
            return;
        }

        tdBatch.innerHTML = batch.value;
        tdName.innerHTML = name.value;
        tdColor.innerHTML = color.value;
        tdAmount.innerHTML = amount.value;
        tdDom.innerHTML = dom.value;
        tdTos.innerHTML = tos.value;
        tdCapacity.innerHTML = capacity.value;
        tdBio.innerHTML = bio.value;
        tdDelete.innerHTML = "Bỏ";

        tr.appendChild(tdBatch);
        tr.appendChild(tdName);
        tr.appendChild(tdColor);
        tr.appendChild(tdAmount);
        tr.appendChild(tdDom);
        tr.appendChild(tdTos);
        tr.appendChild(tdCapacity);
        tr.appendChild(tdBio);
        tr.appendChild(tdDelete);

        document.querySelector(".tableProductLine > tbody").appendChild(tr);

        var root = this;
        tdDelete.style.cursor = 'pointer'
        tdDelete.onclick = function() {
            root.delete(this);
        }
    }

    /*
        Gửi request gồm data về các lô lên database để update vào database kho của cơ sở sản xuất
    */
   importStorage(event) {
        event.preventDefault();
        var error1 = document.getElementsByClassName('errProfile')[0];
        var error2 = document.getElementsByClassName('errProfile')[1];
        error1.innerHTML = '';
        error2.innerHTML = '';
        // element 0 là th
        const arrTr = document.querySelectorAll('tr');
        for (var i = 1; i < arrTr.length; i++) {
            const id_user = this.props.id;
            const batch = arrTr[i].firstChild.innerHTML;
            const name = arrTr[i].firstChild.nextSibling.innerHTML;
            const color = arrTr[i].firstChild.nextSibling.nextSibling.innerHTML;
            const amount = arrTr[i].firstChild.nextSibling.nextSibling.nextSibling.innerHTML;
            const dom = arrTr[i].firstChild.nextSibling.nextSibling.nextSibling.nextSibling.innerHTML;
            const tos = arrTr[i].firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerHTML;
            const capacity = arrTr[i].firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerHTML;
            const bio = document.querySelector('textarea').value;

            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        
                    }
                }
            }
            xmlHttp.open('POST', 'http://localhost:8000/factory/entry_product', false);
            xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlHttp.send(
                'id_user=' + id_user
                + '&batch=' + batch
                + '&name=' + name
                + '&color=' + color
                + '&amount=' + amount
                + '&bio=' + bio
                + '&DoM=' + dom
                + '&ToS=' + tos
                + '&capacity=' + capacity
            )
        }
        if (arrTr.length === 1) error1.innerHTML = 'Chưa có sản phẩm nào';
        else alert('Nhập sản phẩm vào kho thành công!');
   }

   delete(tdDelete) {
        var trDelete = tdDelete.parentNode;
        var tbody = document.querySelector('tbody');
        tbody.removeChild(trDelete);
   }

    /*
        UI producer nhập lô sản phẩm mới sản xuất vào kho
    */
    render() {

        return(
            <Fragment>
                <table className="tableProductLine">
                    <thead>
                        <tr>
                            <th>Lô</th>
                            <th>Tên</th>
                            <th>Màu sắc</th>
                            <th>Số lượng</th>
                            <th>NSX</th>
                            <th>Tháng bảo hành</th>
                            <th>Dung lượng</th>
                            <th>Thông số</th>
                            <th>Bỏ chọn</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div>
                    <form className="profile" onSubmit={this.importStorage}>
                            <span className='errProfile'></span>
                            <input type='submit' value='Nhập kho'></input>
                    </form>
                    <form className="profile" onSubmit={this.update}>
                        <h1>Nhập lô sản phẩm vào kho</h1>

                        <label htmlFor='batch'>Số lô</label>
                        <input type='text' id='batch'></input>
                        <br></br>
                        
                        <label htmlFor='name'>Tên</label>
                        <input type='text' id='name'></input>
                        <br></br>

                        <label htmlFor='color'>Màu sắc</label>
                        <input type='text' id='color'></input>
                        <br></br>
                        
                        <label htmlFor='amount'>Số lượng</label>
                        <input type='text' id='amount'></input>

                        <label htmlFor='dom'>NSX</label>
                        <input type='date' id='dom'></input>

                        <label htmlFor='tos'>Số tháng bảo hành</label>
                        <input type='number' id='tos'></input>

                        <label htmlFor='capacity'>Dung lượng lưu trữ</label>
                        <input type='text' id='capacity'></input>

                        <label htmlFor='bio'>Thông số</label>
                        <textarea id="bio"></textarea>

                        <span className='errProfile'></span>
                        <input type='submit' value='Thêm'></input>
                    </form>
                </div>
            </Fragment>
        )
    }
}

export default ImportProductBatch