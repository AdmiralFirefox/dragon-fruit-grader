import Link from "next/link";
import styles from "@/styles/AdminNavbar.module.scss";

const AdminNavbar = () => {
  return (
    <div className={styles["content"]}>
      <Link href="/admin">Users</Link>
      <Link href="/admin/recent_activity?page=1">Recent Activity</Link>
    </div>
  );
};

export default AdminNavbar;
