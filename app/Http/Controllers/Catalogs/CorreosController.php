<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Mail\ConfiguracionCorreo;
use App\Models\Catalogos\ConfiguracionCorreo as CatalogosConfiguracionCorreo;
use App\Models\Catalogos\CorreoNotificacion;
use Illuminate\Http\Request;
// use App\Models\CorreoNotificacion; // Importamos el modelo
use Illuminate\Support\Facades\Validator;

class CorreosController extends Controller
{
   
    public function index()
    {
        // 1. Filtramos por estatus y cargamos la relación 'usuario'
        $correos = CorreoNotificacion::where('estatus', true)
            ->with('usuario','asunto')
            ->get();
        // 3. Retornamos la respuesta
        return response()->json($correos, 200);
    }

    public function store(Request $request)
    {
        // 1. Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'correo'     => 'required|email',
            'idUsuario'  => 'required|integer',
            'estatus'    => 'sometimes|boolean',
            'idAsunto'  => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422); // Código 422 Unprocessable Entity
        }

        try {
            // 2. Crear el nuevo registro
            $correo = CorreoNotificacion::create($validator->validated());

            return response()->json([
                'message' => 'Correo de notificación creado exitosamente',
                'data' => $correo
            ], 201); // Código 201 Created

        } catch (\Exception $e) {
            // 3. Manejo de errores
            return response()->json([
                'message' => 'Ocurrió un error al guardar el correo',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function indexconfiguracioncorreo()
    {
        $correo = CatalogosConfiguracionCorreo::orderBy('IdConfiguracionCorreos', 'desc')->first();
        return response()->json($correo);
    }


    public function ConfiguracionCorreoStore(Request $request)
    {
        // 1. Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'correo'     => 'required',
            'password'  => 'required',
            'host'    => 'required',
            'puerto'    => 'required',
            'seguridadSSL'    => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422); // Código 422 Unprocessable Entity
        }

        try {
            // 2. Crear el nuevo registro
            $correo = CatalogosConfiguracionCorreo::create($validator->validated());

            return response()->json([
                'message' => 'Configuracion del correo exitosamente',
                'data' => $correo
            ], 201); // Código 201 Created

        } catch (\Exception $e) {
            // 3. Manejo de errores
            return response()->json([
                'message' => 'Ocurrió un error al guardar el correo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra el recurso especificado.
     */
    public function show(string $id)
    {
        // Busca el correo por su clave primaria o lanza una excepción 404
        $correo = CorreoNotificacion::find($id);

        if (!$correo) {
            return response()->json(['message' => 'Correo de notificación no encontrado'], 404);
        }

        return response()->json($correo, 200);
    }

    /**
     * Muestra el formulario para editar el recurso especificado (usualmente para vistas).
     */
    public function edit(string $id)
    {
        // En una API REST, este método suele dejarse vacío o se omite.
        return response()->json(['message' => 'Not implemented for API'], 501);
    }

    /**
     * Actualiza el recurso especificado en el almacenamiento (BD).
     */
    public function update(Request $request, string $id)
    {
        // 1. Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            // El correo debe ser único, excluyendo el registro actual
            'correo'     => 'required|email|max:255',
            'idUsuario'  => 'sometimes|integer', // 'sometimes' para permitir actualizaciones parciales
            'estatus'    => 'sometimes|boolean',
            'idAsunto'  => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Buscar el registro
        $correo = CorreoNotificacion::find($id);

        if (!$correo) {
            return response()->json(['message' => 'Correo de notificación no encontrado'], 404);
        }


        try {
            // 3. Actualizar el registro
            $correo->update($validator->validated());

            return response()->json([
                'message' => 'Correo de notificación actualizado exitosamente',
                'data' => $correo
            ], 200); // Código 200 OK

        } catch (\Exception $e) {
            // 4. Manejo de errores
            return response()->json([
                'message' => 'Ocurrió un error al actualizar el correo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina el recurso especificado del almacenamiento (BD).
     */
    public function destroy(string $id)
    {
        // 1. Buscar el registro
        $correo = CorreoNotificacion::find($id);

        if (!$correo) {
            return response()->json(['message' => 'Correo de notificación no encontrado'], 404);
        }

        try {
            // 2. Eliminar el registro
            $correo->delete();

            // 3. Retornar respuesta
            return response()->json([
                'message' => 'Correo de notificación eliminado exitosamente'
            ], 204); // Código 204 No Content (Éxito sin contenido de retorno)

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al eliminar el correo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
