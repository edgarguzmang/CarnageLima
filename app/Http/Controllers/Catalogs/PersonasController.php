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
        $personas = Persona::all();
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
            'Telefono'         => 'nullable|string|max:20',
            'FechaNacimiento'  => 'required|date',
            'FechaIngreso'     => 'required|date',
            'Sexo'             => 'required|in:M,F,O', // M=Masculino, F=Femenino, O=Otro
            'NSS'              => 'nullable|string|max:20',
            'RFC'              => 'required|string|max:13|unique:rh.Persona,RFC',
            'Curp'             => 'required|string|max:18|unique:rh.Persona,Curp',
            'CodigoPostal'     => 'required|string|max:10',
            'SalarioReal'      => 'required|numeric|min:0',
            'Estatus'          => 'required|boolean',
            'EsEmpleado'       => 'required|boolean',
            'PathFotoEmpleado' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $persona = Persona::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Persona registrada con todos los campos',
            'data' => $persona
        ], 201);
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
            // "sometimes" para que solo valide si el campo viene en el request
            'Nombres'          => 'sometimes|required|string|max:255',
            'RFC'              => 'sometimes|required|string|unique:rh.Persona,RFC,' . $id . ',IdPersona',
            'Curp'             => 'sometimes|required|string|unique:rh.Persona,Curp,' . $id . ',IdPersona',
            'SalarioReal'      => 'sometimes|numeric',
            'Estatus'          => 'sometimes|boolean',
            // ... puedes replicar los del store aquí
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $persona->update($request->all());
        return response()->json(['success' => true, 'data' => $persona], 200);
    }

    public function destroy(string $id)
    {
        $persona = Persona::find($id);
        if (!$persona) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $persona->delete();
        return response()->json(['success' => true, 'message' => 'Eliminado'], 200);
    }
}
