import { SelectHTMLAttributes } from "react";

export default function Select({
  id,
  value,
  onChange,
  label,
  children,
}: { label?: string } & Pick<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "value" | "onChange" | "children"
>) {
  return (
    <>
      {label !== null && <label htmlFor={id}>{label}</label>}
      <select id={id} name={id} value={value} onChange={onChange}>
        {children}
      </select>
    </>
  );
}
