// TABLE BINDING plugin for Knockout http://knockoutjs.com/
// (c) Michael Best
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
// Version 0.4.0

(function (ko, undefined) {

var elemTextProp = 'textContent' in document.createElement('div') ? 'textContent' : 'innerText';

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
    init: function () {
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var rawValue = ko.utils.unwrapObservable(valueAccessor()) || [],
            value = isArray(rawValue) ? { data: rawValue } : rawValue,

            data = ko.utils.unwrapObservable(value.data),
            dataItem = ko.utils.unwrapObservable(value.dataItem),
            classItem = ko.utils.unwrapObservable(value.classItem),

            header = ko.utils.unwrapObservable(value.header),
            rowheader = ko.utils.unwrapObservable(value.rowheader),
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
        if (numCols === undefined && dataIsArray) {
            if (!data.length) {
                numCols = 0;
                cols = [];
            } else if (isArray(data[0])) {
                for (numCols = rowIndex = 0; rowIndex < data.length; rowIndex++) {
                    if (data[0].length > numCols)
                        numCols = data[0].length;
                }
                cols = makeRangeIfNotArray(numCols);
            }
        }

        // By here, rows and cols must be defined
        if (!(numRows >= 0))
            throw Error('table binding requires row information (either "rows" or a "data" array)');
        if (!(numCols >= 0))
            throw Error('table binding requires column information (either "columns" or "header")');

        if (rowheader && !isArray(rowheader))
            throw Error('table binding "rowheader" must be an array');

        // Return the item value and update table cell if observable item changes
        function unwrapItemAndSubscribe(rowIndex, colIndex) {
            // Use a data function if provided; otherwise use the column value as a property of the row item
            var rowItem = rows[rowIndex], colItem = cols[colIndex],
                itemValue = dataItem ? (dataItemIsFunction ? dataItem(rowItem, colItem, data) : data[rowItem][colItem[dataItem]]) : data[rowItem][colItem];

            if (rowheader)
                ++colIndex;
            if (ko.isObservable(itemValue)) {
                itemSubs.push(itemValue.subscribe(function (newValue) {
                    if (tableBody)
                        tableBody.rows[rowIndex].cells[colIndex][elemTextProp] = newValue == null ? '' : newValue;
                }));
                itemValue = itemValue.peek();
            }
            return itemValue == null ? '' : ko.utils.escape(itemValue);
        }

        function getItemClass(rowIndex, colIndex) {
            if (classItem) {
                var colItem = cols[colIndex], classKey = colItem[classItem];
                if (classKey) {
                    return ko.utils.escape(data[rows[rowIndex]][classKey]);
                }
            }
        }

        // Ensure the class won't corrupt the HTML
        if (evenClass)
            evenClass = ko.utils.escape(evenClass);

        var html = '<table>';

        // Generate a header section if a header function is provided
        if (header) {
            html += '<thead><tr>';
            if (rowheader)
                html += '<th></th>';
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
            if (rowheader)
                html += '<th>' + ko.utils.escape(rowheader[rowIndex]) + '</th>';
            for (colIndex = 0; colIndex < numCols; colIndex++) {
                var itemClass = classItem && getItemClass(rowIndex, colIndex);
                html += (itemClass ? '<td class="' + itemClass + '">' : '<td>') + unwrapItemAndSubscribe(rowIndex, colIndex) + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        // Remove previous table contents (use removeNode so any subscriptions will be disposed)
        while (element.firstChild)
            ko.removeNode(element.firstChild);

        // Insert new table contents
        var tempDiv = element.ownerDocument.createElement('div');
        tempDiv.innerHTML = html;
        var tempTable = tempDiv.firstChild;
        while (tempTable.firstChild)
            element.appendChild(tempTable.firstChild);

        // Make sure subscriptions are disposed if the table is cleared
        if (itemSubs) {
            tableBody = element.tBodies[0];
            ko.utils.domNodeDisposal.addDisposeCallback(tableBody, function () {
                ko.utils.arrayForEach(itemSubs, function (itemSub) {
                    itemSub.dispose();
                });
            });
        }
    }
};

/*
 * Escape a string for html representation; use SafeString to indicate that string shouldn't be escaped
 */
function SafeString(string) {
    this.value = '' + string;
}
SafeString.prototype.toString = function () {
    return this.value;
};

ko.utils.safeString = function (string) {
    return new SafeString(string);
};

ko.utils.escape = function (string) {
    if (!string) {
        return string;
    } else if (string instanceof SafeString) {
        return string.value;
    } else {
        return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
    }
};

})(ko);
