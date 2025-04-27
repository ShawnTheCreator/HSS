
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  className?: string;
  cardTitle: string;
  cardDescription?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AuthCard = ({
  className,
  cardTitle,
  cardDescription,
  children,
  footer,
}: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-hss-purple-dark p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] opacity-5 z-0"></div>
      <Card className={cn("w-full max-w-md shadow-xl border-hss-purple/30 bg-background/90 backdrop-blur-sm z-10", className)}>
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4">
            <span className="text-3xl font-bold text-hss-purple-vivid">HSS</span>
            <span className="text-3xl font-bold ml-1 text-foreground">Secure</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{cardTitle}</CardTitle>
          {cardDescription && (
            <CardDescription className="text-center">{cardDescription}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
};

export default AuthCard;
