// This file is for storing global state that needs to be shared across the application.
// Be careful when using global state, as it can make the application harder to reason about.

// A flag to ensure that database validation runs only once per server instance.
export let dbValidationExecuted = false;

export function setDbValidationExecuted(value: boolean) {
  dbValidationExecuted = value;
}
