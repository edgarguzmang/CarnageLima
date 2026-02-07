<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserxMenu extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'dbo.usuarioxmenu';
    protected $primaryKey = 'usuarioxmenu_id';
    protected $fillable = [
        'usuarioxmenu_idusuario',
        'usuarioxmenu_idmenu',
        'usuarioxmenu_alta',
        'usuarioxmenu_consulta',
        'usuarioxmenu_especial',
        'usuarioxmenu_cambio',
    ];



    public function Menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'usuarioxmenu_idmenu', 'menu_id');
    }
}
