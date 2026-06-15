"use client"
import { FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export function EmptyCardsState() {
  const navigate = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <FileImage className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">No cards yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Generate your first AI greeting card to see it here
      </p>
      <Button
        className="mt-6"
        onClick={() => navigate.push("/generate")}
      >
        Generate Card
      </Button>
    </div>
  );
}
