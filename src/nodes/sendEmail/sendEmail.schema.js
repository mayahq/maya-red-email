const { Node, Schema, fields } = require("@mayahq/module-sdk");
const EmailAuth = require("../emailAuth/emailAuth.schema.js");
class SendEmail extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "send-email",
    label: "send-email",
    category: "Maya Red Email",
    isConfig: false,
    fields: {
      // Whatever custom fields the node needs.
      EmailAuth: new fields.ConfigNode({ type: EmailAuth }),
      to: new fields.Typed({
        type: "str",
        defaultVal: "",
        allowedTypes: ["str", "msg", "flow", "global"],
      }),
      subject: new fields.Typed({
        type: "str",
        allowedTypes: ["str", "msg", "flow", "global"],
      }),
      message: new fields.Typed({
        type: "str",
        allowedTypes: ["str", "msg", "flow", "global"],
      }),
    },
  });

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    // Handle the message. The returned value will
    // be sent as the message to any further nodes.
    this.setStatus("PROGRESS", "Sending email");
    const _this = this;
    const props = vals.EmailAuth;
    const { service } = props;
    if (service == "sendgrid") {
      try {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(props.apiKey);
        const mail = {
          to: vals.to, // Change to your recipient
          from: props.senderEmail, // Change to your verified sender
          subject: vals.subject,
          text: vals.message,
          html: vals.message,
        };
        sgMail
          .send(mail)
          .then(() => {
            _this.setStatus("SUCCESS", "Email sent successfully");
            _this.redNode.send(msg);
          })
          .catch((error) => {
            _this.setStatus("ERROR", error.message);
            msg.__isError = true;
            msg.__error = error;
            _this.redNode.send(msg);
          });
      } catch (err) {
        _this.setStatus("ERROR", err.message);
        msg.__isError = true;
        msg.__error = err;
        _this.redNode.send(msg);
      }
    } else if (service == "mailgun") {
      try {
        const mailgun = require("mailgun-js");
        const mg = mailgun({ apiKey: props.api_key, domain: props.domain });
        const data = {
          from: props.from,
          to: vals.to,
          subject: vals.subject,
          text: vals.message,
          html: vals.message,
        };
        mg.messages().send(data, function (error, body) {
          if(error){
            _this.setStatus("ERROR", error.message);
            msg.__isError = true;
            msg.__error = error;
            _this.redNode.send(msg);
          }
          else{
            _this.setStatus("SUCCESS", "Email sent successfully");
            _this.redNode.send(msg);
          }
        });
      } catch (err) {
        _this.setStatus("ERROR", err.message);
        msg.__isError = true;
        msg.__error = err;
        _this.redNode.send(msg);
      }
    }
    //return msg;
  }
}

module.exports = SendEmail;
