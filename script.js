// Get CT CSV first. created by opening "CT protocols list" GSheet, Select All, Copy, Paste into Excel, Save as CSV.
var request = new XMLHttpRequest();
request.open('GET', 'MRG CT protocols.csv');
request.overrideMimeType("text/plain");
request.send();

request.onreadystatechange = function() {
	if (request.readyState === 4) {	// have to wait for AJAX call to complete
		CTData = CSVtoArray(request.responseText);	

		// (once CT CSV is loaded...) get MR CSV. it's more difficult to do for loops for the XMLHttpRequests. maybe both CT and MRI could be loaded by doing .open('GET',url,false)?
		var request2 = new XMLHttpRequest();
		request2.open('GET', 'MRG MRI protocols.csv');
		request2.overrideMimeType("text/plain");
		request2.send();

		request2.onreadystatechange = function() {
			if (request2.readyState === 4) { 					// have to wait for AJAX call to complete
				MRData = CSVtoArray(request2.responseText);

				trimCSV(CTData);
				MRData.splice(0,1);								// remove MR header row
				trimCSV(MRData);

				for (i=0; i<CTData.length; i++)	
					CTData[i][0] = "CT " + CTData[i][0]; 		// prepend "CT " to protocol # - this crashes if placed in trimCSV
			
				for (i=0; i<MRData.length; i++) 
					MRData[i][0] = "MR " + MRData[i][0]; 		// prepend "MR " to protocol # - this crashes if placed in trimCSV
				
				MRData = rearrange(MRData,[0,1,3,4,5,6,2]);		// shift MR Time col (position 2 in the CSV) to the end

				CSVData = CTData.concat(MRData);				// combine the CT and MR entries into one array

				console.log("start adding " + CTData.length + " CT protocols, " + MRData.length + " MR protocols");
				console.time("addProtocols()");					// time this function; it's a little slow
					addProtocols();
				console.timeEnd("addProtocols()");

				// remove blank and undefined rows from the table
				protocolList.remove('protNum','');
				protocolList.remove('protNum',undefined);
			}
		}
	}
};


// FUNCTIONS
// Convert the XML responseText (raw data of CSV file) into an array
const CSVtoArray = (data, delimiter = ',', omitFirstRow = false) =>
	data
	  .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
	  .split('\n')
	  .map(v => v.split(delimiter));

// Remove empty CSV data rows and label rows with 100, 200, 300, etc
function trimCSV(input) {
	for (i=0; i<input.length; i++) {
		if (input[i][0] == "" || input[i][0].length == 3)
			input.splice(i--,1);
	}
	return input;
}

// Shift the MR Time column
function rearrange(rows, pos) {
	return rows.map(function(cols) {
	  return pos.map(function(i) {
		return cols[i];
	  });
	});
  }

// Add CSV Data to the table
function addProtocols() {	
	for (i=0; i<CSVData.length; i++) {
		if (PDFLinks[CSVData[i][0]] !== undefined)		// check to make sure a matching PDF link exists in the JSON array
			CSVData[i][5] = "<a href=\""+PDFLinks[CSVData[i][0]].replace("edit?usp=sharing","export?format=pdf&attachment=false")+"\" target=\"_blank\">PDF</a>";	// if so, add PDF link in 6th column, replacing the default GDocs Sharing link with one that opens pdf format in a tab/window
		
		if (PDFLinksExtra[CSVData[i][0]] !== undefined)	// add extra PDF links if present
			CSVData[i][5] += PDFLinksExtra[CSVData[i][0]];

		protocolList.add({								// populate the main table with protocol entries
			protNum: CSVData[i][0],
			protName: CSVData[i][1],
			protContrast: CSVData[i][2],
			protRegion: CSVData[i][3],
			protInfo: CSVData[i][4],
			protFull: CSVData[i][5],
			protTime: CSVData[i][6]
		});
	}
}


// VARIABLES
// vars needed for the searchable table
var options = 
		{
			valueNames: ['protNum','protDesc','protIndic','protMDCT'],	// this seems to be necessary, but not sure what it does
			page: [2000]
		},
	protocolList = new List('protocolDIV', options);

