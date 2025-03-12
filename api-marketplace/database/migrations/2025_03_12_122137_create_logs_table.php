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
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // тип события
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('sales_id')->nullable()->constrained('sales_receipts');
            $table->boolean('activation_event')->nullable();
            $table->integer('count_of_current_request')->nullable();
            $table->json('metadata')->nullable(); // дополнительные данные
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
