export const getStartCount = (repoOwner, repoName) => {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}`

  return fetch(url).then(res => {
    if(res.status === 200) {
      return res.json()
    }

    throw new Error('请求失败', res.status)
  })
  .then(res => {
    console.log(res);
  })
}
