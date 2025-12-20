import { forwardRef, type JSX } from "react";
import { TextField as TextFieldMUI, type TextFieldProps } from "@mui/material";
import type { FormComponentError } from "../../Types/types";

const Input = forwardRef<
	HTMLInputElement,
	TextFieldProps & Partial<FormComponentError> & { id?: string }
>(
	(
		{
			errors = {},
			errorKey = "",
			error = null,
			helperText = null,
			variant = "outlined",
			fullWidth = true,
			id,
			...props
		},
		ref
	): JSX.Element => (
		<TextFieldMUI
			id={id}
			error={error ?? !!errors[errorKey]}
			helperText={helperText || errors[errorKey]?.message?.toString() || ""}
			variant={variant}
			fullWidth={fullWidth}
			inputRef={ref}
			size={props.size || "small"}
			{...props}
			sx={{
				"& .MuiOutlinedInput-root": {
					"& fieldset": {
						borderColor: "#ccc",
					},
					"&:hover fieldset": {
						borderColor: "black",
					},
					"&.Mui-focused fieldset": {
						borderColor: "black",
					},
					"&.Mui-focused .MuiInputBase-input": {
						color: "black", 
					},
				},
				"& .MuiFormLabel-root.Mui-focused": {
					color: "black",
				},
				"& .MuiFormHelperText-root": {
					marginLeft: "0px",
				},
			}}
		/>
	)
);

export default Input;
