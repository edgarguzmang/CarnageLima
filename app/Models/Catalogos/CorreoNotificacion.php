<?php

namespace App\Models\Catalogos;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CorreoNotificacion extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'dbo.CorreoNotificaciones';
    protected $primaryKey = 'IdCorreoNotificaciones';
    protected $fillable = [
        'correo',
        'idUsuario',
        'estatus',
        'idAsunto',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'idUsuario', 'IdUsuario');
    }
    public function asunto(): BelongsTo
    {
        return $this->belongsTo(Asuntos::class, 'idAsunto', 'IdAsunto');
    }
}
