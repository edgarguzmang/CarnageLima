<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Colonias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ColoniasController extends Controller
{
    public function index(Request $request)
    {
        $query = Colonias::query();

        // Filtro por municipio
        if ($request->has('Colonia_IdMunicipio') && $request->Colonia_IdMunicipio != "") {
            $query->where('Colonia_IdMunicipio', $request->Colonia_IdMunicipio);
        }

        return response()->json($query->paginate(15), 200);
    }

    /**
     * Almacena una nueva colonia.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'Colonia_Nombre'      => 'required|string|max:255',
            'Colonia_IdMunicipio' => 'required|integer',
            'c_CodigoPostal'      => 'required|string|max:10',
            'Colonia_cveSAT'      => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $colonia = Colonias::create($request->all());

        return response()->json([
            'message' => 'Colonia creada con éxito',
            'data' => $colonia
        ], 201);
    }

    /**
     * Muestra una colonia específica.
     */
    public function show($id)
    {
        $colonia = Colonias::find($id);

        if (!$colonia) {
            return response()->json(['message' => 'Colonia no encontrada'], 404);
        }

        return response()->json($colonia, 200);
    }

    /**
     * Actualiza una colonia existente.
     */
    public function update(Request $request, $id)
    {
        $colonia = Colonias::find($id);

        if (!$colonia) {
            return response()->json(['message' => 'Colonia no encontrada'], 404);
        }

        $colonia->update($request->all());

        return response()->json([
            'message' => 'Colonia actualizada con éxito',
            'data' => $colonia
        ], 200);
    }

    /**
     * Elimina una colonia.
     */
    public function destroy($id)
    {
        $colonia = Colonias::find($id);

        if (!$colonia) {
            return response()->json(['message' => 'Colonia no encontrada'], 404);
        }

        $colonia->delete();

        return response()->json(['message' => 'Colonia eliminada'], 200);
    }
}
