const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "nigam.ama@northeastern.edu",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
  });
};

const cancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "nigam.ama@northeastern.edu",
    subject: "We will miss you!",
    text: `We will miss you, ${name}. Please let us know what better we could have done.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  cancellationEmail,
};
