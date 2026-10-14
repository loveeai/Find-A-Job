const USERNAME_MIN_LENGTH = 4
const USERNAME_MAX_LENGTH = 20
const PASSWORD_MIN_LENGTH = 6
const PASSWORD_MAX_LENGTH = 20

const USERNAME_REGEX = /^[A-Za-z0-9_]{4,20}$/
const PASSWORD_REGEX = /^[A-Za-z0-9~!@#$%^&*()_+\-=\[\]{}|;:'",.<>/?]{6,20}$/

const USERNAME_PLACEHOLDER = '\u8bf7\u8f93\u5165\u8d26\u53f7'
const PASSWORD_PLACEHOLDER = '\u8bf7\u8f93\u5165\u5bc6\u7801'
const USERNAME_RULE_HINT = '\u89c4\u5219\uff1a4-20\u4f4d\uff0c\u4ec5\u9650\u5b57\u6bcd/\u6570\u5b57/\u4e0b\u5212\u7ebf'
const PASSWORD_RULE_HINT = '\u89c4\u5219\uff1a6-20\u4f4d\uff0c\u4ec5\u9650\u5b57\u6bcd/\u6570\u5b57/\u82f1\u6587\u7b26\u53f7\uff0c\u4e0d\u652f\u6301\u7a7a\u683c\u548c\u4e2d\u6587'
const USERNAME_RULE_MESSAGE = '\u8d26\u53f7\u9700\u4e3a4-20\u4f4d\uff0c\u4ec5\u9650\u5b57\u6bcd/\u6570\u5b57/\u4e0b\u5212\u7ebf'
const PASSWORD_RULE_MESSAGE = '\u5bc6\u7801\u9700\u4e3a6-20\u4f4d\uff0c\u4ec5\u9650\u5b57\u6bcd/\u6570\u5b57/\u82f1\u6587\u7b26\u53f7'

function toText(value) {
  if (value === undefined || value === null) {
    return ''
  }
  return String(value)
}

function sanitizeUserNameInput(value) {
  return toText(value)
    .replace(/[^A-Za-z0-9_]/g, '')
    .slice(0, USERNAME_MAX_LENGTH)
}

function sanitizePasswordInput(value) {
  return toText(value)
    .replace(/[^A-Za-z0-9~!@#$%^&*()_+\-=\[\]{}|;:'",.<>/?]/g, '')
    .slice(0, PASSWORD_MAX_LENGTH)
}

function validateUserName(value, emptyMessage = '\u8bf7\u8f93\u5165\u8d26\u53f7') {
  const userName = sanitizeUserNameInput(value)
  if (!userName) {
    return emptyMessage
  }
  if (!USERNAME_REGEX.test(userName)) {
    return USERNAME_RULE_MESSAGE
  }
  return ''
}

function validatePassword(value, emptyMessage = '\u8bf7\u8f93\u5165\u5bc6\u7801') {
  const password = toText(value).trim()
  if (!password) {
    return emptyMessage
  }
  if (!PASSWORD_REGEX.test(password)) {
    return PASSWORD_RULE_MESSAGE
  }
  return ''
}

module.exports = {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PLACEHOLDER,
  PASSWORD_REGEX,
  PASSWORD_RULE_HINT,
  PASSWORD_RULE_MESSAGE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PLACEHOLDER,
  USERNAME_REGEX,
  USERNAME_RULE_HINT,
  USERNAME_RULE_MESSAGE,
  sanitizePasswordInput,
  sanitizeUserNameInput,
  validatePassword,
  validateUserName
}
