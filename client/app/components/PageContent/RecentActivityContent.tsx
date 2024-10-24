"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext, FormEvent } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useAuthState } from "@/hooks/useAuthState";
import { db } from "@/firebase/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import InfoModal from "@/app/components/Modals/InfoModal";
import useInfoModal from "@/hooks/useInfoModal";
import Fuse from "fuse.js";
import { formatTime } from "@/utils/formatTime";
import { formatUrl } from "@/utils/formatUrl";
import ArrowIcon from "@/app/components/Icons/ArrowIcon";
import { StructuredInfo } from "@/types/DataType";
import AdminNavbar from "../AdminNavbar";
import PaginationControls from "@/app/components/PaginationControls";
import LoadingAdmin from "../States/LoadingAdmin";
import { imageInHttps } from "@/utils/imageInHttps";
import styles from "@/styles/RecentActivity.module.scss";

interface RecentActivityProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const RecentActivityContent = ({ searchParams }: RecentActivityProps) => {
  const [gradingInfo, setGradingInfo] = useState<StructuredInfo[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [loadingInfo, setLoadingInfo] = useState(true);

  const { initializing } = useAuthState();
  const {
    infoModal,
    openModal: openModalInfo,
    closeModal: closeModalInfo,
  } = useInfoModal();

  const user = useContext(AuthContext);
  const router = useRouter();

  //Create a fuse instance
  const fuse = new Fuse(gradingInfo, {
    keys: ["owner_name", "owner_email", "owner_id"],
    includeScore: true,
    threshold: 0.3,
  });

  //Create a Search Result
  const results = fuse.search(searchResults);

  //Map the search result
  const filteredInfo =
    searchResults === "" ? gradingInfo : results.map((result) => result.item);

  // Define Parameters for Pagination
  const contents_per_page = "5";

  const pageParam = searchParams["page"];
  const perPageParam = searchParams["per_page"] ?? contents_per_page;

  const page = Array.isArray(pageParam)
    ? Number(pageParam[0])
    : Number(pageParam ?? "1");
  const per_page = Array.isArray(perPageParam)
    ? Number(perPageParam[0])
    : Number(perPageParam);

  // Calculate the total number of pages
  const totalPages = Math.ceil(gradingInfo.length / per_page);

  const start = (Number(page) - 1) * Number(per_page);
  const end = start + Number(per_page);

  // Slice the data
  const grading_data = filteredInfo !== undefined ? filteredInfo : [];
  const entries = grading_data.slice(start, end);

  // Handle Search
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchResults(searchInput);
    router.push("/admin/recent_activity?page=1");
  };

  // Delete Result
  const deleteResult = async (info: StructuredInfo) => {
    if (user) {
      try {
        const docRef = doc(db, "grading_info", info.id);
        await deleteDoc(docRef);

        await fetch("/api/cloudinary/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_image: info.input_image,
            yolo_images: info.yolo_images,
            results: info.results.map((result) => result.cropped_images),
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Redirect if the page number is out of range
  useEffect(() => {
    const isValidNumber = !isNaN(page) && Number.isInteger(page);

    if (!isValidNumber) {
      router.push(`/admin/recent_activity?page=1`);
    } else if (page > totalPages && totalPages > 0) {
      router.push(`/admin/recent_activity?page=1`);
    } else if (page < 1) {
      router.push(`/admin/recent_activity?page=1`);
    }
  }, [page, totalPages, router]);

  // Fetch Data from database
  useEffect(() => {
    if (user) {
      const gradingInfoRef = collection(db, "grading_info");
      const q = query(gradingInfoRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const grading_info = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGradingInfo(grading_info as StructuredInfo[]);
        setLoadingInfo(false);
      });

      // Clean up function
      return () => unsubscribe();
    }
  }, [user]);

  // Restrict access
  useEffect(() => {
    const checkAdmin = async () => {
      if (!initializing) {
        if (user) {
          const token = await user.getIdTokenResult();

          if (!token.claims.admin) {
            router.push("/"); // Redirect if not admin
          } else {
            setLoadingInfo(true); // Continue loading admin content
          }
        } else {
          router.push("/"); // Redirect if not authenticated
        }
      }
    };

    checkAdmin();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing, user]);

  return (
    <main>
      <AdminNavbar />
      {gradingInfo.length === 0 && loadingInfo ? (
        <LoadingAdmin message="Loading Data" />
      ) : (
        <>
          <form
            className={styles["search-wrapper"]}
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>

          {entries!.map((info) => (
            <li key={info.id} className={styles["result-wrapper"]}>
              <div className={styles["result-container"]}>
                <div className={styles["user-section"]}>
                  <div>
                    <Image
                      src={info.owner_photo as string}
                      alt="User Photo"
                      width={50}
                      height={50}
                    />
                  </div>
                  <div>
                    <p>{info.owner_name}</p>
                    <p>{info.owner_email}</p>
                  </div>
                </div>

                <div className={styles["first-section"]}>
                  <div className={styles["uploaded-image"]}>
                    <p>Uploaded Image</p>
                    <div className={styles["image-wrapper"]}>
                      <Image
                        src={formatUrl(imageInHttps(info.input_image))}
                        alt="Uploaded Image"
                        width={300}
                        height={300}
                        unoptimized
                      />
                    </div>
                  </div>

                  <div className={styles["detected-image"]}>
                    <p>Detected Dragon Fruits</p>
                    <div className={styles["image-wrapper"]}>
                      <Image
                        src={formatUrl(imageInHttps(info.yolo_images))}
                        alt="Detected Dragon Fruits"
                        width={300}
                        height={300}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                <div className={styles["second-section"]}>
                  <p className={styles["result-title"]}>Results</p>
                  <div className={styles["grading-results"]}>
                    {info.results != null &&
                      info.results.map((result) => (
                        <div key={result.id} className={styles["results-card"]}>
                          <div className={styles["image-wrapper"]}>
                            <Image
                              src={formatUrl(
                                imageInHttps(result.cropped_images)
                              )}
                              alt="Dragon Fruit"
                              width={250}
                              height={250}
                              unoptimized
                            />
                          </div>

                          <button
                            onClick={() => openModalInfo(result.id)}
                            className={styles["result-info-button"]}
                          >
                            <p className={styles["grading-result"]}>
                              {result.grading_result}
                            </p>

                            <ArrowIcon width="2em" height="2em" />
                          </button>

                          <InfoModal
                            active={infoModal === result.id}
                            closeModal={() => closeModalInfo(result.id)}
                            products={result.products}
                            probabilities={result.probabilities}
                            id={result.id}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className={styles["timestamp"]}>
                  <p>Time Graded: {formatTime(info.timestamp)}</p>
                </div>

                <div className={styles["delete-results-button"]}>
                  <button onClick={() => deleteResult(info)}>
                    Delete Result
                  </button>
                </div>
              </div>
            </li>
          ))}
        </>
      )}

      {grading_data.length <= 0 || grading_data.length <= 4 ? null : (
        <PaginationControls
          routeName="admin/recent_activity"
          contentsPerPage={contents_per_page}
          hasNextPage={end < grading_data!.length}
          hasPrevPage={start > 0}
          dataLength={grading_data.length}
        />
      )}
    </main>
  );
};

export default RecentActivityContent;
