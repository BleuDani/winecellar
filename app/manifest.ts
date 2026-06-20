import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wine Cellar",
    short_name: "Wine Cellar",
    description: "Personal wine cellar management",
    start_url: "/",
    display: "standalone",
    background_color: "#fefbf8",
    theme_color: "#d55d0d",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
