const config = {
  port: parseInt(process.env.PORT || "5001"),
  secretKey: process.env.SECRET_KEY || "fingerprint_customer",
};

module.exports = config;
