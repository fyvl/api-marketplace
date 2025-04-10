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
        Schema::create('money_types_for_each_api', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_id')->constrained()->onDelete('cascade');
            $table->foreignId('money_type_id')->constrained()->onDelete('cascade');
            $table->string('unit_of_payment'); // месяц, год, запрос, 1000 запросов и т.д.
            $table->decimal('price', 10, 2);
            $table->text('body')->nullable(); // описание тарифа
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('money_types_for_each_api');
    }
};