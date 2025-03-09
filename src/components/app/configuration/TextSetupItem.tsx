import { TextMarkdown } from '../TextMarkdown';

interface TextSetupItemProps {
  label: string;
  value: string;
}

export function TextSetupItem({ label, value }: TextSetupItemProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium">{label}</p>
      <TextMarkdown
        text={value}
        className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
      />
    </div>
  );
}

export type { TextSetupItemProps }; 