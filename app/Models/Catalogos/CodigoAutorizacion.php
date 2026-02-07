<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CodigoAutorizacion extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'dbo.codigoAutorizacion';
    protected $primaryKey = 'codigoAutorizacion_id';
    protected $fillable = [
        'codigoAutorizacion_codigo',
        'codigoAutorizacion_idUnidad',
        'codigoAutorizacion_idUsuarioAutoriza',
        'codigoAutorizacion_idUsuarioSolicita',
        'codigoAutorizacion_motivo',
        'codigoAutorizacion_fechaAut',
        'codigoAutorizacion_fecha',
        'codigoAutorizacion_estatus',
    ];

     public function unidades()
    {
        return $this->belongsTo(Unidades::class,'codigoAutorizacion_idUnidad', 'Unidades_unidadID');
    }
}
