<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.Departamentos';
    protected $primaryKey = 'Departamentos_id';
    protected $fillable = [
        'Departamentos_nombre',
        'Departamentos_estatus',
    ];
}
