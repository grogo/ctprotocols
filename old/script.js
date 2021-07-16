var options = {
	valueNames: ['protNum', 'protDesc', 'protIndic', 'protMDCT'],
	page: [2000]
};

var protocolList = new List('protocolDIV', options);

var CTPDFLinks = 
	{
		"100A":"https://docs.google.com/document/d/1ct0uUm0ITY8K8QbNurzj9EJZjbHZZOEPBQcdCDYoG1s/export?format=pdf",
		"100C":"https://docs.google.com/document/d/1glp6AlpDxyGlXavzwDQp02iRSFnjRQHKkLRBPm5xRhE/export?format=pdf"
	};

// CSV STUFF
var CSVProtocols = new XMLHttpRequest(), CSVLines = [];
CSVProtocols.open('GET', 'MRG CT protocols list orig.csv', true);
CSVProtocols.overrideMimeType("text/plain");
CSVProtocols.send();

CSVProtocols.onreadystatechange = function() {
	if (CSVProtocols.readyState === 4) {	// have to wait for AJAX call to complete
		// CSVLines = CSVProtocols.responseText.split('\n');	// this is for use before the original CSVtoArray function
		CSVLines = CSVtoArray(CSVProtocols.responseText);		// remove first 3 rows
		CSVLines.splice(0,3);
		trimCSV();	// remove empty rows
		// parseCSV();
		addProtocols();	// add rows to the table
	}

	// need these to remove blank and undefined rows from the table
	protocolList.remove('protNum', '');
	protocolList.remove('protNum', undefined);
};

const CSVtoArray = (data, delimiter = ',', omitFirstRow = false) =>
  data
    .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
    .split('\n')
    .map(v => v.split(delimiter));

function trimCSV() {	// remove empty rows
	for (var i=0; i<CSVLines.length; i++) {
		if (CSVLines[i][0] == "")
			CSVLines.splice(i,1);
	}
}

// function parseCSV() {
// 	var i, len = CSVLines.length;
// 	for (i = 1; i < len; i++) {
// 		CSVLines[i] = CSVtoArray(CSVLines[i]);
// 	}
// }

function addProtocols() {	// add rows to the table
	var len = CSVLines.length;

	for (i = 0; i < len; i++) {
		if(CTPDFLinks[CSVLines[i][0]]!==undefined)	// check to make sure a matching PDF link exists in the JSON array
			// find out how to open PDF inline. when testing remote login to CS: target=_blank/_tab doesn't work. onclick=window.open _blank doesn't work
			// try adding ?download=false to the URL
			CSVLines[i][5] = "<a href=\""+CTPDFLinks[CSVLines[i][0]]+"\" target=\"_tab\">PDF</a>";	// if so, replace the value in the 6th column (Full Protocol). this opens new tab
			// CSVLines[i][5] = "<a href=\"#\" onclick=\"window.open(\'"+CTPDFLinks[CSVLines[i][0]]+"\', \'_blank\', \'fullscreen=yes\'); return false;\">PDF</a>"; // this opens new window
		protocolList.add({
			protNum: CSVLines[i][0],
			protName: CSVLines[i][1],
			protContrast: CSVLines[i][2],
			protRegion: CSVLines[i][3],
			protInfo: CSVLines[i][4],
			protFull: CSVLines[i][5]
			// protFull: "<a href=\""+CTPDFLinks[CSVLines[i][0]]+"\">PDF</a>"	//	this method needs error checking - probably better to replace CSVLines[i][5] before protocolList.add() or before running this for() loop
		});
	}
}


	/* 
function CSVtoArray(data, delimiter) {	// original use this in conjunction with line 29 parseCSV() and line 25 CSVLines = CSVProtocols.responseText.split('\n');
	// Retrieve the delimiter
	if (delimiter === undefined) {
		delimiter = ',';
	}
	if (delimiter && delimiter.length > 1) {
		delimiter = ',';
	}

	// initialize variables
	var	newline = '\n',
		eof = '',
		i = 0,
		c = data.charAt(i),
		array = [];

	while (c != eof) {
		// get value
		var value = "";
		if (c == '\"') {
			// value enclosed by double-quotes
			c = data.charAt(++i);

			do {
				if (c != '\"') {
					// read a regular character and go to the next character
					value += c;
					c = data.charAt(++i);
				}

				if (c == '\"') {
					// check for escaped double-quote
					var cnext = data.charAt(i+1);
					if (cnext == '\"') {
						// this is an escaped double-quote.
						// Add a double-quote to the value, and move two characters ahead.
						value += '\"';
						i += 2;
						c = data.charAt(i);
					}
				}
			} while (c != eof && c != '\"');

			if (c == eof) {
				throw "Unexpected end of data, double-quote expected";
			}

			c = data.charAt(++i);
		} else {
			// value without quotes
			while (c != eof && c != delimiter && c!= newline && c != '\t' && c != '\r') {
				value += c;
				c = data.charAt(++i);
			}
		}

		array.push(value);

		// unexpected character
		if (c !== delimiter && c != eof) {
			throw "Delimiter expected after character " + i;
		}

		// go to the next character
		c = data.charAt(++i);
	}

	return array;
}
 */