export function formatNumberWithCommas(n: number) {
	let x = n.toString();
	const pattern = /(-?\d+)(\d{3})/;
	while (pattern.test(x)) x = x.replace(pattern, '$1,$2');
	return x;
}
