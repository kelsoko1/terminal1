import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Link from 'next/link';

interface CancelSubscriptionFormProps {
  subscriptionId: string;
}

export function CancelSubscriptionForm({ subscriptionId }: CancelSubscriptionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          reason,
          feedback,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      toast({
        title: "Subscription canceled",
        description: "Your subscription has been successfully canceled.",
      });

      // Redirect to the subscription management page
      router.push('/investor/subscriptions/manage');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        variant: "destructive",
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Why are you canceling?</Label>
          <RadioGroup
            value={reason}
            onValueChange={setReason}
            className="mt-3 space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="too_expensive" id="too_expensive" className="mt-1" />
              <Label htmlFor="too_expensive" className="cursor-pointer">
                <div className="font-medium">Too expensive</div>
                <div className="text-sm text-muted-foreground">The subscription cost is higher than I expected or can afford</div>
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="not_useful" id="not_useful" className="mt-1" />
              <Label htmlFor="not_useful" className="cursor-pointer">
                <div className="font-medium">Not useful enough</div>
                <div className="text-sm text-muted-foreground">The features don't provide enough value for my needs</div>
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="found_alternative" id="found_alternative" className="mt-1" />
              <Label htmlFor="found_alternative" className="cursor-pointer">
                <div className="font-medium">Found an alternative</div>
                <div className="text-sm text-muted-foreground">I'm using a different service or platform instead</div>
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="temporary" id="temporary" className="mt-1" />
              <Label htmlFor="temporary" className="cursor-pointer">
                <div className="font-medium">Temporary pause</div>
                <div className="text-sm text-muted-foreground">I plan to subscribe again in the future</div>
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="other" id="other" className="mt-1" />
              <Label htmlFor="other" className="cursor-pointer">
                <div className="font-medium">Other reason</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="feedback">Additional feedback (optional)</Label>
          <Textarea
            id="feedback"
            placeholder="Please tell us how we could improve..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          variant="destructive"
          className="sm:flex-1"
          disabled={isLoading || !reason}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Confirm Cancellation'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="sm:flex-1"
          asChild
        >
          <Link href="/investor/subscriptions/manage">
            Keep My Subscription
          </Link>
        </Button>
      </div>
    </form>
  );
}
