import Chart from 'chart.js/auto';
import React, { Fragment } from "react";

class Statistical extends React.Component {

    constructor(props) {
        super(props);
        this.changeShow = this.changeShow.bind(this);
        this.serviceAndQuarter = this.serviceAndQuarter.bind(this);
        this.serviceAndYear = this.serviceAndYear.bind(this);
        this.fixedAndMonth = this.fixedAndMonth.bind(this);
        this.fixedAndQuarter = this.fixedAndQuarter.bind(this);
        this.fixedAndYear = this.fixedAndYear.bind(this);
        this.failAndMonth = this.failAndMonth.bind(this);
        this.failAndQuarter = this.failAndQuarter.bind(this);
        this.failAndYear = this.failAndYear.bind(this);
    }

    changeShow() {
        const type = document.getElementById('statisticalType').value;
        const time = document.getElementById('statisticalTime').value;
        switch(type) {
            case 'service': {
                switch(time) {
                    case 'month': this.componentDidMount(); break;
                    case 'quarter': this.serviceAndQuarter(); break;
                    default: this.serviceAndYear();
                }
                break;
            }
            case 'fixed': {
                switch(time) {
                    case 'month': this.fixedAndMonth(); break;
                    case 'quarter': this.fixedAndQuarter(); break;
                    default: this.fixedAndYear();
                }
                break;
            }
            default: {
                switch(time) {
                    case 'month': this.failAndMonth(); break;
                    case 'quarter': this.failAndQuarter(); break;
                    default: this.failAndYear();
                }
            }
        }
    }

    serviceAndQuarter() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    var arrQuarter = [];
                    var arrAmount = [];
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    for (var i = 0; i < data.length; i++) {
                        arrQuarter[i] = data[i].quarter + '/' + data[i].year;
                        arrAmount[i] = data[i].amount;
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: arrQuarter,
                            datasets: [{
                                label: 'Số lượng',
                                data: arrAmount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/list_quarter_erservice?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    serviceAndYear() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    var years = [], amount = [];
                    for (var i = 0; i < data.length; i++) {
                        years[i] = data[i].year;
                        amount[i] = data[i].amount;
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: years,
                            datasets: [{
                                label: 'Số lượng',
                                data: amount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/list_year_erservice?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    fixedAndMonth() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    var arrMonth = [];
                    var arrAmount = [];
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    else {
                        for (var i = 0; i < data.length; i++) {
                            arrMonth[i] = data[i].month + '/' + data[i].year;
                            arrAmount[i] = data[i].amount;
                        }
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: arrMonth,
                            datasets: [{
                                label: 'Số lượng',
                                data: arrAmount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/list_month_fixedproduct?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    fixedAndQuarter() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    var arrQuarter = [];
                    var arrAmount = [];
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    else {
                        for (var i = 0; i < data.length; i++) {
                            arrQuarter[i] = data[i].quarter + '/' + data[i].year;
                            arrAmount[i] = data[i].amount;
                        }
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: arrQuarter,
                            datasets: [{
                                label: 'Số lượng',
                                data: arrAmount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/list_quarter_fixedproduct?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    fixedAndYear() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    var years = [], amount = [];
                    for (var i = 0; i < data.length; i++) {
                        years[i] = data[i].year;
                        amount[i] = data[i].amount;
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: years,
                            datasets: [{
                                label: 'Số lượng',
                                data: amount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/list_year_fixedproduct?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    failAndMonth() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    var arrMonth = [];
                    var arrAmount = [];
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    else {
                        for (var i = 0; i < data.length; i++) {
                            arrMonth[i] = data[i].month + '/' + data[i].year;
                            arrAmount[i] = data[i].amount;
                        }
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: arrMonth,
                            datasets: [{
                                label: 'Số lượng',
                                data: arrAmount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/list_month_failproduct?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    failAndQuarter() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    var arrQuarter = [];
                    var arrAmount = [];
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    else {
                        for (var i = 0; i < data.length; i++) {
                            arrQuarter[i] = data[i].quarter + '/' + data[i].year;
                            arrAmount[i] = data[i].amount;
                        }
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: arrQuarter,
                            datasets: [{
                                label: 'Số lượng',
                                data: arrAmount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/list_quarter_failproduct?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    failAndYear() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    var years = [], amount = [];
                    for (var i = 0; i < data.length; i++) {
                        years[i] = data[i].year;
                        amount[i] = data[i].amount;
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: years,
                            datasets: [{
                                label: 'Số lượng',
                                data: amount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/service/list_year_failproduct?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }

    // Thống kê theo cần bảo hành và theo tháng
    componentDidMount() {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const data = JSON.parse(this.responseText).list;
                    var divChart = document.getElementById("chart");
                    var arrMonth = [];
                    var arrAmount = [];
                    if (data.length === 0) {
                        if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                        return;
                    }
                    else {
                        for (var i = 0; i < data.length; i++) {
                            arrMonth[i] = data[i].month + '/' + data[i].year;
                            arrAmount[i] = data[i].amount;
                        }
                    }
                    var ctx = document.createElement("canvas");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: arrMonth,
                            datasets: [{
                                label: 'Số lượng',
                                data: arrAmount,
                                borderWidth: 1
                            }]
                        },
                        options: {
                        scales: {
                            y: {
                            beginAtZero: true
                            }
                        }
                        }
                    });
                    ctx.style.display = 'inline';
                    if (divChart.firstChild) divChart.removeChild(divChart.firstChild);
                    divChart.appendChild(ctx);
                }
            }
        }
        xmlHttp.open('GET', 'http://localhost:8000/auth/list_month_erservice?id_user=' + this.props.id, false);
        xmlHttp.send(null);
    }
    /*
      UI theo dõi sản phẩm (tương ứng với mục theo dõi trong thanh menu)  
    */
    render() {

        return (
            <Fragment>
                <div className="createAccount">
                    <h1>Thống kê sản phẩm</h1>
                </div>
                <div className="tableProductLine-select">
                    <label>Thống kê theo:  </label>
                    <select id="statisticalType" onChange={this.changeShow}>
                        <option value="service">Cần bảo hành</option>
                        <option value="fixed">Bảo hành xong</option>
                        <option value="fail">Lỗi</option>
                    </select>
                    <select id="statisticalTime" onChange={this.changeShow}>
                        <option value="month">Tháng</option>
                        <option value="quarter">Quý</option>
                        <option value="year">Năm</option>
                    </select>
                </div>
                <div id='chart'>
                </div>
            </Fragment>
        )
    }
}

export default Statistical