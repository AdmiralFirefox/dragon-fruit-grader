"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuthState";
import { AuthContext } from "@/context/AuthContext";
import { auth } from "@/firebase/firebase";
import { db } from "@/firebase/firebase";
import {
  deleteDoc,
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import Image from "next/image";
import InfoModal from "@/app/components/Modals/InfoModal";
import useInfoModal from "@/hooks/useInfoModal";
import { formatTime } from "@/utils/formatTime";
import { formatUrl } from "@/utils/formatUrl";
import ArrowIcon from "@/app/components/Icons/ArrowIcon";
import PaginationControls from "@/app/components/PaginationControls";
import { signOut } from "firebase/auth";
import { StructuredInfo } from "@/types/DataType";
import Initializing from "../States/Initializing";
import styles from "@/styles/saveresults/SaveResults.module.scss";

interface SavedResultsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const SavedResults = ({ searchParams }: SavedResultsProps) => {
  const [gradingInfo, setGradingInfo] = useState<StructuredInfo[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const { initializing } = useAuthState();
  const {
    infoModal,
    openModal: openModalInfo,
    closeModal: closeModalInfo,
  } = useInfoModal();

  const user = useContext(AuthContext);
  const router = useRouter();

  //Sign Out
  const signOutAccount = async () => {
    await signOut(auth);
  };

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
  const grading_data = gradingInfo !== undefined ? gradingInfo : [];
  const entries = grading_data.slice(start, end);

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
      router.push(`/save_results?page=1`);
    } else if (page > totalPages && totalPages > 0) {
      router.push(`/save_results?page=1`);
    } else if (page < 1) {
      router.push(`/save_results?page=1`);
    }
  }, [page, totalPages, router]);

  // Fetch Data from database
  useEffect(() => {
    if (user) {
      const gradingInfoRef = collection(db, "grading_info");
      const q = query(
        gradingInfoRef,
        orderBy("timestamp", "desc"),
        where("owner_id", "==", user!.uid)
      );

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

  // Redirect unauthorized users
  useEffect(() => {
    if (!initializing && !user) {
      router.push("/");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initializing]);

  if (initializing) {
    return <Initializing />;
  }

  return user !== null ? (
    <main>
      <div className={styles["user"]}>
        <div className={styles["user-photo"]}>
          <Image
            src={user?.photoURL as string}
            alt="User Profile"
            width={85}
            height={85}
          />
        </div>
        <div className={styles["user-info"]}>
          <h1>{user?.displayName}</h1>
          <p>{user?.email}</p>
          <button onClick={signOutAccount}>Sign Out</button>
        </div>
      </div>

      <div className={styles["saved-results-title"]}>
        <h1>Saved Results</h1>
      </div>

      {gradingInfo.length === 0 && loadingInfo ? (
        <div style={{ textAlign: "center" }}>
          <h1>Loading...</h1>
        </div>
      ) : (
        <>
          {entries!.map((info) => (
            <li key={info.id} className={styles["result-wrapper"]}>
              <div className={styles["result-container"]}>
                <div className={styles["first-section"]}>
                  <div className={styles["uploaded-image"]}>
                    <p>Uploaded Image</p>
                    <div className={styles["image-wrapper"]}>
                      <Image
                        src={formatUrl(info.input_image)}
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
                        src={formatUrl(info.yolo_images)}
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
                              src={formatUrl(result.cropped_images)}
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
          routeName="save_results"
          contentsPerPage={contents_per_page}
          hasNextPage={end < grading_data!.length}
          hasPrevPage={start > 0}
          dataLength={grading_data.length}
        />
      )}
    </main>
  ) : null;
};

export default SavedResults;
