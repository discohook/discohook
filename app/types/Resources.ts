export interface PartialResource {
  id: string;
  name: string;
}

export interface PartialMember extends PartialResource {
  color?: number;
}

export interface PartialRole extends PartialResource {
  color?: number;
}
