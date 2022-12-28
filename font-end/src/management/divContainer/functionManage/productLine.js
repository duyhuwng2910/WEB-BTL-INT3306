import React from "react";

class ProductLine extends React.Component {

    componentDidMount() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).listProduct;
                    var tbody = document.querySelector('tbody');
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] === null) continue;
                        const id = data[i]._id;
                        const name = data[i].name;
                        for (var j = 0; j < data[i].model.length; j++) {
                            const capacity = data[i].model[j];
                            var tr = document.createElement('tr');
                            var tdId = document.createElement('td');
                            var tdName = document.createElement('td');
                            var tdCapacity = document.createElement('td');

                            if (id) tdId.innerHTML = id;
                            else tdId.innerHTML = '';

                            if (name) tdName.innerHTML = name;
                            else tdName.innerHTML = '';

                            if (capacity) tdCapacity.innerHTML = capacity;
                            else tdCapacity.innerHTML = '';

                            tr.appendChild(tdId);
                            tr.appendChild(tdName);
                            tr.appendChild(tdCapacity);
                            tbody.appendChild(tr);
                        }
                    }
                } else alert("ERROR!\n" + this.status);
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/manager/portfolio_product?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
        UI dòng sản phẩm (ứng với mục dòng sản phẩm trong thanh menu)  
    */
    render() {
        return (
            <table className='tableProductLine'>
                <caption>Các dòng sản phẩm của công ty</caption>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Tên</th>
                        <th>Dung lượng</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        )
    }
}

export default ProductLine