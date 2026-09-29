import "dotenv/config";

function required(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  deepseek: {
    apiKey: required("DEEPSEEK_API_KEY"),
    model: required("DEEPSEEK_MODEL", "deepseek-chat"),
  },
  whatsapp: {
    token: required("WHATSAPP_TOKEN"),
    phoneNumberId: required("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: required("WHATSAPP_VERIFY_TOKEN"),
  },
  instagram: {
    pageAccessToken: required("IG_PAGE_ACCESS_TOKEN"),
    verifyToken: required("IG_VERIFY_TOKEN"),
  },
};
