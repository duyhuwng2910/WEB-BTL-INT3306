import Chart from 'chart.js/auto';
import React, { Fragment } from "react";

class ErrorStatistical extends React.Component {

    constructor(props) {
        super(props);
        this.changeStatisticalType = this.changeStatisticalType.bind(this);
        this.productLine = this.productLine.bind(this);
    }

    changeStatisticalType(event) {
        var type = event.target.value;
        if (type === 'agent') this.componentDidMount();
        else this.productLine();
    }

    productLine() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText);
                    var divChart = document.getElementById("chartCircle");
                    if (data.productLine.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: data.productLine,
                            datasets: [{
                                label: 'Tỉ lệ',
                                data: data.amount,
                                hoverOffset: 4
                            }]
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/factory/list_productline_fail?id_user=' + this.props.id, false);
        xmlHttp.send(null); 
    }

    componentDidMount() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText);
                    var divChart = document.getElementById("chartCircle");
                    if (data.name.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: data.name,
                            datasets: [{
                                label: 'Tỉ lệ',
                                data: data.amount,
                                hoverOffset: 4
                            }]
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/factory/list_agent_fail?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    /*
      UI theo dõi sản phẩm (tương ứng với mục theo dõi trong thanh menu)  
    */
    render() {

        return (
            <Fragment>
                <div className="createAccount">
                    <h1>Tỉ lệ lỗi</h1>
                </div>
                <div className="tableProductLine-select">
                    <label htmlFor='statisticalType'>Thống kê theo:  </label>
                    <select id="statisticalType" onChange={this.changeStatisticalType}>
                        <option value="agent">Đại lý</option>
                        <option value="productLine">Dòng sản phẩm</option>
                    </select>
                </div>
                <div id='chartCircle'>
                </div>
            </Fragment>
        )
    }
}

export default ErrorStatistical