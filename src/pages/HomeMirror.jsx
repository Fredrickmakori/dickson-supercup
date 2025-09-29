import React from "react";
import Landing from "../components/Landing";

export default function HomeMirror() {
  // This page intentionally mirrors the site's home/landing page.
  // It simply re-uses the existing `Landing` component so the layout
  // stays consistent with the root path.
  return <Landing />;
}
