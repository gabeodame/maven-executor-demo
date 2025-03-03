export const logger = {
  info: (message: string) => console.log(`ℹ️  ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),
  warn: (message: string) => {
    console.warn(`WARN: ${message}`);
  },
};
