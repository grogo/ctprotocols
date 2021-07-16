// Get CT CSV first
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

				for(i=0; i<CTData.length; i++)	
					CTData[i][0] = "CT " + CTData[i][0]; 		// prepend "CT " to protocol # - this crashes if placed in trimCSV
			
				for(i=0; i<MRData.length; i++) 
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
		if(PDFLinks[CSVData[i][0]] !== undefined)	// check to make sure a matching PDF link exists in the JSON array
			CSVData[i][5] = "<a href=\""+PDFLinks[CSVData[i][0]].replace("edit?usp=sharing","export?format=pdf&attachment=false")+"\" target=\"_blank\">PDF</a>";	// if so, add PDF link in 6th column, replacing the default GDocs Sharing link with one that opens pdf format in a tab/window
			// CSVData[i][5] = "<a href=\"#\" onclick=\"window.open(\'"+PDFLinks[CSVData[i][0]]+"\', \'_blank\', \'fullscreen=yes\'); return false;\">PDF</a>"; 	// this opens new window
		
		protocolList.add({
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
		
		
		
		/*
		// MRI 100 NEURO
		
		// MRI 200 THORAX

		// MRI 300 ABDOMEN PELVIS

		// MRI 400 MSK

		// MRI 500 SPINE
		
		// MRI 600 VASCULAR

		// MRI 700 COMBINED */
	};

