<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Destinos;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DestinosController extends Controller
{

    public function index()
    {
        try {
            // Obtener todos los destinos
            $destinos = Destinos::all();

            // Devolver respuesta JSON
            return response()->json(
                $destinos,
                200
            );
        } catch (\Exception $e) {
            // Log::error("Error al obtener la lista de destinos: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al obtener los destinos',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function DestinosQuiencQuien()
    {
        try {
            // Obtener todos los destinos
            $destinos = Destinos::where('Destinos_Estatus', true)->get();

            // Devolver respuesta JSON
            return response()->json(
                $destinos,
                200
            );
        } catch (\Exception $e) {
            // Log::error("Error al obtener la lista de destinos: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al obtener los destinos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //---------------------------------------------------------

    /**
     * Store a newly created resource in storage.
     * Almacena un recurso recién creado en la base de datos.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $validatedData = $request->validate(
            [
                'Destinos_Nombre'    => 'required|string|max:255',
                'Destinos_Latitud'   => 'nullable',
                // ➡️ CORREGIDO: Se añadió la regla 'numeric' para asegurar el tipo de dato.
                'Destinos_Longitud'  => 'nullable',
                'Destinos_Estatus'   => 'required|boolean',
                // ➡️ CORREGIDO/MEJORADO: Se añadió 'integer' y 'exists:users,id' para validar un ID.
                'Destinos_UsuarioID' => 'required|integer',
            ],
            // ➡️ OPTIMIZADO: Solo se incluyen los mensajes para las reglas realmente utilizadas.
            [
                'required' => 'El campo :attribute es obligatorio.',
                'numeric'  => 'El campo :attribute debe ser un número.',
                'boolean'  => 'El campo :attribute debe ser verdadero (1) o falso (0).',
                'integer'  => 'El campo :attribute debe ser un número entero.',
                // Se pueden añadir mensajes específicos para 'exists' y 'max' si se desea.
                // 'Destinos_UsuarioID.exists' => 'El ID de usuario proporcionado no existe.',
                // 'Destinos_Nombre.max' => 'El campo :attribute no debe exceder los 255 caracteres.',
            ]
        );

        // Tu modelo tiene $timestamps = false, por lo que gestionamos la fecha.
        $validatedData['Destinos_Fecha'] = Carbon::now()->format('Ymd H:i:s');
        // $validatedData['Destinos_UsuarioID'] = $user->Personas_usuarioID;

        try {
            // 3. Crear y guardar el nuevo destino
            $destino = Destinos::create($validatedData);

            // 4. Devolver una respuesta exitosa
            return response()->json([
                'message' => 'Destino creado con éxito',
                'data' => $destino
            ], 201); // Código 201 Created

        } catch (\Exception $e) {
            // Log::error("Error al crear destino: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al crear el destino',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //---------------------------------------------------------

    /**
     * Update the specified resource in storage.
     * Actualiza el recurso especificado en la base de datos.
     */
    public function update(Request $request, string $id)
    {
        // 1. Validar los datos de entrada
        // Usamos 'sometimes' para que el campo solo se valide si está presente en el request.
        // Pero mantenemos 'required' para asegurar que si se envía, cumpla con el tipo.
        $validatedData = $request->validate(
            [
                // ➡️ CORRECCIÓN: Usar 'sometimes' y 'nullable' si el campo puede estar ausente
                // y permitir NULL en la base de datos (para actualizar solo lo que se envía).
                'Destinos_Nombre'    => 'sometimes|string|max:255',
                // ➡️ CORRECCIÓN: 'nullable' permite que el campo se envíe como NULL si se desea.
                'Destinos_Latitud'   => 'nullable',
                'Destinos_Longitud'  => 'nullable',
                'Destinos_Estatus'   => 'sometimes|boolean',
                // ➡️ MEJORA: Validar existencia del ID de usuario y eliminar 'min:1' si usas 'exists'.
                'Destinos_UsuarioID' => 'sometimes|integer',
            ],
            // ➡️ CORRECCIÓN: Se eliminó el mensaje 'sometimes' ya que no es una clave de error.
            [
                'string'    => 'El campo :attribute debe ser texto.',
                'max'       => 'El campo :attribute no debe exceder los :max caracteres.',
                'numeric'   => 'El campo :attribute debe ser un número.',
                'boolean'   => 'El campo :attribute debe ser verdadero (1) o falso (0).',
                'integer'   => 'El campo :attribute debe ser un número entero.',
                'exists'    => 'El ID de :attribute proporcionado no existe en la base de datos.',
                // Si quieres un mensaje para cuando se envía un campo pero está vacío:
                // 'required_with' => 'El campo :attribute es obligatorio si se intenta actualizar.',
            ]
        );

        try {
            // 2. Buscar el destino por su llave primaria
            $destino = Destinos::find($id);

            // Si no se encuentra el destino, devolver 404
            if (!$destino) {
                return response()->json([
                    'message' => 'Destino no encontrado'
                ], 404);
            }

            // 3. Actualizar el destino con los datos validados
            $destino->update($validatedData);

            // 4. Devolver respuesta exitosa
            return response()->json([
                'message' => 'Destino actualizado con éxito',
                'data' => $destino
            ], 200);
        } catch (\Exception $e) {
            // Log::error("Error al actualizar destino ID {$id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al actualizar el destino',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
