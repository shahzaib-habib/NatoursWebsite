const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');




// new Email(user, url).sendWelcome();

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        // return nodemailer.createTransport({
        //     host: "smtp.mailtrap.io",
        //     port: 2525,
        //     auth: {
        //         user: "5d9e09c9773271",
        //         pass: "9733dc3b0ecdda"
        //     }
        // });

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        // Send the actual email
        // 1)Render the HTML for the email based on Pug Template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        // 3) Create a transport and send email

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
};



// const sendEmail = async options => {
//     // 1) Create a transporter
//     /*
//     const transporter = nodemailer.createTransport({
//         host: "smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//             user: "5d9e09c9773271",
//             pass: "9733dc3b0ecdda"
//         }
//     });
//     */

//     // 2) Define the email options
//     const mailOptions = {
//         from: 'Jonas Schmedtmann <hello@jonas.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         // html:
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
// };


// module.exports = sendEmail;
