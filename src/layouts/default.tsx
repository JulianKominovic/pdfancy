import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <svg
        className="fixed z-50 pointer-events-none isolate opacity-70 mix-blend-soft-light"
        width="100%"
        height="100%"
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg> */}
      <div className="relative z-10 flex h-screen gap-6">
        <Navbar />
        <main className="w-full px-2 overflow-auto">{children}</main>
      </div>
    </>
  );
}
