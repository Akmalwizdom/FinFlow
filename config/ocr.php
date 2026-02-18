<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Tesseract OCR Binary Path
    |--------------------------------------------------------------------------
    |
    | The path to the Tesseract OCR executable.
    | On Windows, this is usually 'C:\Program Files\Tesseract-OCR\tesseract.exe'.
    | On Linux, it is usually just 'tesseract'.
    |
    */
    'tesseract_path' => env('TESSERACT_PATH', 'tesseract'),

    /*
    |--------------------------------------------------------------------------
    | Max Image Size
    |--------------------------------------------------------------------------
    |
    | Maximum allowed image size in kilobytes.
    |
    */
    'max_image_size' => env('OCR_MAX_IMAGE_SIZE', 10240),
];
