import { demoFetch } from "@/lib/demo-user-client";

const API_SECRET = process.env.NEXT_PUBLIC_APP_API_SECRET;

export const fetcher = async (url) => {
  const res = await demoFetch(url, {
    headers: {
      'x-app-secret': API_SECRET,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export const swrOptions = {
  fetcher,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
};
