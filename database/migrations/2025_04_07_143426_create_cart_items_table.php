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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('money_types_for_each_api_id')->constrained('money_types_for_each_api')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->timestamps();

            // Пользователь может добавить конкретный тариф API только один раз
            $table->unique(['user_id', 'money_types_for_each_api_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};