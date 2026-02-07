<?php

namespace App\Http\Controllers\Catalogs;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class DashboardController extends Controller
{
   
    // public function index(Request $request)
    // {
    //     // 1. Get the authenticated user
    //     $user = Auth::user();
    //     $token = JWTAuth::fromUser($user);
    //     // 2. Prepare the data array
    //     $data = [
    //         'auth' => $user,
    //         'token' => $token,
        
    //     ];

    //     // 3. Render the Inertia component and pass the data
    //     return Inertia::render('Home', $data);
    // }
}
