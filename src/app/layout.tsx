import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "FounderBox AI",
  description:
    "AI workspace for founders to plan, test, migrate, and remember product work."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#111116",
              border: "1px solid #2A2A35",
              color: "#F8F8F8"
            }
          }}
        />
      </body>
    </html>
  );
}
