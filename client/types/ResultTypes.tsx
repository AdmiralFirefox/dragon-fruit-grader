import { StructuredInfo } from "./DataType";

export interface ResultsProps {
  structured_info: StructuredInfo[];
  imageInHttps: (image_url: string) => string;
  infoModal: string | number;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  addGradingInfo(info: StructuredInfo): Promise<void>;
  docExist: {
    [key: string]: boolean;
  };
  docLoadingSave: {
    [key: string]: boolean;
  };
}
