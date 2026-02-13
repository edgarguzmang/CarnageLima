<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EstadosController extends Controller
{
    /**
     * Muestra la lista de estados.
     */
    public function index()
    {
        $estados = Estado::all();
        return response()->json($estados, 200);
    }

    /**
     * Almacena un nuevo estado.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cveEstado'         => 'required|string|max:10|unique:dbo.CatalogoSATEstado,cveEstado',
            'cvePais'           => 'required|string|max:5',
            'descripcionEstado' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $estado = Estado::create($request->all());
        return response()->json($estado, 201);
    }

    /**
     * Muestra un estado específico.
     */
    public function show($id)
    {
        $estado = Estado::find($id);

        if (!$estado) {
            return response()->json(['message' => 'Estado no encontrado'], 404);
        }

        return response()->json($estado, 200);
    }

    /**
     * Actualiza un estado existente.
     */
    public function update(Request $request, $id)
    {
        $estado = Estado::find($id);

        if (!$estado) {
            return response()->json(['message' => 'Estado no encontrado'], 404);
        }

        $estado->update($request->all());
        return response()->json($estado, 200);
    }

    /**
     * Elimina un estado.
     */
    public function destroy($id)
    {
        $estado = Estado::find($id);

        if (!$estado) {
            return response()->json(['message' => 'Estado no encontrado'], 404);
        }

        $estado->delete();
        return response()->json(['message' => 'Estado eliminado correctamente'], 200);
    }
}