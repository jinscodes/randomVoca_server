import crypto from "crypto";

interface Props {
  header: JSON;
  payload: JSON;
}

export const jwt = ({ header, payload }: Props) => {
  const encodedHeader = base64(header);
  const encodedPayload = base64(payload);
  const signiture = crypto
    .createHmac("sha256", "secret_key")
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace("=", "");
  const jwt = `${encodedHeader}.${encodedPayload}.${signiture}`;

  return jwt;
};

const base64 = (json: JSON) => {
  const stringify = JSON.stringify(json);
  const base64Encoded = Buffer.from(stringify).toString("base64");
  const paddingRm = base64Encoded.replace("=", "");

  return paddingRm;
};
