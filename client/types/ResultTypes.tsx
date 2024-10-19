import { StructuredInfo } from "./DataType";

export interface ResultsProps {
  structured_info: StructuredInfo[];
  imageInHttps: (image_url: string) => string;
  addGradingInfo(info: StructuredInfo): Promise<void>;
  docExist: {
    [key: string]: boolean;
  };
  docLoadingSave: {
    [key: string]: boolean;
  };
}
