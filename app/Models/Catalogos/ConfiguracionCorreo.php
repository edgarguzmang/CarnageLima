<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfiguracionCorreo extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'dbo.ConfiguracionCorreos';
    protected $primaryKey = 'IdConfiguracionCorreos';
    protected $fillable = [
        'correo',
        'password',
        'host',
        'puerto',
        'seguridadSSL',
    ];
}
