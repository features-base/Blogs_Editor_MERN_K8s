//  Wrapper around fetch for post request
async function post (options) {
  if(typeof options === 'string' || options instanceof String)
    options = { uri: options , body:{} }
  const res = await fetch(options.uri, {
      method: 'POST',
      body: JSON.stringify(options.body),
      headers: {
          'Content-type': 'application/json',
      },
  })
  if (res.ok) {
    const data = await res.json();
    return data;
  }
  throw ({name:'res not ok',res})
}

//  Wrapper around fetch for get request
async function get (options) {
  if(typeof options === 'string' || options instanceof String)
    options = { uri: options }
  const res = await fetch(options.uri);
  if (res.ok) {
    const data = await res.json();
    return data;
  }
  throw ({name:'res not ok',res})
}

const request = {
  post,
  get
}

module.exports = request