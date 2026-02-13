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
        // Cargamos la relación municipio
        $query = Colonias::with('municipio');

        if ($request->filled('Colonia_IdMunicipio')) {
            $valor = $request->Colonia_IdMunicipio;

            // Si es un número (ID), filtramos directo en la tabla Colonias
            if (is_numeric($valor)) {
                $query->where('Colonia_IdMunicipio', $valor);
            }
            // Si es texto (Nombre), filtramos a través de la relación
            else {
                $query->whereHas('municipio', function ($q) use ($valor) {
                    $q->where('descripcionMunicipio', 'LIKE', "%{$valor}%");
                });
            }
        }

        // Ordenar por nombre de la colonia de forma ascendente
        // y ejecutar la consulta
        return response()->json($query->orderBy('Colonia_Nombre', 'ASC')->get(), 200);
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
