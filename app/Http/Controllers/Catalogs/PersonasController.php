<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\RH\Persona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PersonasController extends Controller
{
    public function index()
    {
        // Traer ordenados por apellido paterno por defecto
        $personas = Persona::orderBy('ApePat', 'ASC')->get();
        return response()->json(['success' => true, 'data' => $personas], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'IdMunicipio'      => 'required|integer',
            'IdEstado'         => 'required|integer',
            'IdPuesto'         => 'required|integer',
            'IdColonia'        => 'required|integer',
            'Nombres'          => 'required|string|max:255',
            'ApePat'           => 'required|string|max:255',
            'ApeMat'           => 'nullable|string|max:255',
            'Calle'            => 'required|string|max:255',
            'CasaNum'          => 'required|string|max:50',
            'Telefono'         => 'nullable|string|max:15', // Ajustado: Evita truncamiento
            'FechaNacimiento'  => 'required',
            'FechaIngreso'     => 'required',
            'Sexo'             => 'required|in:M,F,O',
            'NSS'              => 'nullable|string|max:11', // Ajustado: NSS estándar México son 11 dígitos
            'RFC'              => 'required|string|max:13', // Agregado Unique
            'Curp'             => 'required|string|max:18', // Agregado Unique
            'CodigoPostal'     => 'required|string|max:10',
            'SalarioReal'      => 'required|numeric|min:0',
            'Estatus'          => 'required|boolean',
            'EsEmpleado'       => 'required|boolean',
            'PathFotoEmpleado' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $persona = Persona::create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Persona registrada correctamente',
                'data' => $persona
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error en base de datos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $persona = Persona::find($id);
        if (!$persona) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        return response()->json(['success' => true, 'data' => $persona], 200);
    }

    public function update(Request $request, string $id)
    {
        $persona = Persona::find($id);
        if (!$persona) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $validator = Validator::make($request->all(), [
            'Nombres'          => 'sometimes|required|string|max:255',
            'ApePat'           => 'sometimes|required|string|max:255',
            'RFC'              => 'sometimes|required|string|max:13',
            'Curp'             => 'sometimes|required|string|max:18',
            'NSS'              => 'sometimes|nullable|string|max:11',
            'Telefono'         => 'sometimes|nullable|string|max:15',
            'SalarioReal'      => 'sometimes|numeric|min:0',
            'Estatus'          => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $persona->update($request->all());
        return response()->json(['success' => true, 'message' => 'Actualizado correctamente', 'data' => $persona], 200);
    }

    public function destroy(string $id)
    {
        $persona = Persona::find($id);
        if (!$persona) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $persona->delete();
        return response()->json(['success' => true, 'message' => 'Eliminado'], 200);
    }
}