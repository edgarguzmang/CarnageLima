<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destinos extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.Destinos';
    protected $primaryKey = 'Destinos_Id';
    protected $fillable = [
        'Destinos_Nombre',
        'Destinos_Latitud',
        'Destinos_Longitud',
        'Destinos_Estatus',
        'Destinos_UsuarioID',
        'Destinos_Fecha'
    ];
}
