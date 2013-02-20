describe('table binding', {
    before_each: function () {
        var existingNode = document.getElementById("testNode");
        if (existingNode != null)
            existingNode.parentNode.removeChild(existingNode);
        testNode = document.createElement("div");
        testNode.id = "testNode";
        document.body.appendChild(testNode);
    },

    'Should generate a table of items from an array of arrays': function() {
        testNode.innerHTML = "<table data-bind=\"table: rows\"></table>";
        var vm = {
            rows: [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should generate a table of items from an array of arrays and a column count': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: 3}\"></table>";
        var vm = {
            rows: [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should generate a header row if a header function is provided': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, header: function(column) { return columnHeaders[column] } }\"></table>";
        var vm = {
            rows: [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ],
            columnHeaders: [ 'a', 'b', 'c' ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('abc123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<thead><tr><th>a</th><th>b</th><th>c</th></tr></thead>' +
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should use a data function, if provided, to get the table item values': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, dataItem: function(row, col, data) { return 'x'+data[row][col] } }\"></table>";
        var vm = {
            rows: [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('x1x2x3x4x5x6x7x8x9');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>x1</td><td>x2</td><td>x3</td></tr>'+
                '<tr><td>x4</td><td>x5</td><td>x6</td></tr>'+
                '<tr><td>x7</td><td>x8</td><td>x9</td></tr>'+
            '</tbody>');
    },

    'Should generate a header row if a header array is provided': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, header: columnHeaders }\"></table>";
        var vm = {
            rows: [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ],
            columnHeaders: [ 'a', 'b', 'c' ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('abc123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<thead><tr><th>a</th><th>b</th><th>c</th></tr></thead>' +
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should generate a table of items from an array of row objects and and array of columns': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: columns}\"></table>";
        var vm = {
            rows: [
                { col1: 1, col2: 2, col3: 3 },
                { col1: 4, col2: 5, col3: 6 },
                { col1: 7, col2: 8, col3: 9 }
            ],
            columns: [ 'col1', 'col2', 'col3' ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should generate a table of items from a data object, and rows and columns arrays': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: data, rows: rows, columns: columns}\"></table>";
        var vm = {
            data: {
                row1: { col1: 1, col2: 2, col3: 3 },
                row2: { col1: 4, col2: 5, col3: 6 },
                row3: { col1: 7, col2: 8, col3: 9 }
            },
            columns: [ 'col1', 'col2', 'col3' ],
            rows: [ 'row1', 'row2', 'row3' ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should generate a table of items with a header from an array of row objects and and array of columns objects using header and data value': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: columns, header: 'heading', dataItem: 'datavalue' }\"></table>";
        var vm = {
            rows: [
                { col1: 1, col2: 2, col3: 3 },
                { col1: 4, col2: 5, col3: 6 },
                { col1: 7, col2: 8, col3: 9 }
            ],
            columns: [ {heading: 'a', datavalue: 'col1'}, {heading: 'b', datavalue: 'col2'}, {heading: 'c', datavalue: 'col3'} ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('abc123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<thead><tr><th>a</th><th>b</th><th>c</th></tr></thead>' +
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should be able to combine data from row and column objects using a data function': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: columns, dataItem: function(row, col, data) {return data[row][col.prop]} }\"></table>";
        var vm = {
            rows: [
                { col1: 1, col2: 2, col3: 3 },
                { col1: 4, col2: 5, col3: 6 },
                { col1: 7, col2: 8, col3: 9 }
            ],
            columns: [ {prop: 'col1'}, {prop: 'col2'}, {prop: 'col3'} ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should generate a table of items using a data function': function() {
        testNode.innerHTML = "<table data-bind=\"table: { columns: 3, rows: 3, dataItem: function(row, col) { return (row+1) * (col+1) } }\"></table>";
        ko.applyBindings(null, testNode);
        value_of(testNode).should_contain_text('123246369');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>2</td><td>4</td><td>6</td></tr>'+
                '<tr><td>3</td><td>6</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should set the class for even rows if evenClass is set': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: 3, evenClass: 'even'}\"></table>";
        var vm = {
            rows: [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr class="even"><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    },

    'Should re-generate table if an observable row array is updated or an observable column value is updated': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: columns}\"></table>";
        var vm = {
            rows: ko.observableArray([
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                [ 7, 8, 9 ]
            ]),
            columns: ko.observable(3)
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');

        // add a row
        vm.rows.push([ 'x', 'y', 'z' ]);
        value_of(testNode).should_contain_text('123456789xyz');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
                '<tr><td>x</td><td>y</td><td>z</td></tr>'+
            '</tbody>');

        // remove a column
        vm.columns(2);
        value_of(testNode).should_contain_text('124578xy');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td></tr>'+
                '<tr><td>4</td><td>5</td></tr>'+
                '<tr><td>7</td><td>8</td></tr>'+
                '<tr><td>x</td><td>y</td></tr>'+
            '</tbody>');
    },

    'Should update cell items if an observable is updated (and not regenerate whole table)': function() {
        testNode.innerHTML = "<table data-bind=\"table: {data: rows, columns: 3}\"></table>";
        var vm = {
            rows: [
                [ ko.observable(1), 2, 3 ],
                [ ko.observable(4), 5, 6 ],
                [ ko.observable(7), 8, 9 ]
            ]
        };
        ko.applyBindings(vm, testNode);
        value_of(testNode).should_contain_text('123456789');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody>'+
                '<tr><td>1</td><td>2</td><td>3</td></tr>'+
                '<tr><td>4</td><td>5</td><td>6</td></tr>'+
                '<tr><td>7</td><td>8</td><td>9</td></tr>'+
            '</tbody>');

        // set a class for the tbody to show that it doesn't get regenerated
        testNode.childNodes[0].tBodies[0].className = "test";

        // update three items
        vm.rows[0][0](10);
        vm.rows[1][0](40);
        vm.rows[2][0](70);
        value_of(testNode).should_contain_text('102340567089');
        value_of(testNode.childNodes[0]).should_contain_html(
            '<tbody class="test">'+
                '<tr><td>10</td><td>2</td><td>3</td></tr>'+
                '<tr><td>40</td><td>5</td><td>6</td></tr>'+
                '<tr><td>70</td><td>8</td><td>9</td></tr>'+
            '</tbody>');
    }
});
