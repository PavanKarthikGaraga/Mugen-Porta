import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: [ "400" , "500", "600" ,"700"],
  subsets: ["latin"],
});


export const metadata = {
  title: "KL SAC Activities Portal",
  description: "SAC Activities",
};

// Disable PWA and service worker
export const viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Unregister any service workers
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }

              // Force reload if old chunks are cached
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) {
                    if (name.includes('next') || name.includes('workbox')) {
                      caches.delete(name);
                    }
                  }
                });
              }

              // Add cache busting parameter to avoid 404s
              const currentTime = Date.now();
              const links = document.querySelectorAll('link[rel="preload"], link[rel="modulepreload"]');
              links.forEach(link => {
                if (link.href && link.href.includes('/_next/static/')) {
                  link.href += (link.href.includes('?') ? '&' : '?') + '_t=' + currentTime;
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
