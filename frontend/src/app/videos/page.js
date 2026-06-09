import { Suspense } from "react";
import VideosContent from "./VideosContent";

export const dynamic = "force-dynamic";

export default function VideosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideosContent />
    </Suspense>
  );
}
