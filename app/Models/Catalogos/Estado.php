<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.CatalogoSATEstado';
    protected $primaryKey = 'idEstado';
    protected $fillable = [
        'cveEstado',
        'cvePais',
        'descripcionEstado',
    ];
}
