<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
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
            'amount' => (float) $this->amount,
            'spent_amount' => $this->spent_amount,
            'remaining_amount' => $this->remaining_amount,
            'progress_percentage' => $this->progress_percentage,
            'period' => $this->period,
            'period_label' => $this->period_label,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'alert_threshold' => $this->alert_threshold,
            'is_over_threshold' => $this->is_over_threshold,
            'is_exceeded' => $this->is_exceeded,
            'days_remaining' => $this->days_remaining,
            'is_active' => $this->is_active,
            'category' => $this->when($this->category, [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
                'color' => $this->category?->color,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
