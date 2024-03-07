import { Type } from "./types";
import { getIconByType } from "./utils";
import styles from "./Icon.module.css";

export default function Icon({ type }: { type?: Type }) {
  return (
    <span className={styles.container}>
      {type && <img src={getIconByType(type)} />}
    </span>
  );
}
