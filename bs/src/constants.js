 const isHttpsOrigin = process.env.CORS_ORIGIN?.startsWith("https://");

 const options = {
    httpOnly: true,
    secure: true,
  };

  const NETWORK_OPTIONS_CORS = {
    httpOnly : true, 
    secure : Boolean(isHttpsOrigin),
    sameSite : isHttpsOrigin ? "none" : "lax"
  }

  // the given template is for downlading details of like customer, stafff and other
  const downloadReportHtmlTemplate= ``

  // billing PDF , this template is for billings only 
  const billingHtmlTemplate = ``

  export {
    options, 
    NETWORK_OPTIONS_CORS,
    downloadReportHtmlTemplate, 
    billingHtmlTemplate
  }
