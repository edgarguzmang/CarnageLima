<?php

namespace App\Models;

use App\Models\Catalogos\Puestos;
use App\Models\Menu;
use App\Models\RH\Persona;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'dbo.Usuarios';
    public $timestamps = false;
    protected $primaryKey = 'IdUsuario';

    protected $fillable = [
        'Username',
        'Password',
        'IdPersona',
        'IdRol',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'Password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // Esta línea asegura que la contraseña se hashee automáticamente con Bcrypt
        'Password' => 'hashed',
    ];

    /**
     * Sobreescribe el método de autenticación para indicarle a Laravel 
     * cuál es la columna de la contraseña.
     */
    public function getAuthPassword(): string
    {
        return $this->Password;
    }

    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'usuarioxmenu', 'usuarioxmenu_idusuario', 'usuarioxmenu_idmenu')
            ->withPivot('usuarioxmenu_idusuario', 'usuarioxmenu_idmenu', 'usuarioxmenu_alta', 'usuarioxmenu_consulta', 'usuarioxmenu_especial', 'usuarioxmenu_cambio',);
    }


    public function Persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'IdPersona', 'IdPersona');
    }

    public function Rol(): BelongsTo
    {
        return $this->belongsTo(Roles::class, 'IdRol', 'roles_id');
    }
}
