export function toRefs(object) {
  const res = {}

  for(let key in object) {
    res[key] = toRef(object, key)
  }

  return res
}