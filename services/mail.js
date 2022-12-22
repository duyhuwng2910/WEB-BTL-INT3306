const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SERVICE_EMAIL_ADDRESS,
        pass: process.env.SERVICE_EMAIL_PASSWORD
    }
});

function verificationEmailOptions(_to, _token) {
    return {
        from: `Product Move <${process.env.SERVICE_EMAIL_ADDRESS}>`,
        to: _to,
        subject: `Đây là thư xác minh tài khoản email của bạn.`,
        text: `Đây là thư xác minh tài khoản email của bạn.`,
        html: `<p>Mã xác nhận email của bạn là ${_token} . Mã xác nhận này sẽ có hiệu lực trong 10 phút.</p>`
    }
}

function resetPasswordEmailOptions(_to, _token) {
    return {
        from: `Product Move <${process.env.SERVICE_EMAIL_ADDRESS}>`,
        to: _to,
        subject: `Đây là thư đổi mật khẩu tài khoản của bạn.`,
        text: `Đây là thư đổi mật khẩu tài khoản của bạn.`,
        html: `<p>Đây là mã xác nhận đổi mật khẩu của bạn ${_token} . Mã xác nhận này sẽ có hiệu lực trong 10 phút.</p>`
    }
}

function deleteAccountOptions(_to) {
    return {
        from: `Product Move <${process.env.SERVICE_EMAIL_ADDRESS}>`,
        to: _to,
        subject: `Đây là thư thu hồi tài khoản của bạn.`,
        text: `Đây là thư thu hồi tài khoản của bạn.`,
        html: `<p>Tài khoản của bạn đã bị thu hồi bởi người quản lý. 
        Có thể bạn đã vi phạm những nguyên tắc của cộng đồng học lý do nào đó. Hãy liên hệ với bên quản lý để giải đáp</p>`
    }
}

module.exports = {
    transporter,
    verificationEmailOptions,
    resetPasswordEmailOptions,
    deleteAccountOptions
}
