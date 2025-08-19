import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: [ "400" , "500", "600" ,"700"],
  subsets: ["latin"],
});


export const metadata = {
  title: "KL University SIL",
  description: "SIL Management portal for KL University SAC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}> 
      <body
        className={`${poppins.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
