export interface Step {
  orderIndex: number;
  type: "CLICK" | "ACTION";
  xCoordinate?: number;
  yCoordinate?: number;
  delay: number;
  actionName?: string;
  parameter?: string; // HADA L'CHAMP JDID
}

export interface Template {
  id?: number;
  name: string;
  steps: Step[];
}