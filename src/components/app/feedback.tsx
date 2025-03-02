
import { Send } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '@/components/ui/button';

export const Feedback = () => {
  const handleFeedbackClick = async () => {
    try {
      await openUrl('https://forms.gle/HZy45ghY8SQavz126');
    } catch (error) {
      console.error('Failed to open feedback form:', error);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleFeedbackClick}
      className="flex items-center gap-2"
    >
      <Send className="h-4 w-4" />
      Feedback
    </Button>
  );
};
