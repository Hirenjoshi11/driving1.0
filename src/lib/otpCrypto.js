/**
 * Browser-side crypto for the end-to-end OTP relay.
 *
 * The guarantee: the plaintext OTP is encrypted on the citizen's device to the
 * operator's public key, and can only be decrypted in the operator's browser
 * with the private key that never left it. The server relays ciphertext only.
 *
 * These functions require Web Crypto (window.crypto.subtle) and therefore run
 * only in the browser, never in a route handler.
 */

const RSA_PARAMS = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Operator side: make an ephemeral keypair for one relay request.
 * Returns the public key as base64 SPKI (to send to the citizen) and the
 * private CryptoKey (kept in memory, never serialised, never sent).
 */
export async function generateOperatorKeypair() {
  const pair = await window.crypto.subtle.generateKey(RSA_PARAMS, true, ['encrypt', 'decrypt']);
  const spki = await window.crypto.subtle.exportKey('spki', pair.publicKey);
  return { publicKeyB64: bufToB64(spki), privateKey: pair.privateKey };
}

/**
 * Citizen side: encrypt the OTP to the operator's public key, on-device.
 * Returns base64 ciphertext. The plaintext never leaves this call.
 */
export async function encryptOtpToPublicKey(publicKeyB64, otp) {
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    b64ToBuf(publicKeyB64),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const enc = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    enc.encode(String(otp))
  );
  return bufToB64(ciphertext);
}

/**
 * Operator side: decrypt the relayed ciphertext with the in-memory private key.
 */
export async function decryptOtp(privateKey, ciphertextB64) {
  const plainBuf = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    b64ToBuf(ciphertextB64)
  );
  return new TextDecoder().decode(plainBuf);
}
