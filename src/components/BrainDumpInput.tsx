import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner} from "@/components/ui/spinner"


interface BrainDumpInputProps {
  onSubmit?: (content: string) => Promise<void>;
  isProcessing: boolean;
}

export function BrainDumpInput({ onSubmit, isProcessing }: BrainDumpInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isProcessing) {
      await onSubmit!(content);
      setContent('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="grid w-full gap-2">
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='h-80'
            placeholder="Dump everything on your mind here... tasks, ideas, worries, goals, appointments - anything and everything. Don't worry about organizing it, just get it all out."
            disabled={isProcessing}
          />
          {content.length > 0 && (
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {content.length} characters
            </div>
          )}
        </div>

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
      </form>

    </div>
  );
}
