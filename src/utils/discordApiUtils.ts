const hex2bin = (hex: string) => {
  const buf = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Number.parseInt(hex.substr(i * 2, 2), 16);
  }
  return buf;
};

const PUBLIC_KEY = crypto.subtle.importKey(
  "raw",
  hex2bin("50a4b185ecaaf54abfb50418eb14575209511de333fa3c3fb6209ea9f2ab2519"),
  {
    name: "NODE-ED25519",
    namedCurve: "NODE-ED25519",
  },
  true,
  ["verify"],
);

const encoder = new TextEncoder();

export const validateSecurityHeaders = async (request: Request) => {
  const signature = hex2bin(request.headers.get("X-Signature-Ed25519")!);
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const unknown = await request.clone().text();

  return await crypto.subtle.verify("NODE-ED25519", await PUBLIC_KEY, signature, encoder.encode(timestamp + unknown));
};
