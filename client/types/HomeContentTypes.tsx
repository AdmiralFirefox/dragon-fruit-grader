import { StructuredInfo } from "./DataType";

export interface InputProps {
  structured_info: StructuredInfo[];
  session_id: string;
}

export interface DocLoadingSave {
  [key: string]: boolean;
}

export interface DocExist {
  [key: string]: boolean;
}

export interface ClearSessionProps {
  message: string;
}
