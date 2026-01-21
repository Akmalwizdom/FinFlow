<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
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
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:255',
            'transaction_date' => 'required|date|before_or_equal:today',
            'spending_type' => 'nullable|in:need,want',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'type.required' => 'Please specify the transaction type.',
            'type.in' => 'Transaction type must be income or expense.',
            'amount.required' => 'Please enter an amount.',
            'amount.min' => 'Amount must be greater than zero.',
            'transaction_date.required' => 'Please select a date.',
            'transaction_date.before_or_equal' => 'Transaction date cannot be in the future.',
            'spending_type.in' => 'Spending type must be need or want.',
        ];
    }
}
