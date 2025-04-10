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
            $table->string('type'); // purchase, api_usage, activation и т.д.
            $table->foreignId('user_id')->constrained();
            $table->foreignId('sales_id')->nullable()->constrained('sales_receipts');
            $table->boolean('activation_event')->nullable();
            $table->integer('count_of_current_request')->nullable();
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