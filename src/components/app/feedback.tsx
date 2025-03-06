import { openUrl } from '@tauri-apps/plugin-opener';

export const Feedback = () => {
  const handleFeedbackClick = async () => {
    try {
      await openUrl('https://forms.gle/HZy45ghY8SQavz126');
    } catch (error) {
      console.error('Failed to open feedback form:', error);
    }
  };

  return (
    <div 
      onClick={handleFeedbackClick}
      className="flex items-center gap-2 cursor-pointer"
    >
      <img src="/icons/feedback.svg" className="h-4 w-4" />
    </div>
  );
};
