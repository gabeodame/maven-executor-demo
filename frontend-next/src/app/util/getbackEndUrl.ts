export const getBackEndUrl = () =>
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_VITE_API_URL
    : process.env.NEXT_PUBLIC_DEV_URL;
