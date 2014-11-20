/**
 * Anton Pustovoyt 
 */

(function($) {

    /**
     * Extendable event emitter object.
     */

    var EventEmitter = (function() {
        var o = $({});

        EventEmitter = {
            on: function() {
                o.on.apply(o, arguments);
            },

            off: function() {
                o.off.apply(o, arguments);
            },

            trigger: function() {
                o.trigger.apply(o, arguments);
            }
        };

        return EventEmitter;
    }());

    /**
     * Main calculator object. Takes care of operations and state.
     */

    var calculator = (function() {
        var operations = {
            add: function(valueLeft, valueRight) {
                return valueLeft + valueRight;
            },

            subtract: function(valueLeft, valueRight) {
                return valueLeft - valueRight;
            },

            multiply: function(valueLeft, valueRight) {
                return valueLeft * valueRight;
            },

            divide: function(valueLeft, valueRight) {
                return valueLeft / valueRight;
            }
        };

        function Calculator() {
            this.waitingOperation = null;
            this.fromEqual = false;
            this.clear();
        };

        Calculator.prototype = $.extend({}, EventEmitter, {
            setOperation: function(type) {
                this.rightValue = parseFloat(this.rightValue);

                if (!type) {
                    return this.waitingOperation = null;
                }

                if (!type in operations) {
                    throw new Error('invalid operation: "' + type + '"');
                }

                if (type && this.fromEqual) {
                    //If the user is continuing to count after hitting equal, we reset the waiting operation to new one, waiting for new rightValue.
                    this.waitingOperation = operations[type];
                    this.rightValue = 0;
                    this.fromEqual = false;
                    return;
                }

                if (this.waitingOperation) {
                    this.leftValue = this.waitingOperation(this.leftValue, this.rightValue);
                } else {
                    this.leftValue = this.rightValue;
                }

                if (type) {
                    this.waitingOperation = operations[type];
                }

                this.rightValue = 0;
                this.trigger('change:operation');
            },

            inputNumber: function(number) {
                // Max 15 characters.
                if (('' + this.rightValue).length > 15) return;
                this.rightValue = (this.rightValue.toString() + number.toString()).replace(/^0+(?!\.|$)/, '');
                this.trigger('change:rightValue');
            },

            specialFunctions: function(func) {
                this.rightValue = parseFloat(this.rightValue);
                if (func == 'reset') {
                    this.clear();
                    this.fromEqual = false;
                    this.trigger('change:rightValue');
                }

                if (func == 'equal' && this.waitingOperation !== null) {
                    this.leftValue = this.waitingOperation(this.leftValue, this.rightValue);
                    this.fromEqual = true;
                    this.trigger('change:operation');
                }
            },

            clear: function() {
                this.setOperation(null);
                this.rightValue = 0;
                this.leftValue = 0;
            }
        });

        return new Calculator();
    }());

    /**
     * Application view
     */

    var AppView = (function() {
        function AppView(element) {
            this.element = element;

            this.displayView = new DisplayView();
            this.numpadView = new NumpadView();
        }

        AppView.prototype = {
            render: function() {
                this.element.empty();

                this.displayView.render();
                this.numpadView.render();

                this.element.append(this.displayView.element);
                this.element.append(this.numpadView.element);
            }
        };

        return AppView;
    }());

    /**
     * Display view
     */

    var DisplayView = (function() {
        function DisplayView() {
            this.showRightValue = $.proxy(this.showRightValue, this);
            this.showLeftValue = $.proxy(this.showLeftValue, this);

            this.element = $('<div class="display" />');
            calculator.on('change:rightValue', this.showRightValue);
            calculator.on('change:operation', this.showLeftValue);
        }

        DisplayView.prototype = {
            render: function() {
                this.showRightValue();
            },

            showRightValue: function() {
                this.element.text(calculator.rightValue);
            },

            showLeftValue: function() {
                if (calculator.leftValue !== 0) {
                    this.element.text(calculator.leftValue);
                }
            }
        };

        return DisplayView;
    }());

    /**
     * Numpad view
     */

    var NumpadView = (function() {
        function NumpadView() {
            this.element = $('<div class="buttons" />');

            this.buttons = {
                numberButtons: [],
                operationButtons: [],
                functionsButtons: []
            };

            for (var i = 1; i <= 9; i++) {
                this.buttons.numberButtons.push(new NumberButtonView(i));
            }

            this.buttons.numberButtons.push(new NumberButtonView(0));
            this.buttons.numberButtons.push(new NumberButtonView('.'));

            var operations = ['add', 'subtract', 'multiply', 'divide'];

            for (var i = 0, iMax = operations.length; i < iMax; i++) {
                this.buttons.operationButtons.push(new OperatorButtonView(operations[i]));
            }

            var functions = ['reset', 'equal']

            for (var i = 0, iMax = functions.length; i < iMax; i++) {
                this.buttons.functionsButtons.push(new FunctionsView(functions[i]));
            }
        }

        NumpadView.prototype = {
            render: function() {
                this.element.empty();

                var numPad = $('<ul class="numpad" />');

                for (var i = 0, button; button = this.buttons.numberButtons[i]; i++) {
                    button.render();
                    numPad.append(button.element);
                }

                var operationsPad = $('<ul class="operations" />');

                for (i = 0; button = this.buttons.operationButtons[i]; i++) {
                    button.render();
                    operationsPad.append(button.element);
                }

                var functionsPad = $('<ul class="specialfunctions" />');

                for (i = 0; button = this.buttons.functionsButtons[i]; i++) {
                    button.render();
                    functionsPad.append(button.element);
                }

                this.element.append(numPad, operationsPad, functionsPad);
            }
        };

        return NumpadView;
    }());


    /**
     * Buttons main constructor
     */

    var ButtonView = (function() {
        var $win = $(window);

        function ButtonView() {
            this.onMouseDown = $.proxy(this.onMouseDown, this);
            this.onMouseUp = $.proxy(this.onMouseUp, this);

            this.element.on('mousedown', this.onMouseDown);
            $win.on('mouseup', this.onMouseUp);
        }

        ButtonView.prototype = {
            onMouseDown: function() {
                this.element.addClass('mousedown');
            },

            onMouseUp: function() {
                this.element.removeClass('mousedown');
            }
        };

        return ButtonView;
    }());


    /**
     * Number buttons.
     */

    var NumberButtonView = (function() {
        function NumberButtonView(number) {
            this.onClick = $.proxy(this.onClick, this);
            this.element = $('<li class="number-button key" />');
            this.number = number;

            this.element.on('click', this.onClick);

            ButtonView.call(this);
        }

        NumberButtonView.prototype = $.extend({}, ButtonView.prototype, {
            onClick: function() {
                calculator.inputNumber(this.number);
            },

            render: function() {
                this.element.text(this.number);
            }
        });

        return NumberButtonView;
    }());

    /**
     * Special functions, new view for easier styling on a new row and possible future extended functionality. And cleaner code :)
     */

    var FunctionsView = (function() {
        var functionsAliases = {
            'reset': 'AC',
            'equal': '='
        };

        function FunctionsView(func) {
            this.onClick = $.proxy(this.onClick, this);

            this.element = $('<li class="function-button key" />');
            this.func = func;

            this.element.click(this.onClick);

            ButtonView.call(this);
        }

        FunctionsView.prototype = $.extend({}, ButtonView.prototype, {
            render: function() {
                this.element.text(functionsAliases[this.func] || this.funcn);
            },

            onClick: function() {
                calculator.specialFunctions(this.func);
            }
        });

        return FunctionsView;
    }());


    /**
     * Buttons for mathematical operations.
     */

    var OperatorButtonView = (function() {
        var operationAliases = {
            'add': '+',
            'subtract': '-',
            'multiply': '*',
            'divide': '/'
        };

        function OperatorButtonView(operation) {
            this.onClick = $.proxy(this.onClick, this);

            this.element = $('<li class="operator-button key" />');
            this.operation = operation;

            this.element.click(this.onClick);

            ButtonView.call(this);
        }

        OperatorButtonView.prototype = $.extend({}, ButtonView.prototype, {
            render: function() {
                this.element.text(operationAliases[this.operation] || this.operation);
            },

            onClick: function() {
                calculator.setOperation(this.operation);
            }
        });

        return OperatorButtonView;
    }());

    $(function() {
        var appView = new AppView($('#app'));
        appView.render();

    });
}(jQuery));