const csp = (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL;

  res.setHeader(
    "Content-Security-Policy",
    `
      default-src 'self';
      connect-src 'self' ${clientUrl};
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
      font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
      script-src 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim()
  );

  next();
};

module.exports = csp;
