declare module 'novel' {
    import { FC } from 'react';
    import { Editor as CoreEditor } from '@tiptap/core';
  
    interface EditorProps {
      defaultValue?: string;
      onUpdate?: (editor: CoreEditor | null) => void;
      onDebouncedUpdate?: (editor: CoreEditor | null) => void;
      debounceDuration?: number;
      completionApi?: string;
      className?: string;
      disableHistory?: boolean;
    }
  
    export const Editor: FC<EditorProps>;
  }