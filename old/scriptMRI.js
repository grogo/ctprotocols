var options = {
	valueNames: ['protNum', 'protName', 'protTime', 'protContrast', 'protRegion', 'protInfo', 'protFull'],
	page: [2000]
};

var protocolList = new List('protocolDIV', options);

// CSV STUFF
var CSVProtocols = new XMLHttpRequest(), CSVLines = [];
CSVProtocols.open('GET', 'MRG MRI protocols list orig.csv', true);
CSVProtocols.overrideMimeType("text/plain");
CSVProtocols.send();


CSVProtocols.onreadystatechange = function() {
	if (CSVProtocols.readyState === 4) {	// have to wait for AJAX call to complete
		//CSVLines = CSVProtocols.responseText.split('\r\n');
		CSVLines = CSVtoArray(CSVProtocols.responseText);
		CSVLines.splice(0,3);
		trimCSV();
		//parseCSV();
		addProtocols();
	}

	protocolList.remove('protNum', '');
	protocolList.remove('protNum', undefined);
};

const CSVtoArray = (data, delimiter = ',', omitFirstRow = false) =>
  data
    .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
    .split('\n')
    .map(v => v.split(delimiter));

function trimCSV() {
	for (var i=0; i<CSVLines.length; i++) {
		if (CSVLines[i][0] == "")
			CSVLines.splice(i,1);
	}
}
	
function parseCSV() {
	var i, len = CSVLines.length;
	for (i = 1; i < len; i++) {
		CSVLines[i] = CSVtoArray(CSVLines[i]);
	}
}

function addProtocols() {
	var i, len = CSVLines.length;
	for (i = 1; i < len; i++) {
		protocolList.add({
			protNum: CSVLines[i][0],
			protName: CSVLines[i][1],
			protTime: CSVLines[i][2],
			protContrast: CSVLines[i][3],
			protRegion: CSVLines[i][4],
			protInfo: CSVLines[i][5],
			protFull: CSVLines[i][6]
		});
	}
}
