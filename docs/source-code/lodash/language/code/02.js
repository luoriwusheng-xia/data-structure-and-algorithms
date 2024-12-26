/**
 *获取 正则表达式的 flags
 */
function copyRegExpFlags(regexp) {
  let flags = '';
  if (regexp.global) flags += 'g';
  if (regexp.ignoreCase) flags += 'i';
  if (regexp.multiline) flags += 'm';
  if (regexp.unicode) flags += 'u';
  if (regexp.sticky) flags += 'y';
  if (regexp.dotAll) flags += 's';
  return flags;
}

let r1 = /[0-9]/gim;

console.log(copyRegExpFlags(r1)); // gim
