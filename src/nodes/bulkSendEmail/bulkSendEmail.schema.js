const { Node, Schema, fields } = require("@mayahq/module-sdk");
const EmailAuth = require("../emailAuth/emailAuth.schema.js");
const { color } = require("../../constants.js");
class BulkSendEmail extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "bulk-send-email",
    label: "bulk-send-email",
    category: "Maya Red Email",
    isConfig: false,
    color,
    icon: "font-awesome/fa-envelope",
    fields: {
      // Whatever custom fields the node needs.
      EmailAuth: new fields.ConfigNode({ type: EmailAuth }),

      from: new fields.Typed({
        type: "str",
        defaultVal: "",
        allowedTypes: ["msg", "str", "flow", "global"],
      }),
      to: new fields.Typed({
        type: "str",
        defaultVal: "",
        allowedTypes: ["str", "msg", "flow", "global"],
      }),
      subject: new fields.Typed({
        type: "str",
        defaultVal: "",
        allowedTypes: ["str", "msg", "flow", "global"],
      }),
      message: new fields.Typed({
        type: "str",
        defaultVal: "",
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
    this.setStatus("PROGRESS", "Sending emails");
    const _this = this;
    const creds = vals.EmailAuth;
    const { service } = creds;

    const showdown  = require('showdown');
    const converter = new showdown.Converter();
    const formattedMessage = converter.makeHtml(vals.message);
    if (service == "sendgrid") {
      try {
        // convert vals.to from comma seperated email id and conver to array
        const toArray = vals.to.split(",").map((email) => email.trim());
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(creds.apiKey);
        const msgSend = {
          to: toArray, // replace these with your email addresses
          from: vals.from,
          subject: vals.subject,
          text: formattedMessage,
          html: formattedMessage,
        };
        sgMail
          .sendMultiple(msgSend)
          .then(() => {
            _this.setStatus("SUCCESS", "Emails sent successfully");
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
    } else {
      this.setStatus("ERROR", "Set sendgrid credentials");
      msg.__isError = true;
      msg.__error =
        "Please select sendgrid in the config node and set the credentials";
      this.redNode.send(msg);
    }
  }
}

module.exports = BulkSendEmail;
