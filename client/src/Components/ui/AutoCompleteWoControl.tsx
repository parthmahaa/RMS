import {
	Autocomplete as AutocompleteMUI,
	type ChipTypeMap,
} from "@mui/material";

import Input from "./Input";
import type { CustomAutoCompleteWoControlProps } from "../../Types/types";
import type { JSX, ReactNode } from "react";

const AutocompleteWoControl = <
	Value,
	Multiple extends boolean | undefined,
	DisableClearable extends boolean | undefined,
	FreeSolo extends boolean | undefined,
	ChipComponent extends React.ElementType = ChipTypeMap["defaultComponent"]
>({
	options = [],
	label,
	fullWidth = true,
	id,
	value,
	...props
}: CustomAutoCompleteWoControlProps<
	Value,
	Multiple,
	DisableClearable,
	FreeSolo,
	ChipComponent
	>): JSX.Element => {
	return (
		<AutocompleteMUI
			{...props}
			value={value}
			id={id}
			options={options}
			renderInput={
				props.renderInput ??
				((parameters): ReactNode => (
					<Input
						{...parameters}
						error={!!props.error}
						helperText={props.helperText}
						id={id}
						label={label}
						fullWidth={fullWidth}
					/>
				))
			}
			size={props.size || "small"}
			fullWidth={fullWidth}
			disableCloseOnSelect={props.multiple}
		/>
	);
};
export default AutocompleteWoControl;
