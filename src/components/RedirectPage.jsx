// RedirectPage.jsx
import { useEffect } from "react";

export default function RedirectPage() {
  useEffect(() => {
    try {
      // avoid running during tests (jsdom doesn't implement navigation)
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV !== "test" &&
        window.location
      ) {
        window.location.href = "https://www.mchanga.africa/fundraiser/120550";
      }
    } catch (e) {
      // swallow in test envs
      // console.debug('Redirect suppressed in test environment', e);
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Redirecting you to the fundraiser...</p>
    </div>
  );
}
