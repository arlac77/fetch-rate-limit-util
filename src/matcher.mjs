export function nameExtensionMatcher(extensions) {
  const r = new RegExp(
    `(${extensions.map(x => x.replace(/\./, "\\.")).join("|")})$`
  );
  return entry => r.test(entry.name);
}
