<template>
  <div
    class="w-full h-full bg-[#181824] border-2 border-[#3f416d] flex flex-col items-center justify-between p-3 select-none relative overflow-hidden"
  >
    <!-- Riveted vault corners -->
    <div class="absolute top-1 left-1 w-1.5 h-1.5 bg-[#71717a] shadow-[1px_1px_0_#000]" />
    <div class="absolute top-1 right-1 w-1.5 h-1.5 bg-[#71717a] shadow-[1px_1px_0_#000]" />
    <div class="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#71717a] shadow-[1px_1px_0_#000]" />
    <div class="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#71717a] shadow-[1px_1px_0_#000]" />

    <!-- Top Bunker Header -->
    <div class="w-full text-center border-b border-[#3f416d] pb-1.5">
      <span class="text-[9px] font-['Press_Start_2P'] uppercase text-[#9ca3af] tracking-wider">
        {{ categoryTitle || 'BUNKER ARCHIVE' }}
      </span>
    </div>

    <!-- Center Heavy Padlock -->
    <div class="flex flex-col items-center justify-center my-auto py-2">
      <div class="w-12 h-12 bg-[#27272a] border-2 border-[#71717a] flex items-center justify-center shadow-[3px_3px_0_#000] mb-2">
        <PixelIcon name="lock" size="24" class="text-zinc-400" />
      </div>
      <div
        class="bg-[#7f1d1d] text-[#fca5a5] border border-[#ef4444] px-2 py-0.5 text-[9px] font-['Press_Start_2P'] uppercase tracking-widest shadow-[2px_2px_0_#000]"
      >
        [LOCKED]
      </div>
    </div>

    <!-- Bottom Classified Stamp -->
    <div class="w-full text-center border-t border-[#3f416d] pt-1.5">
      <span class="text-[8px] font-['Silkscreen'] uppercase text-zinc-500">
        СЕКРЕТНЫЙ РАЗДЕЛ
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import PixelIcon from '@/components/ui/PixelIcon.vue';
defineProps<{
  categoryTitle?: string;
}>();
</script>
