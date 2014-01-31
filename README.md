### **TABLE** binding for [Knockout](http://knockoutjs.com/)

The `table` binding provides a fast method for displaying tables of data using Knockout. `table` is about ten times faster than nested `foreach` bindings.

#### Examples

This example outputs a two-dimensional array as a table.

```javascript
var vm = {
    data: [
        [ 1, 2, 3 ],
        [ 4, 5, 6 ],
        [ 7, 8, 9 ]
    ]
};
```

```html
<table data-bind="table: data"></table>
```

This example uses a `header` array (which determines the number of columns in the table) and a `data` two-dimensional array.

```javascript
var vm = {
    header: [ 'x', 'y', 'z' ],
    data: [
        [ 1, 2, 3 ],
        [ 4, 5, 6 ],
        [ 7, 8, 9 ]
    ]
};
```

```html
<table data-bind="table: { header: header, data: data }"></table>
```

This example uses `rows` and `columns` definition arrays and a `data` object.

```javascript
var vm = {
    columns: [ 'x', 'y', 'z' ],
    rows: [ 'a', 'b', 'c' ],
    data: {
        a: { x: 1, y: 2, z: 3 },
        b: { x: 4, y: 5, z: 6 },
        c: { x: 7, y: 8, z: 9 }
    }
};
```

```html
<table data-bind="table: { header: columns, rows: rows, columns: columns, data: data }"></table>
```

This example uses `header` and `dataItem` options to define the values for those items.

```javascript
var vm = {
    columns: [
        { heading: 'x', datavalue: 'col1' },
        { heading: 'y', datavalue: 'col2' },
        { heading: 'x', datavalue: 'col3' } ]
    data: [
        { col1: 1, col2: 2, col3: 3 },
        { col1: 4, col2: 5, col3: 6 },
        { col1: 7, col2: 8, col3: 9 }
    ]
};
```

```html
<table data-bind="table: { columns: columns, data: data, header: 'heading', dataItem: 'datavalue' }"></table>
```

This example uses `header` and `dataItem` functions to define the values (uses same view model as above).

```html
<table data-bind="table: { columns: columns,
                           data: data,
                           header: function(col) { return col.heading },
                           dataItem: function(row, col, data) { return data[row][col.datavalue] } }">
</table>
```

This example uses a `dataItem` function to output a multiplication table (up to five).

```html
<table data-bind="table: { columns: 5, rows: 5, dataItem: function(row, col) { return (row+1) * (col+1) } }"></table>
```


#### Parameters

The `table` binding expects a single parameter of a two-dimensional array to output. It also accepts an object literal with the following properties:

* `data` - an array or object containing either objects or arrays, depending on the `columns` and `rows` options. `data` is required unless a `dataItem` function is provided.
* `columns` - either the number of columns in the table or an array, with each item representing a column. In the former case, the rows in `data` should be arrays; in the latter case, they should be objects, with the values in `columns` being the keys in the object. If no `columns` option is provided, it will default to either the length of the `header` array (if it’s given and an array) or the longest row in `data`. `columns` can also be an array of objects, in which case the `dataItem` option must also be specified.
* `rows` - either the number of the rows in the table or an array, with each item representing a row. In the former case, `data` should be an array of rows; in the latter case, it should be an object, with the values in `rows` being the keys for each row. If no `rows` option is given, it will default to the length of the `data` array.
* `header` - either an array of header values, a function that returns the header for each column value, or a string used to read the header from the column object. (optional)
* `dataItem` - either a function that returns the data value for a given row and column, or a string used to read the data-item key from the column object (which is then used to read from the row object). (optional)
* `evenClass` - the name of a class that will be applied to even rows in the table, starting with the second row. (optional)

Any of the above parameters can be an observable and will cause the table to be regenerated if updated. For the purpose of making the binding faster, the entries in `data`, `rows`, `columns`, or `headers` cannot be observables. The actual data items, though, can be observable, and if updated, will update only the corresponding table cell’s contents.

#### How this binding works

The `table` binding uses a very fast method of table generation. 1) It first generates the table HTML as a string. 2) It then parses the string into DOM elements using `innerHTML` on a detached node. 3) Finally, it inserts the table contents into the table element in the document.

#### Additional interfaces

* `ko.utils.escape(string)` - returns a string with HTML special characters (&, <, >, ", etc.) converted to entities. This is used internally by the `table` binding to ensure that data values are treated as text when assembled into the table HTML.

#### License and Contact

**License:** MIT (http://www.opensource.org/licenses/mit-license.php)

Michael Best<br>
https://github.com/mbest<br>
mbest@dasya.com
