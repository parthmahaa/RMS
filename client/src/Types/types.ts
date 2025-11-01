import type {
    FieldErrors,
} from "react-hook-form";
import type { AutocompleteProps, ChipTypeMap } from "@mui/material";

export interface DashboardData {
    userId:number;
    name: String;
    email: String;
    role: String[];
    profileCompleted: Boolean;
    summary: String;
    phone: String;
    location: String;
    totalExperience: Number;
    graduationYear: Number;
    collegeName: String;
    degree: String;
    currentCompany: String;
    resumeFilePath: String;
    skills: UserSkillDto[];
    company: CompanyDto | null;
}

interface UserSkillDto {
    skillId: number;
    id?: number;
    name?: string;
}

interface CompanyDto {
    id?: number;
    name: string;
    website: string;
    location: string;
    description: string;
    industry: string;
}

/*
=============== UI TYPES ===============
*/

export type FormComponentError = {
	errors?: FieldErrors;
	errorKey?: string;
	error?: boolean;
	helperText?: string;
	hidden?: boolean;
};

export type CustomAutoCompleteWoControlProps<
	Value,
	Multiple extends boolean | undefined,
	DisableClearable extends boolean | undefined,
	FreeSolo extends boolean | undefined,
	ChipComponent extends React.ElementType = ChipTypeMap["defaultComponent"]
> = Partial<FormComponentError> & {
	id: string;
	options: Array<Value>;
	label?: string;
	limitTag?: number;
} & Partial<
		AutocompleteProps<
			Value,
			Multiple,
			DisableClearable,
			FreeSolo,
			ChipComponent
		>
	>;
