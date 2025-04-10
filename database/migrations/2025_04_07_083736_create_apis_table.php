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
        Schema::create('apis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // REST, SOAP, WebSocket и т.д.
            $table->string('protocol'); // HTTPS, WS, XMPP и т.д.
            $table->string('version');
            $table->text('body')->nullable(); // комментарий/описание
            $table->text('documentation')->nullable();
            $table->text('integration_guide')->nullable();
            $table->text('usage_examples')->nullable();
            $table->enum('status', ['draft', 'active', 'disabled'])->default('draft');
            $table->string('endpoint_url')->nullable();
            $table->string('authentication_method')->nullable();
            $table->string('service_level')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apis');
    }
};