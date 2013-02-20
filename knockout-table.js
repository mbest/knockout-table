// TABLE BINDING plugin for Knockout http://knockoutjs.com/
// (c) Michael Best
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
// Version 0.2.2

(function(ko, undefined) {

var div = document.createElement('div'),
    elemTextProp = 'textContent' in div ? 'textContent' : 'innerText';
div = null;

function makeRangeIfNotArray(primary, secondary) {
    if (primary === undefined && secondary)
        primary = secondary.length;
    return (typeof primary === 'number' && !isNaN(primary)) ? ko.utils.range(0, primary-1) : primary;
}

function isArray(a) {
    return a && typeof a === 'object' && typeof a.length === 'number';
}

/*
 * Table binding
 */
ko.bindingHandlers.table = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var rawValue = ko.utils.unwrapObservable(valueAccessor()),
            value = isArray(rawValue) ? { data: rawValue } : rawValue,

            data = ko.utils.unwrapObservable(value.data),
            dataItem = ko.utils.unwrapObservable(value.dataItem),
            header = ko.utils.unwrapObservable(value.header),
            evenClass = ko.utils.unwrapObservable(value.evenClass),

            dataIsArray = isArray(data),
            dataIsObject = typeof data === 'object',
            dataItemIsFunction = typeof dataItem === 'function',

            headerIsArray = isArray(header),
            headerIsFunction = typeof header === 'function',

            cols = makeRangeIfNotArray(ko.utils.unwrapObservable(value.columns), headerIsArray && header),
            rows = makeRangeIfNotArray(ko.utils.unwrapObservable(value.rows), dataIsArray && data),
            numCols = cols && cols.length,
            numRows = rows && rows.length,

            itemSubs = [], tableBody, rowIndex, colIndex;

        // data must be set and be either a function or an array
        if (!dataIsObject && !dataItemIsFunction)
            throw Error('table binding requires a data array or dataItem function');

        // If not set, read number of columns from data
        if (numCols === undefined && dataIsArray && isArray(data[0])) {
            for (numCols = rowIndex = 0; rowIndex < data.length; rowIndex++) {
                if (data[0].length > numCols)
                    numCols = data[0].length;
            }
            cols = makeRangeIfNotArray(numCols);
        }

        // By here, rows and cols must be defined
        if (!(numRows >= 0))
            throw Error('table binding requires row information (either "rows" or a "data" array)');
        if (!(numCols >= 0))
            throw Error('table binding requires column information (either "columns" or "header")');

        // Return the item value and update table cell if observable item changes
        function unwrapItemAndSubscribe(rowIndex, colIndex) {
            // Use a data function if provided; otherwise use the column value as a property of the row item
            var rowItem = rows[rowIndex], colItem = cols[colIndex],
                itemValue = dataItem ? (dataItemIsFunction ? dataItem(rowItem, colItem, data) : data[rowItem][colItem[dataItem]]) : data[rowItem][colItem];

            if (ko.isObservable(itemValue)) {
                itemSubs.push(itemValue.subscribe(function(newValue) {
                    if (tableBody)
                        tableBody.rows[rowIndex].cells[colIndex][elemTextProp] = newValue == null ? '' : newValue;
                }));
                itemValue = itemValue.peek ? itemValue.peek() : ko.ignoreDependencies(itemValue);
            }
            return itemValue == null ? '' : ko.utils.escape(itemValue);
        }

        // Ensure the class won't corrupt the HTML
        if (evenClass)
            evenClass = ko.utils.escape(evenClass);

        var html = '<table>';

        // Generate a header section if a header function is provided
        if (header) {
            html += '<thead><tr>';
            for (colIndex = 0; colIndex < numCols; colIndex++) {
                var headerValue = headerIsArray ? header[colIndex] : (headerIsFunction ? header(cols[colIndex]) : cols[colIndex][header]);
                html += '<th>' + ko.utils.escape(headerValue) + '</th>';
            }
            html += '</tr></thead>';
        }

        // Generate the table body section
        html += '<tbody>';
        for (rowIndex = 0; rowIndex < numRows; rowIndex++) {
            html += (evenClass && rowIndex%2) ? '<tr class="' + evenClass + '">' : '<tr>';
            for (colIndex = 0; colIndex < numCols; colIndex++) {
                html += '<td>' + unwrapItemAndSubscribe(rowIndex, colIndex) + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        // Remove previous table contents (use removeNode so any subscriptions will be disposed)
        while (element.firstChild)
            ko.removeNode(element.firstChild);

        // Insert new table contents
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        var tempTable = tempDiv.firstChild;
        while (tempTable.firstChild)
            element.appendChild(tempTable.firstChild);

        // Make sure subscriptions are disposed if the table is cleared
        if (itemSubs) {
            tableBody = element.tBodies[0];
            ko.utils.domNodeDisposal.addDisposeCallback(tableBody, function() {
                ko.utils.arrayForEach(itemSubs, function(itemSub) {
                    itemSub.dispose();
                });
            });
        }
    }
};

/*
 * Escape a string for html representation
 */
ko.utils.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
};

/*
 * Helper functions for finding minified property names
 */
function findNameMethodSignatureContaining(obj, match) {
    for (var a in obj)
        if (obj.hasOwnProperty(a) && obj[a].toString().indexOf(match) >= 0)
            return a;
}

function findPropertyName(obj, equals) {
    for (var a in obj)
        if (obj.hasOwnProperty(a) && obj[a] === equals)
            return a;
}

function findSubObjectWithProperty(obj, prop) {
    for (var a in obj)
        if (obj.hasOwnProperty(a) && obj[a] && obj[a][prop])
            return obj[a];
}

/*
 * ko.ignoreDependencies is used to access observables without creating a dependency
 */
if (!ko.ignoreDependencies) {
    var depDet = findSubObjectWithProperty(ko, 'end'),
        depDetBeginName = findNameMethodSignatureContaining(depDet, '.push({');
    ko.ignoreDependencies = function(callback, object, args) {
        try {
            depDet[depDetBeginName](function() {});
            return callback.apply(object, args || []);
        } finally {
            depDet.end();
        }
    }
}

})(ko);
