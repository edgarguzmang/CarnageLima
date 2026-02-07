<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Puestos;
use App\Models\Departamento; // Asumiendo que el modelo Departamento está en App\Models
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB; // Para manejo de excepciones específicas de la base de datos
use Illuminate\Support\Facades\Log;

class PuestosController extends Controller
{
    public function index()
    {
        // Eager loading + Filtro por estatus
        $puestos = Puestos::with('departamento')
            ->where('Puestos_estatus', true) // O usa 1 si tu DB no maneja booleanos nativos
            ->get();

        // Retorna la colección filtrada como respuesta JSON
        return response()->json($puestos);
    }
    public function store(Request $request)
    {
        // 1. Validación de datos
        $validatedData = $request->validate([
            // Validar unicidad en la tabla 'dbo.Puestos' y columna 'Puestos_nombre'
            'Puestos_nombre' => 'required|string|max:255',
            'Puestos_estatus' => 'required|boolean',
            // Asegurar que el id del departamento exista en la tabla 'dbo.Departamentos'
            'Puestos_idDepartamento' => 'required',
        ], [
            // Mensajes de error personalizados
            'Puestos_nombre.unique' => 'El nombre del puesto ya existe.',
        ]);

        try {
            // 2. Creación del registro
            $puesto = Puestos::create($validatedData);

            // 3. Respuesta JSON con código 201 (Created)
            return response()->json([
                'message' => 'Puesto creado exitosamente.',
                'puesto' => $puesto
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error al crear Puesto: " . $e->getMessage());
            // Respuesta de error 500 (Internal Server Error)
            return response()->json(['error' => 'Hubo un error al crear el puesto. Por favor, inténtelo de nuevo.'], 500);
        }
    }



    /**
     * Actualiza el puesto especificado en la base de datos.
     * @param \Illuminate\Http\Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $puesto = Puestos::findOrFail($id);
        $primaryKey = $puesto->getKeyName(); // Obtener el nombre de la clave primaria, asumiendo Puestos_id

        // 1. Validación de datos (se usa Rule::unique para ignorar el registro actual)
        $validatedData = $request->validate([
            'Puestos_nombre' => [
                'required',
                'string',
                'max:255',

            ],
            'Puestos_estatus' => 'required|boolean',
            // Asegura que el id del departamento exista en la tabla 'dbo.Departamentos'
            'Puestos_idDepartamento' => 'required',
        ], [
            'Puestos_nombre.unique' => 'El nombre del puesto ya existe.',
            'Puestos_idDepartamento.exists' => 'El departamento seleccionado no es válido.'
        ]);

        try {
            // 2. Actualización del registro
            $puesto->update($validatedData);

            // 3. Respuesta JSON con código 200 (OK) y el modelo actualizado
            return response()->json([
                'message' => 'Puesto actualizado exitosamente.',
                'puesto' => $puesto
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error al actualizar Puesto ID {$id}: " . $e->getMessage());
            // Respuesta de error 500
            return response()->json(['error' => 'Hubo un error al actualizar el puesto. Por favor, inténtelo de nuevo.'], 500);
        }
    }
}
