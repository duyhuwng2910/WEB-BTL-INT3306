import React from "react";

class FollowProduct extends React.Component {


    componentDidMount() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).products;
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
                        var bio = document.createElement('td');

                        if (data[i]._id) id.innerHTML = data[i]._id;
                        else id.innerHTML = '';
                        
                        if (data[i].name) name.innerHTML = data[i].name;
                        else name.innerHTML = '';
                        
                        if (data[i].batch) batch.innerHTML = data[i].batch;
                        else batch.innerHTML = '';
                        
                        if (data[i].color) color.innerHTML = data[i].color;
                        else color.innerHTML = '';
                        
                        switch(data[i].status) {
                            case 'new_product': {
                                status.innerHTML = 'Mới sản xuất';
                                break;
                            }
                            case 'back_agent': {
                                status.innerHTML = 'Đưa về đại lý';
                                break;
                            }
                            case 'sold': {
                                status.innerHTML = 'Đã bán';
                                break;
                            }
                            case 'er_service': {
                                status.innerHTML = 'Lỗi cần bảo hành';
                                break;
                            }
                            case 'sv_fixing': {
                                status.innerHTML = 'Đang bảo hành';
                                break;
                            }
                            case 'sv_fixed': {
                                status.innerHTML = 'Đã bảo hành xong';
                                break;
                            }
                            case 'sv_return': {
                                status.innerHTML = 'Đã trả lại khách hàng';
                                break;
                            }
                            case 'er_back_factory': {
                                status.innerHTML = 'Lỗi cần trả về nhà máy';
                                break;
                            }
                            case 'er_back_production': {
                                status.innerHTML = 'Lỗi đã đưa về cơ sở sản xuất';
                                break;
                            }
                            case 'er_recall': {
                                status.innerHTML = 'Lỗi cần triệu hồi';
                                break;
                            }
                            case 'overtime_service': {
                                status.innerHTML = 'Hết thời gian bảo hành';
                                break;
                            }
                            default: {
                                status.innerHTML = 'Trả lại cơ sở sản xuất';
                            }
                        }
                        if (data[i].bio) bio.innerHTML = data[i].bio;
                        else bio.innerHTML = '';

                        tr.appendChild(id);
                        tr.appendChild(name);
                        tr.appendChild(batch);
                        tr.appendChild(color);
                        tr.appendChild(status);
                        tr.appendChild(bio);
                        tbody.appendChild(tr);
                    }
                } else alert("ERROR!\n" + this.status);
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/manager/all_product?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }
    /*
      UI theo dõi sản phẩm (tương ứng với mục theo dõi trong thanh menu)  
    */
    render() {
        return (
            <table className="tableProductLine">
                <caption>Sản phẩm trên toàn quốc</caption>
                <thead>
                    <tr>
                        <th className='columnId'>Id</th>
                        <th>Tên</th>
                        <th>Lô</th>
                        <th>Màu sắc</th>
                        <th>Trạng thái</th>
                        <th>Thông số</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        )
    }
}

export default FollowProduct