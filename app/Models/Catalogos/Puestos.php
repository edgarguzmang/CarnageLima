<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Puestos extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.Puesto';
    protected $primaryKey = 'IdPuesto';
    protected $fillable = [
        'nombre',
        'estatus',
        'IdDepartamento',
        'TieneHorasExtra',
    ];

    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'IdDepartamento', 'IdDepartamento');
    }
}
