<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Http\Request;

class RolesController extends Controller
{
    public function index()
    {

        $roles = Roles::with('menus')
            ->orderBy('roles_descripcion', 'asc')
            ->get();

        return response()->json($roles, 200);
    }

    public function store(Request $request)
    {


        $rol = Roles::create($request->only('roles_descripcion'));

        // $eventData = (object) [
        //     "Accion" => "CREACION",
        //     "Descripcion" => "SE CREO UN ROL: " . "ID:" .  $rol->roles_id . ", " . "NOMBRE: " . $rol->roles_descripcion,
        // ];
        return response()->json($rol, 201);
    }

    public function update(Request $request)
    {

        $rol = Roles::find($request->role);
        $rol->roles_descripcion = $request->roles_descripcion;
        $rol->save();
      
        return response()->json($rol, 201);
    }

    public function rolesxmenu(Request $request)
    {

        $rol = Roles::find($request->id);
        $menus_ids = $request->menus_ids;
        $menuInicio = $request->menuInicio;
        $updateUsers = $request->updateUsers;
        $usersList = $request->usersList;
        $rol->update(['roles_menuInicio' => $menuInicio]);
        if ($updateUsers) {
            foreach ($usersList as $user) {
                $mUser = User::find($user['idUser']);
                $menus = [];
                foreach ($menus_ids as $menu) {
                    $menus[$menu] =
                        [
                            'usuarioxmenu_alta' => '1',
                            'usuarioxmenu_cambio' => '1',
                            'usuarioxmenu_consulta' => '1',
                            'usuarioxmenu_especial' => '0',
                        ];
                }
                $mUser->menus()->sync($menus);
                $mUser->save();
            }
            $rol->menus()->sync($menus_ids);
            $rol->save();
            $rol->menus;
            return response()->json(['Exito'], 201);
        }
      
        $rol->menus()->sync($menus_ids);
        $rol->save();
        $rol->menus;
        return response()->json($rol, 201);
    }

    public function usersPerRole(Request $request)
    {
        $users = User::where('IdRol', $request->idRol)->get();
        $res = [];



        foreach ($users as $user) {
            $res[] = [
                'idUser' => $user->IdUsuario,
                'idRol' => $user->IdRol
            ];
        }

        return response()->json([
            'usuarios' => $res
        ], 201);
    }

    public function getRolesMenu(Request $request)
    {
        $rol = Roles::find($request->id);
        return response()->json($rol->menus, 201);
    }

    public function getAllRolesMenu()
    {
        $roles = Roles::orderByRaw('LOWER(roles_descripcion) asc')->get();
        $roles->load('menus');
        return response()->json($roles, 200); // 200 es más adecuado que 201 para una consulta GET
    }
}
