
export interface DraftFile {
  id: string;
  file: File;
  url?: string;
}

export type SetDraftFile = React.Dispatch<React.SetStateAction<DraftFile[]>>;
