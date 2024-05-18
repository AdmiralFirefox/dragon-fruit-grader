import Dexie, { Table } from "dexie";

/*
This main data model has been destructured
to be indexed by IndexedDB

interface InputProps {
  structured_info: {
    id: string;
    input_image: string;
    yolo_images: string;
    timestamp: string;
    results: {
      id: string;
      cropped_images: string;
      grading_result: string;
      products: string[];
      probabilities: {
        id: string;
        class: string;
        probability: number;
      }[];
    }[];
  }[];
}
*/

export interface Probability {
  id: string;
  class: string;
  probability: number;
}

export interface Result {
  id: string;
  cropped_images: string;
  grading_result: string;
  products: string[];
  probabilities: Probability[];
}

export interface GradingInfo {
  id: string;
  input_image: string;
  yolo_images: string;
  timestamp: string;
  results: Result[];
}

export class MySubClassedDexie extends Dexie {
  grading_info!: Table<GradingInfo>;
  results!: Table<Result>;
  probabilities!: Table<Probability>;

  constructor() {
    super("grading_info_database");
    this.version(1).stores({
      grading_info: "++id, input_image, yolo_images, timestamp",
      results: "++id, cropped_images, grading_result, products",
      probabilities: "++id, class, probability",
    });
  }
}

export const db = new MySubClassedDexie();
