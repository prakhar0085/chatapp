// Helper to buffer
const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const ab2str = (buf) => {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};

const importPublicKey = async (pem) => {
  const binaryDer = str2ab(atob(pem));
  return window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
};

const importPrivateKey = async (pem) => {
  const binaryDer = str2ab(atob(pem));
  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
};

export const encryptMessage = async (publicKeyPem, text) => {
  try {
    if (!publicKeyPem) return text; // If no key, send as plain (or fail)

    // 1. Generate AES Session Key
    const sessionKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    // 2. Encrypt Text with AES
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encodedText = enc.encode(text);
    
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      sessionKey,
      encodedText
    );

    // 3. Encrypt Session Key with RSA (Recipient's Public Key)
    const publicKey = await importPublicKey(publicKeyPem);
    const sessionKeyRaw = await window.crypto.subtle.exportKey("raw", sessionKey);
    
    const encryptedSessionKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      sessionKeyRaw
    );

    // 4. Package it all
    const payload = {
      iv: btoa(ab2str(iv)),
      content: btoa(ab2str(encryptedContent)),
      key: btoa(ab2str(encryptedSessionKey))
    };

    return JSON.stringify(payload);
  } catch (error) {
    console.error("Encryption failed:", error);
    return text; // Fallback? Or error.
  }
};

export const decryptMessage = async (privateKeyPem, encryptedJson) => {
  try {
    // Attempt parse
    let payload;
    try {
        payload = JSON.parse(encryptedJson);
    } catch {
        return encryptedJson; // Not JSON -> Plain text
    }

    if (!payload.iv || !payload.key || !payload.content) return encryptedJson;

    // 1. Import Private Key
    const privateKey = await importPrivateKey(privateKeyPem);

    // 2. Decrypt Session Key
    const encryptedSessionKey = str2ab(atob(payload.key));
    const sessionKeyRaw = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedSessionKey
    );

    // 3. Import Session Key
    const sessionKey = await window.crypto.subtle.importKey(
      "raw",
      sessionKeyRaw,
      { name: "AES-GCM" },
      true,
      ["decrypt"]
    );

    // 4. Decrypt Content
    const iv = str2ab(atob(payload.iv));
    const encryptedContent = str2ab(atob(payload.content));

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      sessionKey,
      encryptedContent
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);

  } catch (error) {
    console.error("Decryption failed:", error);
    return "🔒 Encrypted Message (Decryption Failed)";
  }
};
