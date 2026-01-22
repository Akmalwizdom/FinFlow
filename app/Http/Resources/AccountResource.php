<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'type_label' => $this->type_label,
            'initial_balance' => (float) $this->initial_balance,
            'current_balance' => $this->current_balance,
            'currency' => $this->currency,
            'icon' => $this->icon,
            'color' => $this->color,
            'is_active' => $this->is_active,
            'transaction_count' => $this->whenCounted('transactions'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
