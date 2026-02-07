<?php

namespace App\Models; // <--- ¡Asegúrate de que este namespace es correcto!
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Roles extends Model
{
    use HasFactory;
    public $table = 'dbo.Roles';
    public $timestamps = false;
    public $primaryKey = 'roles_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'roles_descripcion',
        'roles_menuInicio'
    ];

     public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'menusxrole', 'menusxrole_idrole', 'menusxrole_idmenu')
        ->withPivot( 'menusxrole_idmenu', 'menusxrole_idrole');
    }
}
