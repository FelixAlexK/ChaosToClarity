import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface InfoCardProps {
  color?: string;
}

export function InfoCard({ color }: InfoCardProps) {
  return <Card className={color ? `border-${color}-50` : ''}>
    <CardHeader>
      <CardTitle className={color ? `text-${color}-900` : ''}>How It Works</CardTitle>
      <CardDescription className={color ? `text-${color}-700` : ''}>
        After you submit your brain dump, our AI analyzes the information and generates a personalized weekly plan to help you stay organized and focused.
      </CardDescription>
    </CardHeader>
  </Card>;
}