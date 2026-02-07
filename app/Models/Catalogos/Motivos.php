<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Motivos extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.Motivos';
    protected $primaryKey = 'Motivos_motivoID'; 
    protected $fillable = [
        'Motivos_nombre',
        'Motivos_tipo',
        'Motivos_descripcion',
        'Motivos_estatus',
    ];
}
