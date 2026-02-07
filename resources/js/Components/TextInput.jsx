import { forwardRef, useEffect, useRef, useState } from 'react';
import { InputGroup, InputGroupInput } from './ui/input-group';

const TextInput = forwardRef(function TextInput({
    type = 'text',
    className = '',
    placeholder = '',
    allowDecimals = true,
    allowNegative = false,
    value = '',
    onChange,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    min,
    max,
    ...props
}, ref) {
    const [isFocused, setIsFocused] = useState(false);
    const input = ref ? ref : useRef();

    const handleChange = (e) => {
        if (type !== 'number') {
            if (onChange) onChange(e);
            return;
        }

        let inputValue = e.target.value;

        if (inputValue === '') {
            if (onChange) onChange(e);
            return;
        }

        // Permitir punto inicial (se convertirá a "0.")
        if (inputValue === '.' && allowDecimals) {
            e.target.value = '0.';
            if (onChange) onChange(e);
            return;
        }

        // Permitir guion para negativos
        if (inputValue === '-' && allowNegative) {
            if (onChange) onChange(e);
            return;
        }

        // Regex que permite el punto
        let regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
        if (!allowDecimals) {
            regex = allowNegative ? /^-?\d*$/ : /^\d*$/;
        }

        if (!regex.test(inputValue)) {
            return;
        }

        // Eliminar ceros a la izquierda excepto con punto
        if (inputValue.length > 1 && inputValue[0] === '0' && inputValue[1] !== '.') {
            inputValue = inputValue.replace(/^0+/, '');
            e.target.value = inputValue;
        }

        // Manejar "-."
        if (inputValue === '-.' && allowDecimals && allowNegative) {
            e.target.value = '-0.';
            if (onChange) onChange(e);
            return;
        }

        // Si tiene punto pero no decimales después, dejar como string temporalmente
        if (inputValue.endsWith('.')) {
            // Dejar como string mientras escribe los decimales
            if (onChange) onChange(e);
            return;
        }

        const numValue = parseFloat(inputValue);

        if (!isNaN(numValue)) {
            // if (min !== undefined && numValue < min && inputValue !== '' && inputValue !== '-') {
            //     return;
            // }
            // if (max !== undefined && numValue > max) {
            //     return;
            // }

            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    name: e.target.name,
                    value: allowDecimals ? parseFloat(inputValue) : parseInt(inputValue, 10)
                }
            };
            if (onChange) onChange(syntheticEvent);
        } else {
            if (onChange) onChange(e);
        }
    };

    const handleFocus = (e) => {
        setIsFocused(true);

        if (type === 'number') {
            if (e.target.value === '0' || e.target.value === '0.00') {
                e.target.select();
            }
        }
        if (onFocusProp) {
            onFocusProp(e);
        }
    };

    const handleBlur = (e) => {
        setIsFocused(false);

        if (type === 'number') {
            let inputValue = e.target.value;

            if (inputValue === '' || inputValue === '-' || inputValue === '.') {
                const syntheticEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        name: e.target.name,
                        value: 0
                    }
                };
                if (onChange) onChange(syntheticEvent);
            } else if (inputValue.endsWith('.') && inputValue.length > 1) {
                const cleanValue = inputValue.slice(0, -1);
                const syntheticEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        name: e.target.name,
                        value: allowDecimals ? parseFloat(cleanValue) : parseInt(cleanValue, 10)
                    }
                };
                if (onChange) onChange(syntheticEvent);
            }
        }

        if (onBlurProp) {
            onBlurProp(e);
        }
    };

    const handleKeyDown = (e) => {
        if (type !== 'number') return;

        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];

        if (allowedKeys.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;

        const blockedChars = ['e', 'E', '+'];
        if (!allowNegative) blockedChars.push('-');
        if (!allowDecimals) blockedChars.push('.');

        if (e.key === '.' && allowDecimals) {
            const cursorPos = e.target.selectionStart;
            const currentValue = e.target.value;

            if (cursorPos === 0 && currentValue === '') {
                return;
            }

            if (currentValue.includes('.')) {
                e.preventDefault();
                return;
            }
        }

        if (blockedChars.includes(e.key) || /[a-zA-Z]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e) => {
        if (type !== 'number') return;

        const pastedText = e.clipboardData.getData('text');

        let regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
        if (!allowDecimals) {
            regex = allowNegative ? /^-?\d*$/ : /^\d*$/;
        }

        if (!regex.test(pastedText)) {
            e.preventDefault();
        }
    };

    const displayValue = type === 'number' && !isFocused && (value === '' || value === null || value === undefined)
        ? '0'
        : String(value);

    useEffect(() => {
        if (isFocused) {
            input.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className='w-full min-w-0'>
            <InputGroup className='w-full min-w-0'>
                <InputGroupInput
                    placeholder={placeholder}
                    className={`w-full min-w-0 ${className}`}
                    ref={input}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    onPaste={handlePaste}
                    value={displayValue}
                    inputMode={type === 'number' ? 'decimal' : undefined}
                    {...props}
                />
            </InputGroup>
        </div>
    );
});

TextInput.displayName = 'TextInput';

export default TextInput;