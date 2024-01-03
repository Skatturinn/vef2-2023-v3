import fs from 'fs/promises';
/**
 * Fínpúsanlega einfalt
 * skoðar hvort URL sé löglegur og skilar boolean
 * @param {String} string 
 * @returns {Boolean}
 */
export function isUrlValid(string: string): Boolean {
	try {
		const a = new URL(string);
		return !!a
	} catch {
		return false
	}
}
/**
 * athugar hvort skra/directory se til
 * @param {String} skra 
 * @returns {Boolean}
 */
export async function isPathValid(skra: string): Promise<Boolean> {
	return fs.access(skra)
		.then(() => true)
		.catch(() => false);
}