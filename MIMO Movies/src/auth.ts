import crypto from "crypto";

export const generateApiKey = (): string => {
  return `api_${crypto.randomBytes(32).toString("hex")}`;
};
