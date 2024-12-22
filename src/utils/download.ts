export function download(blob: Blob, fileName: string) {
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.style.display = "none";
	a.href = url;
	// the filename you want
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
}
