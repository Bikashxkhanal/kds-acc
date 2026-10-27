import puppeteer from 'puppeteer';

export const launchPdfBrowser = () => puppeteer.launch({
  headless: true,
  ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

export const logPdfError = (context, error) => {
  console.error(`[pdf] ${context}`, {
    name: error?.name,
    message: error?.message || String(error),
    stack: error?.stack,
    code: error?.code,
    cause: error?.cause ? { name: error.cause.name, message: error.cause.message, stack: error.cause.stack } : undefined
  });
};

export const logPdfStage = (context, stage, details = {}) => {
  console.info(`[pdf] ${context} ${stage}`, details);
};
