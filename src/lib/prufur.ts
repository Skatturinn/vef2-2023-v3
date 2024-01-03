import fs from 'fs/promises';
/**
 * Fínpúsanlega einfalt
 * skoðar hvort URL sé löglegur og skilar hlekknum
 */
export function isUrlValid(string: string): string {
	return URL.canParse(string) ? (new URL(string)).href : '';
}
/**
 * athugar hvort skra/directory se til
 */
export async function isPathValid(skra: string): Promise<Boolean> {
	return fs.access(skra)
		.then(() => true)
		.catch(() => false);
}