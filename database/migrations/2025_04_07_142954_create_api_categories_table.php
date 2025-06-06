<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('api_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Pivot table for many-to-many relationship between APIs and categories
        Schema::create('api_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_id')->constrained()->onDelete('cascade');
            $table->foreignId('api_category_id')->constrained()->onDelete('cascade');
            $table->unique(['api_id', 'api_category_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_category');
        Schema::dropIfExists('api_categories');
    }
};