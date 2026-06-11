import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <Card className="max-w-lg p-8 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-gold">FounderBox AI</p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Route not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This demo route does not exist. The main product workspace is ready at the
          dashboard.
        </p>
        <Button asChild className="mt-6">
          <Link href="/app/dashboard">Open dashboard</Link>
        </Button>
      </Card>
    </main>
  );
}
