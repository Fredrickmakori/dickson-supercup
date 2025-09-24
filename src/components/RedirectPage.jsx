// RedirectPage.jsx
import { useEffect } from "react";

export default function RedirectPage() {
  useEffect(() => {
    window.location.href = "https://www.mchanga.africa/fundraiser/120550";
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Redirecting you to the fundraiser...</p>
    </div>
  );
}
