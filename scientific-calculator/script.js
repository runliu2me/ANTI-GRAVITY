document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const historyDisplay = document.getElementById('history');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '0';
    let history = '';
    let lastResult = null;
    let newCalculation = false;

    // Map for scientific functions to JS Math functions
    const scientificMap = {
        'sin': 'Math.sin',
        'cos': 'Math.cos',
        'tan': 'Math.tan',
        'log': 'Math.log10',
        'ln': 'Math.log',
        'sqrt': 'Math.sqrt',
        'pi': 'Math.PI',
        'e': 'Math.E',
        'pow': '**',
        'fact': 'factorial'
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const value = button.dataset.value;

            if (value !== undefined) {
                handleNumber(value);
            } else if (action !== undefined) {
                handleAction(action);
            }
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        if (/[0-9.]/.test(key)) {
            handleNumber(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
            let op = key;
            if (op === '*') op = 'multiply';
            if (op === '/') op = 'divide';
            if (op === '+') op = 'add';
            if (op === '-') op = 'subtract';
            if (op === '(') op = 'parenthesis-open';
            if (op === ')') op = 'parenthesis-close';
            
            // Map back for action handler if needed, or just handle directly
            // Simpler to just map key to action name if possible, or handle char directly
            // For simplicity, let's map common keys to our action logic
            if (key === '*') handleAction('multiply');
            else if (key === '/') handleAction('divide');
            else if (key === '+') handleAction('add');
            else if (key === '-') handleAction('subtract');
            else if (key === '(') handleAction('parenthesis-open');
            else if (key === ')') handleAction('parenthesis-close');
        } else if (key === 'Enter' || key === '=') {
            handleAction('calculate');
        } else if (key === 'Backspace') {
            handleAction('delete');
        } else if (key === 'Escape') {
            handleAction('clear');
        }
    });

    function handleNumber(num) {
        if (newCalculation) {
            currentInput = num;
            newCalculation = false;
        } else {
            if (currentInput === '0' && num !== '.') {
                currentInput = num;
            } else {
                currentInput += num;
            }
        }
        updateDisplay();
    }

    function handleAction(action) {
        switch (action) {
            case 'clear':
                currentInput = '0';
                history = '';
                lastResult = null;
                break;
            case 'delete':
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
                break;
            case 'add':
                appendOperator('+');
                break;
            case 'subtract':
                appendOperator('-');
                break;
            case 'multiply':
                appendOperator('*');
                break;
            case 'divide':
                appendOperator('/');
                break;
            case 'percent':
                currentInput = String(parseFloat(currentInput) / 100);
                break;
            case 'parenthesis-open':
                if (currentInput === '0') currentInput = '(';
                else currentInput += '(';
                break;
            case 'parenthesis-close':
                currentInput += ')';
                break;
            case 'calculate':
                calculate();
                break;
            // Scientific
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
                handleScientificFunction(action);
                break;
            case 'pi':
                if (currentInput === '0') currentInput = 'Math.PI';
                else currentInput += 'Math.PI';
                break;
            case 'e':
                if (currentInput === '0') currentInput = 'Math.E';
                else currentInput += 'Math.E';
                break;
            case 'pow':
                appendOperator('**');
                break;
            case 'fact':
                // Factorial is a bit special as it's a postfix in math usually (n!) but here we might want to wrap or compute immediately
                // For simplicity in this eval-based approach, let's implement a factorial function wrapper
                // But since we are building a string to eval, it's harder to do postfix '!' without parsing.
                // Let's treat it as a function `fact(` that the user types? 
                // Or maybe just compute the factorial of the current number on screen immediately.
                // Let's go with immediate computation for factorial of the current number/block.
                try {
                    const val = eval(sanitize(currentInput));
                    currentInput = String(factorial(val));
                    newCalculation = true;
                } catch (e) {
                    currentInput = 'Error';
                    newCalculation = true;
                }
                break;
        }
        updateDisplay();
    }

    function handleScientificFunction(func) {
        // For functions like sin, cos, we want to append `Math.sin(` to the string
        const jsFunc = scientificMap[func];
        if (currentInput === '0') {
            currentInput = `${jsFunc}(`;
        } else {
            // Check if the last char is a number, if so, maybe add a multiply? 
            // E.g. 2sin(30) -> 2*Math.sin(30)
            const lastChar = currentInput.slice(-1);
            if (/[0-9)]/.test(lastChar)) {
                currentInput += `*${jsFunc}(`;
            } else {
                currentInput += `${jsFunc}(`;
            }
        }
    }

    function appendOperator(op) {
        if (newCalculation) {
            newCalculation = false;
        }
        const lastChar = currentInput.slice(-1);
        if (['+', '-', '*', '/', '.'].includes(lastChar)) {
            // Replace last operator if it's an operator
            currentInput = currentInput.slice(0, -1) + op;
        } else {
            currentInput += op;
        }
    }

    function calculate() {
        try {
            const expression = sanitize(currentInput);
            // Note: eval is used here for simplicity of a calculator. 
            // In a real production app with user inputs beyond just buttons, we'd want a parser.
            // But here inputs are controlled via buttons mostly.
            const result = eval(expression); 
            
            // Format result
            let formattedResult = parseFloat(result.toFixed(10)); // Avoid float precision errors
            
            history = currentInput + ' =';
            currentInput = String(formattedResult);
            lastResult = formattedResult;
            newCalculation = true;
        } catch (error) {
            currentInput = 'Error';
            newCalculation = true;
        }
        updateDisplay();
    }

    function sanitize(input) {
        // Replace visual operators with JS operators if any remained (though we used JS ones in logic)
        // And maybe handle degrees vs radians? JS Math.sin expects radians.
        // For a simple scientific calc, let's stick to radians or convert?
        // Standard scientific calcs often have a toggle. Let's assume Radians for now as it's standard in code.
        return input; 
    }

    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    function updateDisplay() {
        // Visual cleanup for display
        let displayString = currentInput
            .replace(/Math.PI/g, 'π')
            .replace(/Math.E/g, 'e')
            .replace(/Math.sin/g, 'sin')
            .replace(/Math.cos/g, 'cos')
            .replace(/Math.tan/g, 'tan')
            .replace(/Math.log10/g, 'log')
            .replace(/Math.log/g, 'ln')
            .replace(/Math.sqrt/g, '√')
            .replace(/\*\*/g, '^')
            .replace(/\*/g, '×')
            .replace(/\//g, '÷');

        display.textContent = displayString;
        historyDisplay.textContent = history;
        
        // Auto scroll to end
        display.scrollLeft = display.scrollWidth;
    }
});
