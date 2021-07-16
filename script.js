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
		"CT 312A":"https://docs.google.com/document/d/1E7QAtp7MehsyWD2oc6JzyMJtMfL0dZc7ckGTJDp1Qjg/edit?usp=sharing"



		// CT 400 MSK

		// CT 500 SPINE

		// CT 600 CTA - VASCULAR

		// CT 700 COMBINATION EXAMS

		// MRI 100 NEURO

		// MRI 200 THORAX

		// MRI 300 ABDOMEN PELVIS

		// MRI 400 MSK

		// MRI 500 SPINE
		
		// MRI 600 VASCULAR

		// MRI 700 COMBINED
	};

