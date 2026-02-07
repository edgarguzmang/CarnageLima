<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unidades extends Model
{
    use HasFactory;
    protected $table = 'dbo.Unidades';
    protected $primaryKey = 'Unidades_unidadID';
    public $timestamps = false; // <--- ¡Añade esta línea!
    protected $fillable = [
        'Unidades_numeroEconomico',
        'Unidades_numeroSerie',
        'Unidades_modelo',
        'Unidades_ano',
        'Unidades_placa',
        'Unidades_kilometraje',
        'Unidades_mantenimiento',
        'Unidades_estatus',
        'Unidades_usuarioID',
        'Unidades_fechaCreacion',
        'Unidades_capGasolina',

    ];
}
