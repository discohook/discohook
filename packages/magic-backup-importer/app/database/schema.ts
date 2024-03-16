export interface Backup {
  id: number;
  name: string;
  messages: Array<unknown>;
  targets: { url: string }[];
}

export type Schema = {
  backup: {
    key: number;
    value: Backup;
    indexes: {
      name: string;
    };
  };
};
