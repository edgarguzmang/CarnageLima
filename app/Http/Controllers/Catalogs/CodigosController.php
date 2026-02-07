<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\CodigoAutorizacion;
use Illuminate\Http\Request;

class CodigosController extends Controller
{
    public function index()
    {
        try {
            // Obtener todos los destinos
            $codigos = CodigoAutorizacion::where('codigoAutorizacion_estatus', true)
                ->with('unidades')
                ->get();


            // Devolver respuesta JSON
            return response()->json(
                $codigos,
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


    public function CodigoverificacionEstado(Request $request)
    {
        try {
            // 1. Validación de entrada
            if (!$request->has('code')) {
                return response()->json(['message' => 'El código es requerido'], 400);
            }

            // 2. Buscar el PRIMER registro que coincida
            $codigo = CodigoAutorizacion::where('codigoAutorizacion_codigo', $request->code)
                ->with('unidades')
                ->first(); // Cambiado de get() a first()

            // 3. Verificar si existe el registro
            if (!$codigo) {
                return response()->json(['message' => 'Código no encontrado'], 404);
            }

            // 4. Transformar el estatus para la respuesta
            // Asumiendo que 'codigoAutorizacion_estatus' es el nombre de la columna en tu DB
            $estadoTexto = ($codigo->codigoAutorizacion_estatus == 1) ? 'Activo' : 'Inactivo';

            // 5. Estructurar la respuesta
            return response()->json([
                'datos' => $codigo,
                'estado_label' => $estadoTexto
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno al obtener los datos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
