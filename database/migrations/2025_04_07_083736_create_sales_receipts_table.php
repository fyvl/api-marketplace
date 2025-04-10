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
            $table->date('period_begin')->nullable();
            $table->date('period_end')->nullable();
            $table->integer('count_of_request')->nullable();
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['active', 'expired', 'canceled'])->default('active');
            $table->string('payment_method')->nullable();
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