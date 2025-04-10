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
        Schema::create('api_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->nullable();
            $table->text('comment')->nullable();
            $table->text('developer_response')->nullable();
            $table->timestamp('developer_response_at')->nullable();
            $table->timestamps();

            // Пользователь может оставить только один отзыв на API
            $table->unique(['api_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_reviews');
    }
};