// JSON array of evergreen PDF links to Google Docs protocols. Within GDrive folder, right click on the protocol GDoc, Get Link, Copy Link
var PDFLinks = 
	{
		// CT 100 HEAD NECK
		"CT 100A":"https://docs.google.com/document/d/1ct0uUm0ITY8K8QbNurzj9EJZjbHZZOEPBQcdCDYoG1s/edit?usp=sharing",
		"CT 100C":"https://docs.google.com/document/d/1glp6AlpDxyGlXavzwDQp02iRSFnjRQHKkLRBPm5xRhE/edit?usp=sharing",
		"CT 110A":"https://docs.google.com/document/d/1ypoT6EaDVcNO_oSQxnL6m_P2NuacCHS6TDdkinagEtE/edit?usp=sharing",
		"CT 110B":"https://docs.google.com/document/d/1uJM1EiJwQw8X4FZJ7dV1tetMgDVFBUThOsfys3UL7Eo/edit?usp=sharing",
		"CT 120A":"https://docs.google.com/document/d/1097f_bWlyPUP6mKWKWXHcCo8BHRiw6mOjDDRzYx_MxM/edit?usp=sharing",
		"CT 120B":"https://docs.google.com/document/d/1cd1-xoRPp0auIR3mhWIm5EUGxT12Dk22XzAMshrLFYM/edit?usp=sharing",
		"CT 121A":"https://docs.google.com/document/d/1tTRMktfVie2PM9Zm4jsElbRlXY1DKR6SRp3-n3qDLtM/edit?usp=sharing",
		"CT 122A":"https://docs.google.com/document/d/1rUd-x0xb4T9s5YIBCNkm_GfM3EphxeusY_hUwJ8VcwE/edit?usp=sharing",
		"CT 123A":"https://docs.google.com/document/d/1ZfX9qcNEiwPGlqYZRDbV_sa0FNpnjBIbdJzLsO_-roQ/edit?usp=sharing",
		"CT 124A":"https://docs.google.com/document/d/1WugyPNjP-s-zIVfPC4YTBXwv9nyak6d3x0yOE8D7Cxg/edit?usp=sharing",
		"CT 125C":"https://docs.google.com/document/d/15IPeXsFiGrKqtXwDJ38LCsOqhLjDUPt0fIEpC8LwMoY/edit?usp=sharing",
		"CT 130A":"https://docs.google.com/document/d/1Mf1rBAmVRWAO0QZp1IZ5gnn6AtdKWSVus9ygv0NUORM/edit?usp=sharing",
		"CT 130B":"https://docs.google.com/document/d/1NU3DCwYkOWFuzShoZKcqJ3ukzwm9SOMCb3VRc9nQkNU/edit?usp=sharing",
		"CT 130C":"https://docs.google.com/document/d/1YE6iibdgl-7_ntukYHJ8xxwZNUkYMy_L8Oot2qByDpc/edit?usp=sharing",
		"CT 150A":"https://docs.google.com/document/d/1MRhQLYm58rUZ7OpXK4d12QEyb_GvMRxR58lUUpXga2g/edit?usp=sharing",
		"CT 150B":"https://docs.google.com/document/d/1zXB88zsqbi49tEuhEMKK__0NJPNbNOYDKUdvpBcKMCY/edit?usp=sharing",
		"CT 154C":"https://docs.google.com/document/d/1NXF2U3P9zOnkTOtXj7Krx_mcOnvBCrQ0fjWkHSkUqVw/edit?usp=sharing",

		// CT 200 THORAX
		"CT 200A":"https://docs.google.com/document/d/1ohZvuLVV8Pz9k2Eb3m6ccqmvl6mbkWCY6cVVUqwnUNs/edit?usp=sharing",
		"CT 200B":"https://docs.google.com/document/d/1ld9eTXaH9yrHM97Zhn6LbEvEEO4yGpO3X0eDjsCP8Kg/edit?usp=sharing",
		"CT 210A":"https://docs.google.com/document/d/1GJoaCX1yCAgjd-ohiRb7vymuXimLFxyre5-MvEuuReo/edit?usp=sharing",
		"CT 211A":"https://docs.google.com/document/d/1p6NgICXyKI9yWAwuc0BM6ud_yTMWjo_9NtfzhazFu-o/edit?usp=sharing",
		"CT 212A":"https://docs.google.com/document/d/1OjJgnPc4mKGUlZHh490BAqZNpBOE6l-ql-kmZQJku_U/edit?usp=sharing",
		"CT 213A":"https://docs.google.com/document/d/1uoDL5NlquFx_9WL1tUe6Llzx19pH9XYlU6AitK2peMw/edit?usp=sharing",
		"CT 215A":"https://docs.google.com/document/d/13Avndh7Ts0HqszNmuH9hRM96kkpy_D2mQ5Xd0Usg2Vw/edit?usp=sharing",

		// CT 300 ABDOMEN PELVIS
		"CT 300A":"https://docs.google.com/document/d/1OPnOj6NztXsF-eoAcZst6bNbonFMq99Z4sRUWLfX8Cw/edit?usp=sharing",
		"CT 300B":"https://docs.google.com/document/d/1z7Z453vGAPmow3Vi7FnXW09JlafKmeAPbt75apjq2Fk/edit?usp=sharing",
		"CT 301B":"https://docs.google.com/document/d/140ZtHFOLJ9kefgbAE6pSWUqMLkG0-v9C5z5eScizdak/edit?usp=sharing",
		"CT 301C":"https://docs.google.com/document/d/1LoGe0Z1g9atX-0xM0OsBAeDKixoS2NaB45zMR-oMXb8/edit?usp=sharing",
		"CT 303C":"https://docs.google.com/document/d/1HAHMlivnyRY2qKl3bsoKMSzQAapf0f4v8fXTCMINuPk/edit?usp=sharing",
		"CT 304C":"https://docs.google.com/document/d/1P3yf9dB5ujF8bWGDy-54Yx1mqUU4vrcCqCx8BlR_PvU/edit?usp=sharing",
		"CT 309C":"https://docs.google.com/document/d/1Z56zUU8ZwvVmrDkZVIjCM4mq5VsrJHIut8mPssq4iSA/edit?usp=sharing",
		"CT 310A":"https://docs.google.com/document/d/1TM_XICQSk26IvzKg3J3KLLR29DwHgEvu2StXPaiHg2I/edit?usp=sharing",
		"CT 310B":"https://docs.google.com/document/d/12BHyEqZXUZa94Tv2jGmmNUWQy1qkHaBHVK2p1nERjb8/edit?usp=sharing",
		"CT 312A":"https://docs.google.com/document/d/1E7QAtp7MehsyWD2oc6JzyMJtMfL0dZc7ckGTJDp1Qjg/edit?usp=sharing",
		"CT 321C":"https://docs.google.com/document/d/1YxDAMlSNWH_davgHhoLMCW2otFMafIvbAMcYjuPq61o/edit?usp=sharing",
		"CT 323C":"https://docs.google.com/document/d/1wU7iyWDgETn-MehFwwqGSv7LB7nz3VQtfSVrm3BP-ng/edit?usp=sharing",
		"CT 324C":"https://docs.google.com/document/d/16fwodiWXAD0JSt1AH8wNkIwDBCc3EFQoNgbaTT6TpO0/edit?usp=sharing",
		"CT 329C":"https://docs.google.com/document/d/1_gYQwc_TAgFHlrMU22njNCiED8-Ad848qSMbRAb1N8M/edit?usp=sharing",
		"CT 340C":"https://docs.google.com/document/d/1kmQODKnhaVBBoG9SHohEbuO3qsu_O_kNWX_OHbE-L9A/edit?usp=sharing",
		"CT 341C":"https://docs.google.com/document/d/1CLKZRAJP7MShOnJnlnNo9hbua4qk4UveD6cJE-yJdUc/edit?usp=sharing",
		"CT 350B":"https://docs.google.com/document/d/14ggXe3F22h3B7G8BdVWA9gATN5q5kAbtwGBk5N67r-g/edit?usp=sharing",
		"CT 351C":"https://docs.google.com/document/d/1U9943a-HLHrLnold_EsSmvIYYt6eM3BuyE4X49V2aTw/edit?usp=sharing",
		"CT 370A":"https://docs.google.com/document/d/1cTLxIjhk_Ra_ylDJlAAm8LeWYmqNI_YR0xuvbMWIGkw/edit?usp=sharing",
		"CT 370B":"https://docs.google.com/document/d/18FnbmH_HDVPQ22niFwND07vpuVfCDnZSXkm5yOX4Qmk/edit?usp=sharing",
		"CT 380D":"https://docs.google.com/document/d/1UGiu9fH4hpbV0HTNnDPU5_R009FjjtNJareKb5mPLgk/edit?usp=sharing",
		"CT 381C":"https://docs.google.com/document/d/1GJ3AriEbRrcTT6ZTlFqA7Y7ARqlh57lngEoTmCKi1sE/edit?usp=sharing",
		"CT 390A":"https://docs.google.com/document/d/1W63ePQrcI13ggyv4uQRDqzqBl21wJ7CvlwbXfXfCrGE/edit?usp=sharing",
		
		// CT 400 MSK
		"CT 400A":"https://docs.google.com/document/d/1oo06G67Xcz1cJOPf8Psb9WEsm3axu0L1sYTDHu3W76g/edit?usp=sharing",
		"CT 400B":"https://docs.google.com/document/d/1mZghbWzJWTNv0V5W6ne-VhsVUAFVv6YvFwy9exgbpN0/edit?usp=sharing",
		"CT 402A":"https://docs.google.com/document/d/1casvCt3RBK2WAVzp4acdBT4fWZWga8Qzsf2IQBuk0BI/edit?usp=sharing",
		"CT 410A":"https://docs.google.com/document/d/1xk2e1JAcmqbexCtjuH6y9k4rQp4JWs4n3NQcvZA88qU/edit?usp=sharing",
		"CT 410B":"https://docs.google.com/document/d/1vIfdWKKIHnqoC6Wpxp-X3EUmyXsOofO_XufACa8nnWw/edit?usp=sharing",
		"CT 412A":"https://docs.google.com/document/d/1UUD7NrXrOulvugIxKANuoq8TWNWzrPl8cmcKUbFK9jM/edit?usp=sharing",
		"CT 413D":"https://docs.google.com/document/d/1yazq1N04nNExJcCDfsXfUv6XfKO-livQiLrDg8CQafM/edit?usp=sharing",
		"CT 420A":"https://docs.google.com/document/d/1INZBCQHd9ynqTOOC4_lNuOnj50YCkDvQyWl-eOScCRI/edit?usp=sharing",
		"CT 421A":"https://docs.google.com/document/d/1wJ-cGB6v2aDKx8A6y3VviI5EW3_B6p5SacLxFfGWNgc/edit?usp=sharing",
		"CT 422A":"https://docs.google.com/document/d/11fm3AXf4iqkmd0l6QJB-9XreHlvuc-s2ckRoPGi4CSU/edit?usp=sharing",
		"CT 424A":"https://docs.google.com/document/d/1_xIJ6s9KFziY2S9Ahg3tMuWV9XYkT4b_SHdfnzrBnrM/edit?usp=sharing",
		"CT 425A":"https://docs.google.com/document/d/1OBJagXHqyRTGd4N3tquq0boJIJHg-WO9oOpPnKkgXuo/edit?usp=sharing",
		"CT 426A":"https://docs.google.com/document/d/1ah7hrqBbHx8F3kUwvKaQMqYnNTHx9fcZWfy6Qy4ZKCA/edit?usp=sharing",
		"CT 427A":"https://docs.google.com/document/d/1PIOoStDfuWDxCxhWA3EJINEg85YR2s1YwVc2PNuIsG0/edit?usp=sharing",
		
		// CT 500 SPINE
		"CT 500A":"https://docs.google.com/document/d/1HQxBqmi1EgoQobjgVp1Nt9rqwhkgO6WvfybPGnwQUJs/edit?usp=sharing",
		"CT 500B":"https://docs.google.com/document/d/1HKykWZWEOviTvPcaZX9TvdTOo7mdVgsHbVA6ZMJL5ug/edit?usp=sharing",
		"CT 510A":"https://docs.google.com/document/d/1Mqec4mGel6l_0WWdJy9VDDCjTsX1vCoP_MK1UIBn3_E/edit?usp=sharing",
		"CT 510B":"https://docs.google.com/document/d/1sslH4cMT69mfjLGU-myNvzM2srQ18pwv0jxYgTHusaI/edit?usp=sharing",
		"CT 520A":"https://docs.google.com/document/d/1iI8FZ_dS_1Myh5Mmqsw6j1ZCXrQT179r_rpo5gFWrr4/edit?usp=sharing",
		"CT 520B":"https://docs.google.com/document/d/10PM2Pkx4WoRMcQyk8edHJMgGrk-j1KzzdwzT9Gy1wvE/edit?usp=sharing",
		"CT 530A":"https://docs.google.com/document/d/1vjKkxrcvYy9TQ3PT7NPx0g0wL_DPuJSZicytAXrFxVw/edit?usp=sharing",
		
		// CT 600 CTA - VASCULAR
		"CT 600C":"https://docs.google.com/document/d/1gsCUU0NIWwr6sfmlEhFRqPiCg70gLuoGxQHBwBcGifM/edit?usp=sharing",
		"CT 611B":"https://docs.google.com/document/d/1EMHYUyIc1zwQtyd_EYk72EK6bNmEbqe7nFRoJvKlhWI/edit?usp=sharing",
		"CT 611C":"https://docs.google.com/document/d/1VS8_G9t-PPUbnwmx-afhIzjL7FQSV5Fsybz2nZEFv1c/edit?usp=sharing",
		"CT 612C":"https://docs.google.com/document/d/1zsJjxESMY1dXq0WhOjFMGTEij8Cvo7OLX0A8tMdW2cs/edit?usp=sharing",
		"CT 620C":"https://docs.google.com/document/d/1kDNagtkZS27KIkSe2CsSwilEVMezXLMRL4Gaw9bDtKI/edit?usp=sharing",
		"CT 621B":"https://docs.google.com/document/d/13l3IloOvTzbd2tADn1qBZn5Jy75JVVOyvORqjU6adi4/edit?usp=sharing",
		"CT 622C":"https://docs.google.com/document/d/12r8yl_n66QgzLz_8f5cl4hj1V2buJhmXYRi6Q4aM__M/edit?usp=sharing",
		"CT 623B":"https://docs.google.com/document/d/1efk86W9nyIYip9q-_-hLeL0FE1-_glcAawucTvRxtDs/edit?usp=sharing",
		"CT 624C":"https://docs.google.com/document/d/1uvy1JHr9DgPh1HvZL_Z9xJv5xLFvM5qx3Lfg83mRCVg/edit?usp=sharing",
		"CT 625C":"https://docs.google.com/document/d/1aYS8ObZEDEKyimdqBFdOZpwuRMY1tl6KVnppJX9tr_g/edit?usp=sharing",
		"CT 626C":"https://docs.google.com/document/d/1nzQ0WIE9oE2r7t7f94fbyi5Ni8TaURg9gx_G3rnvwS4/edit?usp=sharing",
		"CT 627B":"https://docs.google.com/document/d/16nxlxBoALrfb0nJsgIl9aHzWwKp5ZysADCMuyftplCc/edit?usp=sharing",
		"CT 630C":"https://docs.google.com/document/d/1peEXuuhh-ejjTcu8uH6MvCkDylizDf5lSs8KbhSQBwU/edit?usp=sharing",
		"CT 631C":"https://docs.google.com/document/d/1BkywHPS0j-yRMjxZQv759oYUO11K1cZvhuQji7kaf_w/edit?usp=sharing",
		"CT 632B":"https://docs.google.com/document/d/1vvb32DAGP_x9quV7IRIBAkA5NIhEIPpVUEXRQwtRTTg/edit?usp=sharing",
		"CT 632C":"https://docs.google.com/document/d/1Y9AdhxAGxfZy3cqVuxsGqIhg6KLLRwFGmrWCzA-AXUs/edit?usp=sharing",
		"CT 634C":"https://docs.google.com/document/d/1z3U5cbMql2KOin1zkqS4n-VBBDnGqUPs2bzUJEe9DLs/edit?usp=sharing",
		"CT 635B":"https://docs.google.com/document/d/1kHflyi-up3yqXpiwD-POe4ZiSq7-tSKRi2TA02H8Vlo/edit?usp=sharing",
		"CT 640C":"https://docs.google.com/document/d/1qcMFDCzTBhek416HsVnXfJZcnlQVMye-QLxG5PgbuXo/edit?usp=sharing",
		"CT 641C":"https://docs.google.com/document/d/1CjDbPCFh6hsLWpFqVeSEgZSfuqhmOBRYFFlE7Rjuowc/edit?usp=sharing",
		"CT 642B":"https://docs.google.com/document/d/15qXHv_rowRHQvnQ7TzUuvcWbPjdXRNgFSt-ztmZf32Y/edit?usp=sharing",
		"CT 643C":"https://docs.google.com/document/d/1G_sfS8v0z2kYT-e8ihkGhxghXX2IBgoFC61hQcPW1jk/edit?usp=sharing",
		"CT 650C":"https://docs.google.com/document/d/1FVdJxuB5vnIMF_bIfQQEX-Dp72gyGWywdl-QeNccROs/edit?usp=sharing",
		"CT 660C":"https://docs.google.com/document/d/1l1VvbbLBM10Cq1Bqc_IXiqZqmCt71y7dNNI4lsYbibU/edit?usp=sharing",
		"CT 670B":"https://docs.google.com/document/d/1Og7SOaOQ2FR5lzv9RwMaukZ72KFOZ6HxOQDZkOokadI/edit?usp=sharing",
		"CT 671B":"https://docs.google.com/document/d/1GDhsxffDcKD2uKANeGPFbJxAeQ57tNMJxX4p6Hc8d9Y/edit?usp=sharing",
		"CT 672B":"https://docs.google.com/document/d/1tW_w0vnXT97C5IfrR43ORXUZH_yoVdybb5fqC4N_G7k/edit?usp=sharing",
		"CT 673C":"https://docs.google.com/document/d/1-FgWzBic39PdXYs2Oh_RtHgPy4w_PgmJggzEO9El1tc/edit?usp=sharing",
		"CT 680A":"https://docs.google.com/document/d/1K3acxrWrrt0ln4yvbJ1oOZv5SIYpsJcufHULO_iZMSE/edit?usp=sharing",
		"CT 681A":"https://docs.google.com/document/d/1_Eh94stzLryxz7LTsIXJ6dCEvDPfo-NOh7YdKCYuwd0/edit?usp=sharing",
		"CT 682B":"https://docs.google.com/document/d/1z7TrRzEoht9K9G0u6J-1Nohqgl58ZurbFhsDPxsy_7g/edit?usp=sharing",
		"CT 683C":"https://docs.google.com/document/d/1nU2Z0XBTxj5j_Zy2EToqZ_8zVH8jAttf8uGCEx5fBF4/edit?usp=sharing",
		"CT 684B":"https://docs.google.com/document/d/1fNydno5oIE84zEPiVB6d1HzWtE213jKN94aDF_J7tnM/edit?usp=sharing",
		"CT 685C":"https://docs.google.com/document/d/1WoCxxpDOVm59mNc2w5YO2xKygI6WC7t0t8rpCb_MAus/edit?usp=sharing",
		"CT 686B":"https://docs.google.com/document/d/1pz48Ut5cnGbCU8B6sKPgtqAa99Rj0wZWjqnq7emW1EU/edit?usp=sharing",
		"CT 686C":"https://docs.google.com/document/d/1PnDuOvqYyA3v0fwKOk3r6sMAfjZ8QA1Ugx1vUnLPApA/edit?usp=sharing",
		"CT 687B":"https://docs.google.com/document/d/19JUWPAw2SYBHCY1IpfV7r1Msht_oKAs_bz27C48nKRU/edit?usp=sharing",
		"CT 687C":"https://docs.google.com/document/d/1aWuz1WdVvZMbmmIs6eZb-Kt_ikrG9DJ4puwbBT0Zc3k/edit?usp=sharing",
		"CT 688B":"https://docs.google.com/document/d/1Npxh_ij12CJWM3rgVCZgyTIfpju0SJzSKmCfly0lN0A/edit?usp=sharing",
		"CT 689B":"https://docs.google.com/document/d/1MWKL-rJ_ivbXO-o2Kv3qUtzc2prdQsiyGRMKGjRbvyE/edit?usp=sharing",
		"CT 690B":"https://docs.google.com/document/d/1_pW8HAkTI-a5bCdPl_bL48YK703Z2ep-Lv8Doiqd_Kg/edit?usp=sharing",
		"CT 691C":"https://docs.google.com/document/d/1DxK3DqTVSX5pBbciVcrlnftl5K7UXw4coU7iTL7Tp60/edit?usp=sharing",
		
		// CT 700 COMBINATION EXAMS
		"CT 700C":"https://docs.google.com/document/d/1Q7gTzJXm7s5lWt9HUpQmx3Kqc6CwzBR1982FhB_ZFjM/edit?usp=sharing",
		"CT 701C":"https://docs.google.com/document/d/1FMF8kB_4BCx01w4a8mERTSgRKfzD3C8EfiqdpyfRDLE/edit?usp=sharing",
		"CT 702C":"https://docs.google.com/document/d/1AQTtgrsllnsFzgjnPAhSnZ59hAdv9y8-Ub0A-BQW7ik/edit?usp=sharing",
		"CT 703C":"https://docs.google.com/document/d/1kf7muOssgt8knXN4ydrmVefkNodVY96xNpRgHlqV_4I/edit?usp=sharing",
		"CT 704C":"https://docs.google.com/document/d/1VrIQXlzeQ-caaRkd92FKtBWFrV3pNtM7lIpiI7aM4z0/edit?usp=sharing",
		"CT 705B":"https://docs.google.com/document/d/1bcmLHLizhnKnxVZk4TbaKgfoa_KEyvspOfGDBzEBk8M/edit?usp=sharing",
		"CT 706C":"https://docs.google.com/document/d/1lXXlfVc4XT7WaAZe-K_cn074JRp-x04vXqzBLZ6nfAU/edit?usp=sharing",
		"CT 707B":"https://docs.google.com/document/d/1XAKBFb0p-ML6rj1XFWJJhwjq6YbkvCGMmWeWKkYRPK8/edit?usp=sharing",
		"CT 708B":"https://docs.google.com/document/d/1tjuCgD4QdoKG7bZ0xrL7x48hn96YRc_RPMNAG2KLOI0/edit?usp=sharing",
		"CT 709B":"https://docs.google.com/document/d/1pqkizCD43yN3A0yXcPVyjP8FZzQWz6X5W56R3zl8TwE/edit?usp=sharing",
		"CT 710B":"https://docs.google.com/document/d/1e49iC20tQ6Pmd4uZF3v9c-S0nWchSFacI4-N0H8_hPQ/edit?usp=sharing",
		"CT 711C":"https://docs.google.com/document/d/1vZe-7exctt0Cw8oRYIGjd5ZR-uLtrx-HmHeOCXnkHOc/edit?usp=sharing",
		"CT 712C":"https://docs.google.com/document/d/1d2NYCV6beGDAzvfdm1zf_i2-FGuduMzJg9YifzZJxks/edit?usp=sharing",
		"CT 713C":"https://docs.google.com/document/d/1A8K66Y1_DoIc_2pseG6zjP3SCO4E1yyB1PHtoBVZrFs/edit?usp=sharing",
		"CT 714C":"https://docs.google.com/document/d/1snxMtIs0OiRgNSDbuIT5UA4jJxKc5YA5VTZ-chrB9Ik/edit?usp=sharing",
		"CT 715C":"https://docs.google.com/document/d/17xxGL73GFhMi8VmZRgqjTMYiUo759Remq4mBj38pgoU/edit?usp=sharing",
		"CT 716C":"https://docs.google.com/document/d/1XJZuPuKlUL8Snl959vJqkGnyNkmnzaHlRTSSjcGM4TE/edit?usp=sharing",
		"CT 717C":"https://docs.google.com/document/d/1gKLwsTyJ01bsyCQUFySljYrsf6Fkepn-QBR4SMt0d6A/edit?usp=sharing",
		"CT 718C":"https://docs.google.com/document/d/1-aBCQLLznXuq8TptorMu3yYFhZZ38NWCbWOL7aJkKhI/edit?usp=sharing",
		"CT 720A":"https://docs.google.com/document/d/1NDMLSLc7KbQZCJsConueGhAt8XZNs00i5U-TLwCFoJI/edit?usp=sharing",
		"CT 720B":"https://docs.google.com/document/d/1MTUnZEXdTQEyaAsiu5YaBGg1Ay_I9myg2TeywSvMW2s/edit?usp=sharing",
		"CT 720C":"https://docs.google.com/document/d/1D9MQbxMTtMTEq37ZBjeNQMSo9DgoxfpDECy7gcFqDis/edit?usp=sharing",
		"CT 723B":"https://docs.google.com/document/d/1tbWy-ZSTOt_R_vOx41esBVDUWg4J0fUXv15G13hQKHM/edit?usp=sharing",
		

		// MRI 100 NEURO
		"MR 100A":"https://docs.google.com/document/d/1KATgW6r5xV3xl3WqshPP2lbJpjuQEHanAju5xUr1Wpk/edit?usp=sharing",
		"MR 100C":"https://docs.google.com/document/d/1ocVviKiHlrKvszCImOjsV01RPWcSQ7dW0EufdJOCbZQ/edit?usp=sharing",
		"MR 102C":"https://docs.google.com/document/d/1Sez70fM05NoFoaa2UdMA8abB11enWHioAAy_e5OQnSs/edit?usp=sharing",
		"MR 103C":"https://docs.google.com/document/d/1uSdPXQWeaO-CTpfEq82ASVytojmvyti9hZwnI5yhwfE/edit?usp=sharing",
		"MR 105C":"https://docs.google.com/document/d/18pRvf36LaQjWyDXx--r-DHv54mY63rd7hpNioDVk5B8/edit?usp=sharing",
		"MR 106C":"https://docs.google.com/document/d/1EPuVLgd64PvQUQLyaR5HQ6quNYlu63uaMuKK8kHlxdU/edit?usp=sharing",
		"MR 107C":"https://docs.google.com/document/d/1WiZFBgrDIwQ-bI6NM5O_oo3DTxsLrqfnczksQMirTEY/edit?usp=sharing",
		"MR 108A":"https://docs.google.com/document/d/1p2poz-ljrn5S0K29k7Rly-avCD73vQ-QYThpmgR_Crg/edit?usp=sharing",
		"MR 108C":"https://docs.google.com/document/d/1pu2ipTDXvYNOgqiwGfDBmfYv7UPHtCxTKAfhs2iaABs/edit?usp=sharing",
		"MR 110A":"https://docs.google.com/document/d/1_tjXSf-FrvN5ZHCcr2Cmd4QjSLto1CjIrbdmtQyZXVo/edit?usp=sharing",
		"MR 111A":"https://docs.google.com/document/d/1xbjRTvHmH3shQLza8u6ldBoF9m0AEzG9Gwc4xQp-93I/edit?usp=sharing",
		"MR 115A":"https://docs.google.com/document/d/1AY8iqmhhawdvnAl8wkpTmt553U9jwPzZrwHvVOsVSI4/edit?usp=sharing",
		"MR 115C":"https://docs.google.com/document/d/1RBWMm3J4RS-1T0lqUKJG8YA025SWp_kaM3pDrmu3y2g/edit?usp=sharing",
		"MR 116A":"https://docs.google.com/document/d/1ONWCR5yFNQgyjSZ3q5DMUCNTIhmO4pUx0O55V1WmAFw/edit?usp=sharing",
		"MR 116C":"https://docs.google.com/document/d/1uI1TXYNTx1_YKw77xZOvhyVMiHQf8an8ucqOTotBVPA/edit?usp=sharing",
		"MR 130C":"https://docs.google.com/document/d/1hlFiUIKoYxwQYQXSs2iNcPIh8gJEJZ2LJ-9Lm_dBUKk/edit?usp=sharing",
		"MR 131C":"https://docs.google.com/document/d/1GxcuvMbu8YzdfLMQPfZYKBPi6YAz3qEXMvXatlSTJA8/edit?usp=sharing",
		"MR 140A":"https://docs.google.com/document/d/1fDQFSc_-YpJ6yZ7KRoQZ4ficzTgQk8FQ4I-viX2O8x4/edit?usp=sharing",
		"MR 140C":"https://docs.google.com/document/d/1AOinDJ7juT4QBPIgWIYVZhO1B81DU4sBk6d02zpkz_Y/edit?usp=sharing",
		"MR 142C":"https://docs.google.com/document/d/10DQwk55N7fFzt0lzm6azHCqlaDLPDQ_ERebTTPZo3I4/edit?usp=sharing",
		"MR 143C":"https://docs.google.com/document/d/1st91LBK5UrFZepXza503pFby2QN8zWpre8bxh9y_I2g/edit?usp=sharing",
		"MR 144C":"https://docs.google.com/document/d/1--RFI0-kdORO85srERQJzo2VkX1VcHZ7p65bbMlK6Hk/edit?usp=sharing",
		"MR 145C":"https://docs.google.com/document/d/1TsKegrLRxG8t-iH0I1bj_bM0xYVWj_45mx-xc71vfao/edit?usp=sharing",
		"MR 146C":"https://docs.google.com/document/d/1yR9ccFm-4D8lTHtbo1N790sp8k7RzMHQrWuF7UEYicM/edit?usp=sharing",
		"MR 150C":"https://docs.google.com/document/d/1AWEpqujMyxFWj8fWt1hmLqKi9pDIbsOTkCqNz8pwZbo/edit?usp=sharing",
		"MR 151C":"https://docs.google.com/document/d/1CD22RtCqxrjFXD7T6fxD2Uy_sx8tcMY2IBrTSvaoTtE/edit?usp=sharing",
		"MR 152C":"https://docs.google.com/document/d/1y_8H4OgU_KMoMYAzATdKCqnVGjjPvCVReYVDszN7sBQ/edit?usp=sharing",
		"MR 153A":"https://docs.google.com/document/d/1tyw4J3CzLFC_OvOg2VZDgEqxyPENHy9GovNkq5Js3Ws/edit?usp=sharing",
		"MR 160A":"https://docs.google.com/document/d/1nBrL7DwZr6xjBxxBOAljJ7TNh_Qa2Gy06v4Egbra59w/edit?usp=sharing",
		"MR 180A":"https://docs.google.com/document/d/1H7l0iL7CMebL1PBUnGDdzwiwE4W0Fte7beWlOO83ZS8/edit?usp=sharing",
		"MR 180C":"https://docs.google.com/document/d/13pe2Eyfvl0fjB_gvwHl7x2DuIQpdZc23EqtRzB4m-_Q/edit?usp=sharing",
		
		// MRI 200 THORAX
		"MR 200A":"https://docs.google.com/document/d/1eq6kFDxc0tOv6_TLHtRcQ3OYbhjf14ffuH8gvAPH83s/edit?usp=sharing",
		"MR 200C":"https://docs.google.com/document/d/1rRMq1dG3OA5mb6zQMakjvE8T8mbwwWAWxBRCCpDKn4Q/edit?usp=sharing",
		"MR 221C":"https://docs.google.com/document/d/11YwWXm0ijzNwuU4gWFj00wiyWP296V3Xlb6cZPT6Tgo/edit?usp=sharing",
		"MR 225C":"https://docs.google.com/document/d/12MN0wdjACQ02hhTlW3mu_XjwqN4GWevQHi5djBcwwxc/edit?usp=sharing",
		"MR 230C":"https://docs.google.com/document/d/1HGOrVLx28cyOqscYrmRK2Kxep0VDbNkY7XX_gbEe7DI/edit?usp=sharing",
		
		// MRI 300 ABDOMEN PELVIS
		"MR 300A":"https://docs.google.com/document/d/1WedWnGgqGXaf4xKfMnG7Zqmb1KHtyMVmNn1PHOm2J7w/edit?usp=sharing",
		"MR 300C":"https://docs.google.com/document/d/1aBHkjOIUsWU6ZSxDP7TIR51C3uH-QILhX9dHCeyudpQ/edit?usp=sharing",
		"MR 301C":"https://docs.google.com/document/d/1gMG1rMnxbnC3E2LFpHKOcwKLXFd_Z7lvDmu5ZSGaGm4/edit?usp=sharing",
		"MR 302C":"https://docs.google.com/document/d/1WsTuQE__NMTeopN-Xps9H_mFzPq5MjHvnknjksygT54/edit?usp=sharing",
		"MR 302C F/U":"https://docs.google.com/document/d/1o9ZJ-u7I5kb3ib0VQpxZf0QIAAlkTf403hnm0UNBgYM/edit?usp=sharing",
		"MR 303C":"https://docs.google.com/document/d/1NC7R44o9Z1OAFImBD_0Ezn4eGJHCfsSIWiNOe2YYz48/edit?usp=sharing",
		"MR 304C":"https://docs.google.com/document/d/1jyZoz30EaVtw-f2N0brRr7L93EEtA4lY5ZUIAqpbhZE/edit?usp=sharing",
		"MR 305C":"https://docs.google.com/document/d/1f7vRNyNayjRGvk9YaNFIT6P9VG9JdAaDORp6Y8JwtOA/edit?usp=sharing",
		"MR 307A":"https://docs.google.com/document/d/1vuMsOof33FsTxwRPcjP9S5JEhVltAllnGIibOvblpT0/edit?usp=sharing",
		"MR 308A":"https://docs.google.com/document/d/1dl9qnO6BT8lL80Sscf0jO0TQ3jFF-ZsfBZ4uZK7W19w/edit?usp=sharing",
		"MR 309C":"https://docs.google.com/document/d/1Cnavk64s-vTLRyFkuY1bYQCJonCvUgw6wqmKz7sVDDY/edit?usp=sharing",
		"MR 310A":"https://docs.google.com/document/d/127Ud9y4fXGvm1dVbBsUYM0VqlA7G2i6TqXkUVCKYnns/edit?usp=sharing",
		"MR 340C":"https://docs.google.com/document/d/1GKIzzpJRR3nt5fNPv5b6IDNoAYrEm3yO64eCdRwAiIc/edit?usp=sharing",
		"MR 350C":"https://docs.google.com/document/d/1m9hekhZzL-_q3wN67gRIdLXRO4HlyUAiUdeRmzrFTvk/edit?usp=sharing",
		"MR 360C":"https://docs.google.com/document/d/1MWCiZrGiOw41loQz5xIKN4t6xR72_UpVhzNkcrvZFWc/edit?usp=sharing",
		"MR 361C":"https://docs.google.com/document/d/1f-jAz0RP4cbNCZ8bPpHGBOef3-K4rt6RJ3oRrXl5I0E/edit?usp=sharing",
		"MR 362C":"https://docs.google.com/document/d/1F7yFNMQvLjzhcQgXzJazJEVKyxCDR4UCX40buiqWqlY/edit?usp=sharing",
		"MR 363C":"https://docs.google.com/document/d/1g9AT2-wTvz9aYp2y2y9XAce2OAkFaAofM-pIZmWCWD8/edit?usp=sharing",
		"MR 365C":"https://docs.google.com/document/d/1EBk3ZkWYoBx8W0-sgMuvzyW7PnXtYxkFR8opkYF9vCs/edit?usp=sharing",
		"MR 366A":"https://docs.google.com/document/d/1yacD_x45fqcQMNcggQaWwpMlQlO95nlm00TBwi00XTM/edit?usp=sharing",
		"MR 367A":"https://docs.google.com/document/d/1pUHrvkJB6IwW4mb-v3GMKSQY669sws2hPJPxRuba6NI/edit?usp=sharing",
		"MR 368C":"https://docs.google.com/document/d/1jQPQ9hT-DLSVFcpv1X7bBjpcNHaDdVv_JHr4CT-obnM/edit?usp=sharing",
		"MR 369A":"https://docs.google.com/document/d/1nB5HJeGHu-ix698Hy80_OQ3zSh3Cg0YiOc7swxxRb0k/edit?usp=sharing",
		"MR 370A":"https://docs.google.com/document/d/18FWER-MWu4d7u-Sv72mV4N7ViWL43mDvk66WFYVc74M/edit?usp=sharing",
		"MR 370C":"https://docs.google.com/document/d/1MVdZhHbqKwRnMd6KMUZ4caOOVWStfAmUY76TgpbrO8o/edit?usp=sharing",
		"MR 372C":"https://docs.google.com/document/d/1Swmpl04-wuXraLcg3_SDZeUKM8ry7ZEKwO0yRkSbszE/edit?usp=sharing",
		"MR 373C":"https://docs.google.com/document/d/1t0J-0NNZQkbhFrsmRYhpuWxd0W5lsc4Od2DDZbe0YQA/edit?usp=sharing",
		"MR 374C":"https://docs.google.com/document/d/1KohBgeMY0SjPdiEFchhamxsE8AAz_hzEfhKutoabEAg/edit?usp=sharing",
		"MR 375C":"https://docs.google.com/document/d/1qjPkeT5lyj259kZP6Fd3N_qyuVJ-svuyWtkLqVrAnyM/edit?usp=sharing",
		"MR 376A":"https://docs.google.com/document/d/1ahXxJx3ddE10PgrrVgWd9QpAnul8L_ByWDXKQ94bm-E/edit?usp=sharing",
		
		// MRI 400 MSK
		"MR 400A":"https://docs.google.com/document/d/1Xe5MnjpaEHeLFnnERF5ZuvqhdMgIQe_JqAd2uZHt_EY/edit?usp=sharing",
		"MR 400C":"https://docs.google.com/document/d/12SM57aIoGrGUtZIynKr32U5RJ-F-kH9kCk1ysGdhNBM/edit?usp=sharing",
		"MR 400D":"https://docs.google.com/document/d/1njE6uSKRZ314PgS8vXKIJwAFFACMI4ND8o4s7XrPLJU/edit?usp=sharing",
		"MR 403A":"https://docs.google.com/document/d/1sMzYjE-2lJvpBQ2B9vl6sUPeCX-A1fK2eYVT56GdMPs/edit?usp=sharing",
		"MR 403C":"https://docs.google.com/document/d/1RUkld9h5UH1IJdllLLrJ8ZYU6DtRpSri7DWapoOEhsI/edit?usp=sharing",
		"MR 405A":"https://docs.google.com/document/d/1hdSHjYuAnb83-OeUgXiNvl3G1zNLqud7i49TQQUSpXM/edit?usp=sharing",
		"MR 405C":"https://docs.google.com/document/d/1Jd1NsS_siW-oDol2ER6YEmBxz1jPN1RuvrmmRinKTn4/edit?usp=sharing",
		"MR 406A":"https://docs.google.com/document/d/12Z7ZH4VwNGQYTJMnBaLPQPUaSWdkMNg5FDXOqMsJC5Y/edit?usp=sharing",
		"MR 408A":"https://docs.google.com/document/d/1IGlK67-bFtkXTc03vi0J3zDgkxq5FbDtqCbT9lw_UpY/edit?usp=sharing",
		"MR 408C":"https://docs.google.com/document/d/1fEXjQAnx_Zl-9NlRsV1ywxVV131LPkQNCPtCPsSke3g/edit?usp=sharing",
		"MR 408D":"https://docs.google.com/document/d/16mUh0lyX3pwU9YhhSTkukXDldu0GCXxRq2uOs1g6Rfo/edit?usp=sharing",
		"MR 411A":"https://docs.google.com/document/d/1R8Tg_hul8qK-RBw2POJnwbSNlsXHbJfCY5Dvm9w36cc/edit?usp=sharing",
		"MR 411C":"https://docs.google.com/document/d/1kAWyyJTYqxwILU5Oqy1naytTzAAraT5biN7Jwp8Aep4/edit?usp=sharing",
		"MR 413A":"https://docs.google.com/document/d/1HJyo4dt81aoDI0Y3keldpXsz2eZipu5Lf7DuZEDJuzA/edit?usp=sharing",
		"MR 420A":"https://docs.google.com/document/d/1pEmFTfINcjcr8JdPFn_sPIo9KPHKhGqdu1pq9wqAOtk/edit?usp=sharing",
		"MR 420C":"https://docs.google.com/document/d/10BKPS5ezghCOzrr35tAJfkdgMtQnDOOiV5iGYLM1iyQ/edit?usp=sharing",
		"MR 420D":"https://docs.google.com/document/d/1RbsT8hoPtl7-czpiMfITE6lU-HX9bDsdC97EriZZ66A/edit?usp=sharing",
		"MR 423A":"https://docs.google.com/document/d/1eRD8KMzhEmO5GMNMbAmf-0xgXicvVODk6jivTQK-3Vk/edit?usp=sharing",
		"MR 423C":"https://docs.google.com/document/d/1gR-5_WsxfbowwZN5pttdyUjdecWmqI9_fgATRkaHqRo/edit?usp=sharing",
		"MR 425C":"https://docs.google.com/document/d/1Ruc5Uwh_7xwZjSS-rs-mZjFsBv9BSiqGmlQnnNLnayE/edit?usp=sharing",
		"MR 426A":"https://docs.google.com/document/d/12ADuvyJ1PeA65z_sRnxeusxBuNCN_MUervHmFg17Q9I/edit?usp=sharing",
		"MR 426C":"https://docs.google.com/document/d/117zTAX-8W_EkKYbSB-KmHebNTiZxSV8_WdeZFCdzmOE/edit?usp=sharing",
		"MR 430A":"https://docs.google.com/document/d/1ujXUueD2BCZCzkgbdWgSohI3cwBWfWpEdx8sbjpWnyE/edit?usp=sharing",
		"MR 430C":"https://docs.google.com/document/d/1Sf7BlOeObpXBODP6oGKvK3KTphCaSAZ5_UzvoeKyKTs/edit?usp=sharing",
		"MR 431A":"https://docs.google.com/document/d/1uQK6t5ofGPbhY7O5rNht1m9qAcNV96DmCgCvuewXc_4/edit?usp=sharing",
		"MR 433A":"https://docs.google.com/document/d/1zYTxuy_JQKAqxRrkDwkat_o8WW-CtBwHI9o69cYESLc/edit?usp=sharing",
		"MR 433C":"https://docs.google.com/document/d/1F3B083BmgwmyEq6lhvV6eC1ZN3GsxDTCfsy6saThrRA/edit?usp=sharing",
		"MR 433D":"https://docs.google.com/document/d/1kEHyt4mhPuoODfDAtYyqyKDSCSZVLj3581RkQzGxeHw/edit?usp=sharing",
		"MR 434A":"https://docs.google.com/document/d/1zw_LH7qQ7FVvFFXRkx7CYovOuVuqvgKPQ3mFrJ65-34/edit?usp=sharing",
		"MR 437A":"https://docs.google.com/document/d/13LwvhVrQ-WuNTPFjwxaYnLnTI_RPwr4q9u5UGyJ3zBM/edit?usp=sharing",
		"MR 437C":"https://docs.google.com/document/d/1VLjh0-uPwaIvKYpfwpmHGgKBcnPq3oL13NFcekMLtHo/edit?usp=sharing",
		"MR 438A":"https://docs.google.com/document/d/1tiRV2mfFg_6btMSJEEHhSRA_dAhksTX-zzZfQj8PEdo/edit?usp=sharing",
		"MR 438C":"https://docs.google.com/document/d/1WbBsN1Rx1rjpN2XnJxtomcPyThjVKqM6WjC5kZ8DSsk/edit?usp=sharing",
		"MR 439A":"https://docs.google.com/document/d/14w7bEYF4jsehJrvMM1iQ7plgxpGJhEKRWZXgXFKSuiI/edit?usp=sharing",
		"MR 440":"https://docs.google.com/document/d/1aCjQPYcghNYFll52kjUhtwhGdI5cOoCnsK_eKAr3U34/edit?usp=sharing",
		"MR 440A":"https://docs.google.com/document/d/1sETXVPoRgXDEaJQxfGrWdhYrJbt-cTNPiHmhR0pdmow/edit?usp=sharing",
		"MR 440C":"https://docs.google.com/document/d/1gAU3zK7Tc1g_FvPpygmNqHV6r5W6nWDSoqTMFx3kERA/edit?usp=sharing",
		"MR 440D":"https://docs.google.com/document/d/1EA36aXCPKpJne2_QutwZClwk7U1vSWI2KOxbH4ijaIg/edit?usp=sharing",
		"MR 441":"https://docs.google.com/document/d/1Pmd069SwfhVcG3n9YVFiabfvOaWS_ZWJAlQQRl7HJAQ/edit?usp=sharing",
		"MR 441A":"https://docs.google.com/document/d/1CVARpN_LjZ3AIIVd5J-U-r8gSUB3p6yxHck0KSHlwBA/edit?usp=sharing",
		"MR 442":"https://docs.google.com/document/d/1sAIwAAbyXwQNF-zNZW7yv5hSAKL_6MYlnOMRp0ZTffk/edit?usp=sharing",
		"MR 443A":"https://docs.google.com/document/d/1rubcjx-aajYkYECTwkVL5AAVn17YE0Xd65nUt_Kr7_M/edit?usp=sharing",
		"MR 443C":"https://docs.google.com/document/d/1SeK57rWKeXuBJ3fUYzI8xw2Bc5cC_MJwFHEbo9xY5w0/edit?usp=sharing",
		"MR 444C":"https://docs.google.com/document/d/1MPEt50rGxord3rVBck_I4IkOMlrb35zq_GBjj44E8Lo/edit?usp=sharing",
		"MR 445":"https://docs.google.com/document/d/1-ea2sm5gG15XvUJYqknzjpzlgb_jsPDABG2kz1m-c3A/edit?usp=sharing",
		"MR 445A":"https://docs.google.com/document/d/1iK1o0WFh9jKceWWRAfJgfUPUm5rR7jwQhE67_yO5OLk/edit?usp=sharing",
		"MR 445C":"https://docs.google.com/document/d/1LvZb8VQKTaMHrpV1jnPHlmIIyQ2sBpS1LXPTfDmnq0E/edit?usp=sharing",
		"MR 446":"https://docs.google.com/document/d/1pWUt6BVuA6rNU8InUQ-ml8eCKsZx8rRMbsueMOB1Nes/edit?usp=sharing",
		"MR 446C":"https://docs.google.com/document/d/1bpP_17Q9fyb0Hu9HC0qsK0vh8-A0Bv6iCuvTurWppPE/edit?usp=sharing",
		"MR 447A":"https://docs.google.com/document/d/18uNppZHGuUBsR6EUMBI9BcVmDqwyfuV78wXOLf4OaE4/edit?usp=sharing",
		"MR 447C":"https://docs.google.com/document/d/1D95uZZfjoKSEOMmFXbgNKFGn43FxzB4O7Qk5DH_FCwc/edit?usp=sharing",
		"MR 448":"https://docs.google.com/document/d/1bxH_0uUYzneM_1Hsxw792yTPNvHEW9Wjjzfsl_oVyhc/edit?usp=sharing",
		"MR 448C":"https://docs.google.com/document/d/1AA9I6LAjRl2pMsdZATJ7OoHzZJoEer0OwP6gdTxiaxs/edit?usp=sharing",
		"MR 450A":"https://docs.google.com/document/d/1YDC-2SeTlabmPKI71XwvF-9RLjOXGsFPKEfVLJa1VfA/edit?usp=sharing",
		"MR 451A":"https://docs.google.com/document/d/18tiUOucQYhP18LnCyLChrifaWIf0Ue0_7jkEWJfTxRI/edit?usp=sharing",
		"MR 452A":"https://docs.google.com/document/d/1EeH-7i3N4UZ06GVPiFzrEkZJiKd60jSlXATK_Qk3W9c/edit?usp=sharing",
		"MR 453":"https://docs.google.com/document/d/1e1legIeND4oyRdsZUHoHFRyTFMzgFzhHM2nQVuukJT4/edit?usp=sharing",
		"MR 453A":"https://docs.google.com/document/d/1y0WhBq7htqVVqKY5w8hWTf_jqDvdkepoJNjIG0CbJ24/edit?usp=sharing",
		"MR 454A":"https://docs.google.com/document/d/1pCpz1DoQyoCATNUjk1Cex8h3quxoBQuMmBsKpClqQr0/edit?usp=sharing",
		"MR 455A":"https://docs.google.com/document/d/14cNHJFBlw6oJ_jMtLQsuU9-qJgnpFqbqKbDGeVXWsAM/edit?usp=sharing",
		"MR 455C":"https://docs.google.com/document/d/1GxuDefijHuBBfzBXtLuEHZs-sSBTLZP67vs6p8PfIiQ/edit?usp=sharing",
		"MR 456A":"https://docs.google.com/document/d/1vMhPaRECfKZhfvCS7ySMLjPxgjdPkz0m4kSPX982GRU/edit?usp=sharing",
		"MR 474C":"https://docs.google.com/document/d/1HY1kWPTw5740ZlZ6UHYhy_KTTvKJGsBu3mj1QoxqF4g/edit?usp=sharing",
		"MR 490C":"https://docs.google.com/document/d/1RAeBy03-bTQfs1w-KmB80yq46Az8H4MOHyFPWD3mY-8/edit?usp=sharing",
		
		// MRI 500 SPINE
		"MR 500A":"https://docs.google.com/document/d/1EztRQZLmtTZn9VipiiJ8mE6acZ-ciEYK_rL2twOc3-U/edit?usp=sharing",
		"MR 500C":"https://docs.google.com/document/d/13hWdsUF1oqqR2p4uWzHD_cSwstCLpsUTuiEQWUtabLs/edit?usp=sharing",
		"MR 502A":"https://docs.google.com/document/d/1oNu1_ppD5j_zo4EjjWIcvZBduLZkNXvRyU8GSKlja5Y/edit?usp=sharing",
		"MR 502C":"https://docs.google.com/document/d/14cTlDVJq6vT-Qq3dcQRnFMwsFKQgiZua-5455MeIHh4/edit?usp=sharing",
		"MR 510A":"https://docs.google.com/document/d/1Zfbrkv44BKdXEycWa34JJvmVDBhmPBHe9emxfEbz-_k/edit?usp=sharing",
		"MR 510C":"https://docs.google.com/document/d/1eP4FlJzPzbZ_zhaqXclXFHc3fUE-VJ4aK0u6JWPgF5Q/edit?usp=sharing",
		"MR 512C":"https://docs.google.com/document/d/1_XorGFQL_EKhSz8F0mm2k63Dht6ds5on4HmOjqcP-1U/edit?usp=sharing",
		"MR 520A":"https://docs.google.com/document/d/1CxY3VFceurYgrqT0sR-ooYchRg7VZoUU02QQbNb_zJc/edit?usp=sharing",
		"MR 520C":"https://docs.google.com/document/d/1YP7kGwCbLiscngV6Joj77D80XVxWw_lAYgrYIQwXY8o/edit?usp=sharing",
		"MR 523A":"https://docs.google.com/document/d/12o2pm59kfL42ZAd4uDLb4a6_PXmq0jZHIZBijR-uPGU/edit?usp=sharing",
		"MR 523C":"https://docs.google.com/document/d/16RcAhscQvMJDx1TXI7TQ145CtFEa_H8X9piBtBue-uc/edit?usp=sharing",
		"MR 524A":"https://docs.google.com/document/d/1lw2WSezJesRJpDotS_5mM0lDrx4yhuK9EpMQHaVm9GQ/edit?usp=sharing",
		"MR 530C":"https://docs.google.com/document/d/15mMU-I0PmoAxjeJ1BqiAb-HVyZdVIxsd80stdp50F88/edit?usp=sharing",
		"MR 540C":"https://docs.google.com/document/d/1DjMfA1kDu-GEo7jg1rT3tmDID-_5E20OIb6LKHhn4MY/edit?usp=sharing",
		"MR 550C":"https://docs.google.com/document/d/1kIbWXk9xFgnZoRK8EoJX5HCaM-xEWa4XDRkSgAx0-ho/edit?usp=sharing",
		
		// MRI 600 VASCULAR
		"MR 600A":"https://docs.google.com/document/d/1BF_fA4YzHdNfIiCghqfBWn2JNZrzeW3XTk_O4o5yPfE/edit?usp=sharing",
		"MR 600C":"https://docs.google.com/document/d/12PblzQaV3wu-aFnA7Ab36Fzw70kdlHscaeCIsEjZUas/edit?usp=sharing",
		"MR 602A":"https://docs.google.com/document/d/1OgAswzuxIP3PW8VbPNEbTkKVOk8po_rTJB8IsRDKWoo/edit?usp=sharing",
		"MR 610A":"https://docs.google.com/document/d/1sn3lNrrDK74UFwCgr26DJslk1smtTTErsGI013C2sY0/edit?usp=sharing",
		"MR 610C":"https://docs.google.com/document/d/19vPQXyax2hUCcwJA2oNBH8dF1vJfgAbiMTmBSoT91M0/edit?usp=sharing",
		"MR 620C":"https://docs.google.com/document/d/1QjGJe06RaEb6X1SKlhy40XSPVlCV9iylq62dAmDDRzo/edit?usp=sharing",
		"MR 621C":"https://docs.google.com/document/d/1sobW3FjeshIMIZkXhut-mDCv0HVjWLMFCumsk3Jmzag/edit?usp=sharing",
		"MR 630A":"https://docs.google.com/document/d/13n_x5dCq9JRVHdtYWZJpj0-aYdvr5iuJpBsH4BGGOKg/edit?usp=sharing",
		"MR 630C":"https://docs.google.com/document/d/1Dq7EOWhOfuaTzesjPaBsPbIm4PSyvZQD_WpRovjTAq0/edit?usp=sharing",
		"MR 632C":"https://docs.google.com/document/d/1jBydg7XM7vG35RxqcHmO_4v9iUB3f0Fwbl5ZcBKo4jQ/edit?usp=sharing",
		"MR 640C":"https://docs.google.com/document/d/1i-cO9jWZYA7ZdbkglxKu8sfOgCwgww_ZXasSVoWCRNQ/edit?usp=sharing",
		"MR 641C":"https://docs.google.com/document/d/1-akUf01j8wlFAgpRrfLsBr0swbVWkKf3f3qqkK-eQio/edit?usp=sharing",
		"MR 650C":"https://docs.google.com/document/d/1jbSa9M2P7N5zofosdGvNycKJQqY1g4yM5ArbEMfwvbE/edit?usp=sharing",
		"MR 660C":"https://docs.google.com/document/d/1zB4yZ2KSZFv6tXuslaV8KsT8-kuxOX8aAbIAOf4f1gI/edit?usp=sharing",
		
		// MRI 700 COMBINED 
		"MR 701A":"https://docs.google.com/document/d/1L-iEi0JuZMiDV2ULvwdvR2t0Ss0xFQpgjdKTuPY3qAA/edit?usp=sharing",
		"MR 701C":"https://docs.google.com/document/d/1gT_aJ9XkVO2qy5dslbILw2h2pmFAvxD8h1Ind4vCQy0/edit?usp=sharing",
		"MR 702A":"https://docs.google.com/document/d/1vBh6vhOrBwz9zLg-ZyE5hk2kMvY5ED4lY9JAHbdwWNU/edit?usp=sharing",
		"MR 702C":"https://docs.google.com/document/d/1sdUdkNbgNeS7iJppojJLUu2zL_xt3S7ZHx-DZu540Ig/edit?usp=sharing",
		"MR 703A":"https://docs.google.com/document/d/1iVwwXZUSEKCGYxviK4HG7L_Dmmsyie258nYtXsIR6fI/edit?usp=sharing",
		"MR 703C":"https://docs.google.com/document/d/1EDzMpQInMBhv1J2YGiO7-kLxeYqVRgJmW4UIYXxXQhg/edit?usp=sharing",
		"MR 705A":"https://docs.google.com/document/d/1VraD8Pd1I7HA9PrMsmvgRloTGW0cSs50E-mO01hOhRE/edit?usp=sharing",
		"MR 705C":"https://docs.google.com/document/d/1UZfeZb5EvPvXPMzTaCKSVQy06O8x5wepGFdlJ7whkdE/edit?usp=sharing",
		"MR 706A":"https://docs.google.com/document/d/1aZRjXMqkbypsVZy5fGJbFdDboI06QejyWR6Gxd2volw/edit?usp=sharing",
		"MR 706C":"https://docs.google.com/document/d/1IFc9q4UJqsc2sN16knNdE0sqYX8xTlFlEUFFkRpFUdQ/edit?usp=sharing",
		"MR 707A":"https://docs.google.com/document/d/1uav-aY732sM676T7-Vsf5eyuoUd0ZyQFUvfffLXqrg8/edit?usp=sharing",
		"MR 707C":"https://docs.google.com/document/d/1t5R8FaVNFq-Ta9kgpby5EQV_tr7dDOZ7WM9sBNOlOOc/edit?usp=sharing",
		"MR 708A":"https://docs.google.com/document/d/1B7AVTSyequypsq1gjq7u0Hp_mhLfHnlxoNKy0oBSkyA/edit?usp=sharing",
		"MR 708C":"https://docs.google.com/document/d/1vz_UJv3lzTaud9E6CpKvkjKtPQq0boIf86pljPGsG5A/edit?usp=sharing",
		"MR 709A":"https://docs.google.com/document/d/1PWqw07kxb3lwlRyQ3_v2fhEUlkEiBQhcgKAu5NzWqiM/edit?usp=sharing",
		"MR 709C":"https://docs.google.com/document/d/15nzr6tiBsbzpzHHcyi5a5Gqp6N8slB42xJInwjpcSOI/edit?usp=sharing",
		"MR 710A":"https://docs.google.com/document/d/17UXE35FOpXOJI1efSYqnppRNmndT7jsrVE0OeVnCCgA/edit?usp=sharing",
		"MR 710C":"https://docs.google.com/document/d/1xz3vWmXpcw50tJr4Bu3o4LwyhiKtBtJB1wVfTtZ67S4/edit?usp=sharing",
		"MR 711A":"https://docs.google.com/document/d/1Y-hiWo0_V7hElGt1zLq64TMzrejtc3uUuKYNeqI6gBc/edit?usp=sharing",
		"MR 711C":"https://docs.google.com/document/d/1dqXFGv0-7pkoPaIl9cdooQn-Srt24iEKiekCGsDPSis/edit?usp=sharing",
		"MR 712C":"https://docs.google.com/document/d/135YGizczdBsVvzDk9yWZWUnYcz1KtIAZhjpwu_ayoIA/edit?usp=sharing",
		"MR 713C":"https://docs.google.com/document/d/1EFusH7dz5idSbnaihJdd_a5Ids-57bG5-mVrdABDP78/edit?usp=sharing",
		"MR 714C":"https://docs.google.com/document/d/1FBc13PeBjhJ7pm5oRirsu9ZvUesC_nRPLEE6-RvQ0zY/edit?usp=sharing",
		"MR 715C":"https://docs.google.com/document/d/1AwMQqb3mnEVKt0B4BwovOF8Oa_bzfPeJfTnKTsSZPeI/edit?usp=sharing",
		"MR 716C":"https://docs.google.com/document/d/19DVp5GInd1oh3mS_RcmkSQkZBCmetrGqsWMBxGk8pmM/edit?usp=sharing",
		"MR 717C":"https://docs.google.com/document/d/1q4nOVyGY17aBtjPNqDCrOAEUgp0QhPybHIvt3d19qQU/edit?usp=sharing",
		"MR 730C":"https://docs.google.com/document/d/1N4N5wSCh2la5KDu63ai61qxprJkKBDRWZJFrT2L_oP4/edit?usp=sharing",
		"MR 731C":"https://docs.google.com/document/d/1zn86tDoMNGfzdY-ijTSPV66fc9CGgZ4HLa3Ms0Fg7Dg/edit?usp=sharing",
		"MR 740A":"https://docs.google.com/document/d/1ivaDoIdeaQbepdF1ucTQzxDSU8Xvkbr4zVMlUkFemoA/edit?usp=sharing",
		"MR 750C":"https://docs.google.com/document/d/10C4cSWqlieVD1xqbzB93_xN1CoOdnRo5gzVc5YH5Ols/edit?usp=sharing",

	};

