import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/api/client';
import type { RequestReviewRequest } from '@/types';

const REVIEW_TYPES = [
  { id: 'general', label: 'General' },
  { id: 'security', label: 'Security' },
] as const;

const DEFAULT_REVIEW_TYPES = [REVIEW_TYPES[0].id];

interface RequestReviewDialogProps {
  workflowId: string;
}

export function RequestReviewDialog({ workflowId }: RequestReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(DEFAULT_REVIEW_TYPES);
  const [mode, setMode] = useState<'review_only' | 'review_fix'>('review_only');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleType = useCallback((typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedTypes.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const request: RequestReviewRequest = {
        mode,
        review_types: selectedTypes,
      };
      await api.requestReview(workflowId, request);
      toast.success('Review requested successfully');
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request review';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [workflowId, mode, selectedTypes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Request Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Code Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Review Types</label>
            <div className="flex gap-2 mt-1">
              {REVIEW_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    selectedTypes.includes(type.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Mode</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setMode('review_only')}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  mode === 'review_only'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                Review Only
              </button>
              <button
                onClick={() => setMode('review_fix')}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  mode === 'review_fix'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                Review & Fix
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={submitting || selectedTypes.length === 0}
            className="w-full"
          >
            {submitting ? 'Requesting...' : 'Request Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
