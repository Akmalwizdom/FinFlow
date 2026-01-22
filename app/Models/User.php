<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'currency',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the categories for the user.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Get the transactions for the user.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the tags for the user.
     */
    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            $user->createDefaultCategories();
        });
    }

    /**
     * Create default categories for a new user.
     */
    public function createDefaultCategories(): void
    {
        $defaultCategories = [
            // Expense categories - Teal palette
            ['name' => 'Makanan', 'type' => 'expense', 'color' => '#007180', 'is_default' => true],
            ['name' => 'Transportasi', 'type' => 'expense', 'color' => '#4db6ac', 'is_default' => true],
            ['name' => 'Belanja', 'type' => 'expense', 'color' => '#80cbc4', 'is_default' => true],
            ['name' => 'Hiburan', 'type' => 'expense', 'color' => '#009688', 'is_default' => true],
            ['name' => 'Tagihan', 'type' => 'expense', 'color' => '#26a69a', 'is_default' => true],
            ['name' => 'Kesehatan', 'type' => 'expense', 'color' => '#00897b', 'is_default' => true],
            ['name' => 'Pendidikan', 'type' => 'expense', 'color' => '#b2dfdb', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'expense', 'color' => '#e0f2f1', 'is_default' => true],

            // Income categories - Green palette
            ['name' => 'Gaji', 'type' => 'income', 'color' => '#2e7d32', 'is_default' => true],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#4caf50', 'is_default' => true],
            ['name' => 'Bonus', 'type' => 'income', 'color' => '#66bb6a', 'is_default' => true],
            ['name' => 'Investasi', 'type' => 'income', 'color' => '#81c784', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'income', 'color' => '#a5d6a7', 'is_default' => true],
        ];

        foreach ($defaultCategories as $category) {
            $this->categories()->create($category);
        }
    }
}

