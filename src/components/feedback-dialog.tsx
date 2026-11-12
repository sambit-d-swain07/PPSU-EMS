"use client";

import * as React from "react";
import { Rating } from "react-simple-star-rating";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedbackAction } from "@/actions/feedback";

interface FeedbackDialogProps {
  registrationId: string;
  eventTitle: string;
}

export function FeedbackDialog({
  registrationId,
  eventTitle,
}: FeedbackDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitFeedbackAction(registrationId, rating, comment);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Thank you! Your feedback has been recorded.");
        setOpen(false);
      }
    } catch {
      toast.error("Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 font-medium">
          <MessageSquarePlus className="h-3.5 w-3.5 text-slate-500" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Event Feedback
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rate your experience for &quot;{eventTitle}&quot;. Your feedback is
              shared anonymously with organizers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Rating
                  onClick={(val) => setRating(val)}
                  initialValue={rating}
                  size={26}
                  fillColor="#f59e0b"
                  emptyColor="#e2e8f0"
                  SVGstyle={{ display: "inline-block" }}
                />
                <span className="text-xs font-bold text-slate-700 ml-1">
                  {rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Comments (Optional)
              </label>
              <Textarea
                placeholder="What did you enjoy most? Any suggestions for future events?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
                className="text-xs resize-none"
              />
              <span className="text-[10px] text-muted-foreground block text-right mt-1">
                {comment.length} / 500 characters
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
