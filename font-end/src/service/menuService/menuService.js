import React from "react";
import { Navigate } from "react-router-dom";

class MenuService extends React.Component {
    /*
        logOut để xác định xem user vẫn đang hoạt động hay đã đăng xuất (false: đang hoạt động, true: đã đăng xuất),
        value khởi tạo mặc định là false
    */
    constructor(props) {
        super(props);
        this.state = {
            logOut: false
        }
        this.show = this.show.bind(this);
        this.showChange = this.showChange.bind(this);
        this.hover = this.hover.bind(this);
        this.unHover = this.unHover.bind(this);
        this.changeViewMenu = this.changeViewMenu.bind(this);
    }

    /*
        Xử lý trường hợp user onclick vào 1 mục trong menu mà mục đó chứa các mục con khác. Hàm này chuyển kiểu display của mục đó
        từ none thành block và ngược lại
    */
    show(event) {
        var ul = event.target.nextSibling;
        if (ul.style.display === "block") ul.style.display = "none";
        else ul.style.display = "block";
    }

    /*
        Khi user onclick vào 1 mục (các mục mà k chứa mục con nào nữa) trong menu thì nó sẽ thay đổi biến mà nó nhận 
        đc từ component khác truyền vào cho nó thông qua hàm đc truyền vào là changeTypeFunc(). Nếu onClick mục đăng xuất thì
        thay đổi state.logOut thành true
    */
    showChange(event) {
        if (event.target.innerHTML === "Đăng xuất") {
            this.setState({
                logOut: true
            })
        }
        else this.props.changeTypeFunc(event.target.innerHTML)
    }

    /*
        Hover vào mục nào trong menu thì mục đó chuyển thành chữ màu đen
    */
    hover(event) {
        event.target.style.color = "black";
    }

    /*
        Không hover vào mục trong menu nữa thì mục đó chuyển thành chữ màu ban đầu
    */
    unHover(event) {
        event.target.style.color = "grey";
    }

    /*
        Xử lý event user onclick vào icon bật/tắt của thanh menu: chuyển tên lớp của icon đó để có css phù hợp với
        trường hợp bật/tắt
    */
    changeViewMenu(event) {
        var ulMenu = document.querySelector(".divMenu > ul");
        if (ulMenu.style.display === "block" || ulMenu.style.display === "") {
            ulMenu.style.display = "none";
            event.target.className = "fas fa-angle-double-right";
            event.target.previousSibling.previousSibling.style.display = "none";
        } else {
            ulMenu.style.display = "block";
            event.target.className = "fas fa-angle-double-left";
            event.target.previousSibling.previousSibling.style.display = "block";
        }
    }

    render() {

        /*
            Kiểm tra user đang hoạt động hay đăng xuất, if đăng xuất thì chuyển về UI login
        */
        if (this.state.logOut) return <Navigate to='/' />

        /*
            Menu của UI trung tâm bảo hành
        */
        return (
            <div className="divMenu">
                <h1>BigCorp</h1>
                <ul id="menu">
                    <li>
                        <a href="#!" onClick={this.show} onMouseOver={this.hover} onMouseOut={this.unHover}>Kho</a>
                        <ul>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Trong kho</li>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Sửa chữa xong</li>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Không thể sửa</li>
                        </ul>
                    </li>
                    <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Thông báo bảo hành</li>
                    <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Thống kê</li>
                    <li>
                        <a href="#!" onClick={this.show} onMouseOver={this.hover} onMouseOut={this.unHover}>Tài khoản</a>
                        <ul>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Thông tin tài khoản</li>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Thay đổi email</li>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Thay đổi mật khẩu</li>
                            <li onClick={this.showChange} onMouseOver={this.hover} onMouseOut={this.unHover}>Đăng xuất</li>
                        </ul>
                    </li>
                    <h1><br></br></h1>
                </ul>
                <i className='fas fa-angle-double-left' onClick={this.changeViewMenu}></i>
            </div>
        );
    }
}

export default MenuService