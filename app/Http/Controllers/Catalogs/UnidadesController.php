<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\Catalogos\ChoferUnidadAsignar;
use App\Models\Catalogos\CodigoAutorizacion;
use App\Models\Catalogos\IncidenciasMovimiento;
use App\Models\Catalogos\Movimientos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Catalogos\Unidades; // Importar el modelo de Unidades
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UnidadesController extends Controller
{
    /**
     * Define las reglas de validación comunes (CREATE/STORE)
     * AJUSTADO PARA COINCIDIR CON EL ESQUEMA ESTRICTO DE SQL SERVER (INT/DATETIME) y para ser todos campos OBLIGATORIOS.
     */
    private function getValidationRules()
    {
        return [
            'Unidades_numeroEconomico' => 'required|string|max:100',
            'Unidades_numeroSerie' => 'required|string|max:255',
            'Unidades_modelo' => 'required|string|max:255',
            'Unidades_placa' => 'required|string|max:20',
            // El año es un entero y ahora es requerido
            'Unidades_ano' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            // AJUSTADO: Debe ser 'integer' para coincidir con la columna INT de SQL Server
            'Unidades_kilometraje' => 'required|integer|min:0',
            // CAMBIADO: Ahora es requerido y debe ser 'integer'
            'Unidades_mantenimiento' => 'required|integer',
            // REQUERIDO y debe ser string
            'Unidades_estatus' => 'required',
            'Unidades_usuarioID' => 'required',

            'Unidades_capGasolina' => 'required',

            // CAMBIADO: Ahora es requerido y debe tener formato datetime completo para SQL Server
            // 'Unidades_fechaCreacion' => 'required|date_format:Y-m-d H:i:s',
            // 'Unidades_usuarioID' => 'required|integer',
        ];
    }

    /**
     * Define los mensajes de error en español
     */
    private function getValidationMessages()
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El campo :attribute debe ser texto.',
            // Mensaje más específico para los campos INT
            'integer' => 'El campo :attribute debe ser un número entero (no se aceptan decimales).',
            'numeric' => 'El campo :attribute debe ser un número válido.',
            'date_format' => 'El campo :attribute no tiene el formato de fecha y hora esperado (YYYY-MM-DD HH:MM:SS).',
            'max' => 'El campo :attribute no debe exceder los :max caracteres.',
            'min' => 'El campo :attribute debe ser al menos :min.',

            // Mensajes específicos para mejor claridad
            'Unidades_numeroEconomico.required' => 'El número económico de la unidad es obligatorio.',
            'Unidades_numeroSerie.required' => 'El número de serie de la unidad es obligatorio.',
            'Unidades_modelo.required' => 'El modelo de la unidad es obligatorio.',
            'Unidades_placa.required' => 'La placa de la unidad es obligatoria.',
            'Unidades_ano.required' => 'El año de la unidad es obligatorio.',
            'Unidades_kilometraje.required' => 'El kilometraje de la unidad es obligatorio.',
            'Unidades_mantenimiento.required' => 'El mantenimiento es obligatorio y debe ser un código numérico entero.',
            // 'Unidades_estatus.required' => 'El estatus de la unidad es obligatorio.',
            // 'Unidades_fechaCreacion.required' => 'La fecha de creación es obligatoria.',
            // 'Unidades_usuarioID.required' => 'El ID del usuario es obligatorio.',
        ];
    }

    /**
     * Obtiene y muestra un listado de todos los recursos (Unidades).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $unidades = Unidades::all();
        return response()->json($unidades);
    }

    public function UnidadesQuiencQuien()
    {
        $unidades = Unidades::where('Unidades_estatus', true)->get();
        return response()->json($unidades);
    }

    public function store(Request $request)
    {
        // 1. Obtener reglas y mensajes
        $rules = $this->getValidationRules();
        $messages = $this->getValidationMessages();
        $user = $request->user();

        // dd($user);

        // 2. Ejecutar la validación
        $validator = Validator::make($request->all(), $rules, $messages);

        // 3. Manejar error de validación
        if ($validator->fails()) {
            // Retorna errores de validación con código 400
            return response()->json($validator->errors(), 400);
        }

        try {

            $validatedData = $validator->validated();
            // $validatedData['Unidades_usuarioID'] = $user->Personas_usuarioID;
            $validatedData['Unidades_fechaCreacion'] = Carbon::now()->format('Ymd H:i:s');
            $unidad = Unidades::create($validatedData);

            // 6. Respuesta exitosa
            return response()->json([
                'message' => 'Unidad creada exitosamente',
                'unidad' => $unidad
            ], 201);
        } catch (\Exception $e) {
            // 7. Manejar error de la base de datos o inesperado
            return response()->json([
                'message' => 'Error al guardar la unidad. Verifique los tipos de datos o campos de la base de datos.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        // 1. Encontrar la unidad o fallar (manejo implícito de 404)
        // Cambiamos find($id) por findOrFail($id) para un código más limpio.
        $unidad = Unidades::findOrFail($id);

        // 2. Obtener reglas y mensajes de validación
        $rules = $this->getValidationRules();
        $messages = $this->getValidationMessages();

        // **AJUSTE CRÍTICO 1: Modificación de reglas para la actualización**

        // a) Eliminar reglas de campos que NO deben ser actualizados
        // (Ej: ID de usuario y fecha de creación).
        unset($rules['Unidades_usuarioID'], $rules['Unidades_fechaCreacion']);

        // b) Aplicar 'sometimes' a todas las reglas restantes
        // Reemplazamos la lógica compleja de array_map con una función más robusta.
        $updateRules = [];
        foreach ($rules as $field => $rule) {
            // Aseguramos que 'required' se reemplace por 'sometimes', 
            // y que 'sometimes' esté presente sin importar la posición inicial de 'required'.
            $modifiedRule = str_replace('required', 'sometimes', $rule);
            if (!str_contains($modifiedRule, 'sometimes')) {
                $modifiedRule = 'sometimes|' . $modifiedRule;
            }
            $updateRules[$field] = $modifiedRule;
        }

        // 3. Ejecutar la validación (solo sobre los datos que se enviaron)
        $validator = Validator::make($request->all(), $updateRules, $messages);

        if ($validator->fails()) {
            // Retorna 400 Bad Request con los errores de validación
            return response()->json($validator->errors(), 400);
        }

        // 4. Procesar y guardar
        try {
            // Obtenemos solo los datos validados para evitar campos no deseados
            $validatedData = $validator->validated();

            // Llenar y guardar la unidad. Solo se actualizan los campos presentes y validados.
            $unidad->fill($validatedData);
            $unidad->save(); // Eloquent maneja Unidades_fechaModificacion automáticamente.

            // 5. Respuesta exitosa
            return response()->json([
                'message' => 'Unidad actualizada exitosamente',
                'unidad' => $unidad
            ], 200);
        } catch (\Exception $e) {
            // 6. Manejo de errores de base de datos o inesperados
            return response()->json([
                'message' => 'Error al actualizar la unidad. Ocurrió un error inesperado.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $unidad = Unidades::find($id);

        if (!$unidad) {
            // Retorna 404 Not Found
            return response()->json(['message' => 'Unidad no encontrada'], 404);
        }

        return response()->json($unidad);
    }

    public function DashboardUnidad(Request $request)
    {
        // Fetch the last 5 units
        $ultimas5Unidades = Unidades::orderBy('Unidades_fechaCreacion', 'desc')->limit(5)->get();
        // Obtener el total de unidades (para el total general, no solo las 5)
        $totalUnidades = Unidades::count();

        // Obtener movimientos de hoy
        $movimientosDeHoy = Movimientos::whereDate('Movimientos_fecha', Carbon::today())->get();
        $totalMovimientosHoy = $movimientosDeHoy->count(); // Total de movimientos de hoy

        // Obtener todas las incidencias
        $incidencias = IncidenciasMovimiento::get();
        $totalIncidencias = $incidencias->count(); // Total de incidencias

        // Prepare the data array
        $data = [
            'ultimas5Unidades' => $ultimas5Unidades,
            'totalUnidades' => $totalUnidades, // Total general de unidades en la BD
            'movimientosDeHoy' => $movimientosDeHoy,
            'totalMovimientosHoy' => $totalMovimientosHoy, // Total de movimientos de hoy
            'incidencias' => $incidencias,
            'totalIncidencias' => $totalIncidencias, // Total de incidencias
        ];

        // Return the data as a JSON response
        return response()->json($data);
    }


    // public function ReporteMovimientos(Request $request)
    // {
    //     // 1. Iniciar la consulta y seleccionar los campos necesarios
    //     $query = DB::table('dbo.Movimientos')
    //         ->select(
    //             'Movimientos.Movimientos_fecha',
    //             'Movimientos.Movimientos_tipoMovimiento',
    //             'Movimientos.Movimientos_kilometraje',
    //             'Movimientos.Movimientos_combustible',

    //             'Movimientos.Movimientos_usuarioID',
    //             DB::raw("CONCAT(Personas.Personas_nombres, ' ', Personas.Personas_apPaterno) AS nombre_chofer"),
    //             'Unidades.Unidades_placa',
    //             'Unidades.Unidades_modelo',
    //             'Unidades.Unidades_numeroEconomico',
    //             'Motivos.Motivos_nombre',
    //             'Destinos.Destinos_Nombre'
    //         )
    //         ->join('dbo.ChoferUnidadAsignada', 'Movimientos.Movimientos_asignacionID', '=', 'ChoferUnidadAsignada.CUA_asignacionID')
    //         ->join('dbo.Personas', 'ChoferUnidadAsignada.CUA_choferID', '=', 'Personas.Personas_usuarioID')
    //         ->join('dbo.Unidades', 'ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
    //         ->join('dbo.Motivos', 'ChoferUnidadAsignada.CUA_motivoID', '=', 'Motivos.Motivos_motivoID')
    //         ->join('dbo.Destinos', 'ChoferUnidadAsignada.CUA_destino', '=', 'Destinos.Destinos_Id')
    //         ->orderBy('Movimientos.Movimientos_fecha', 'DESC');

    //     // 2. Filtrar por Rango de Fechas (Solo si ambas fechas están presentes y NO son nulas)
    //     // Esto corrige el problema de enviar [null, null] al whereBetween.
    //     if ($request->filled('fechaInicio') && $request->filled('fechaFin')) {
    //         $fechaInicio = $request->input('fechaInicio');
    //         $fechaFin = $request->input('fechaFin');

    //         $query->whereBetween('Movimientos.Movimientos_fecha', [$fechaInicio, $fechaFin]);
    //     }

    //     // 3. Filtrar por Tipo de Movimiento (Opcional, solo si el campo está lleno)
    //     if ($request->filled('tipoMovimiento')) {
    //         $query->where('Movimientos.Movimientos_tipoMovimiento', $request->input('tipoMovimiento'));
    //     }

    //     // 4. Filtrar por Usuario (Opcional, solo si el campo está lleno)
    //     if ($request->filled('usuarioID')) {
    //         $query->where('Movimientos.Movimientos_usuarioID', $request->input('usuarioID'));
    //     }


    //     if ($request->filled('unidad')) {
    //         $query->where('Unidades.Unidades_unidadID', $request->input('unidad'));
    //     }


    //     // 5. Ejecutar la consulta
    //     $movimientosFiltrados = $query->get();

    //     // 6. Calcular totales
    //     // Se puede hacer esto de forma eficiente usando colecciones después de obtener los datos.
    //     $totalSalidas = $movimientosFiltrados->where('Movimientos_tipoMovimiento', 'SALIDA')->count();
    //     $totalEntradas = $movimientosFiltrados->where('Movimientos_tipoMovimiento', 'ENTRADA')->count();

    //     // 7. Preparar la respuesta
    //     $data = [
    //         'movimientos' => $movimientosFiltrados,
    //         'totalMovimientos' => $movimientosFiltrados->count(),
    //         'totalSalidas' => $totalSalidas,
    //         'totalEntradas' => $totalEntradas,
    //     ];

    //     return response()->json($data);
    // }

    public function ReporteMovimientos(Request $request)
    {
        // 1. INICIAR LA CONSULTA Y SELECCIONAR LOS CAMPOS NECESARIOS
        $query = DB::table('dbo.Movimientos')
            ->select(
                'Movimientos.Movimientos_fecha',
                'Movimientos.Movimientos_tipoMovimiento',
                'Movimientos.Movimientos_kilometraje',
                'Movimientos.Movimientos_combustible',
                'Movimientos.Movimientos_usuarioID',
                // AGREGAMOS EL ID DE ASIGNACIÓN QUE ES CRÍTICO PARA EMPAREJAR MOVIMIENTOS
                'Movimientos.Movimientos_asignacionID',
                DB::raw("CONCAT(Personas.Personas_nombres, ' ', Personas.Personas_apPaterno) AS nombre_chofer"),
                'Unidades.Unidades_placa',
                'Unidades.Unidades_modelo',
                'Unidades.Unidades_numeroEconomico',
                'Motivos.Motivos_nombre',
                'Destinos.Destinos_Nombre',
                'ChoferUnidadAsignada.CUA_ayudantes as ayudantes',

            )
            ->join('dbo.ChoferUnidadAsignada', 'Movimientos.Movimientos_asignacionID', '=', 'ChoferUnidadAsignada.CUA_asignacionID')
            ->join('dbo.Personas', 'ChoferUnidadAsignada.CUA_choferID', '=', 'Personas.Personas_usuarioID')
            ->join('dbo.Unidades', 'ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
            ->join('dbo.Motivos', 'ChoferUnidadAsignada.CUA_motivoID', '=', 'Motivos.Motivos_motivoID')
            ->join('dbo.Destinos', 'ChoferUnidadAsignada.CUA_destino', '=', 'Destinos.Destinos_Id')
            ->orderBy('Movimientos.Movimientos_fecha', 'DESC');

        // 2. FILTRAR POR RANGO DE FECHAS
        if ($request->filled('fechaInicio') && $request->filled('fechaFin')) {
            $fechaInicio = $request->input('fechaInicio');
            $fechaFin = $request->input('fechaFin');
            $query->whereBetween('Movimientos.Movimientos_fecha', [$fechaInicio, $fechaFin]);
        }

        // 3. FILTRAR POR TIPO DE MOVIMIENTO (OPCIONAL)
        if ($request->filled('tipoMovimiento')) {
            $query->where('Movimientos.Movimientos_tipoMovimiento', $request->input('tipoMovimiento'));
        }

        // 4. FILTRAR POR USUARIO (OPCIONAL)
        if ($request->filled('usuarioID')) {
            $query->where('Movimientos.Movimientos_usuarioID', $request->input('usuarioID'));
        }

        // 4.1. FILTRAR POR UNIDAD (OPCIONAL)
        if ($request->filled('unidad')) {
            $query->where('Unidades.Unidades_unidadID', $request->input('unidad'));
        }

        // 5. EJECUTAR LA CONSULTA
        // IMPORTANTE: USAMOS LA FUNCIÓN 'OLDEST()' PARA REVERTIR EL ORDEN DESCENDENTE, 
        // YA QUE EL CÁLCULO DE RENDIMIENTO REQUIERE PROCESAR LA SALIDA ANTES DE LA ENTRADA.
        // $movimientosFiltrados = $query->get();


        // ... (Tu código de consulta anterior permanece igual hasta $query->get())

        $movimientosFiltrados = $query->get()->map(function ($item) {
            // 1. Convertimos la cadena de ayudantes en un array
            // Usamos array_filter por si hay espacios o comas extras
            $listaAyudantes = !empty($item->ayudantes) ? explode(',', $item->ayudantes) : [];

            // 2. Creamos las nuevas propiedades (ayudante1, ayudante2, etc.)
            // Limitamos a 5 o la cantidad que necesites
            for ($i = 1; $i <= 5; $i++) {
                $key = "ayudante" . $i;
                // Asignamos el nombre limpio o null si no existe ese índice
                $item->$key = isset($listaAyudantes[$i - 1]) ? trim($listaAyudantes[$i - 1]) : null;
            }

            // Opcional: eliminar la columna original 'ayudantes' para no duplicar datos
            unset($item->ayudantes);

            return $item;
        });

        // dd($movimientosFiltrados);

        // dd($movimientosFiltrados);

        // 6. CALCULAR TOTALES Y RENDIMIENTO POR VIAJE COMPLETO

        $totalSalidas = $movimientosFiltrados->where('Movimientos_tipoMovimiento', 'SALIDA')->count();
        $totalEntradas = $movimientosFiltrados->where('Movimientos_tipoMovimiento', 'ENTRADA')->count();

        $viajesCompletos = [];
        $salidasPendientes = []; // USAMOS ESTO PARA RASTREAR LAS SALIDAS SIN ENTRADA CORRESPONDIENTE
        $movimientosPendientes = [];

        // AGRUPAR MOVIMIENTOS POR ASIGNACIÓN (CUA_ASIGNACIONID).
        // ESTO ES CLAVE PARA ASEGURAR QUE SOLO EMPAREJAMOS LA SALIDA Y ENTRADA DEL MISMO VIAJE.
        $movimientosAgrupados = $movimientosFiltrados->groupBy('Movimientos_asignacionID');

        foreach ($movimientosAgrupados as $asignacionID => $grupo) {

            // ORDENAR POR FECHA ASCENDENTE PARA ENCONTRAR EL PAR SALIDA-ENTRADA EN ORDEN CRONOLÓGICO
            $grupoOrdenado = $grupo->sortBy('Movimientos_fecha')->values();

            $salida = null;
            foreach ($grupoOrdenado as $movimiento) {

                // CONVERTIR KILOMETRAJE Y COMBUSTIBLE A NÚMEROS PARA EL CÁLCULO
                $kilometraje = (float) $movimiento->Movimientos_kilometraje;
                $combustible = (float) $movimiento->Movimientos_combustible;

                if ($movimiento->Movimientos_tipoMovimiento == 'SALIDA') {
                    // SI YA HABÍA UNA SALIDA PENDIENTE, LA ASIGNAMOS COMO PENDIENTE ANTES DE SOBREESCRIBIRLA
                    if ($salida) {
                        $movimientosPendientes[] = $salida;
                    }
                    $salida = $movimiento; // ALMACENAR LA NUEVA SALIDA
                } elseif ($movimiento->Movimientos_tipoMovimiento == 'ENTRADA' && $salida) {

                    $entrada = $movimiento;

                    // CÁLCULO
                    $kmRecorridos = $kilometraje - (float) $salida->Movimientos_kilometraje;

                    // SUPOSICIÓN DE CÁLCULO DE COMBUSTIBLE CONSUMIDO: 
                    // ES LA DIFERENCIA ENTRE EL NIVEL DE COMBUSTIBLE REGISTRADO EN LA SALIDA Y EL REGISTRADO EN LA ENTRADA.
                    // SI EL COMBUSTIBLE ES EL CARGADO, LA LÓGICA NECESITA SER AJUSTADA.
                    $combustibleConsumido = (float) $salida->Movimientos_combustible - $combustible;

                    $rendimiento = 0;

                    // EVITAR DIVISIÓN POR CERO O CÁLCULOS INVÁLIDOS (KM O COMBUSTIBLE NEGATIVOS O CERO)
                    if ($kmRecorridos > 0 && $combustibleConsumido > 0) {
                        $rendimiento = $kmRecorridos / $combustibleConsumido;
                    }

                    // AGREGAR EL VIAJE COMPLETO
                    // $viajesCompletos[] = [
                    //     'asignacion_id' => $asignacionID,
                    //     'nombre_chofer' => $salida->nombre_chofer,
                    //     'Unidades_numeroEconomico' => $salida->Unidades_numeroEconomico,
                    //     'destino' => $salida->Destinos_Nombre,
                    //     'motivo' => $salida->Motivos_nombre,
                    //     'fecha_salida' => $salida->Movimientos_fecha,
                    //     'fecha_entrada' => $entrada->Movimientos_fecha,
                    //     'km_recorridos' => round($kmRecorridos, 2),
                    //     'combustible_salida' => (float) $salida->Movimientos_combustible,
                    //     'combustible_entrada' => $combustible,
                    //     'combustible_consumido' => round($combustibleConsumido, 4),
                    //     'rendimiento_kml' => round($rendimiento, 4), // RENDIMIENTO FINAL
                    // ];

                    // ... dentro del elseif ($movimiento->Movimientos_tipoMovimiento == 'ENTRADA' && $salida)

                    // AGREGAR EL VIAJE COMPLETO
                    $viajesCompletos[] = [
                        'asignacion_id' => $asignacionID,
                        'nombre_chofer' => $salida->nombre_chofer,

                        // --- AGREGAMOS LOS AYUDANTES AQUÍ ---
                        'ayudante1' => $salida->ayudante1,
                        'ayudante2' => $salida->ayudante2,
                        'ayudante3' => $salida->ayudante3,
                        'ayudante4' => $salida->ayudante4,
                        'ayudante5' => $salida->ayudante5,
                        // ------------------------------------

                        'Unidades_numeroEconomico' => $salida->Unidades_numeroEconomico,
                        'destino' => $salida->Destinos_Nombre,
                        'motivo' => $salida->Motivos_nombre,
                        'fecha_salida' => $salida->Movimientos_fecha,
                        'fecha_entrada' => $entrada->Movimientos_fecha,
                        'km_recorridos' => round($kmRecorridos, 2),
                        'combustible_salida' => (float) $salida->Movimientos_combustible,
                        'combustible_entrada' => $combustible,
                        'combustible_consumido' => round($combustibleConsumido, 4),
                        'rendimiento_kml' => round($rendimiento, 4),
                    ];

                    // REINICIAR LA SALIDA PARA EL SIGUIENTE PAR
                    $salida = null;
                }
            }

            // SI AL FINAL DEL GRUPO QUEDA UNA SALIDA SIN EMPAREJAR, ES UN MOVIMIENTO PENDIENTE
            if ($salida) {
                $movimientosPendientes[] = $salida;
            }
        }

        // CALCULAR EL PROMEDIO GLOBAL DE RENDIMIENTO DE LOS VIAJES COMPLETOS
        $sumaRendimientos = collect($viajesCompletos)->sum('rendimiento_kml');
        $conteoViajes = count($viajesCompletos);
        $rendimientoPromedioGlobal = $conteoViajes > 0 ? $sumaRendimientos / $conteoViajes : 0;

        // 7. PREPARAR LA RESPUESTA
        $data = [
            'movimientos_base' => $movimientosFiltrados, // MOVIMIENTOS ORIGINALES COMPLETOS
            'viajes_completos_rendimiento' => $viajesCompletos, // VIAJES CON CÁLCULOS DE RENDIMIENTO
            'movimientos_pendientes' => $movimientosPendientes, // SALIDAS SIN ENTRADA (OPCIONAL)
            'rendimiento_promedio_global_kml' => round($rendimientoPromedioGlobal, 4),
            'totalMovimientos' => $movimientosFiltrados->count(),
            'totalViajesCompletos' => $conteoViajes,
            'totalSalidas' => $totalSalidas,
            'totalEntradas' => $totalEntradas,
        ];

        return response()->json($data);
    }

    // public function QuienconQuienUnidades(Request $request)
    // {
    //     $today = now()->toDateString();


    //     $unidadesDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)
    //         ->join('dbo.Unidades', 'dbo.ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
    //         ->select(
    //             'dbo.ChoferUnidadAsignada.CUA_unidadID',
    //             'dbo.ChoferUnidadAsignada.CUA_choferID',
    //             'dbo.ChoferUnidadAsignada.CUA_destino',
    //             'dbo.ChoferUnidadAsignada.CUA_motivoID',
    //             'dbo.ChoferUnidadAsignada.CUA_fechaAsignacion',
    //             'dbo.ChoferUnidadAsignada.CUA_asignacionID', // **Asegúrate de seleccionar el ID de la asignación**
    //             'Unidades.Unidades_numeroEconomico'
    //         )
    //         ->where('dbo.ChoferUnidadAsignada.CUA_estatus', 1)
    //         ->get();

    //         $unidades = Unidades::all();


    //           $todasLasUnidades = $todasLasUnidades->map(function ($unidad) {
    //             $unidad->CUA_unidadID = $unidad->Unidades_unidadID;
    //             $unidad->CUA_choferID = null;
    //             $unidad->CUA_destino = null;
    //             $unidad->CUA_motivoID = null;
    //             $unidad->UltimoMovimiento = 'ENTRADA';

    //             return $unidad;
    //         });

    //     // 2. Iterar sobre la colección para obtener el último movimiento de CADA unidad
    //     $unidadesConMovimiento = $unidadesDeHoy->map(function ($unidad) {

    //         // 3. Buscar el último movimiento utilizando el ID de asignación
    //         $ultimoMovimiento = Movimientos::where('Movimientos_asignacionID', $unidad->CUA_asignacionID)
    //             ->latest('Movimientos_fecha')
    //             ->first();

    //         // 4. Lógica Condicional: Asignar el último movimiento
    //         if (is_null($ultimoMovimiento)) {
    //             // Si no hay movimientos, se asume 'ENTRADA'
    //             $unidad->UltimoMovimiento = 'ENTRADA';
    //         } else {
    //             // Si hay movimientos, se asigna el tipo de movimiento
    //             $unidad->UltimoMovimiento = $ultimoMovimiento->Movimientos_tipoMovimiento;
    //             // ¡Cuidado! En tu código original usaste 'Movimientos_tipoMovimiento' sin la variable
    //         }

    //         return $unidad;
    //     });

    //     // Verifica si no se encontró ninguna asignación para hoy
    //     if ($unidadesDeHoy->isEmpty()) {
    //         // Si la colección está vacía, devuelve todas las unidades
    //         $todasLasUnidades = Unidades::get();

    //         // Agrega el nuevo campo 'CUA_unidadID' con el valor del campo 'Unidades_unidadID'
    //         $todasLasUnidades = $todasLasUnidades->map(function ($unidad) {
    //             $unidad->CUA_unidadID = $unidad->Unidades_unidadID;
    //             $unidad->CUA_choferID = null;
    //             $unidad->CUA_destino = null;
    //             $unidad->CUA_motivoID = null;
    //             $unidad->UltimoMovimiento = 'ENTRADA';

    //             return $unidad;
    //         });

    //         return response()->json($todasLasUnidades); // ⬅️ Add final return
    //     }

    //     // Si hay asignaciones para hoy, devuelve esas asignaciones
    //     return response()->json($unidadesDeHoy);
    // }

    // use Illuminate\Http\Request;
    // use App\Models\ChoferUnidadAsignar; // Asumiendo el nombre de tu modelo
    // use App\Models\Unidades; // Asumiendo el nombre de tu modelo
    // use App\Models\Movimientos; // Asumiendo el nombre de tu modelo

    public function QuienconQuienUnidadesDashboard(Request $request)
    {
        $today = now()->toDateString();

        // 1. Obtener TODAS las unidades existentes
        // $todasLasUnidades = Unidades::all()->keyBy('Unidades_unidadID');

        $todasLasUnidades = Unidades::where('Unidades_estatus', true)
            ->get()
            ->keyBy('Unidades_unidadID');
        // Usamos keyBy para un acceso rápido por ID de unidad.

        // 2. Obtener las asignaciones de hoy con un join para obtener el número económico
        $asignacionesDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)
            ->join('dbo.Unidades', 'dbo.ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
            ->select(
                'dbo.ChoferUnidadAsignada.CUA_unidadID',
                'dbo.ChoferUnidadAsignada.CUA_choferID',
                'dbo.ChoferUnidadAsignada.CUA_destino',
                'dbo.ChoferUnidadAsignada.CUA_motivoID',
                'dbo.ChoferUnidadAsignada.CUA_ayudantes',

                'dbo.ChoferUnidadAsignada.CUA_fechaAsignacion',
                'dbo.ChoferUnidadAsignada.CUA_asignacionID',
                'Unidades.Unidades_numeroEconomico'
            )
            ->where('dbo.ChoferUnidadAsignada.CUA_estatus', 1)
            ->get();

        // 3. Mapear las asignaciones de hoy para obtener el último movimiento
        $asignacionesConMovimiento = $asignacionesDeHoy->map(function ($asignacion) {
            $ultimoMovimiento = Movimientos::where('Movimientos_asignacionID', $asignacion->CUA_asignacionID)
                ->latest('Movimientos_fecha')
                ->first();

            // Asignar el último movimiento o 'ENTRADA' por defecto
            $asignacion->UltimoMovimiento = $ultimoMovimiento
                ? $ultimoMovimiento->Movimientos_tipoMovimiento
                : 'ENTRADA';

            return $asignacion;
        })->keyBy('CUA_unidadID'); // Indexar las asignaciones por ID de unidad

        // Inicializar contadores
        $totalRojo = 0;
        $totalAmarillo = 0;
        $totalVerde = 0;

        // 4. Construir la colección final combinando TODAS las unidades con las asignaciones de hoy
        $resultadoFinal = $todasLasUnidades->map(function ($unidadBase) use ($asignacionesConMovimiento, &$totalRojo, &$totalAmarillo, &$totalVerde) {
            $unidadID = $unidadBase->Unidades_unidadID;
            $asignada = $asignacionesConMovimiento->has($unidadID);
            $unidadBase->ColorEstatus = 'ROJO'; // Establecer un valor por defecto que será sobrescrito

            // Transferir/Inicializar campos de asignación
            $unidadBase->CUA_unidadID = $unidadID;
            $unidadBase->CUA_choferID = null;
            $unidadBase->CUA_destino = null;
            $unidadBase->CUA_motivoID = null;
            $unidadBase->CUA_ayudantes = null;

            $unidadBase->CUA_fechaAsignacion = null;
            $unidadBase->CUA_asignacionID = null;
            $unidadBase->UltimoMovimiento = 'ENTRADA';

            if ($asignada) {
                // Si está asignada, usar los datos de la asignación
                $asignacion = $asignacionesConMovimiento->get($unidadID);

                $unidadBase->CUA_choferID = $asignacion->CUA_choferID;
                $unidadBase->CUA_destino = $asignacion->CUA_destino;
                $unidadBase->CUA_motivoID = $asignacion->CUA_motivoID;
                $unidadBase->CUA_fechaAsignacion = $asignacion->CUA_fechaAsignacion ?? null;
                $unidadBase->CUA_asignacionID = $asignacion->CUA_asignacionID ?? null;
                // Unidades_numeroEconomico ya está en $unidadBase si no hubo asignación, pero se actualiza para asegurar si viene del join.
                // En este caso, el join se hizo sobre $asignacionesDeHoy, por lo que el numeroEconomico viene de ahi.
                // PERO si se usa $todasLasUnidades, es mejor usar el que ya viene en $unidadBase o asegurar que se toma el correcto.
                // Para el caso de unidades NO asignadas, el valor de $unidadBase->Unidades_numeroEconomico es el correcto.
                // Para las asignadas, el numeroEconomico ya viene en la asignacion si se necesita: $asignacion->Unidades_numeroEconomico.
                // Pero como la base es $todasLasUnidades, simplemente dejamos el de $unidadBase.

                $unidadBase->UltimoMovimiento = $asignacion->UltimoMovimiento;

                // Lógica de color para unidades ASIGNADAS
                if ($unidadBase->UltimoMovimiento === 'SALIDA') {
                    $unidadBase->ColorEstatus = 'VERDE'; // Asignada y en la calle
                    $totalVerde++;
                } else { // $unidadBase->UltimoMovimiento === 'ENTRADA'
                    $unidadBase->ColorEstatus = 'AMARILLO'; // Asignada pero en patio/regreso
                    $totalAmarillo++;
                }
            } else {
                // Lógica de color para unidades NO ASIGNADAS
                // Si no está asignada hoy (CUA_choferID es null), es ROJO.
                $unidadBase->ColorEstatus = 'ROJO';
                $totalRojo++;
            }

            // Remover el campo original 'Unidades_unidadID' si solo quieres ver 'CUA_unidadID' en el JSON final
            unset($unidadBase->Unidades_unidadID);

            return $unidadBase;
        })->values(); // Quitar las claves para que sea un array simple en el JSON

        // 5. Devolver el resultado final que contiene todas las unidades (asignadas o no) y los totales
        return response()->json([

            'totalRojo' => $totalRojo,
            'totalAmarillo' => $totalAmarillo,
            'totalVerde' => $totalVerde,
            'totalUnidades' => $resultadoFinal->count()
        ]);
    }

    public function QuienconQuienUnidades(Request $request)
    {
        $today = now()->toDateString();

        $todasLasUnidades = Unidades::where('Unidades_estatus', true)
            ->get()
            ->keyBy('Unidades_unidadID');

        // 2. Obtener las asignaciones de hoy con un join para obtener el número económico
        $asignacionesDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)
            ->join('dbo.Unidades', 'dbo.ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
            ->select(
                'dbo.ChoferUnidadAsignada.CUA_unidadID',
                'dbo.ChoferUnidadAsignada.CUA_choferID',
                'dbo.ChoferUnidadAsignada.CUA_destino',
                'dbo.ChoferUnidadAsignada.CUA_motivoID',
                'dbo.ChoferUnidadAsignada.CUA_fechaAsignacion',
                'dbo.ChoferUnidadAsignada.CUA_asignacionID',
                'dbo.ChoferUnidadAsignada.CUA_ayudantes',

                'Unidades.Unidades_numeroEconomico'
            )
            ->where('dbo.ChoferUnidadAsignada.CUA_estatus', 1)
            ->get();

        // 3. Mapear las asignaciones de hoy para obtener el último movimiento
        $asignacionesConMovimiento = $asignacionesDeHoy->map(function ($asignacion) {
            $ultimoMovimiento = Movimientos::where('Movimientos_asignacionID', $asignacion->CUA_asignacionID)
                ->latest('Movimientos_fecha')
                ->first();

            // Asignar el último movimiento o 'ENTRADA' por defecto
            $asignacion->UltimoMovimiento = $ultimoMovimiento
                ? $ultimoMovimiento->Movimientos_tipoMovimiento
                : 'ENTRADA';

            return $asignacion;
        })->keyBy('CUA_unidadID'); // Indexar las asignaciones por ID de unidad

        // 4. Construir la colección final combinando TODAS las unidades con las asignaciones de hoy

        $resultadoFinal = $todasLasUnidades->map(function ($unidadBase) use ($asignacionesConMovimiento) {
            $unidadID = $unidadBase->Unidades_unidadID;

            // Verificar si la unidad tiene una asignación hoy
            if ($asignacionesConMovimiento->has($unidadID)) {
                // Si está asignada, usar los datos de la asignación
                $asignacion = $asignacionesConMovimiento->get($unidadID);
                // 'dbo.ChoferUnidadAsignada.CUA_ayudantes',
                $unidadBase->CUA_ayudantes       = $asignacion->CUA_ayudantes;

                $unidadBase->CUA_unidadID       = $unidadID;
                $unidadBase->CUA_choferID       = $asignacion->CUA_choferID;
                $unidadBase->CUA_destino        = $asignacion->CUA_destino;
                $unidadBase->CUA_motivoID       = $asignacion->CUA_motivoID;
                $unidadBase->CUA_fechaAsignacion = $asignacion->CUA_fechaAsignacion ?? null;
                $unidadBase->CUA_asignacionID   = $asignacion->CUA_asignacionID ?? null;
                $unidadBase->Unidades_numeroEconomico = $asignacion->Unidades_numeroEconomico; // Ya debería venir, pero para asegurar
                $unidadBase->UltimoMovimiento   = $asignacion->UltimoMovimiento;
            } else {
                // Si NO está asignada hoy, establecer los campos de asignación a null y movimiento a 'ENTRADA'
                $unidadBase->CUA_unidadID       = $unidadID;
                $unidadBase->CUA_choferID       = null;
                $unidadBase->CUA_destino        = null;
                $unidadBase->CUA_motivoID       = null;
                $unidadBase->CUA_fechaAsignacion = null;
                $unidadBase->CUA_asignacionID   = null;
                $unidadBase->CUA_ayudantes       = null;

                $unidadBase->UltimoMovimiento   = 'ENTRADA';
            }

            // Remover el campo original 'Unidades_unidadID' si solo quieres ver 'CUA_unidadID' en el JSON final
            unset($unidadBase->Unidades_unidadID);

            return $unidadBase;
        })->values(); // Quitar las claves para que sea un array simple en el JSON

        // 5. Devolver el resultado final que contiene todas las unidades (asignadas o no)
        return response()->json($resultadoFinal);
    }



    public function AutorizacionQuienconQuienUnidades(Request $request)
    {
        $today = now('America/Monterrey')->toDateString();

        $asignacionesDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)
            ->join('dbo.Unidades', 'dbo.ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
            ->join('dbo.Destinos', 'dbo.ChoferUnidadAsignada.CUA_destino', '=', 'Destinos.Destinos_Id')
            ->join('dbo.Personas', 'dbo.ChoferUnidadAsignada.CUA_choferID', '=', 'Personas.Personas_usuarioID')

            ->select(
                'dbo.ChoferUnidadAsignada.CUA_unidadID',
                'dbo.ChoferUnidadAsignada.CUA_choferID',
                'dbo.ChoferUnidadAsignada.CUA_destino',
                'dbo.ChoferUnidadAsignada.CUA_motivoID',
                'dbo.ChoferUnidadAsignada.CUA_fechaAsignacion',
                'dbo.ChoferUnidadAsignada.CUA_asignacionID',
                'dbo.ChoferUnidadAsignada.CUA_ayudantes',
                'dbo.ChoferUnidadAsignada.CUA_estatus',
                'dbo.ChoferUnidadAsignada.CUA_autAdmin',
                'Unidades.Unidades_numeroEconomico',
                'Unidades.Unidades_modelo',
                'Destinos.Destinos_Nombre',
                // 'Destinos.Destinos_Nombre',
                DB::raw("CONCAT(Personas.Personas_nombres, ' ', Personas.Personas_apPaterno, ' ', Personas.Personas_apMaterno) AS nombre_chofer")
            )
            ->where('dbo.ChoferUnidadAsignada.CUA_estatus', 1)
            ->where('dbo.ChoferUnidadAsignada.CUA_autAdmin', 0)

            ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_choferID')
            ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_destino')
            ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_motivoID')
            ->get();


        return response()->json($asignacionesDeHoy);
    }



    public function QuienconQuienControl(Request $request)
    {
        $today = now()->toDateString();
        $filterType = $request->query('id');

        $unidadesCompletasDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)
            ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_choferID')
            ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_destino')
            ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_motivoID')
            ->join('dbo.Unidades', 'dbo.ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
            ->select(
                'dbo.ChoferUnidadAsignada.CUA_asignacionID',
                'dbo.ChoferUnidadAsignada.CUA_unidadID',
                'dbo.ChoferUnidadAsignada.CUA_choferID',
                'dbo.ChoferUnidadAsignada.CUA_destino',
                'dbo.ChoferUnidadAsignada.CUA_motivoID',
                'dbo.ChoferUnidadAsignada.CUA_autAdmin',
                'dbo.ChoferUnidadAsignada.CUA_ayudantes',

                'dbo.ChoferUnidadAsignada.CUA_fechaAsignacion',
                'Unidades.Unidades_numeroEconomico'
            )
            ->where('dbo.ChoferUnidadAsignada.CUA_estatus', 1)
            ->get();

        foreach ($unidadesCompletasDeHoy as $unidad) {
            $Movimiento = Movimientos::where('Movimientos_asignacionID', $unidad->CUA_asignacionID)
                ->latest('Movimientos_fecha')
                ->first();

            $unidad->ultimoMovimiento = $Movimiento;

            if ($Movimiento) {
                $unidad->type = $Movimiento->Movimientos_tipoMovimiento;
                $unidad->KM = $Movimiento->Movimientos_kilometraje;
                $unidad->EstatusCodigo = $Movimiento->Movimientos_estatus;
            } else {
                $unidad->type = 'SALIDA';
                $unidad->KM = 0;
                $unidad->EstatusCodigo = 0;
            }
        }

        if ($filterType) {
            $unidadesCompletasDeHoy = $unidadesCompletasDeHoy->filter(function ($unidad) use ($filterType) {

                // ⭐ Lógica nueva: Si el estatus es "1", la unidad se queda en el listado 
                // que coincida con su ÚLTIMO TIPO DE MOVIMIENTO (type).
                if ($unidad->EstatusCodigo == "1") {
                    return $unidad->type === $filterType;
                }

                // Lógica original (para unidades no activas o que esperan la siguiente acción):

                // FILTRO ENTRADA: Muestra las unidades que tienen SALIDA y no están activas (EstatusCodigo != 1).
                if ($filterType === 'ENTRADA') {
                    return $unidad->type === 'SALIDA' && $unidad->ultimoMovimiento !== null;
                }

                // FILTRO SALIDA: Muestra las unidades que tienen ENTRADA o no tienen movimiento (están listas para salir).
                if ($filterType === 'SALIDA') {
                    return $unidad->type === 'ENTRADA' || ($unidad->type === 'SALIDA' && $unidad->ultimoMovimiento === null && $unidad->CUA_autAdmin
                        == 1);
                }

                return false;
            })->values();
        }

        return $unidadesCompletasDeHoy;
    }



    //     public function AuthorizacionQuienCQuien(Request $request)
    //     {
    //         $today = now()->toDateString();
    //         $id = $request->query('id');

    //         // ... (Obtención de datos y bucle foreach - sin cambios) ...
    // $unidadesCompletasDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)

    //         return $unidadesCompletasDeHoy;
    //     }


    // public function AuthorizacionQuienCQuien(Request $request)
    // {
    //     $id =   $request->input('id');


    //     $asignacion = ChoferUnidadAsignar::find($id);

    //     if ($asignacion) {
    //         $asignacion->update(['CUA_autAdmin' => true]); // O el valor que necesites
    //     }

    //     return response()->json(['message' => 'Actualizado con éxito']);
    // }

    public function AuthorizacionQuienCQuien(Request $request)
    {
        $id = $request->input('id');
        $asignacion = ChoferUnidadAsignar::find($id);

        // 1. Verificar si el registro existe
        if (!$asignacion) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }

        // 2. Verificar si ya está autorizado (ya es true)
        if ($asignacion->CUA_autAdmin) {
            return response()->json([
                'message' => 'Esta asignación ya había sido autorizada previamente.',
                'status' => 'already_authorized'
            ], 200); // O 400 si prefieres que sea un error de cliente
        }

        // 3. Si no es true, proceder a actualizar
        $asignacion->update(['CUA_autAdmin' => true]);

        return response()->json([
            'message' => 'Autorización concedida con éxito',
            'status' => 'updated'
        ]);
    }






    // public function QuienconQuienControl(Request $request)
    // {
    //     $today = now()->toDateString();
    //     $filterType = $request->query('id');

    //     // ... (Se mantiene la obtención de datos y el bucle foreach, ya que son correctos) ...
    //     // 1. Obtener las asignaciones completas de hoy
    //     $unidadesCompletasDeHoy = ChoferUnidadAsignar::whereDate('CUA_fechaAsignacion', $today)
    //         ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_choferID')
    //         ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_destino')
    //         ->whereNotNull('dbo.ChoferUnidadAsignada.CUA_motivoID')
    //         ->join('dbo.Unidades', 'dbo.ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
    //         ->select(
    //             'dbo.ChoferUnidadAsignada.CUA_asignacionID',
    //             'dbo.ChoferUnidadAsignada.CUA_unidadID',
    //             'dbo.ChoferUnidadAsignada.CUA_choferID',
    //             'dbo.ChoferUnidadAsignada.CUA_destino',
    //             'dbo.ChoferUnidadAsignada.CUA_motivoID',
    //             'dbo.ChoferUnidadAsignada.CUA_fechaAsignacion',
    //             'Unidades.Unidades_numeroEconomico'
    //         )
    //         ->where('dbo.ChoferUnidadAsignada.CUA_estatus', 1)
    //         ->get();

    //     // 2. Iterar y obtener el último movimiento
    //     foreach ($unidadesCompletasDeHoy as $unidad) {
    //         $Movimiento = Movimientos::where('Movimientos_asignacionID', $unidad->CUA_asignacionID)
    //             ->latest('Movimientos_fecha')
    //             ->first();

    //         $unidad->ultimoMovimiento = $Movimiento;

    //         if ($Movimiento) {
    //             $unidad->type = $Movimiento->Movimientos_tipoMovimiento;
    //             $unidad->KM = $Movimiento->Movimientos_kilometraje;
    //             $unidad->EstatusCodigo = $Movimiento->Movimientos_estatus;
    //         } else {
    //             $unidad->type = 'SALIDA';
    //             $unidad->KM = 0;
    //             $unidad->EstatusCodigo = 0;
    //         }
    //     }

    //     if ($filterType) {
    //         $unidadesCompletasDeHoy = $unidadesCompletasDeHoy->filter(function ($unidad) use ($filterType) {

    //             // Si el estatus es "1", la unidad está ACTIVA.
    //             // La unidad debe aparecer en el filtro que corresponde a su siguiente acción.
    //             // Si el último tipo fue 'SALIDA', está esperando una 'ENTRADA'.
    //             // Si el último tipo fue 'ENTRADA', está esperando una 'SALIDA'.

    //             if ($filterType === 'ENTRADA') {
    //                 // Buscamos unidades listas para ENTRADA (último Movimiento fue SALIDA).
    //                 // NOTA: Si EstatusCodigo es "1", y type es "SALIDA", ¡debe aparecer aquí!
    //                 // El filtro original ya maneja esto:
    //                 return $unidad->type === 'SALIDA'; // Aquí ya no necesitas verificar `!== null` si la lógica es que el estatus "1" la mantiene activa.
    //             }

    //             if ($filterType === 'SALIDA') {
    //                 // Buscamos unidades listas para SALIDA (último Movimiento fue ENTRADA o no hay movimientos).
    //                 // NOTA: Si EstatusCodigo es "1", y type es "ENTRADA", ¡debe aparecer aquí!
    //                 // El filtro original ya maneja esto:
    //                 return $unidad->type === 'ENTRADA' || ($unidad->type === 'SALIDA' && $unidad->ultimoMovimiento === null);
    //             }

    //             return false;
    //         })->values();
    //     }

    //     return $unidadesCompletasDeHoy;
    // }
}
