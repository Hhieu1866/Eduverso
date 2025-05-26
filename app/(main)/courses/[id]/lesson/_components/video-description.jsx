"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function VideoDescription({ description }) {
  return (
    <div className="mt-4">
      <Tabs defaultValue="details">
        <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger className="capitalize" value="details">
            Description
          </TabsTrigger>
        </TabsList>
        <div className="pt-3">
          <TabsContent value="details">
            <div>{description}</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default VideoDescription;
