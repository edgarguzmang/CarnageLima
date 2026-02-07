<?php

namespace App\Models\Catalogos;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChoferUnidadAsignar extends Model
{
    use HasFactory;

    // Define the table name
    protected $table = 'dbo.ChoferUnidadAsignada';

    // Define the primary key
    protected $primaryKey = 'CUA_asignacionID';

    // Disable timestamps if your table doesn't have 'created_at' and 'updated_at' columns
    public $timestamps = false;

    // Define the mass-assignable fields
    protected $fillable = [
        'CUA_unidadID',
        'CUA_choferID',
        'CUA_ayudanteID',
        'CUA_motivoID',
        'CUA_destino',
        'CUA_fechaAsignacion',
        'CUA_estatus',
        'CUA_usuarioId',
        'CUA_ayudantes',
        'CUA_autAdmin'
    ];


    public function ultimoMovimiento()
    {
        // 'Movimientos_asignacionID' es la foreign key en la tabla de Movimientos
        // 'CUA_asignacionID' es la local key en la tabla de Asignaciones (debe ser la PK)
        return $this->hasOne(Movimientos::class, 'Movimientos_asignacionID', 'CUA_asignacionID')
            ->latest('Movimientos_fecha') // Ordena por fecha descendente
            ->latest('Movimientos_movimientoID'); // Desempata con el ID si las fechas son iguales
    }

    public function chofer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'CUA_choferID', 'Personas_usuarioID');
    }

    public function ayudante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'CUA_ayudanteID', 'Personas_usuarioID');
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidades::class, 'CUA_unidadID', 'Unidades_unidadID');
    }

    public function motivo(): BelongsTo
    {
        return $this->belongsTo(Motivos::class, 'CUA_motivoID', 'Motivos_motivoID');
    }

    public function destino(): BelongsTo
    {
        return $this->belongsTo(Destinos::class, 'CUA_destino', 'Destinos_Id');
    }
}
