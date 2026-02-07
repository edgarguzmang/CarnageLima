<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\Asuntos;
use Illuminate\Http\Request;

class AsuntosController extends Controller
{
    /**
     * Muestra una lista de los asuntos.
     */
    public function index()
    {
        $asuntos = Asuntos::all();
        return response()->json($asuntos);
    }

    /**
     * Almacena un nuevo asunto en la base de datos.
     */
    public function store(Request $request)
    {
        $request->validate([
            'Descripcion' => 'required',
            // 'Asuntos_descripcion' => 'nullable|string',
        ]);

        $asunto = Asuntos::create($request->all());

        return response()->json([
            'message' => 'Asunto creado con éxito',
            'data' => $asunto
        ], 201);
    }

    /**
     * Muestra un asunto específico.
     */
    public function show($id)
    {
        $asunto = Asuntos::findOrFail($id);
        return response()->json($asunto);
    }

    /**
     * Actualiza un asunto específico.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'Descripcion' => 'sometimes|required|string|max:255',
            // 'Asuntos_descripcion' => 'nullable|string',
        ]);

        $asunto = Asuntos::findOrFail($id);
        $asunto->update($request->all());

        return response()->json([
            'message' => 'Asunto actualizado con éxito',
            'data' => $asunto
        ]);
    }

    /**
     * Elimina un asunto de la base de datos.
     */
    public function destroy($id)
    {
        $asunto = Asuntos::findOrFail($id);
        $asunto->delete();

        return response()->json([
            'message' => 'Asunto eliminado correctamente'
        ]);
    }
}