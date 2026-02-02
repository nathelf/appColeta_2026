import * as React from "react";

import { cn, maskDateDDMMYYYY } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  (
    { className, type, onChange, placeholder, inputMode, maxLength, pattern, ...props },
    ref,
  ) => {
    const isDateInput = type === "date";

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isDateInput) {
          const maskedValue = maskDateDDMMYYYY(event.target.value);
          if (event.target.value !== maskedValue) {
            event.target.value = maskedValue;
          }
        }
        onChange?.(event);
      },
      [isDateInput, onChange],
    );

    return (
      <input
        type={isDateInput ? "text" : type}
        inputMode={isDateInput ? "numeric" : inputMode}
        maxLength={isDateInput ? 10 : maxLength}
        pattern={isDateInput ? "\\d{2};\\d{2};\\d{4}" : pattern}
        placeholder={isDateInput ? placeholder ?? "DD;MM;AAAA" : placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isDateInput && "h-11 font-mono tracking-[0.08em] md:h-10",
          className,
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
