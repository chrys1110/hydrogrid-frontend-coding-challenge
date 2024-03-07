import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export default function Button({
  type,
  children,
  variant,
  className = "",
  ...rest
}: { variant?: "primary" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const buttonClass =
    className + " " + (variant === "primary" ? styles.primary : "");

  return (
    <button {...rest} type={type ?? "button"} className={buttonClass}>
      {children}
    </button>
  );
}
