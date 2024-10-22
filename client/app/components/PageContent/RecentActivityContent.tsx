"use client";

import AdminNavbar from "../AdminNavbar";
import { useAuthState } from "@/hooks/useAuthState";
import styles from "@/styles/RecentActivity.module.scss";

const RecentActivityContent = () => {
  const { initializing } = useAuthState();

  if (initializing) {
    return (
      <div style={{ marginTop: "5em", textAlign: "center" }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <main>
      <AdminNavbar />
      <h1>Hello World</h1>
    </main>
  );
};

export default RecentActivityContent;
