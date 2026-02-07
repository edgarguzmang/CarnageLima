import DialogComp from '@/Components/DialogComp';
import React, { useState } from 'react'
import { toast } from 'sonner';

const AuthorizationModal = ({ isOpen, onClose, onAuthorize, data }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const CODE_LENGTH = 6;
    const digitBoxes = Array(CODE_LENGTH).fill(0);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            if (code.length !== CODE_LENGTH) {
                setError('El código debe tener 6 dígitos.');
                return;
            }

            toast.info("Verificando código de autorización...");

            // **IMPORTANTE**: Asegúrate de que `route('verifycode')` apunta al endpoint correcto
            const response = await fetch(route('verifycode'), {
                method: 'POST',
                body: JSON.stringify({ unit: data.unit, code: code, type: data.movementType }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                toast.error(`Código incorrecto o error del servidor: ${errorText}`);
                setError('Código incorrecto o expirado.');
                throw new Error("Respuesta de verifycode no ok");
            }

            // Si es exitoso
            setCode('');
            setError('');
            onAuthorize(code); // Llama a onAuthorize con el código validado
            toast.success("Autorización completada y verificada.");

        } catch (err) {
            console.error('Error en el proceso de verificación de código:', err);
            if (!error) {
                toast.error('Fallo de comunicación con el servidor.');
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, CODE_LENGTH);
        setCode(value);
        setError('');
    };

    const focusInput = () => {
        document.getElementById('auth-code-input').focus();
    }

    return (
        <DialogComp open={isOpen} onClose={onClose} maxWidth="sm">
            <>
                {/* BOTÓN DE CIERRE (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Cerrar modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                {/* FIN BOTÓN DE CIERRE */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">Código de Autorización</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Introduce el código de 6 dígitos para continuar.
                </p>
                <div className="mb-6 flex flex-col items-center">
                    <div
                        className="flex justify-center space-x-2 mb-4 cursor-text"
                        onClick={focusInput}
                    >
                        {digitBoxes.map((_, index) => {
                            const digit = code[index] || '';
                            const isActive = index === code.length;

                            return (
                                <div
                                    key={index}
                                    className={`w-10 h-12 flex items-center justify-center text-xl font-mono border-2 rounded-lg 
                                      ${isActive
                                            ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                                            : 'border-gray-300 bg-gray-100'}
                                          transition-all duration-150`}
                                >
                                    {digit}
                                </div>
                            );
                        })}
                    </div>
                    {/* Input invisible real que captura el valor */}
                    <input
                        id="auth-code-input"
                        type="tel"
                        maxLength={CODE_LENGTH}
                        value={code}
                        onChange={handleInputChange}
                        onBlur={() => {
                            if (code.length !== CODE_LENGTH && code.length > 0) {
                                setError('Faltan dígitos.');
                            } else if (code.length === CODE_LENGTH) {
                                setError('');
                            }
                        }}
                        className="absolute opacity-0 w-0 h-0 p-0 m-0 overflow-hidden"
                        autoFocus
                    />
                    {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={code.length !== CODE_LENGTH || !!error}
                    className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 
                          ${code.length === CODE_LENGTH && !error ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Confirmar Código
                </button>
            </>
        </DialogComp>
    );
}

export default AuthorizationModal