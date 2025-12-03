import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OrganizeButton } from './OrganizeButton'

interface BrainDumpInputProps {
  onSubmit?: (content: string) => Promise<void>
  isProcessing: boolean
}

const MAX_CONTENT_LENGTH = 1500

export function BrainDumpInput({ onSubmit, isProcessing }: BrainDumpInputProps) {
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && !isProcessing) {
      await onSubmit!(content)
      setContent('')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="grid w-full gap-2">
        <div className="relative">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="h-80 max-w-4xl"
            maxLength={MAX_CONTENT_LENGTH}
            placeholder="Dump everything on your mind here... tasks, ideas, worries, goals, appointments - anything and everything. Don't worry about organizing it, just get it all out."
            disabled={isProcessing}
          />
          {content.length > 0 && (
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {content.length}
              {' '}
              /
              {MAX_CONTENT_LENGTH}
              {' '}
              characters
            </div>
          )}
          {content.length > 0 && (
            <div className="absolute bottom-4 left-4 text-sm text-gray-400">
              <Button
                variant="link"
                size="sm"
                onClick={() => setContent('')}
                disabled={isProcessing}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <OrganizeButton isProcessing={isProcessing} content={content}></OrganizeButton>
      </form>

    </div>
  )
}
