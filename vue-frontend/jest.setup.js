if (typeof AggregateError === 'undefined') {
  global.AggregateError = class AggregateError extends Error {
    constructor(errors, message) {
      super(message)
      this.errors = errors
    }
  }
}
