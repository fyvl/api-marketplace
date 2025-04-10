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
        Schema::create('api_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Pivot table for many-to-many relationship between APIs and tags
        Schema::create('api_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_id')->constrained()->onDelete('cascade');
            $table->foreignId('api_tag_id')->constrained()->onDelete('cascade');
            $table->unique(['api_id', 'api_tag_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_tag');
        Schema::dropIfExists('api_tags');
    }
};