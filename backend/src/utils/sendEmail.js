const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "votre.email@gmail.com",
    pass: "votreMotDePasse",
  },
});
let mailOptions = {
  from: "votre.email@gmail.com",
  to: "destinataire.email@example.com",
  subject: "Envoi d'email via Node.js",
  text: "Bonjour, ceci est un email envoyé via Node.js et Nodemailer.",
};
transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email envoyé: " + info.response);
  }
});
