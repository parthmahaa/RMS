export function encrypt(data: any): string {
	return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decrypt(data: string) {
	try {
		return JSON.parse(decodeURIComponent(atob(data)));
	} catch {
		return null;
	}
}

export function encryptString(text: string): string {
	return btoa(encodeURIComponent(text));
}

export function decryptString(encoded: string): string {
	try {
		return decodeURIComponent(atob(encoded));
	} catch {
		return "";
	}
}