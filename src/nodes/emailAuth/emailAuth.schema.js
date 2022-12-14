const { Node, Schema, fields } = require("@mayahq/module-sdk");

class EmailAuth extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "email-auth",
    label: "email-auth",
    category: "Maya Red Email",
    isConfig: true,
    fields: {
      // Whatever custom fields the node needs.
      service: new fields.SelectFieldSet({
        fieldSets: {
          sendgrid: {
            apiKey: new fields.Typed({
              type: "str",
              defaultVal: "",
              allowedTypes: ["msg", "str", "flow", "global"],
            }),
          },
          mailgun: {
            api_key: new fields.Typed({
              type: "str",
              defaultVal: "",
              allowedTypes: ["msg", "str", "flow", "global"],
            }),
            domain: new fields.Typed({
              type: "str",
              defaultVal: "",
              allowedTypes: ["msg", "str", "flow", "global"],
            }),
          },
        },
      }),
    },
  });

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    // Handle the message. The returned value will
    // be sent as the message to any further nodes.
  }
}

module.exports = EmailAuth;
