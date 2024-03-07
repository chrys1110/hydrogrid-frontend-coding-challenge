import { InputHTMLAttributes } from "react";

export default function Input({
  id,
  className,
  value,
  onChange,
  required,
  label,
}: { label?: string } & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className" | "value" | "onChange" | "required"
>) {
  return (
    <>
      {label !== null && <label htmlFor={id}>{label}</label>}
      <input
        type="text"
        className={className}
        name={id}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
      />
    </>
  );
}
