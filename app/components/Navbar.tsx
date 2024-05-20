import Image from "next/image";
import Link from "next/link";
import ResultIcon from "./Icons/ResultIcon";
import styles from "@/styles/Navbar.module.scss";

const Navbar = () => {
  return (
    <header className={styles["navbar"]}>
      <Link href="/" className={styles["web-title"]}>
        <div className={styles["web-logo"]}>
          <Image
            src="/logos/web-logo.png"
            alt="Web Logo"
            width={100}
            height={100}
          />
        </div>
        <h1>Dragon Fruit Grader</h1>
      </Link>

      <Link href="/save_results?page=1">
        <ResultIcon width="2.8em" height="2.8em" />
      </Link>
    </header>
  );
};

export default Navbar;
