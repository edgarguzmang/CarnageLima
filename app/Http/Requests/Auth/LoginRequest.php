<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            // El nombre de usuario que viene del formulario
            'Username' => ['required', 'string'], 
            // La contraseña que viene del formulario
            'Password' => ['required', 'string'],
        ];
    }
    
    /**
     * Get the authentication credentials.
     */
    protected function credentials(): array
    {
        // El array de credenciales DEBE usar 'password' como llave para la contraseña,
        // sin importar cómo se llame el campo en el formulario.
        return [
            'Username' => $this->get('Username'),
            'password' => $this->get('Password'), // <-- ¡CORRECCIÓN CLAVE!
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        // 1. Verificar la limitación de intentos fallidos
        $this->ensureIsNotRateLimited();

        // 2. Intentar la autenticación con las credenciales modificadas
        if (! Auth::attempt($this->credentials(), $this->boolean('remember'))) {
            // Si falla, registramos un intento fallido (hit)
            RateLimiter::hit($this->throttleKey());

            // Lanzamos el error de validación
            throw ValidationException::withMessages([
                'Username' => trans('auth.failed'),
            ]);
        }

        // 3. Si tiene éxito, limpiamos el contador de intentos fallidos
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        // Si no ha excedido 5 intentos, retorna sin hacer nada
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        // Lanza el evento de bloqueo
        event(new Lockout($this->getRequest()));

        // Calcula el tiempo restante para desbloquear
        $seconds = RateLimiter::availableIn($this->throttleKey());

        // Lanza el error de validación con el mensaje de límite de tasa
        throw ValidationException::withMessages([
            'Username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }


    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        // Genera la clave de limitación de tasa usando el campo de usuario y la IP
        return Str::transliterate(Str::lower($this->input('Username')).'|'.$this->ip());
    }
    
}