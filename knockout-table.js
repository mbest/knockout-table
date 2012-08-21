// TABLE BINDING plugin for Knockout http://knockoutjs.com/
// (c) Michael Best
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
// Version 0.1.0

(function(ko, undefined) {

var div = document.createElement('div'),
    elemTextProp = 'textContent' in div ? 'textContent' : 'innerText';
div = null;

/*
 * Table binding
 */
ko.bindingHandlers.table = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            cols = ko.utils.unwrapObservable(value.columns),
            rows = ko.utils.unwrapObservable(value.rows),
            header = ko.utils.unwrapObservable(value.header),
            data = ko.utils.unwrapObservable(value.data),
            evenClass = ko.utils.unwrapObservable(value.evenClass),
            headerIsFunction = typeof header === 'function',
            numCols = cols && cols.length,
            numRows = rows && rows.length,
            itemSubs = [],
            tableBody;

        // Return the item value and update table cell if observable item changes
        function unwrapItemAndSubscribe(rowIndex, colIndex) {
            // Use a data function if provided; otherwise use the column value as a property of the row item
            var rowItem = rows[rowIndex], colItem = cols[colIndex],
                itemValue = data ? data(rowItem, colItem) : rowItem[colItem];

            if (ko.isObservable(itemValue)) {
                itemSubs.push(itemValue.subscribe(function(newValue) {
                    if (tableBody)
                        tableBody.rows[rowIndex].cells[colIndex][elemTextProp] = newValue;
                }));
                itemValue = itemValue.peek ? itemValue.peek() : ko.ignoreDependencies(itemValue);
            }
            return ko.utils.escape(itemValue);
        }

        // Use header array for number of columnes
        if (cols === undefined && header && !headerIsFunction) {
            cols = header.length;
        }

        // Support either a column array or number
        if (cols && numCols === undefined) {
            numCols = cols;
            cols = ko.utils.range(0, numCols-1);
        }

        // By here, rows and cols must be defined
        if (!rows)
            throw Error('table binding requires "rows" option');
        if (!cols)
            throw Error('table binding requires column information (either "columns" or "header")');

        // Ensure the class won't corrupt the HTML
        if (evenClass)
            evenClass = ko.utils.escape(evenClass);

        var html = '<table>';

        // Generate a header section if a header function is provided
        if (header) {
            html += '<thead><tr>';
            for (var colIndex = 0; colIndex < numCols; colIndex++) {
                html += '<th>' + (headerIsFunction ? header(cols[colIndex]) : header[cols[colIndex]]) + '</th>';
            }
            html += '</tr></thead>';
        }

        // Generate the table body section
        html += '<tbody>';
        for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
            html += (evenClass && rowIndex%2) ? '<tr class="' + evenClass + '">' : '<tr>';
            for (var colIndex = 0; colIndex < numCols; colIndex++) {
                html += '<td>' + unwrapItemAndSubscribe(rowIndex, colIndex) + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        // Remove previous table contents
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
