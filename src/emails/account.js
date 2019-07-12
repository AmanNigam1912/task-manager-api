const sgMail = require('@sendgrid/mail')

//api key break them into env variables
//const sendgridAPIKey = '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'


//let send grid module know we have to work with the above API key
//sgMail.setApiKey(sendgridAPIKey)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({ 
//     to: 'nigam.ama@husky.neu.edu',
//     from: 'nigam.ama@husky.neu.edu',
//     subject: 'This is my first creation',
//     text: 'I hope this one actually get to you.'
// })

const sendWelcomeEmail = (email, name) => {
    //send({}) returns a promise so we can use async await
    sgMail.send({
        to: email,
        from: 'nigam.ama@husky.neu.edu',
        subject: 'Thanks for joining in!',
        //use javascript es6 template string feature
        //can inject variable inside. can only be used with `` template string only
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const cancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'nigam.ama@husky.neu.edu',
        subject: 'We will miss you!',
        text: `We will miss you, ${name}. Please let us know what better we could have done.`
    })
}

module.exports = {
    sendWelcomeEmail,
    cancellationEmail
}