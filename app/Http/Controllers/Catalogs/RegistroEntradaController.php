<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Mail\CodigoVerificacion;

use App\Mail\CodigoAutorizacionQuiencQuien;


use App\Mail\ConfiguracionCorreo;
use App\Mail\MailTest;
use App\Models\Catalogos\Unidades;
use App\Models\User;
use App\Models\Catalogos\ChoferUnidadAsignar;
use App\Models\Catalogos\CodigoAutorizacion;
use App\Models\Catalogos\ConfiguracionCorreo as CatalogosConfiguracionCorreo;
use App\Models\Catalogos\CorreoNotificacion;
use App\Models\Catalogos\Destinos;
use App\Models\Catalogos\IncidenciasMovimiento;
use App\Models\Catalogos\ListaVerificacion;
use App\Models\Catalogos\Movimientos;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\User as AuthUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RegistroEntradaController extends Controller
{

    public function store(Request $request)
    {
        try {
            // --- 1. Buscar Asignación Activa ---
            $asignacion = ChoferUnidadAsignar::where('CUA_estatus', 1)
                ->latest('CUA_fechaAsignacion')
                ->where('CUA_unidadID', $request->unit)
                ->first();

            if (!$asignacion) {
                return response()->json([
                    'message' => 'No se encontró una asignación de unidad y chófer activa (CUA_estatus = 1).',
                ], 404);
            }

            // --- 2. Opciones de Combustible y Cálculo ---
            $FUEL_OPTIONS = [
                ['nombre' => '1/8', 'id' => 1, 'fraccion' => 1 / 8],
                ['nombre' => '1/4', 'id' => 2, 'fraccion' => 1 / 4],
                ['nombre' => '3/8', 'id' => 3, 'fraccion' => 3 / 8],
                ['nombre' => '1/2', 'id' => 4, 'fraccion' => 1 / 2],
                ['nombre' => '5/8', 'id' => 5, 'fraccion' => 5 / 8],
                ['nombre' => '3/4', 'id' => 6, 'fraccion' => 3 / 4],
                ['nombre' => '7/8', 'id' => 7, 'fraccion' => 7 / 8],
                ['nombre' => 'Lleno', 'id' => 8, 'fraccion' => 1.0]
            ];

            $unidad = Unidades::find($request->unit);

            if (!$unidad) {
                return response()->json(['message' => 'La unidad especificada no existe.'], 404);
            }

            $capacidad_total = $unidad->Unidades_capGasolina;
            $fraccion_seleccionada = 0.0;

            foreach ($FUEL_OPTIONS as $option) {
                if ((int)$request->combustible === $option['id']) {
                    $fraccion_seleccionada = $option['fraccion'];
                    break;
                }
            }

            $cantidad_combustible = $capacidad_total * $fraccion_seleccionada;

            // --- 3. Crear el Movimiento Principal ---
            $datosMovimiento = [
                'Movimientos_fecha'          => DB::raw('GETDATE()'),
                'Movimientos_tipoMovimiento' => $request->movementType,
                'Movimientos_asignacionID'   => $asignacion->CUA_asignacionID,
                'Movimientos_kilometraje'    => $request->kilometers,
                'Movimientos_combustible'    => $cantidad_combustible,
                'Movimientos_observaciones' => (empty($request->observation)) ? null : $request->observation,
                'Movimientos_usuarioID'      => $request->user,
                'Movimientos_estatus'        => $request->estatusCode,
            ];

            // dd($datosMovimiento);

            $movimiento = Movimientos::create($datosMovimiento);

            // --- 4. Guardar Incidencias (Solo 'No') ---
            $incidenciasGuardadas = [];
            foreach ($request->checklist as $list) {
                if ($list['observacion'] === 'No') {
                    $datosIncidencia = [
                        'IncidenciasMovimiento_movimientoID' => $movimiento->Movimientos_movimientoID,
                        'IncidenciasMovimiento_listaID'      => $list['id'],
                        'IncidenciasMovimiento_usuarioID'    => $request->user,
                        'IncidenciasMovimiento_observaciones' => $list['observacion'],
                    ];

                    $incidencia = IncidenciasMovimiento::create($datosIncidencia);
                    $lista = ListaVerificacion::find($list['id']);
                    $incidencia->listaVerificacion = $lista;
                    $incidenciasGuardadas[] = $incidencia;
                }
            }

            // Variable para el código de autorización
            $codigo_autorizacion = null;
            $codigo_creado = null;

            // =================================================================
            // 🚀 LÓGICA CLAVE: CREAR CÓDIGO Y ENVIAR CORREO SOLO SI HAY INCIDENCIAS 'No'
            // =================================================================
            if (!empty($incidenciasGuardadas)) {

                // --- A. Generar y Guardar Código de Autorización ---
                $codigo_autorizacion = (string) random_int(100000, 999999);

                $authorizationData = [
                    'codigoAutorizacion_codigo'              => $codigo_autorizacion,
                    'codigoAutorizacion_idUnidad'            => $request->unit,
                    'codigoAutorizacion_idUsuarioAutoriza'   => null,
                    'codigoAutorizacion_idUsuarioSolicita'   => $request->user,
                    'codigoAutorizacion_motivo'              => $request->movementType,
                    'codigoAutorizacion_fechaAut'            => null,
                    'codigoAutorizacion_fecha'               => DB::raw('GETDATE()'),
                    'codigoAutorizacion_estatus'             => 1, // Pendiente
                ];

                $codigo_creado = CodigoAutorizacion::create($authorizationData);
                $this->configEmail();

                $Correos = CorreoNotificacion::where('correoNotificaciones_estatus', true)
                    ->whereHas('asunto', function ($query) {
                        $query->where('Asuntos_nombre', 'NOTIFICACION INCIDENCIAS');
                    })->get();


                // dd($Correos->get());


                $Destino = Destinos::find($asignacion->CUA_destino);
                $Operador = User::find($asignacion->CUA_choferID);

                $Datos = (object) [
                    "Titulo" => "CORREO DE INCIDENCIAS: " . $request->movementType . ", CON LA UNIDAD: " . $unidad->Unidades_numeroEconomico,
                    "Incidencias" => $incidenciasGuardadas,
                    "Codigo" => $codigo_autorizacion,
                    "QconQuienUnidad" => $request->unit,
                    "Unidad" => $unidad->Unidades_numeroEconomico,
                    "TipoMovimiento" => $request->movementType,
                    "Operador" => $Operador->Personas_nombres . " " . $Operador->Personas_apPaterno . " " . $Operador->Personas_apMaterno,
                    "Destino" => $Destino->Destinos_Nombre,
                ];

                if ($Correos->isNotEmpty()) {
                    foreach ($Correos as $correo) {
                        $destinatario = $correo->correoNotificaciones_correo;
                        Mail::to($destinatario)->send(new ConfiguracionCorreo($Datos));
                    }
                }
            }

            if ($request->movementType == "ENTRADA" && empty($incidenciasGuardadas)) {
                $asignacion->update([
                    'CUA_estatus' => 0 // 0 = INACTIVO/FINALIZADO
                ]);
                $datosAsignacion = [
                    'CUA_unidadID'          => $asignacion->CUA_unidadID,
                    'CUA_choferID'          => null,
                    'CUA_ayudanteID'        => null,
                    'CUA_motivoID'          => null,
                    'CUA_destino'           => null,
                    'CUA_estatus'           => 1, // 1 = ACTIVO/EN PATIO/DISPONIBLE
                    'CUA_fechaAsignacion'   => DB::raw('GETDATE()')
                ];
                ChoferUnidadAsignar::create($datosAsignacion);
            }

            return response()->json([
                'message' => 'Movimiento creado exitosamente.',
                'asignacion_finalizada' => $asignacion,
                'movimiento' => $movimiento,
                'codigo_autorizacion' => $codigo_creado,
                'incidencias_notificadas' => count($incidenciasGuardadas)
            ], 201);
        } catch (\Throwable $e) {
            Log::error('ERROR REAL MOVIMIENTOS', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Error interno',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // use Illuminate\Http\Request;
    // use Illuminate\Support\Carbon;
    // use Illuminate\Support\Facades\Mail;
    // use App\Models\CodigoAutorizacion; // Asegúrate de que el namespace sea correcto
    // use App\Models\CorreoNotificacion; // Asegúrate de que el namespace sea correcto
    // use App\Mail\CodigoVerificacion; // Asegúrate de que el namespace sea correcto

    public function codesend(Request $request)
    {
        try {
            // 1. Generar el código de 6 dígitos
            $codigo_autorizacion = (string) random_int(100000, 999999);

            // 2. Preparar los datos para el modelo
            $authorizationData = [
                'codigoAutorizacion_codigo'          => $codigo_autorizacion,
                'codigoAutorizacion_idUnidad'        => $request->unit,
                'codigoAutorizacion_idUsuarioAutoriza' => null, // El ID del usuario autorizador, nulo al inicio
                'codigoAutorizacion_idUsuarioSolicita' => null,
                'codigoAutorizacion_motivo'          => $request->observation,
                'codigoAutorizacion_fechaAut'        => null, // Aún no autorizado
                // Usar 'Y-m-d H:i:s' es el formato estándar de MySQL, que es más seguro
                'codigoAutorizacion_fecha'           => DB::raw('GETDATE()'),
                'codigoAutorizacion_estatus'         => 1, // Por ejemplo, 'Pendiente'
            ];

            // 3. Guardar el código de autorización en la base de datos
            // Se puede usar ::create() directamente, no es necesario asignar a $codigo si no se usa más adelante
            CodigoAutorizacion::create($authorizationData);

            // 4. Configurar el email (asumiendo que $this->configEmail() existe y funciona)
            $this->configEmail();

            // 5. Obtener correos de notificación activos
            $Correos = CorreoNotificacion::where('correoNotificaciones_estatus', true)->get();

            // 6. Preparar los datos para el email (Ahora incluimos el código generado)
            $Datos = (object) [
                "Titulo" => "CODIGO AUTORIZACION: " . $request->movementType,
                "Codigo" => $codigo_autorizacion, // Se envía solo el código generado
            ];

            // 7. Enviar el email
            if ($Correos->isNotEmpty()) {
                foreach ($Correos as $correo) {
                    $destinatario = $correo->correoNotificaciones_correo;
                    Mail::to($destinatario)->send(new CodigoVerificacion($Datos));
                }
            }

            // 8. Respuesta exitosa
            return response()->json([
                'message' => 'Código de autorización generado y enviado exitosamente.',
            ], 201);
        } catch (\Exception $e) {
            // Manejo de error mejorado
            $errorMessage = $e->getMessage();

            if (strpos($errorMessage, 'SQLSTATE[22007]') !== false) {
                $errorMessage = 'Error de formato de fecha/hora. Verifique el formato de fecha en la base de datos.';
            }

            // 9. Respuesta de error
            return response()->json([
                'message' => 'Ocurrió un error al intentar generar o enviar el código de autorización.',
                'error' => $errorMessage
            ], 500);
        }
    }



    public function verifycode(Request $request)
    {
        // 1. Validar la entrada (opcional pero muy recomendado)
        $request->validate([
            'unit' => 'required|integer',
            'code' => 'required|string',
            'type' => 'required',

            // movementType
        ]);

        // dd($request->all());

        try {
            // 2. Recuperar el ÚLTIMO código de autorización para la unidad
            $latestCodeEntry = CodigoAutorizacion::where('codigoAutorizacion_idUnidad', $request->unit)
                ->latest('codigoAutorizacion_fecha')
                ->first();

            // 3. Verificar si se encontró un código de autorización
            if (!$latestCodeEntry) {
                return response()->json([
                    'message' => 'Unidad no encontrada o no tiene códigos de autorización pendientes.',
                ], 404);
            }

            // 4. Si el código proporcionado es INCORRECTO
            if ($latestCodeEntry->codigoAutorizacion_codigo !== $request->code) {
                return response()->json([
                    'message' => 'El código de autorización proporcionado es incorrecto.',
                    'status' => 'Unauthorized'
                ], 401);
            }

            // 5. Marcar el código de autorización como usado/autorizado
            $latestCodeEntry->codigoAutorizacion_estatus = 0; // e.g., 'Autorizado'
            $latestCodeEntry->codigoAutorizacion_idUsuarioAutoriza = auth()->check() ? auth()->id() : null; // Usar el usuario autenticado
            $latestCodeEntry->codigoAutorizacion_fechaAut = DB::raw('GETDATE()');
            $latestCodeEntry->save();

            // 6. Obtener la ÚLTIMA asignación Chofer-Unidad
            $QuienconQuien = ChoferUnidadAsignar::where('CUA_unidadID', $request->unit)
                ->latest('CUA_fechaAsignacion')
                ->first();

            // 7. Actualizar los movimientos relacionados con la asignación
            $MovimientosActualizados = 0; // Inicializar contador

            if ($QuienconQuien) {
                // Solo actualiza si se encontró una asignación Chofer-Unidad
                $MovimientosActualizados = Movimientos::where('Movimientos_asignacionID', $QuienconQuien->CUA_asignacionID)
                    ->where('Movimientos_estatus', 1) // Opcional: solo actualizar si el estatus es 'pendiente' (e.g., 1)
                    ->update(['Movimientos_estatus' => 0]);
            }

            if ($request->type === "ENTRADA") {

                $QuienconQuien->update([
                    'CUA_estatus' => 0 // 0 = INACTIVO/FINALIZADO
                ]);

                $datosAsignacion = [
                    'CUA_unidadID'          => $request->unit,
                    'CUA_choferID'          => null,
                    'CUA_ayudanteID'        => null,
                    'CUA_motivoID'          => null,
                    'CUA_destino'           => null,
                    'CUA_estatus'           => 1, // 1 = ACTIVO/EN PATIO/DISPONIBLE
                    'CUA_fechaAsignacion'   => DB::raw('GETDATE()')
                ];

                ChoferUnidadAsignar::create($datosAsignacion);
            }


            // 8. Respuesta de éxito
            return response()->json([
                'message' => 'Código de autorización verificado exitosamente. Movimientos actualizados: ' . $MovimientosActualizados,
                'status' => 'Authorized',
                'updated_movements_count' => $MovimientosActualizados
            ], 200);
        } catch (\Exception $e) {
            // 9. Manejo de Errores Mejorado
            $errorMessage = $e->getMessage();
            $statusCode = 500;

            if (strpos($errorMessage, 'SQLSTATE[22007]') !== false) {
                $errorMessage = 'Error de formato de fecha/hora. Verifique el formato de fecha en la base de datos.';
            }

            return response()->json([
                'message' => 'Ocurrió un error interno al intentar verificar el código de autorización.',
                'error' => $errorMessage
            ], $statusCode);
        }
    }

    public function configEmail(): void
    {
        $correo = CatalogosConfiguracionCorreo::orderBy('correoEnvioNotificaciones_id', 'desc')->first();

        // $host = $correo->correoEnvioNotificaciones_host;
        $port = (int) $correo->correoEnvioNotificaciones_puerto; // Asegurar que sea entero
        $host = trim($correo->correoEnvioNotificaciones_host);
        $username = trim($correo->correoEnvioNotificaciones_correoNotificacion);
        $password = trim($correo->correoEnvioNotificaciones_passwordCorreo);
        $encryption = trim($correo->correoEnvioNotificaciones_seguridadSSL);

        $config = [
            'driver' => 'smtp',
            'host' => $host,
            'port' => $port,
            'username' => $username,
            'password' => $password,
            'encryption' => $encryption,
            'local_domain' => 'localhost',
            'from' => [
                'address' => $username,
                'name' => $username
            ],
        ];

        config(['mail' => $config]);
    }

    public function changesswho(Request $request)
    {
        $quienConQuien = $request->input('quienconquien');

        // Inicializar un array para almacenar las unidades que fueron actualizadas o creadas
        $unidadesProcesadas = [];
        $unidadesSaltadas = [];

        if (!is_null($quienConQuien) && is_array($quienConQuien)) {

            foreach ($quienConQuien as $unidad) {

                $unidadID = $unidad['CUA_unidadID'];
                $choferID = $unidad['CUA_choferID'] ?? null;
                $destino = $unidad['CUA_destino'] ?? null;
                $motivoID = $unidad['CUA_motivoID'] ?? null;
                // Usamos null si no viene, y convertimos a string/int si viene, 
                // asegurándonos de que 'null' no se guarde como cadena.
                $ayudanteID = $unidad['CUA_ayudanteID'] ?? null;

                // 1. Buscar asignación activa para la unidad
                $asignacionExistente = ChoferUnidadAsignar::where('CUA_unidadID', $unidadID)
                    ->where('CUA_estatus', 1)
                    ->whereNotNull('CUA_destino')
                    ->whereNotNull('CUA_motivoID')
                    ->whereNotNull('CUA_choferID')
                    ->first();

                // Datos del request para la comparación/actualización/creación
                $nuevosDatos = [
                    'CUA_choferID' => $choferID,
                    'CUA_ayudanteID' => $ayudanteID,
                    'CUA_motivoID' => $motivoID,
                    'CUA_destino' => $destino,
                    'CUA_usuarioId' => $request->user,
                ];

                // 2. Si NO existe una asignación activa, la creamos directamente.
                if (!$asignacionExistente) {
                    $datosAsignacion = array_merge($nuevosDatos, [
                        'CUA_unidadID' => $unidadID,
                        'CUA_fechaAsignacion' => Carbon::now()->format('Ymd H:i:s'),
                        'CUA_estatus' => 1,
                        'CUA_usuarioId' => $request->user,

                    ]);
                    ChoferUnidadAsignar::create($datosAsignacion);
                    $unidadesProcesadas[] = ['id' => $unidadID, 'accion' => 'Creada'];
                } else {
                    // 3. Obtener el último movimiento para esta asignación
                    $ultimoMovimiento = Movimientos::where('Movimientos_asignacionID', $asignacionExistente->CUA_asignacionID)
                        ->latest('Movimientos_fecha')
                        ->first();

                    // 4. Lógica Condicional: Actualizar si NO hay movimientos
                    if (is_null($ultimoMovimiento)) {

                        // BUENA PRÁCTICA: Verificar si los datos son realmente diferentes antes de actualizar
                        $datosActuales = [
                            'CUA_choferID' => (string) $asignacionExistente->CUA_choferID,
                            'CUA_ayudanteID' => is_null($asignacionExistente->CUA_ayudanteID) ? null : (string) $asignacionExistente->CUA_ayudanteID,
                            'CUA_motivoID' => (string) $asignacionExistente->CUA_motivoID,
                            'CUA_destino' => (string) $asignacionExistente->CUA_destino,
                        ];

                        // Hay que normalizar los datos del request a como se obtienen de la DB para comparar
                        $datosRequestNormalizados = [
                            'CUA_choferID' => (string) $choferID,
                            'CUA_ayudanteID' => $ayudanteID,
                            'CUA_motivoID' => (string) $motivoID,
                            'CUA_destino' => (string) $destino,
                        ];

                        if ($datosActuales == $datosRequestNormalizados) {
                            $unidadesSaltadas[] = ['id' => $unidadID, 'motivo' => 'Datos idénticos a la asignación activa (Sin movimientos).'];
                        } else {
                            // Si NO se encontró ningún movimiento, actualiza la asignación
                            $asignacionExistente->update(array_merge($nuevosDatos, [
                                'CUA_fechaAsignacion' => Carbon::now()->format('Ymd H:i:s'),
                            ]));
                            $unidadesProcesadas[] = ['id' => $unidadID, 'accion' => 'Actualizada (Sin movimientos)'];
                        }
                    } else {
                        // Hay movimientos asociados, NO se actualiza la asignación activa.
                        $unidadesSaltadas[] = ['id' => $unidadID, 'motivo' => 'Tiene movimientos asociados.'];
                    }
                }
            }

            // Devolver una respuesta JSON de éxito al final de la iteración
            return response()->json([
                'success' => true,
                'message' => 'Asignaciones procesadas.',
                'procesadas' => $unidadesProcesadas,
                'saltadas' => $unidadesSaltadas,
            ]);
        } else {
            // Devolver una respuesta JSON de error
            return response()->json([
                'success' => false,
                'message' => 'No se encontró la clave "quienconquien" o no es un arreglo válido.'
            ], 400);
        }
    }

    public function WhoDestint(Request $request)
    {
        $quienConQuien = $request->input('quienconquien');
        $userId = $request->input('user');

        $unidadID = $quienConQuien['CUA_unidadID'];
        $choferID = $quienConQuien['CUA_choferID'] ?? null;
        $destinoID = $quienConQuien['CUA_destino'] ?? null;
        $motivoID = $quienConQuien['CUA_motivoID'] ?? null;
        $ayudanteID = $quienConQuien['CUA_ayudanteID'] ?? null;

        // 1. Validar que la unidad existe
        $unidad = Unidades::find($unidadID);
        if (!$unidad) {
            return response()->json(['success' => false, 'message' => 'La unidad especificada no existe.'], 404);
        }

        // 2. Preparar datos base
        $datosAsignacion = [
            'CUA_choferID'   => $choferID,
            'CUA_ayudanteID' => $ayudanteID,
            'CUA_motivoID'   => $motivoID,
            'CUA_destino'    => $destinoID,
            'CUA_usuarioId'  => $userId,
            'CUA_autAdmin'   => 0,
            'CUA_fechaAsignacion' => date('Ymd H:i:s'), // Formato YYYYMMDD es el más seguro en SQL Server
        ];

        // 3. Buscar o Crear/Actualizar la asignación
        $asignacion = ChoferUnidadAsignar::where('CUA_unidadID', $unidadID)
            ->where('CUA_estatus', 1)
            ->first();

        if (!$asignacion) {
            // CREAR NUEVA: Asignamos el ID de unidad y estatus al array
            $datosAsignacion['CUA_unidadID'] = $unidadID;
            $datosAsignacion['CUA_estatus'] = 1;
            $asignacion = ChoferUnidadAsignar::create($datosAsignacion);
        } else {
            // ACTUALIZAR EXISTENTE
            $asignacion->update($datosAsignacion);
        }

        try {
            $correos = CorreoNotificacion::where('correoNotificaciones_estatus', true)
                ->whereHas('asunto', function ($query) {
                    $query->where('Asuntos_nombre', 'NOTIFICACION QUIEN CON QUIEN');
                })
                ->pluck('correoNotificaciones_correo');

            if ($correos->isNotEmpty()) {
                $this->configEmail(); // Configurar solo si hay correos
                $destino = Destinos::find($destinoID);

                $Operador = User::find($choferID);

                $datosEmail = (object) [
                    "Titulo"          => "CORREO DE ACEPTACION DE QUIEN CON QUIEN",
                    "QconQuienUnidad" => $asignacion->CUA_asignacionID, // Usamos $asignacion que siempre existe ahora
                    "Unidad"          => "Modelo: " . $unidad->Unidades_modelo . "-" . "Numero Economico: " . $unidad->Unidades_numeroEconomico,
                    "User"            => $userId,
                    "Operador"        => $Operador->Personas_nombres . " " . $Operador->Personas_apPaterno . " " . $Operador->Personas_apMaterno,
                    "Destino"         => $destino ? $destino->Destinos_Nombre : 'N/D',
                ];

                foreach ($correos as $destinatario) {
                    Mail::to($destinatario)->send(new CodigoAutorizacionQuiencQuien($datosEmail));
                }
            }
        } catch (\Exception $e) {
            Log::error("Error enviando correos en WhoDestint: " . $e->getMessage());
            // No retornamos error aquí para que el usuario sepa que la DB sí se guardó
        }

        return response()->json([
            'success' => true,
            'message' => 'Asignación procesada correctamente.',
        ]);
    }


    public function WhoAyudantes(request $request)
    {
        // obtener los datos de la petición
        $quienconquien = $request->input('quienconquien');
        $user = $request->input('user');
        $seleccionados = $request->input('seleccionados');

        // buscar el registro directamente por su id
        $asignacionexistente = ChoferUnidadAsignar::find($quienconquien['CUA_asignacionID']);

        // validar si el registro existe para evitar errores
        if (!$asignacionexistente) {
            return response()->json([
                'success' => false,
                'message' => 'no se encontró el registro de asignación.',
            ], 404);
        }

        // actualizar los campos con los datos recibidos
        $asignacionexistente->update([
            'CUA_ayudantes' => is_array($seleccionados) ? implode(', ', $seleccionados) : $seleccionados,

        ]);

        return response()->json([
            'success' => true,
            'message' => 'actualizacion de ayudantes exitosa.',
        ]);
    }

    public function getUltimosMovimientosUnidad(Request $request)
    {
        try {
            // Obtener el unidadID desde el cuerpo de la solicitud (POST)
            $unidadID = $request->input('unidadID');

            // Validar que el unidadID esté presente
            if (empty($unidadID)) {
                return response()->json([
                    'message' => 'El campo unidadID es obligatorio.',
                ], 400); // 400 Bad Request
            }

            // 1. Obtener los IDs de las asignaciones para esa unidad
            $assignmentIds = ChoferUnidadAsignar::where('CUA_unidadID', $unidadID)
                ->pluck('CUA_asignacionID');

            if ($assignmentIds->isEmpty()) {
                return response()->json([
                    'message' => 'No se encontraron asignaciones para la unidad ' . $unidadID,
                    'data' => []
                ], 200);
            }

            $movimientos = DB::table('dbo.Movimientos')
                ->select(
                    'Movimientos.Movimientos_fecha',
                    'Movimientos.Movimientos_tipoMovimiento',
                    'Movimientos.Movimientos_kilometraje',
                    'Movimientos.Movimientos_combustible',
                    'Movimientos.Movimientos_usuarioID',
                    DB::raw("CONCAT(Personas.Personas_nombres, ' ', Personas.Personas_apPaterno) AS nombre_chofer"),
                    'Unidades.Unidades_placa',
                    'Unidades.Unidades_modelo',
                    'Unidades.Unidades_numeroEconomico',
                    'Motivos.Motivos_nombre',
                    'Destinos.Destinos_Nombre'
                )
                ->join('dbo.ChoferUnidadAsignada', 'Movimientos.Movimientos_asignacionID', '=', 'ChoferUnidadAsignada.CUA_asignacionID')
                ->join('dbo.Personas', 'ChoferUnidadAsignada.CUA_choferID', '=', 'Personas.Personas_usuarioID')
                ->join('dbo.Unidades', 'ChoferUnidadAsignada.CUA_unidadID', '=', 'Unidades.Unidades_unidadID')
                ->join('dbo.Motivos', 'ChoferUnidadAsignada.CUA_motivoID', '=', 'Motivos.Motivos_motivoID')
                ->join('dbo.Destinos', 'ChoferUnidadAsignada.CUA_destino', '=', 'Destinos.Destinos_Id')
                ->orderBy('Movimientos.Movimientos_fecha', 'DESC')
                ->whereIn('Movimientos_asignacionID', $assignmentIds)
                ->limit(5)
                ->get();


            return response()->json($movimientos, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al intentar obtener los movimientos de la unidad.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendMailTest(Request $request)
    {
        try {
            $this->configEmail();
            $destinatario = $request->input('destinatario');
            Mail::to($destinatario)->send(new MailTest());
            return response()->json(['message' => 'Correo de prueba enviado exitosamente.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al enviar el correo de prueba.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
