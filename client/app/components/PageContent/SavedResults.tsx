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
} from "firebase/firestore";
import Image from "next/image";
import InfoModal from "@/app/components/Modals/InfoModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatTime } from "@/utils/formatTime";
import InfoIcon from "@/app/components/Icons/InfoIcon";
import PaginationControls from "@/app/components/PaginationControls";
import { signOut } from "firebase/auth";
import { GradingInfo } from "@/app/db";
import styles from "@/styles/saveresults/SaveResults.module.scss";

interface SavedResultsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const SavedResults = ({ searchParams }: SavedResultsProps) => {
  const [gradingInfo, setGradingInfo] = useState<GradingInfo[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [infoModal, setInfoModal] = useState<number | string>(0);
  const { initializing } = useAuthState();

  const user = useContext(AuthContext);
  const router = useRouter();

  //Sign Out
  const signOutAccount = async () => {
    await signOut(auth);
  };

  // Define Parameters for Pagination
  const page = searchParams["page"] ?? "1";
  const per_page = searchParams["per_page"] ?? "5";

  const start = (Number(page) - 1) * Number(per_page);
  const end = start + Number(per_page);

  // Slice the data
  const grading_data = gradingInfo !== undefined ? gradingInfo : [];
  const entries = grading_data.slice(start, end);

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  // Delete Result
  const deleteResult = async (id: string) => {
    if (user) {
      try {
        const docRef = doc(db, "grading_info", id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Info Modal
  const openModal = (id: string) => {
    lock();
    if (infoModal === id) {
      return setInfoModal(0);
    }

    setInfoModal(id);
  };

  const closeModal = (id: string) => {
    unlock();
    if (infoModal === id) {
      return setInfoModal(0);
    }
  };

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

        setGradingInfo(grading_info as GradingInfo[]);
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
    return (
      <div style={{ marginTop: "5em", textAlign: "center" }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return user !== null ? (
    <main>
      <div className={styles["user"]}>
        <Image
          src={user?.photoURL as string}
          alt="User Profile"
          width={70}
          height={70}
        />
        <h1>Hello {user?.displayName}!</h1>
        <p>Email: {user?.email}</p>
        <button onClick={signOutAccount}>Sign Out</button>
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
                        src={info.input_image}
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
                        src={info.yolo_images}
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
                              src={result.cropped_images}
                              alt="Dragon Fruit"
                              width={250}
                              height={250}
                              unoptimized
                            />
                          </div>
                          <div className={styles["result-info"]}>
                            <p className={styles["grading-result"]}>
                              {result.grading_result}
                            </p>
                            <button onClick={() => openModal(result.id)}>
                              <InfoIcon width="2em" height="2em" />
                            </button>
                          </div>
                          <InfoModal
                            active={infoModal === result.id}
                            closeModal={() => closeModal(result.id)}
                            products={result.products}
                            probabilities={result.probabilities}
                            id={result.id}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className={styles["delete-results-button"]}>
                  <button onClick={() => deleteResult(info.id)}>
                    Delete Result
                  </button>
                </div>

                <div className={styles["timestamp"]}>
                  <p>Time Graded: {formatTime(info.timestamp)}</p>
                </div>
              </div>
            </li>
          ))}
        </>
      )}

      {grading_data.length <= 0 || grading_data.length <= 4 ? null : (
        <PaginationControls
          hasNextPage={end < grading_data!.length}
          hasPrevPage={start > 0}
          dataLength={grading_data.length}
        />
      )}
    </main>
  ) : null;
};

export default SavedResults;