// JSON array of evergreen PDF links to extra protocol info, e.g. manufacturer documents. Within GDrive folder, right click on the protocol GDoc, Get Link, Copy Link
// These values have been edited to give specific names to the links
var PDFLinksExtra = 
	{
		// CT extras
		"CT 122A":' | <a href="https://docs.google.com/document/d/1rUd-x0xb4T9s5YIBCNkm_GfM3EphxeusY_hUwJ8VcwE/export?format=pdf&attachment=false" target="_blank">Medtronic</a>',
		"CT 124A":' | <a href="https://drive.google.com/file/d/1p34E_nMEl0sRce8e-a_zBNRlP30Bjh5c/view" target="_blank">Stryker</a>',
		"CT 390A":' | <a href="https://docs.google.com/document/d/1c6lAWAOrjiNQ-hykF7FM6imbvmIQ-VJtwnfIybk-T9A/export?format=pdf&attachment=false" target="_blank">Oral Prep</a>',
		"CT 420A":' | <a href="https://drive.google.com/file/d/13nuIfS0bmexNT4OE2qy5hdE9WnXRBBUi/view" target="_blank">Conformis</a>', // error
		"CT 421A":' | <a href="https://drive.google.com/file/d/1Zytkh3fBTzEkoeCP0my1nGG8oMoZesU-/view" target="_blank">Zimmer</a>',
		"CT 422A":' | <a href="https://drive.google.com/file/d/1-UPnlL3Ob-NRDSNyd0-DuV8uhcnLuXkG/view" target="_blank">Zimmer</a>',
		"CT 424A":' | <a href="https://drive.google.com/file/d/1Oq24eO7Vz1lw98Hq38LC0bxBkW-RPa_U/view" target="_blank">Depuy</a>',
		
		// MRI extras
		"MR 307A":' | <a href="https://drive.google.com/file/d/197HlpcWeGvQl0mHqrIMaWCn2JqyAQR5Y/view" target="_blank">Univ Rennes 2019</a>',
		"MR 425C":' | <a href="https://docs.google.com/document/d/176wYaLrDwgyxUCo5-6t--EGisr3hBp_B6UMJAbfevJE/export?format=pdf&attachment=false" target="_blank">Any Other Joint</a>',
		"MR 524A":' | <a href="https://drive.google.com/file/d/1i5wnVUmUzkeWxAMFN87_yDa5ydNkXTwl/view" target="_blank">Nevro White Paper 2018</a>',
	};
