var request = new XMLHttpRequest();
request.open('GET', 'indications.csv'); // previous CT/MR protocols CSV was created by opening "CT protocols list" GSheet, Select All, Copy, Paste into Excel, Save as CSV.
request.overrideMimeType("text/plain");
request.send();
request.onreadystatechange = function() {
	if (request.readyState === 4) {	// have to wait for AJAX call to complete
		CSVData = CSVtoArray(request.responseText);
		CSVData.splice(0,1);

		// console.log("start adding " + CSVData.length + " indications")
		// console.time("addProtocols()");
			addProtocols();
		// console.timeEnd("addProtocols()");
		
		// remove the Loading.. entry
		protocolList.remove('procedureTD','');
		protocolList.remove('procedureTD',undefined);
		}
	};

// FUNCTIONS
// Convert the XML responseText (raw data of CSV file) into an array
const CSVtoArray = (data, delimiter = ';', omitFirstRow = false) =>
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

// Add CSV Data to the table
function addProtocols() {
	for (i=0; i<CSVData.length; i++) {
		protocolList.add({								// populate the main table with protocol entries
			procedureTD: CSVData[i][0],
			reasonTD: CSVData[i][1],
			CPTTD: CSVData[i][2],
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
