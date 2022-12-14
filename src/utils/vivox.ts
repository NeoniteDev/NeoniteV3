/*
* Vivox Token Generation Example - JavaScript
*
* NOTE: There are multiple ways to handle SHA-256 in JavaScript
* Stanford JS Crypto Library - https://crypto.stanford.edu/sjcl/ (used below)
* Source - http://bitwiseshiftleft.github.io/sjcl/sjcl.js
* SHA256 from NPM - https://www.npmjs.com/package/sha256
*
*/

import * as sjcl from 'sjcl';

export function vxGenerateToken(key: string, payload: Object) {
    // Header is static - base64url encoded {}
    const base64urlHeader = base64URLEncode("{}"); // Can also be defined as a constant "e30"

    // Encode payload
    const base64urlPayload = base64URLEncode(JSON.stringify(payload));

    // Join segments to prepare for signing
    const segments = [base64urlHeader, base64urlPayload];
    const toSign = segments.join(".");

    // Sign token with key and SHA-256
    const hmac = new sjcl.misc.hmac(sjcl.codec.utf8String.toBits(key), sjcl.hash.sha256);
    const signature = sjcl.codec.base64.fromBits(hmac.encrypt(toSign));
    const base64urlSigned = signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

    segments.push(base64urlSigned);

    return segments.join(".");
}


function base64URLEncode(value: string) {
    return Buffer.from(value).toString('base64').replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
}