import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CardLinkProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBg?: string;
}

export function CardLink({ to, icon: Icon, title, description, iconColor = "text-primary", iconBg = "bg-primary/10" }: CardLinkProps) {
  return (
    <Link to={to}>
      <Card className="shadow-medium hover:shadow-strong transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-primary h-full">
        <CardHeader>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
