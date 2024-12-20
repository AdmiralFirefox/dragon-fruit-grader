export interface StructuredInfo {
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
  owner_email?: string;
  owner_name?: string;
  owner_id?: string;
  owner_photo?: string;
}
