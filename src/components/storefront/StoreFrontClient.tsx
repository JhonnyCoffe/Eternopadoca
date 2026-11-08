"use client";

import dynamic from "next/dynamic";

const StoreFront = dynamic(
  () => import("@/components/storefront/StoreFront").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="min-h-screen text-zinc-100 bg-[#121215]" /> }
);

export default StoreFront;
