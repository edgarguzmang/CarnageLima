<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Puestos extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.Puestos';
    protected $primaryKey = 'Puestos_id';
    protected $fillable = [
        'Puestos_nombre',
        'Puestos_estatus',
        'Puestos_idDepartamento',
    ];

     public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'Puestos_idDepartamento', 'Departamentos_id');
    }
}
