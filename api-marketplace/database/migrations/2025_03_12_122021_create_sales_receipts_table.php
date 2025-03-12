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
        Schema::create('sales_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users');
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('money_types_for_each_api_id')->constrained('money_types_for_each_api');
            $table->dateTime('period_begin')->nullable();
            $table->dateTime('period_end')->nullable();
            $table->integer('count_of_request')->nullable();
            $table->decimal('total_price', 10, 2);
            $table->string('payment_id')->nullable(); // ID транзакции в платежной системе
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->text('body')->nullable(); // комментарий
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_receipts');
    }
};
