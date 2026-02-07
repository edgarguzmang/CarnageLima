<?php

namespace App\Models\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asuntos extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'dbo.Asunto';
    protected $primaryKey = 'IdAsunto';
    protected $fillable = [
        'Descripcion',
        // 'Asuntos_descripcion',
    ];
}
