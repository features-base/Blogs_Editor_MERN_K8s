async function post (options) {
  if(typeof options === 'string' || options instanceof String)
    options = { uri: options , body:{} }
    const response = await fetch(options.uri, {
        method: 'POST',
        body: JSON.stringify(options.body),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
  const data = response.json()
  return data
}

async function get (options) {
  if(typeof options === 'string' || options instanceof String)
    options = { uri: options }
  const res = await fetch(options.uri);
  if (res.ok) {
    const data = await res.json();
    return data;
  }
  throw error('error')
}

const request = {
  post,
  get
}

module.exports = request