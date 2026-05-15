import { Manrope, Google_Sans } from "next/font/google";
const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
});

const googleSans = Google_Sans({
    variable: "--font-google-sans",
    subsets: ["latin"],
});

export { manrope, googleSans };