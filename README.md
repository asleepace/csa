# Cryptographically Secure Algorithm

The following algorithm is not cryptographically secure (yet) and <b>should not</b> be used where security is paramount.

## The Basics

```Javascript
async function encrypt(text, key, loop = true) {
  // step 0. validate input
  if (text.length > 128) throw "message too large (128 max)";
  if (key.length < 16) throw "key size too small (16 min)";
  // step 1. generate hash from they key
  const hash = await sha512(btoa(key));
  const pads = hash.length - text.length;
  // step 2. convert to UInt8Array
  const ecode = new TextEncoder();
  const codex = ecode.encode(hash);
  const array = ecode.encode(text);
  // step 3. offset the XORs
  const multiplier = text.length * key.length;
  const round = array.map((value, i) => {
    const index = ((i + 1) * multiplier) % codex.length;
    return value ^ codex[index];
  });

  // step 4. convert to string
  const dcode = new TextDecoder();
  let value = dcode.decode(round);

  // step 5. add additional rounds
  if (loop === true) {
    value = encrypt(value, hash + key, false);
  }

  // step 6. return value as string
  return value;
}
```

## View Exmaple

https://jsfiddle.net/asleepace/bxzpraq2/30/
