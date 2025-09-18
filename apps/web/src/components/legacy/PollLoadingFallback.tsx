import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PollLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-6 mb-6">
          <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg mb-6" />

          <div className="space-y-4 mb-6">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
          </div>

          <Separator className="mb-6" />

          <div className="flex gap-6 mb-4">
            <div className="h-5 bg-gray-200 animate-pulse rounded w-20" />
            <div className="h-5 bg-gray-200 animate-pulse rounded w-16" />
          </div>

          <div className="h-5 bg-gray-200 animate-pulse rounded w-32 mb-6" />

          <div className="flex gap-2 mb-8">
            <div className="h-9 bg-gray-200 animate-pulse rounded w-24" />
            <div className="h-9 bg-gray-200 animate-pulse rounded w-12" />
          </div>
        </Card>

        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-32" />
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-20" />
                </div>

                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />

                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 animate-pulse rounded-full w-full" />
                  <div className="flex justify-between text-sm">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-12" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
