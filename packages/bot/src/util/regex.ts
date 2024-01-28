export const BUTTON_URL_RE = /^(?:https?|discord):\/\/[^ ]+$/;

export const spaceEnum = (value: string) =>
  value.replaceAll(/[A-Z]/g, (match) => ` ${match}`).trim();
