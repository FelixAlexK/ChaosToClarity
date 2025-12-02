import { Sparkles } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";

interface OrganizeButtonProps {
  isProcessing: boolean;
  content: string;
}


export function OrganizeButton({ isProcessing, content }: OrganizeButtonProps) {
  return (
    <Button
          type="submit"
          disabled={!content.trim() || isProcessing}

        >
          {isProcessing ? (
            <>
              <Spinner className="w-5 h-5" />
              <span>Creating your plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Transform into Weekly Plan</span>
            </>
          )}
        </Button>
  );
}