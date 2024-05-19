export function formatAttribute(type: string, value: string): string {
  switch (type) {
    case "class":
      return `.${value}`;
    case "id":
      return `#${value}`;
    default:
      return `[${value}]`;
  }
}
