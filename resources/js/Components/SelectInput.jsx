
import React, { forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

// --- SelectInput Component ---
/**
 * Un componente de entrada de selección (dropdown) reutilizable, ahora con forwardRef.
 * Permite que un componente padre obtenga una referencia al elemento <select> subyacente.
 * @param {object} props
 * @param {string} props.label - Etiqueta visible del campo.
 * @param {string} props.name - Nombre del campo para el formulario.
 * @param {any} props.value - El valor seleccionado actual.
 * @param {function} props.onChange - Función manejadora de cambios.
 * @param {Array<object>} props.options - Array de objetos para las opciones.
 * @param {boolean} [props.isRequired=false] - Indica si el campo es obligatorio.
 * @param {boolean} [props.disabled=false] - Indica si el campo está inhabilitado (nuevo).
 * @param {string} [props.placeholder="Seleccionar..."] - Texto de placeholder de la opción deshabilitada.
 * @param {string} [props.valueKey="value"] - Clave del objeto de opción para usar como valor.
 * @param {string} [props.labelKey="label"] - Clave del objeto de opción para usar como texto visible.
 * @param {React.Ref} ref - Referencia pasada por el componente padre.
 */
const SelectInput = forwardRef(({
    label,
    name,
    value,
    onChange,
    options,
    isRequired = false,
    disabled = false, // ¡NUEVA PROP!
    placeholder = "Seleccionar...",
    valueKey = "value",
    labelKey = "label"
}, ref) => {

    return (
        <div className="flex flex-col gap-1 min-w-0 w-full">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative w-full min-w-0">
                <Select
                    id={name}
                    name={name}
                    ref={ref}
                    value={value}
                    onValueChange={onChange}
                    required={isRequired}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-full min-w-0">
                        <SelectValue className='truncate' placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {/* <SelectLabel>Fruits</SelectLabel> */}
                            {options.map((option, index) => (
                                <SelectItem
                                    key={option[valueKey] || index}
                                    value={option[valueKey]}
                                    className="p-2 text-gray-700"
                                >
                                    {option[labelKey]}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {/* Custom arrow icon (ajustado el color para el estado disabled) */}
                {/* <div
                    className={`
                        pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 
                        ${disabled ? 'text-gray-500' : 'text-gray-700'}
                    `}
                >

                </div> */}
            </div>
        </div>
    );
})

export default SelectInput;


