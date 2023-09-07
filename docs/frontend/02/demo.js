async function getUser() {
  return await fetch('./1.json')
}

async function m1() {
  return await getUser()
}

async function m2() {
  return await m1()
}

async function main() {
  return await m2()
}

main()