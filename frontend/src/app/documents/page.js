import { Suspense } from "react";
import DocumentsContent from "./DocumentsContent";

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}