import fs from "fs/promises";
import { isPathValid, isUrlValid } from "./prufur.js";

export type Namsskeid = {
	Numer: string,
	Heiti: string,
	Einingar: number,
	Kennslumisseri: string,
	Namstig: string;
	[key: string]: string | number;
};

function parseDecimalCommaNumber(input: string): number {
	const formattedInput = input?.replace(",", ".");
	const result = parseFloat(formattedInput);
	console.log(result)
	if (Number.isNaN(result)) {
		console.error("Invalid input. Unable to convert to a number.");
		return 0;
	}
	return result;
}
/**
 * @param {path} skra slóð á skrá
 * @returns vigur með obj ef gilt
 */
export async function lesa(skra: string): Promise<Array<Namsskeid>> {
	const vigur: Array<Namsskeid> = [];
	const skratest = await isPathValid(skra);
	if (skratest) {
		try {
			const fileContent = await fs.readFile(skra, "binary");
			const lines = fileContent.split("\n");
			let header = lines[0].split(";");
			if (header.includes("Númer" && "Námstig")) {
				header = header.map(
					(stak) =>
						stak
							.replace(/ú/g, "u")
							.replace(/á/g, "a")
							.replace(/\r/g, "Vefsida")
							.trim() || "Vefsida"
				);
				const data = lines.slice(1).map((line) => line.split(";"));
				data.forEach((values) => {
					console.log(values)
					let obj: Namsskeid = {
						Numer: '',
						Heiti: '',
						Einingar: 0,
						Kennslumisseri: '',
						Namstig: ''
					};
					if (values.length !== 6) {
						// eigum von á values með lengdina 6
						if (values[0] === "") {
							while (values[0] === "" && values.length > 1) {
								// ef fyrsti er auður fjarlægum við hann°°
								values.shift();
							}
						} else {
							// annars sameinum bið 2 og 3
							values.splice(1, 2, `${values[1]}: ${values[2]}`);
						}
					}
					header.forEach((key, index) => {
						if (index === 2) {
							obj[key] = parseDecimalCommaNumber(values[index]);
						} else if (index === 5) {
							obj[key] = isUrlValid(values[index]) ? values[index] : ''
						}
						obj[key] = values[index];
					});
					const existingObjIndex = vigur.findIndex((j: Namsskeid) => j.Numer === obj.Numer && j.Kennslumisseri !== obj.Kennslumisseri);
					if (existingObjIndex !== -1) {
						const j = vigur[existingObjIndex];
						if (j.Kennslumisseri !== obj.Kennslumisseri) { j.Kennslumisseri += `, ${obj.Kennslumisseri}` }
						if (j.Heiti !== obj.Heiti) { j.Heiti += `, ${obj.Heiti}` }
					} else {
						vigur.push(obj);
					}
				});
			}
		} catch (err) {
			console.error("error", err);
			throw err;
		}
	}

	return vigur;
}

/**
 * @param {String} skra slóð á skrá
 * @returns {String} Html kóða fyrir linu i töflu
 */
export async function skrifa(skra: string) {
	let linur = "";
	const vigur = await lesa(skra);
	if (!vigur.length) {
		return linur;
	}
	vigur.forEach((stak) => {
		if (stak.Heiti) {
			const misseri = ["Vor", "Sumar", "Haust"];
			linur += `<tr class="row">
					<td>${stak.Numer}</td>
					<td>${stak.Heiti}</td>
					<td>${stak.Einingar}</td>
					<td>${misseri.includes(stak.Kennslumisseri) ? stak.Kennslumisseri : ""}</td>
					<td>${stak.Namstig ? stak.Namstig : ""}</td>
					<td>${stak.Vefsida}">
					Skoða
					</td>
		  		</tr>`;
			// console.log(stak.Vefsida)
		}
	});
	return linur;
}
