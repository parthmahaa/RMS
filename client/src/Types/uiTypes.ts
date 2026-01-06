export interface CommonModalProps {
	openState: boolean;
	title: React.ReactNode;
	title2?: React.ReactNode;
	onClose: () => void;
	children?: React.ReactNode;
	sizes?: [ModalSize, ModalSize, ModalSize, ModalSize];
	closeOnClickOutside?: boolean;
	closeOnEscape?: boolean;
	zIndex?: number;
	withCloseButton?: boolean;
	styles?: {
		root?: React.CSSProperties;
		body?: React.CSSProperties;
		overlay?: React.CSSProperties;
	};
	contentPadding?: { pt?: number; pb?: number; pl?: number; pr?: number };
}

type ModalSize =
	| "xs"
	| "sm"
	| "md"
	| "lg"
	| "xl"
	| `${number}%`
	| `${number}rem`;