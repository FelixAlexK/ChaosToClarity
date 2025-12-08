import { Settings, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'

interface SettingsDropdownProps {
  clearAllData: () => void
  deleteAllDoneTasks: () => void
}

export function SettingsDropdown({ clearAllData, deleteAllDoneTasks }: SettingsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>

      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => clearAllData()}>Clear All Data</DropdownMenuItem>
        <DropdownMenuItem onClick={() => deleteAllDoneTasks()}>Delete All Done</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
