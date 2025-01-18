import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Check, Home, ShoppingBag } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const CheckoutSuccess = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const redirectTime = 10000; // 10 seconds
    const interval = 100; // Update every 100ms
    const decrementValue = (interval / redirectTime) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0;
        return prev - decrementValue;
      });
    }, interval);

    const redirectTimer = setTimeout(() => {
      router.push("/");
    }, redirectTime);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(progressTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600 animate-[appear_0.3s_ease-out]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Order Confirmed!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Thank you for your purchase! We've received your order and will begin processing it right away.
            </p>
            <p className="text-sm text-muted-foreground">
              Order confirmation has been sent to your email.
            </p>
          </div>

          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Redirecting to homepage</span>
              <span className="text-muted-foreground">{Math.ceil(progress / 10)} seconds</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full sm:w-1/2" 
            variant="outline"
            onClick={() => router.push("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
          <Button 
            className="w-full sm:w-1/2"
            onClick={() => router.push("/orders")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Orders
          </Button>
        </CardFooter>
      </Card>

      <style jsx global>{`
        @keyframes appear {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutSuccess;