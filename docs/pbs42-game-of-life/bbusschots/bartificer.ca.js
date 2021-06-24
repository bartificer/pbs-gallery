/**
* @overview This file provides the {@link bartificer.ca} namespace which acts
* as the container for the entire API.
* @author Bart Busschots
* @license BSD-2-Clause
* @version 0.0.1
*/

// make sure the needed pre-requisites are installed.
if(typeof jQuery !== 'function'){
    throw new Error('jQuery is required but not loaded');
}

// init the bartificer namespace safely

/**
 * The namespace used by Bartificer Creations when publishing JavaScript APIs.
 * @namespace
 */
var bartificer = bartificer ? bartificer : {};

// add all the API's functionality within a self-executing anonymous function
(function(bartificer, $, undefined){
    // initialise the bartificer.ca namespace
    
    /**
    * This namespace provides a JavaScript API for creating
    * [Cellular Automata](https://en.wikipedia.org/wiki/Cellular_automaton)
    * within HTML documents.
    *
    * This API uses  [jQuery](https://jquery.com/) to interact with the DOM, so
    * jQuery must be imported into the HTML document before this API.
    *
    * @namespace
    * @requires jQuery
    * @see {@link https://jquery.com/}
    * @see {@link https://en.wikipedia.org/wiki/Cellular_automaton}
    */
    bartificer.ca = {};
    
    //
    // --- Define Validation Functions ---
    //
    
    /**
    * Test if a given value is a plain object.
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` if the value is a reference to a plain object,
    * `false` otherwise.
    * @see {@link PlainObject}
    */
    function isPlainObject(obj){
        return $.isPlainObject(obj) ? true : false;
    }
    
    /**
    * Validation function to check if a given value is a reference to a jQuery
    * object representing exactly one div.
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` of the value is valid, `false` otherwise.
    * @see {@link jQuerySingleContainer}
    */
    function isJQuerySingleContainer(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('div, p, section, main') ? true : false;
    }
    
    /**
    * Validation function to check if a given value is a reference to a jQuery
    * object representing exactly one table.
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` if the value is valid, `false` otherwise.
    * @see {@link jQuerySingleTable}
    */
    function isJQuerySingleTable(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('table') ? true : false;
    }
    
    /**
    * Validation function to check if a given value is a reference to a jQuery
    * object representing exactly one table data cell.
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` of the value is valid, `false` otherwise.
    * @see {@link jQuerySingleTD}
    */
    function isJQuerySingleTD(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('td') ? true : false;
    }
    
    /**
    * Test if a given value is a valid grid coordinate.
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} n - The value to test.
    * @return {boolean} `true` if the value is a valid grid coordinate, `false`
    * otherwise.
    * @see {@link GridCoordinate}
    */
    function isGridCoordinate(n){
        return String(n).match(/^\d+$/) ? true : false;
    };
    
    /**
    * Test if a given value is a valid grid dimension.
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} gd The value to test.
    * @return {boolean} `true` if the value is a valid grid dimension, `false`
    * otherwise.
    * @see {@link GridDimension}
    */
    function isGridDimension(gd){
        // make sure we have an integer that's not negative
        if(!String(gd).match(/^\d+$/)){
            return false;
        }
        
        // make sure the integer is at least one
        if(gd < 1){
            return false;
        }
        
        // if we got here all is well, so return true
        return true;
    };
    
    /**
    * Test if a given value is a valid cell state (a boolean, number, or
    * string).
    *
    * @memberof bartificer.ca
    * @inner
    * @private
    * @param  {*} s The value to test.
    * @return {boolean} `true` if the value is a valid cell state, `false`
    * otherwise.
    * @see {@link GridDimension}
    */
    function isCellState(s){
        var sType = typeof s;
        
        // accept booleans
        if(sType === 'boolean') return true;
        
        // accept numbers
        if(sType === 'number') return true;
        
        // accpet strings
        if(sType === 'string') return true;
        
        // reject all other types
        return false;
    };
    
    /**
     * Test if a given value is a valid time period in milliseconds, i.e. a
     * whole number grater than zero.
     *
     * @memberof bartificer.ca
     * @inner
     * @private
     * @param  {*} ms - The value to test.
     * @return {boolean} `true` if the value is valid, `false` otherwise.
     * @see {@link IntervalMS}
     */
    function isIntervalMS(ms){
        // make sure we got a number
        if(typeof ms !== 'number') return false;
        
        // make sure we have a whole number
        if(!String(ms).match(/^\d+$/)) return false;
        
        // return based on the size relative to zero
        return ms > 0 ? true : false;
    };
    
    
    /**
     * Validate that a given value is a valid state for an automaton as a
     * whole.
     *
     * @memberof bartificer.ca
     * @inner
     * @private
     * @param {*} s - The value to test.
     * @param {GridDimension} rows - The number of rows in the automaton.
     * @param {GridDimension} cols - The number of columns in the automaton.
     * @returns {boolean} Always returns true.
     * @throws {TypeError} Throws a type error if the value is not valid.
     */
    function validateAutomatonState(s, rows, cols){
        // check if we have a valid value
        var isValid = false;
        if(isCellState(s)){
            isValid = true;
        }else if($.isArray(s)){
            // make sure each element is a cell state, and that the dimensions match
            if(s.length != cols){
                throw new TypeError('state array has invalid dimensions');
            }
            for(x = 0; x < cols; x++){
                if(s[x].length != rows){
                    throw new TypeError('state array has invalid dimensions');
                }
                for(y = 0; y < rows; y++){
                    if(!isCellState(s[x][y])){
                        throw new TypeError('state array contains invalid value');
                    }
                }
            }
                
            // if we made it here without throwing an error, the state is valid
            isValid = true;
        }else if(typeof s === 'function'){
            isValid = true;
        }
            
        // throw an eror if we got here and don't have a valid value
        if(!isValid){
            throw new TypeError('must be a valid cell state (boolean, number, or string), an array of valid cell states with the same dimensions as the automaton, or a callback');
        }
    };
    
    /**
     * Test if a given value is a valid state for an automaton as a whole, i.e.
     * a single cell state, an array of cell states with the correct
     * dimensions, or, a callback.
     *
     * @memberof bartificer.ca
     * @inner
     * @private
     * @param {*} s - The value to test.
     * @param {GridDimension} rows - The number of rows in the automaton.
     * @param {GridDimension} cols - The number of columns in the automaton.
     * @return {boolean} `true` if the value is a valid automaton state,
     * `false` otherwise.
     * @see {@link AutomatonState}
     */
    function isAutomatonState(s, rows, cols){
        try{
            validateAutomatonState(s, rows, cols);
        }catch(err){
            return false;
        }
        return true;
    };
    
    //
    // --- The bartificer.ca.Cell Prototype ---
    //
    
    /**
    * A prototype to represent a single cell within a cellular automaton. The
    * cell will be represented within the DOM by a single table data cell.
    *
    * The constructor expects to be passed a table data cell, and that cell
    * will be emptied of all content. The class `bartificer-ca-cell` will be
    * added to the data cell, and a reference to the constructed object will be
    * added to the data cell as the data attribute `data-bartificer-object`
    * (`bartificerObject` from JavaScipt's point of  view).
    *
    * @constructor
    * @param {jQuerySingleTD} $td - A jQuery object representing the table data
    * cell that will represent the new cell within the automaton.
    * @param {GridCoordinate} x - the cell's x coordinate within the
    * automaton.
    * @param {GridCoordinate} y - the cell's y coordinate within the
    * automaton.
    * @param {CellState} [s] - the cell's initial state.
    * @throws {TypeError} An error is thrown if the first three arguments are
    * not present and valid.
    * @throws {Error} An error is thrown if the table data cell has already
    * been initialised as a cell within an automaton.
    */
    bartificer.ca.Cell = function($td, x, y, s){
        // validate args
        if(!isJQuerySingleTD($td)){
            throw new TypeError('the first argument must be a jQuery object representing exactly one table data cell');
        }
        if(!isGridCoordinate(x)){
            throw new TypeError('the second argument must be a valid grid coordinate');
        }
        if(!isGridCoordinate(y)){
            throw new TypeError('the third argument must be a valid grid coordinate');
        }
        if(typeof s !== 'undefined' && !isCellState(s)){
            throw new TypeError('if present, the fourth argument must be a valid cell state (boolean, number, or string)');
        }
        
        // make sure the data cell has not been initialised into a Cell already
        if($td.hasClass('bartificer-ca-cell') || $td.data('bartificerObject')){
            throw new Error('cannot use the same table data cell to represent multiple Cell objects');
        }
        
        // initialise data attributes
        
        /**
        * A reference to a jQuery object representing the table data cell that
        * represents this cell in the DOM.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {jQuerySingleTD}
        */
        this._$td = $td.empty();
        
        /**
        * The cell's x coordinate within the automaton.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {GridCoordinate}
        */
        this._x = x;
        
        /**
        * The cell's y coordinate within the automaton.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {GridCoordinate}
        */
        this._y = y;
        
        /**
        * The cell's current state.
        *
        * This property should not be directly editable. It should only change
        * when the cell ticks forward to the next state.
        *
        * @private
        * @type {*}
        */
        this._state = s;
        
        /**
        * The cell's next state.
        *
        * @private
        * @type {*}
        */
        this._nextState = undefined;
        
        // add the class to the TD
        this._$td.addClass('bartificer-ca-cell');
        
        // add the data attribute to the TD
        this._$td.data('bartificerObject', this);
    };
    
    /**
    * A read-only accessor function to access a reference to the jQuery object
    * representing the table data cell that represents the cell within the DOM.
    *
    * @returns {jQuerySingleTD}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.$td = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._$td;
    };
    
    /**
    * A read-only accessor function to access the cell's x coordinate within
    * the automaton.
    *
    * @returns {GridCoordinate}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.x = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._x;
    };
    
    /**
    * A read-only accessor function to access the cell's y coordinate within
    * the automaton.
    *
    * @returns {GridCoordinate}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.y = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._y;
    };
    
    /**
    * A read-only accessor function to access the cell's x and y coordinates
    * within the automaton.
    *
    * @returns {Array} An array of length two with the x coordinate as the
    * first value and the y coordinate as the second.
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.coordinates = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return [this._x, this._y];
    };
    
    /**
    * A read-only accessor function to access the cell's current state, if any.
    *
    * @returns {(CellState|undefined)} When the cell has a current state that's
    * returned, otherwise `undefined` is returned.
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.state = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._state;
    };
    
    /**
    * Accessor function for the cell's next state. Always returns the next
    * state of the cell. If an argument is passed, the next state is updated to
    * that value and then returned.
    *
    * @param {(CellState|undefined)} [ns] - if passed, the next state of the
    * cell is set to this value. `undefined` indicates that the cell has no
    * next state.
    * @returns {(CellState|undefined)} When the cell has a next state that's
    * returned, otherwise `undefined` is returned.
    * @throws {TypeError} If an argument is passed and it's not value, an error
    * is thrown.
    */
    bartificer.ca.Cell.prototype.nextState = function(ns){
        // if in setter mode, try set
        if(arguments.length >= 1){
            if(!(typeof ns === 'undefined' || isCellState(ns))){
                throw new TypeError('if present, the first argument must be a valid cell state (boolean, number, or sting), or the value undefined');
            }
            this._nextState = ns;
        }
        
        // always return the current next state
        return this._nextState;
    };
    
    /**
    * Function to determine whether or not the cell has a next state defined.
    * 
    * @returns {boolean} `true` if the cell has a next state defined, `false`
    * otherwise.
    */
    bartificer.ca.Cell.prototype.hasNextState = function(){
        return typeof this._nextState === 'undefined' ? false : true;
    };
    
    /**
    * Advance the cell to its next state.
    *
    * @returns a reference to self to facilitate function chaining.
    * @throws {Error} An error is thrown if an attempt is made to advance while
    * there is no next state defined.
    */
    bartificer.ca.Cell.prototype.advance = function(){
        // throw an error if there is no next state to advance to
        if(!this.hasNextState()){
            throw new Error("can't advance a cell while there is no next state defined");
        }
        
        // set the current state to the next state
        this._state = this._nextState;
        
        // blank the next state
        this._nextState = undefined;
        
        // return a reference to self
        return this;
    };
    
    //
    // --- The bartificer.ca.Automaton Prototype ---
    //
    
    /**
    * A prototype to represent a cellular automaton.
    *
    * The automaton uses a lower-right quadrant zero-indexed coordinate system.
    * The horizontal axis is labeled the *x axis* and numbered from left to
    * right in whole number increments. The vertical axis is labeled the
    * *y axis*, and numbered from top to bottom in whole-number increments.
    * When describing a cell it's x coordinate is specified first, and its y
    * coordinate second. Hence, the cell in the top-left corner has the
    * coordinates (0, 0), the second cell in the top row has the  coordiantes
    * (1, 0), and the cell in the second cell on the left-most column has the
    * coordinates (0, 1).
    *
    * The automaton will be represented within the DOM by an automatically
    * generated table, with the cells that make up the automaton as table
    * cells. The table will be generated within a given container.
    *
    * The constructor expects to be passed a jQuery object representing a sigle
    * container element. That element will be emptied, and the table
    * representing the automaton will then be added to it. The class
    * `bartificer-ca-container` will be added to the conainer, and the
    * generated table will have the class `bartificer-ca-automaton` added.
    * The table. A reference to the constructed object will be added to both 
    * the container and the table as the data attribute 
    * `data-bartificer-object` (`bartificerObject` from JavaScipt's point of
    * view).
    *
    * @constructor
    * @param {jQuerySingleContainer} $container - A jQuery object representing
    * the container that will be converted into the cellular automaton.
    * @param {GridDimension} rows - the number of rows to build the automaton
    * with.
    * @param {GridDimension} cols - the number of columns to build the
    * automaton with.
    * @param {stepFunction} stepFn - a callback that will be used to
    * calcualte the next state of each cell for each step the automaton takes.
    * it's next state.
    * @param {renderFunction} renderFn - a callback that will be used to render
    * the state of each cell.
    * @param {(CellState|CellState[]|initialisationFunction)} [s] - the
    * automaton's initial state. The state can be specified in three different
    * ways:
    * 1. a single state - each cell in the automaton will be initialised with
    *    this state.
    * 2. an array of states. The array must have the same dimensions as the
    *    automaton.
    * 3. an intialisation callback. The callback will be used to calculate the
    *    initial state of each cell given its coordinates.
    * @throws {TypeError} An error is thrown if the first five arguments are
    * not present and valid, and if the sixth argument is present but not
    * valid.
    * @throws {Error} An error is thrown if the table has already been
    * initialised as an automaton.
    */
    bartificer.ca.Automaton = function($container, rows, cols, stepFn, renderFn, s){
        var x, y; // variables to be used in loops throughout this function
        
        // validate args
        if(!isJQuerySingleContainer($container)){
            throw new TypeError('the first argument must be a jQuery object representing exactly one valid container element');
        }
        
        if(!isGridDimension(rows)){
            throw new TypeError('the second argument must be a valid grid dimension');
        }
        if(!isGridDimension(cols)){
            throw new TypeError('the third argument must be a valid grid dimension');
        }
        if(typeof stepFn !== 'function'){
            throw new TypeError('the fourth argument must be a callback');
        }
        if(typeof renderFn !== 'function'){
            throw new TypeError('the fifth argument must be a callback');
        }
        if(typeof s !== 'undefined' && !isAutomatonState(s, rows, cols)){
            throw new TypeError('if present, the sixth argument must be a valid cell state (boolean, number, or string), an array of valid cell states with the same dimensions as the automaton, or, a callback');
        }
        
        // make sure the container has not been initialised into an Automaton already
        if($container.hasClass('bartificer-ca-container') || $container.data('bartificerObject')){
            throw new Error('cannot use the same container to represent multiple cellular automata');
        }
        
        // initialise the container
        $container.empty().addClass('bartificer-ca-container').data('bartificerObject', this);
        
        // save the passed properties
        
        /**
        * A jQuery object representing the container for the automaton.
        * @private
        * @type {jQuerySingleContainer}
        */
        this._$container = $container;
        
        /**
        * The number of rows in the automaton. This property is forced to be a
        * number before being stored.
        * @private
        * @type {GridDimension}
        */
        this._rows = parseInt(rows); // force to number
        
        /**
        * The number of columns in the automaton. This property is forced to be a
        * number before being stored.
        * @private
        * @type {GridDimension} 
        */
        this._cols = parseInt(cols); // force to number
        
        /**
        * The callback used to calculate the next state of each cell each time
        * the automaton steps forward.
        * @private
        * @type {stepFunction}
        */
        this._stepFn = stepFn;
        
        /**
        * The callback used to style a given cell so it represents the
        * appropriate state.
        * @private
        * @type {renderFunction}
        */
        this._renderFn = renderFn;
        
        /**
         * The genreation counter.
         * @private
         * @type {number}
         */
        this._generation = 0;
        
        /**
         * The callbacks to execute when ever the generation changes.
         * @private
         * @type {function[]}
         * @default
         */
        this._generationChange = [];
        
        /**
         * The ID of the timeout for the next automatic step, or zero if there
         * is no running timeout (the automaton is not in automatic mode).
         * @private
         * @type {IntervalMS}
         * @default
         */
        this._autoStepID = 0;
        
        /**
         * The number of milliseconds between automated steps.
         * @private
         * @default
         * @type {number}
         */
        this._autoStepMS = 500;
        
        // initialise the grid and table
        
        /**
        * A 2D array of bartificer.ca.Cell objects representing the cells in
        * the automaton.
        * @private
        * @type {bartificer.ca.Cell[][]}
        */
        this._grid = [];
        for(x = 0; x < this._cols; x++){
            this._grid[x] = [];
        }
        
        /**
        * A jQuery object representing the table that represents the automaton.
        * @private
        * @type {jQuerySingleTable}
        */
        this._$table = $('<table></table>').addClass('bartificer-ca-automaton');
        this._$table.data('bartificerObject', this);
        
        // actually build the table and grid together
        var $tbody = $('<tbody></tbody>');
        for(y = 0; y < this._rows; y++){
            var $row = $('<tr></tr>');
            for(x = 0; x < this._cols; x++){
                var $td = $('<td></td>');
                var initState = undefined;
                if(typeof s !== 'undefined'){
                    if($.isArray(s) && s[x] && isCellState(s[x][y])){
                        initState = s[x][y];
                    }else if(typeof s === 'function'){
                        initState = s(x, y);
                    }else if(isCellState(s)){
                        initState = s;
                    }
                }
                this._grid[x][y] = new bartificer.ca.Cell($td, x, y, initState);
                this._renderFn($td, this._grid[x][y].state());
                $row.append($td);
            }
            $tbody.append($row); // add the row into the table body
        }
        
        // inject the table into the DOM
        this._$table.append($tbody); // add the table body into the table
        this._$container.append(this._$table); // add the table into the container
        
        // initialise the state if the optional sixth argument was passed
        if(typeof s !== 'undefined'){
            this.setState(s);
        }
    };
    
    /**
    * A read-only accessor function to access a reference to the jQuery object
    * representing the container that holds the table that represents the
    * automaton within the DOM.
    *
    * @returns {jQuerySingleContainer}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.$container = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._$container;
    };
    
    /**
    * A read-only accessor function to access a reference to the jQuery object
    * representing the table that represents the automaton within the DOM.
    *
    * @returns {jQuerySingleTable}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.$table = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._$table;
    };
    
    /**
    * A read-only accessor function to get the number of rows within the
    * automaton.
    *
    * @returns {GridDimension}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.rows = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._rows;
    };
    
    /**
    * A read-only accessor function to get the number of columns within the
    * automaton.
    *
    * @returns {GridDimension}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.cols = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._cols;
    };
    
    /**
    * A read-only accessor function to return both the width and height of the
    * grid, i.e. the number of rows and columns.
    *
    * @returns {number[]} An array of two numbers, the width (number of cols),
    * and height (number of rows).
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.dimensions = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return [this._cols, this._rows];
    };
    
    /**
    * A read-only accessor function to get a reference to the automaton's step
    * function.
    *
    * @returns {stepFunction}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.stepFunction = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._stepFn;
    };
    
    /**
    * A read-only accessor function to get a reference to the automaton's
    * render function.
    *
    * @returns {renderFunction}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.renderFunction = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._renderFn;
    };
    
    /**
     * A read-only accessor function to get the automaton's current generation
     * number.
     *
     * @returns {number}
     * @throws {Error} An error is thrown if the accessor is called with
     * arguments.
     */
    bartificer.ca.Automaton.prototype.generation = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._generation;
    };
    
    /**
     * A function for adding a callback to be executed when ever the generation
     * changes, or, to execute all registered geneation-change callbacks.
     *
     * When called with no parameters all callbacks are execute, when called
     * with a callback as the first parameter, that callback is registered.
     *
     * @param {function} [fn]
     * @returns {bartificer.ca.CellularAutomaton} Returns a reference to self.
     * @throws {TypeError} An error is thrown if called with parameters, and the
     * first parameter is not a callback.
     */
    bartificer.ca.Automaton.prototype.generationChange = function(fn){
        // check the number of parameters
        if(arguments.length >= 1){
            // at least one parameter was passed - validate and store it
            
            // make sure the first parameter is a callback
            if(typeof fn !== 'function'){
                throw new TypeError('if present, the first parameter must be a callback');
            }
            
            // store the callback
            this._generationChange.push(fn);
        }else{
            // no parameters were passed, so execute all callbacks
            for(var i = 0; i < this._generationChange.length; i++){
                this._generationChange[i]();
            }
        }
        
        // return a reference to self
        return this;
    };
    
    /**
    * A function for accessing a given cell within the automaton.
    *
    * @param {GridCoordinate} x - the x coordinate of the requested cell.
    * @param {GridCoordinate} y - the y coordinate of the requested cell.
    * @returns {bartificer.ca.Cell} a reference to the object representing the
    * requested cell.
    * @throws {TypeError} A type error is thrown if invalid arguments are
    * passed.
    * @throws {RangeError} A range error is thrown if the coordinates specify
    * a cell beyond the edges of the automaton.
    */
    bartificer.ca.Automaton.prototype.cell = function(x, y){
        if(!(isGridCoordinate(x) && isGridCoordinate(y))){
            throw new TypeError('two valid grid coordinates are required');
        }
        if(x >= this._cols){
            throw new RangeError('x coordinate out of range');
        }
        if(y >= this._rows){
            throw new RangeError('y coordinate out of range');
        }
        return this._grid[x][y];
    };
    
    /**
    * A function for accessing the current state of a given cell within the
    * automaton.
    *
    * @param {GridCoordinate} x - the x coordinate of the requested cell.
    * @param {GridCoordinate} y - the y coordinate of the requested cell.
    * @returns {CellState} The current state of the cell at the given
    * coordinates.
    * @throws {TypeError} A type error is thrown if invalid arguments are
    * passed.
    * @throws {RangeError} A range error is thrown if either of the coordinates
    * specify a cell who's coordiantes are beyond the edges of the automaton.
    */
    bartificer.ca.Automaton.prototype.cellState = function(x, y){
        return this.cell(x, y).state();
    };
    
    /**
     * Set the current state of the automaton as a whole.
     *
     * @param {(CellState|CellState[]|initialisationFunction)} [newState] - a
     * new state for the automaton. The state can be specified in three
     * different ways:
     * 1. a single state - each cell in the automaton will be initialised with
     *    this state.
     * 2. an array of states. The array must have the same dimensions as the
     *    automaton.
     * 3. an intialisation callback. The callback will be used to calculate the
     *    initial state of each cell given its coordinates.
     * @throws {TypeError} An error is thrown if an invalid new state is
     * passed.
     * @returns {bartificer.ca.CellularAutomaton} Returns a reference to self.
     */
    bartificer.ca.Automaton.prototype.setState = function(newState){
        // validate the new state
        validateAutomatonState(newState, this.rows(), this.cols());
        
        // set the next state for every cell
        for(var x = 0; x < this.cols(); x++){
            for(var y = 0; y < this.rows(); y++){
                // set the next state of the cell as appropriate
                if(isCellState(newState)){
                    // we were passed a single state, so apply it to every cell
                    this.cell(x, y).nextState(newState);
                }else if($.isArray(newState)){
                    // we were passed an array of states, so use the matching index
                    this.cell(x, y).nextState(newState[x][y]);
                }else if(typeof newState === 'function'){
                    // we were passed a callback, so invoke it
                    this.cell(x, y).nextState(newState(x, y));
                }else{
                    // should be impossible!
                    throw new TypeError('invalid state');
                }
                
                // advance the cell to its new state
                this.cell(x, y).advance();
                    
                // render the new state
                this._renderFn(this.cell(x, y).$td(), this.cell(x, y).state());
            }
        }
        
        // set the generation counter back to zero
        this._generation = 0;
        this.generationChange();
        
        // return a reference to self
        return this;
    };
    
    /**
     * Get the states of a cell's neighbouring cells.
     *
     * @param {GridCoordinate} x - the x coordinate of the requested cell.
     * @param {GridCoordinate} y - the y coordinate of the requested cell.
     * @returns {CellState[]} Returns an array of eight cell states where the
     * state at index zero is that from the cell directly above the current
     * cell, and then moving clockwise from there. If a cell is at an edge,
     * the indexes for the non-existent positions will still be included in the
     * array, but they will have the value `null`.
     * @throws {TypeError} A type error is thrown if invalid arguments are
     * passed.
     * @throws {RangeError} A range error is thrown if the coordinates specify
     * a cell beyond the edges of the automaton.
     */
    bartificer.ca.Automaton.prototype.cellNeighbourStates = function(x, y){
        // validate the coordinates by getting a reference to the cell
        this.cell(x, y);
        
        // initialise the array
        var ans = [];
        
        // calculate each neighbour state one by one
        ans[0] = y >= 1 ? this.cellState(x, y - 1) : null; // 12 oclock
        ans[1] = x + 1 < this.cols() && y >= 1 ? this.cellState(x + 1, y - 1) : null;
        ans[2] = x + 1 < this.cols() ? this.cellState(x + 1, y) : null; // 3 oclock
        ans[3] = x + 1 < this.cols() && y + 1 < this.rows() ? this.cellState(x + 1, y + 1) : null;
        ans[4] = y + 1 < this.rows() ? this.cellState(x, y + 1) : null; // 6 oclock
        ans[5] = x >= 1 && y + 1 < this.rows() ? this.cellState(x - 1, y + 1) : null;
        ans[6] = x >= 1 ? this.cellState(x - 1, y) : null; // 9 oclock
        ans[7] = x >= 1 && y >= 1 ? this.cellState(x - 1, y - 1) : null;
        
        // return the array
        return ans;
    };
    
    /**
     * Get or set the number of milliseconds between automatic steps.
     *
     * @param {IntervalMS} [ms] - if passed, the number of milliseconds to
     * pause between automatic steps.
     * @returns {IntervalMS}
     * @throws {TypeError} If an argument is passed and it's not valid, an error
     * is thrown.
     */
    bartificer.ca.Automaton.prototype.autoStepIntervalMS = function(ms){
        // if in setter mode, try set
        if(arguments.length >= 1){
            if(!isIntervalMS(ms)){
                throw new TypeError('if present, the first argument must be a whole number greater than zero');
            }
            this._autoStepMS = ms;
        }
        
        // always return the current auto step interval
        return this._autoStepMS;
    };
    
    /**
     * Step the automaton forward by one step.
     *
     * @returns {bartificer.ca.CellylarAutomaton} Returns a reference to self.
     */
    bartificer.ca.Automaton.prototype.step = function(){
        // first calcualte the next state of each cell
        var x, y;
        for(x = 0; x < this.cols(); x++){
            for(y = 0; y < this.rows(); y++){
                // get a reference to the current cell
                var c = this.cell(x, y);
                
                // calculate the next state
                var ns = this._stepFn(c.state(), this.cellNeighbourStates(x, y));
                
                // set the cell's next state to the newly calculated value
                c.nextState(ns);
            }
        }
        
        // next move each cell forward into its next state and re-render it
        for(x = 0; x < this.cols(); x++){
            for(y = 0; y < this.rows(); y++){
                this.cell(x, y).advance();
                this._renderFn(this.cell(x, y).$td(), this.cell(x, y).state());
            }
        }
        
        // finally, increment the generation counter
        this._generation++;
        this.generationChange();
        
        // return a reference to self
        return this;
    };
    
    /**
     * Start automatically stepping the automaton.
     *
     * If the automaton is already in automatic mode, this function does
     * nothing.
     *
     * @param {IntervalMS} [ms] - An optional interval between steps in
     * milliseconds.
     * @returns {bartificer.ca.CellylarAutomaton} Returns a reference to self.
     * @throws {TypeError} A type error is thrown if the optoinal parameter is
     * present, but not a whole number greater than zero.
     */
    bartificer.ca.Automaton.prototype.start = function(ms){
        // if we are already in stepping mode, do nothing
        if(this._autoStepID) return this;
        
        // if we were passed an interval, set it
        if(arguments.length >= 1){
            this.autoStepIntervalMS(ms); // could throw an error
        }
        
        // take one step
        this.step();
        
        // define a callback to automatically take a step
        var self = this;
        var autoStepFn = function(){
            if(self._autoStepID){
                // take a step
                self.step();
                
                // set a fresh timeout - CAUTION: recursive code!
                self._autoStepID = window.setTimeout(autoStepFn, self.autoStepIntervalMS());
            }
        };
        
        // set the ball rolling
        this._autoStepID = window.setTimeout(autoStepFn, this.autoStepIntervalMS());
        
        // return a reference to self
        return this;
    };
    
    /**
     * Stop automatically stepping the automaton.
     *
     * @returns {bartificer.ca.CellylarAutomaton} Returns a reference to self.
     */
    bartificer.ca.Automaton.prototype.stop = function(){
        // if we're not stepping, just do nothing
        if(!this._autoStepID) return this;
        
        // stop the timeout
        window.clearTimeout(this._autoStepID);
        
        // blank the stored timeout ID
        this._autoStepID = 0;
        
        // return a reference to self
        return this;
    };
})(bartificer, jQuery);