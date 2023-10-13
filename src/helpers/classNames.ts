export function classNames(names: Record<string, boolean>): string {
  const classes = [];

  for (const className in names) {
    if (names[className]) {
      classes.push(className);
    }
  }

  return classes.join(" ");
}
