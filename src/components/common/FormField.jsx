import { useId } from "react";

const base =
  "w-full bg-stone-50 border rounded-xl py-3 text-sm focus:outline-hidden focus:border-slate-900 disabled:opacity-60";

// Accessible labelled input/textarea/select with inline error message.
export default function FormField({
  label,
  icon: Icon,
  error,
  hint,
  as = "input",
  className = "",
  children,
  labelRight,
  ...props
}) {
  const id = useId();
  const Tag = as;
  const invalid = Boolean(error);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="text-xs font-bold text-slate-700">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
        <Tag
          id={id}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={`${base} ${Icon ? "pl-11" : "pl-4"} pr-4 ${invalid ? "border-red-400" : "border-gray-200"}`}
          {...props}
        >
          {children}
        </Tag>
      </div>
      {invalid ? (
        <p id={`${id}-err`} className="text-[11px] text-red-500 mt-1" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-[11px] text-gray-400 mt-1">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
