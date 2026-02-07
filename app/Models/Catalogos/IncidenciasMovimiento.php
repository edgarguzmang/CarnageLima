<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidenciasMovimiento extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.IncidenciasMovimiento';
    protected $primaryKey = 'IncidenciasMovimiento_id';
    protected $fillable = [
        'IncidenciasMovimiento_movimientoID',
        'IncidenciasMovimiento_listaID',
        'IncidenciasMovimiento_usuarioID',
        'IncidenciasMovimiento_observaciones',
    ];

    public function listaVerificacion()
    {
        return $this->belongsTo(ListaVerificacion::class, 'IncidenciasMovimiento_listaID', 'ListaVerificacion_listaID');
    }
}
