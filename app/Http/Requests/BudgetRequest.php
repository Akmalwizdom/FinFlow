<?php

namespace App\Http\Requests;

use App\Models\Budget;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'period' => ['required', Rule::in(array_keys(Budget::PERIODS))],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'alert_threshold' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Budget name is required.',
            'name.max' => 'Budget name cannot exceed 100 characters.',
            'amount.required' => 'Budget amount is required.',
            'amount.min' => 'Budget amount must be greater than 0.',
            'period.required' => 'Budget period is required.',
            'period.in' => 'Invalid budget period.',
            'start_date.required' => 'Start date is required.',
            'end_date.after' => 'End date must be after start date.',
            'alert_threshold.min' => 'Alert threshold must be at least 1%.',
            'alert_threshold.max' => 'Alert threshold cannot exceed 100%.',
            'category_id.exists' => 'Selected category does not exist.',
        ];
    }
}
