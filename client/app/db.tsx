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