const NodeClass = require('./bulkSendEmail.schema')
const {
    nodefn
} = require('@mayahq/module-sdk')

module.exports = nodefn(NodeClass, "maya-red-email")