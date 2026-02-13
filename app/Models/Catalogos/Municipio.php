<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Municipio extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.CatalogoSATMunicipio';
    protected $primaryKey = 'idMunicipio';
    protected $fillable = [
        'claveMunicipio',
        'idestado',
        'descripcionMunicipio',
    ];

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'idestado');
    }
}
