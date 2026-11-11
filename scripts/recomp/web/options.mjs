export function enableDebugConsoleOption(text) {
  const option = /^[ \t]*EnableDebugConsole[ \t]*=[^\r\n]*$/gim;
  const value = 'EnableDebugConsole=1';
  if (option.test(text)) return text.replace(option, value);

  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const section = /^\uFEFF?\[Options\][^\r\n]*(?:\r\n|\n|$)/im.exec(text);
  if (section) {
    const insertAt = section.index + section[0].length;
    const prefix = text.slice(0, insertAt);
    return `${prefix}${prefix.endsWith(newline) ? '' : newline}${value}${newline}${text.slice(insertAt)}`;
  }

  const separator = text && !/(?:\r\n|\n)$/.test(text) ? newline : '';
  return `${text}${separator}${value}${newline}`;
}
