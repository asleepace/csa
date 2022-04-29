/**
 * Encrypt
 * encrypt text using given key
 */
async function encrypt(text, key, loop=true) {
	// step 0. validate input
  if (text.length > 128) throw("message too large (128 max)")
	if (key.length < 16) throw("key size too small (16 min)")
  // step 1. generate hash from they key
  const hash = await sha512(btoa(key));
	const pads = hash.length - text.length
  // step 2. convert to UInt8Array
  const ecode = new TextEncoder();
  const codex = ecode.encode(hash);
  const array = ecode.encode(text);
  // step 3. offset the XORs
	const multiplier = text.length * key.length
	const round = array.map((value, i) => {
		const index = ((i + 1) * multiplier) % codex.length
    return value ^ codex[index]
  });

  // step 4. convert to string
  const dcode = new TextDecoder();
  let value = dcode.decode(round);
  
	// step 5. add additional rounds
	if (loop === true) {
  	value = encrypt(value, hash + key, false)
  }
	
	// step 6. return value as string
  return value;
}

/**
 * Decrypt
 * decrypt cipher using given key
 */
async function decrypt(text, key) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  // step 1. generate hash from they key
  const hash = await sha512(btoa(key));
  // step 2. convert to UInt8Array
  const codex = encoder.encode(hash);
  const array = encoder.encode(text);
  // step 3. xor the results
  const output = array.map((value, i) => {
		const index = ((i + 1) * value) % codex.length
    return value ^ codex[index];
  });
  // step 4. convert to string
  const value = decoder.decode(output);
  // step 5. return results
  return value;
}


/**
 * Generate sha512 digest
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 */
async function sha512(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-512", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

/**
 * Test case
 */
async function main() {
  const key = "n,mWqrE@!#sS+Gbc$5";
  const msg = "my namme is colin";
  const out = await encrypt(msg, key);
  console.log({ out, len: out.length });
	const txt = await encrypt(out, key);
  console.log({ txt, len: txt.length });
}

main();
