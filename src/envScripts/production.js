export function main() {
  const console = window.console;
  window.console = new Proxy(console, {
    apply() {}
  });
}
