<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateSettingsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    /**
     * Get current user settings.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'currency' => $user->currency,
                'created_at' => $user->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Update user settings.
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'currency' => $user->currency,
            ],
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Delete user account.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|current_password',
            'confirm' => 'required|boolean|accepted',
        ]);

        $user = $request->user();
        
        // Delete all user data
        $user->transactions()->delete();
        $user->categories()->delete();
        $user->tags()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }
}
