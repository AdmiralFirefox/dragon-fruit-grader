"use client";

import { FC, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/saveresults/PaginationControls.module.scss";

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  dataLength: number;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  hasNextPage,
  hasPrevPage,
  dataLength,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const per_page = Number(searchParams.get("per_page") ?? "5");
  const totalPages = Math.ceil(dataLength / per_page);

  const [inputPage, setInputPage] = useState(page);

  // Synchronize inputPage with the current page
  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const handlePageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;

    // Remove leading zeros
    if (value.startsWith("0")) {
      value = value.replace(/^0+/, "");
    }

    setInputPage(Number(value));
  };

  const handlePageInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputPage > 0 && inputPage <= totalPages) {
      router.push(`/save_results?page=${inputPage}`);
    } else {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };

  return (
    <div className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <div className={styles["first-section"]}>
          <button
            disabled={!hasPrevPage}
            onClick={() => router.push(`/save_results?page=${page - 1}`)}
          >
            Prev
          </button>

          <p>
            {page} / {totalPages}
          </p>

          <button
            disabled={!hasNextPage}
            onClick={() => router.push(`/save_results?page=${page + 1}`)}
          >
            Next
          </button>
        </div>

        <form onSubmit={handlePageInputSubmit} className={styles["page-form"]}>
          <input
            type="number"
            value={inputPage}
            onChange={handlePageInputChange}
            min="1"
            max={totalPages}
          />
          <button type="submit">Go</button>
        </form>
      </div>
    </div>
  );
};

export default PaginationControls;
