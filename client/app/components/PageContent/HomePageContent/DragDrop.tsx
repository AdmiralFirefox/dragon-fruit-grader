import { ChangeEvent, SyntheticEvent } from "react";
import styles from "@/styles/homepage/DragDrop.module.scss";

interface DragDropProps {
  dragOver: boolean;
  onDragOver: (e: SyntheticEvent<Element, Event>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  fileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}

const DragDrop = ({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  fileSelect,
}: DragDropProps) => {
  return (
    <div className={styles["container"]}>
      <form>
        <label
          htmlFor="file"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <h1>
            {!dragOver
              ? "Upload, drag and drop, or take a photo of dragon fruit here for the application to scan and detect. Results will then be shown after analysis."
              : "Drop here..."}
          </h1>
        </label>
        <input
          type="file"
          name="file"
          id="file"
          accept="image/*"
          onChange={fileSelect}
          multiple
        />
      </form>
    </div>
  );
};

export default DragDrop;
