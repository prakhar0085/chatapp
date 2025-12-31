// Generate RSA Key Pair for E2EE
export const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Export Public Key
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyPem = btoa(String.fromCharCode(...new Uint8Array(publicKey)));

    // Export Private Key
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const privateKeyPem = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem,
    };
  } catch (error) {
    console.error("Key generation failed:", error);
    return null;
  }
};

// Store Private Key in localStorage (In production, use IndexedDB)
export const storePrivateKey = (privateKey) => {
  localStorage.setItem("chat_private_key", privateKey);
};

// Retrieve Private Key
export const getPrivateKey = () => {
  return localStorage.getItem("chat_private_key");
};

// Check if user has keys
export const hasKeys = () => {
  return !!localStorage.getItem("chat_private_key");
};
