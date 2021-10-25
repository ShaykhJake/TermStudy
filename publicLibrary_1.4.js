/**
 * Simple Term Study, @ Copyright PidginForge 2021
 * License: FOSS
 * Author: Jacob Wagner
 */

/**
 * This merely represents a list of files to make publicly available for ingest
 *
 * @returns the file name & path and title of a public package
 */
export function getPackage() {
	const listPackage = [
		{
			fileName: "./security_plus.txt",
			title: "Security+ Terms",
			term_count: 301,
		},
		{
			fileName: "./network_plus.txt",
			title: "Network+ Terms",
			term_count: 333,
		},
		{
			fileName: "./OSI_model.txt",
			title: "7 Layers of OSI Model",
			term_count: 7,
		},
		{
			fileName: "./network_ports.txt",
			title: "Common Ports for Network+",
			term_count: 20,
		},
	];
	return listPackage;
}
