<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C] flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Login Box -->
    <div class="relative z-10 w-full max-w-md bg-[#111111] border border-[#2A2A2A] p-10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
      
      <!-- Back to Home -->
      <router-link to="/" class="absolute top-6 right-6 text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </router-link>

      <div class="text-center mb-10">
        <img src="../../assets/mcu_logo.png" alt="MCU Logo" class="w-20 h-20 mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        <h2 class="text-3xl font-title mb-2 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">
          Admin Login
        </h2>
        <p class="text-[#A1A1AA] text-xs font-bold tracking-[0.2em] uppercase">Authorized Personnel Only</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-xs font-bold tracking-widest text-[#A1A1AA] uppercase">Username</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full bg-[#0B0F0C] border border-[#2A2A2A] focus:border-[#22C55E] rounded-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-[#F0FDF4] transition-colors font-medium"
            required
            autocomplete="username"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold tracking-widest text-[#A1A1AA] uppercase">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full bg-[#0B0F0C] border border-[#2A2A2A] focus:border-[#22C55E] rounded-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-[#F0FDF4] transition-colors font-medium tracking-[0.2em]"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="text-center py-2">
          <p class="text-red-500 font-bold text-xs uppercase tracking-widest">{{ error }}</p>
        </div>

        <button 
          type="submit" 
          class="w-full py-4 mt-4 bg-gradient-to-r from-[#22C55E] to-[#14532D] hover:from-[#d9b876] hover:to-[#8a6831] text-[#0B0F0C] rounded-sm font-title text-center transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] uppercase tracking-widest text-sm border border-[#22C55E] cursor-pointer"
        >
          Access Terminal
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');

const handleLogin = () => {
  error.value = '';
  
  if (username.value === 'Arak' && password.value === '@CLveppotja35') {
    localStorage.setItem('admin_auth', 'true');
    router.push('/admin');
  } else {
    error.value = 'Invalid Credentials';
    password.value = '';
  }
};
</script>