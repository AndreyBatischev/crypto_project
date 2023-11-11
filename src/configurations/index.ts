export default () => ({
  port: process.env.PORT,
  db_port: process.env.DB_PORT,
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_database: process.env.DB_DATABASE,
  secret_jwt: process.env.SECRET,
  expire_jwt: process.env.EXPIRE_JWT,
  crypto_api_key: process.env.CRYPTO_API_KEY,
  crypto_api_key_payout: process.env.CRYPTO_API_KEY_PAYMANT,
  crypto_merchant: process.env.CRYPTO_MERCHANT,
});
