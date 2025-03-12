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
            $table->foreignId('creator_id')->constrained('users');
            $table->string('name');
            $table->string('type'); // REST, SOAP, WebSocket
            $table->string('protocol'); // HTTPS, WS, XMPP
            $table->string('version');
            $table->text('description');
            $table->text('documentation')->nullable();
            $table->json('examples')->nullable();
            $table->text('body')->nullable(); // комментарий
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
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
