<?php

namespace App\Http\Requests;

use App\Models\Account;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::in(array_keys(Account::TYPES))],
            'initial_balance' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Account name is required.',
            'name.max' => 'Account name cannot exceed 100 characters.',
            'type.required' => 'Account type is required.',
            'type.in' => 'Invalid account type.',
            'initial_balance.numeric' => 'Initial balance must be a number.',
            'initial_balance.min' => 'Initial balance cannot be negative.',
            'currency.size' => 'Currency must be a 3-letter code (e.g., IDR, USD).',
            'color.regex' => 'Color must be a valid hex color (e.g., #FF5733).',
        ];
    }
}
