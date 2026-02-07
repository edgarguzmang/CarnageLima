<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Departamento;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Controlador de recursos para la gestión de Departamentos.
 * Retorna respuestas JSON, ideal para una API.
 */
class DepartamentoController extends Controller
{
    /**
     * GET /catalogs/departamentos
     * Muestra una lista de todos los departamentos.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $departamentos = Departamento::all();
        return response()->json($departamentos);
    }

      public function DepartamentosActivos()
    {
        $departamentos = Departamento::where('Departamentos_estatus',true)->get();
        return response()->json($departamentos);
    }

    /**
     * POST /catalogs/departamentos
     * Almacena un nuevo recurso (Departamento) en la base de datos.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // 1. Validación de datos
        $request->validate([
            // Debe ser único en la tabla dbo.Departamentos
            'Departamentos_nombre' => 'required|string|max:255',
            'Departamentos_estatus' => 'required|boolean',
        ]);

        try {
            // 2. Creación del recurso
            $departamento = Departamento::create($request->all());

            // 3. Respuesta exitosa (código 201 - Created)
            return response()->json($departamento, 201);
        } catch (\Exception $e) {
            // Manejo de errores
            return response()->json(['error' => 'No se pudo crear el departamento.'], 500);
        }
    }

    /**
     * GET /catalogs/departamentos/{id}
     * Muestra el recurso (Departamento) especificado.
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        // Busca el departamento por su clave primaria o lanza una excepción 404
        $departamento = Departamento::findOrFail($id);

        return response()->json($departamento);
    }

    /**
     * PUT/PATCH /catalogs/departamentos/{id}
     * Actualiza el recurso (Departamento) especificado en la base de datos.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        // Busca el departamento antes de validar
        $departamento = Departamento::findOrFail($id);

        // 1. Validación de datos (usando Rule::unique para ignorar el ID actual)
        $request->validate([
            'Departamentos_nombre' => [
                'required',
                'string',
                'max:255',
              
            ],
            // 'sometimes' permite que el campo sea opcional, pero si está presente, debe ser booleano
            'Departamentos_estatus' => 'sometimes|boolean',
        ]);

        try {
            // 2. Actualización del recurso
            $departamento->update($request->all());

            // 3. Respuesta exitosa
            return response()->json($departamento, 200);
        } catch (\Exception $e) {
            // Manejo de errores
            return response()->json(['error' => 'No se pudo actualizar el departamento.'], 500);
        }
    }

    /**
     * DELETE /catalogs/departamentos/{id}
     * Elimina el recurso (Departamento) especificado de la base de datos.
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        // Busca el departamento o lanza una excepción 404
        $departamento = Departamento::findOrFail($id);

        try {
            // 1. Eliminación del recurso
            $departamento->delete();

            // 2. Respuesta exitosa (código 204 - No Content)
            return response()->json(null, 204);
        } catch (\Exception $e) {
            // Manejo de errores
            return response()->json(['error' => 'No se pudo eliminar el departamento. Puede estar en uso.'], 500);
        }
    }

    /**
     * Show the form for creating a new resource. (No implementado para API)
     */
    public function create()
    {
        return response()->json(['message' => 'Not implemented for API'], 405);
    }

    /**
     * Show the form for editing the specified resource. (No implementado para API)
     */
    public function edit(string $id)
    {
        return response()->json(['message' => 'Not implemented for API'], 405);
    }
}
