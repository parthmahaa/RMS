import type React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { CommonModalProps } from "../../Types/uiTypes";

const CommonModal: React.FunctionComponent<CommonModalProps> = ({
	openState,
	title,
	title2,
	onClose,
	closeOnClickOutside = false,
	closeOnEscape = false,
	zIndex,
	sizes = ["80%", "70%", "60%", "50%"],
	children,
	withCloseButton = true,
	styles,
}) => {
	const theme = useTheme();

	// Define breakpoints
	const isExtraSmall = useMediaQuery(theme.breakpoints.down("xs"));
	const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
	const isMedium = useMediaQuery(theme.breakpoints.down("md"));

	// Determine modal size based on breakpoints
	let modalSize;
	if (isExtraSmall) {
		modalSize = sizes[0];
	} else if (isSmall) {
		modalSize = sizes[1];
	} else if (isMedium) {
		modalSize = sizes[2];
	} else {
		modalSize = sizes[3];
	}

	return (
		<Dialog
			open={openState}
			onClose={(event, reason) => {
				if (
					(reason === "backdropClick" && !closeOnClickOutside) ||
					(reason === "escapeKeyDown" && !closeOnEscape)
				) {
					return;
				}
				onClose();
			}}
			sx={{ "& .MuiDialog-paper": { p: 0, backgroundImage: "none" } }}
			// TransitionComponent={PopupTransition}
			PaperProps={{
				sx: {
					width: modalSize,
					maxWidth: "100%",
					zIndex: zIndex ?? 100,
					...styles?.root,
				},
			}}
		>
			<DialogTitle>
				<Typography variant="h4" >
					{title}
				</Typography>
				{title2 && (
					<Typography variant="body2" color="textSecondary">
						{title2}
					</Typography>
				)}
				{withCloseButton && (
					<IconButton
						aria-label="close"
						color="error"
						onClick={onClose}
						sx={{
							position: "absolute",
							right: 8,
							top: 6,
						}}
					>
						<Close />
					</IconButton>
				)}
			</DialogTitle>
			<DialogContent
				sx={{
					...styles?.body,
					p: 3,
				}}
			>
				{children}
			</DialogContent>
		</Dialog>
	);
};

export default CommonModal;
