import puppeteer from 'puppeteer';

export const launchPdfBrowser = () => puppeteer.launch({
  headless: true,
  ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

export const logPdfError = (context, error) => {
  console.error(`[pdf] ${context}`, error?.stack || error);
};
