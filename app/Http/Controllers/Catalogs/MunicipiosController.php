<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Municipio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MunicipiosController extends Controller
{
    /**
     * Muestra una lista de municipios.
     * Agregué una opción de filtrado por estado, que es lo más común.
     */
    public function index(Request $request)
    {
        $query = Municipio::query();

        // Filtrar por estado si se proporciona idestado
        if ($request->has('idestado')) {
            $query->where('idestado', $request->idestado);
        }

        // Usamos paginación porque los municipios son miles
        return response()->json($query->get(), 200);
    }

    /**
     * Almacena un nuevo municipio.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'claveMunicipio'       => 'required|string|max:10',
            'idestado'             => 'required|integer',
            'descripcionMunicipio' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $municipio = Municipio::create($request->all());
        return response()->json($municipio, 201);
    }

    /**
     * Muestra un municipio específico.
     */
    public function show($id)
    {
        $municipio = Municipio::find($id);

        if (!$municipio) {
            return response()->json(['message' => 'Municipio no encontrado'], 404);
        }

        return response()->json($municipio, 200);
    }

    /**
     * Actualiza un municipio.
     */
    public function update(Request $request, $id)
    {
        $municipio = Municipio::find($id);

        if (!$municipio) {
            return response()->json(['message' => 'Municipio no encontrado'], 404);
        }

        $municipio->update($request->all());
        return response()->json($municipio, 200);
    }

    /**
     * Elimina un municipio.
     */
    public function destroy($id)
    {
        $municipio = Municipio::find($id);

        if (!$municipio) {
            return response()->json(['message' => 'Municipio no encontrado'], 404);
        }

        $municipio->delete();
        return response()->json(['message' => 'Municipio eliminado'], 200);
    }
}
