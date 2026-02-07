<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movimientos extends Model
{
    use HasFactory;

    // Define the table name
    protected $table = 'dbo.Movimientos';

    // Define the primary key
    protected $primaryKey = 'Movimientos_movimientoID';

    // Disable timestamps if your table doesn't have 'created_at' and 'updated_at' columns
    public $timestamps = false;

    // Define the mass-assignable fields
    protected $fillable = [
        'Movimientos_fecha',
        'Movimientos_tipoMovimiento',
        'Movimientos_asignacionID',
        'Movimientos_kilometraje',
        'Movimientos_combustible',
        'Movimientos_observaciones',
        'Movimientos_usuarioID',
        'Movimientos_estatus'
    ];
}
