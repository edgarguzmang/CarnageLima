<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Puestos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PuestosController extends Controller
{
    /**
     * Muestra la lista de puestos ordenada alfabéticamente.
     */
    public function index(Request $request)
    {
        try {
            // Cargamos la relación con departamento si la necesitas en el Datatable
            $query = Puestos::with('departamento');

            // Filtro de búsqueda opcional por nombre
            if ($request->filled('search')) {
                $query->where('nombre', 'LIKE', '%' . $request->search . '%');
            }

            // Filtro por departamento si se requiere
            if ($request->filled('IdDepartamento')) {
                $query->where('IdDepartamento', $request->IdDepartamento);
            }

            $puestos = $query->orderBy('nombre', 'ASC')->get();

            return response()->json(
                $puestos,
                200
            );
        } catch (\Exception $e) {
            Log::error("Error en PuestosController@index: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al cargar puestos'], 500);
        }
    }

    /**
     * Almacena un nuevo puesto.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre'          => 'required|string|max:255',
            'estatus'         => 'required|boolean',
            'IdDepartamento'  => 'required|integer',
            'TieneHorasExtra' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 400);
        }

        try {
            $puesto = Puestos::create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Puesto creado con éxito',
                'data' => $puesto
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error en PuestosController@store: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al guardar el puesto'], 500);
        }
    }

    /**
     * Muestra un puesto específico.
     */
    public function show($id)
    {
        $puesto = Puestos::with('departamento')->find($id);

        if (!$puesto) {
            return response()->json(['success' => false, 'message' => 'Puesto no encontrado'], 404);
        }

        return response()->json(['success' => true, 'data' => $puesto], 200);
    }

    /**
     * Actualiza un puesto.
     */
    public function update(Request $request, $id)
    {
        $puesto = Puestos::find($id);

        if (!$puesto) {
            return response()->json(['success' => false, 'message' => 'Puesto no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre'          => 'sometimes|required|string|max:255',
            'estatus'         => 'sometimes|required|boolean',
            'IdDepartamento'  => 'sometimes|required|integer',
            'TieneHorasExtra' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 400);
        }

        try {
            $puesto->update($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Puesto actualizado con éxito',
                'data' => $puesto
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error en PuestosController@update: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al actualizar el puesto'], 500);
        }
    }

    /**
     * Elimina un puesto.
     */
    public function destroy($id)
    {
        try {
            $puesto = Puestos::find($id);

            if (!$puesto) {
                return response()->json(['success' => false, 'message' => 'Puesto no encontrado'], 404);
            }

            $puesto->delete();
            return response()->json(['success' => true, 'message' => 'Puesto eliminado'], 200);
        } catch (\Exception $e) {
            Log::error("Error en PuestosController@destroy: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'No se puede eliminar el puesto (puede tener registros asociados)'], 500);
        }
    }
}
