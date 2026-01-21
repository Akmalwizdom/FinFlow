<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'name' => 'required|string|max:50',
            'type' => 'required|in:income,expense',
            'color' => 'nullable|regex:/^#[a-fA-F0-9]{6}$/',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter a category name.',
            'name.max' => 'Category name cannot exceed 50 characters.',
            'type.required' => 'Please specify the category type.',
            'type.in' => 'Category type must be income or expense.',
            'color.regex' => 'Color must be a valid hex color (e.g., #FF5733).',
        ];
    }
}
