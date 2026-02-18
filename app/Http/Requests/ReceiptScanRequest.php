<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceiptScanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Please upload a receipt image.',
            'image.image' => 'The uploaded file must be an image.',
            'image.mimes' => 'Receipt must be a JPG, JPEG, PNG, or WEBP image.',
            'image.max' => 'Receipt image must not exceed 10MB.',
        ];
    }
}
