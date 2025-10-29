import { forwardRef } from "react";
import { Add } from "@mui/icons-material";
import { Button as ButtonMui, type ButtonProps } from "@mui/material";

const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & { id: string; withPlusIcon?: boolean }
>((props, ref) => {
  const { id, variant = "contained", size = "small", withPlusIcon, ...otherProps } = props;

  return (
    <ButtonMui
      ref={ref}
      id={id}
      size={size}
      variant={variant}
      startIcon={withPlusIcon && <Add sx={{ fontSize: "1.2rem !important" }} />}
      sx={{
        textTransform: "none",
        borderRadius: "0.5rem",
        fontWeight: 500,
        ...(variant === "contained" && {
          backgroundColor: "#000",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#222",
          },
        }),
        ...(variant === "outlined" && {
          borderColor: "#000",
          color: "#000",
          "&:hover": {
            borderColor: "#222",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }),
      }}
      {...otherProps}
    />
  );
});

export default Button;
