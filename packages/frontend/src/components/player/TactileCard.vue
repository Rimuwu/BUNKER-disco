<template>
  <div
    ref="cardWrapperRef"
    class="tactile-card-wrapper w-56 sm:w-64 h-80 sm:h-96 cursor-pointer select-none"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="handleClick"
  >
    <div
      class="tactile-card w-full h-full relative"
      :class="[
        isFlipped ? 'is-flipped' : '',
        borderClass
      ]"
    >
      <!-- Front Face (Revealed Details) -->
      <div class="card-face card-front bg-[#1b1c36] text-[#f3f4f6] flex flex-col justify-between p-3 border-2 border-transparent relative">
        <!-- Dynamic Foil Sheen Overlay -->
        <div class="tactile-card__foil" />

        <!-- Top Header & Category -->
        <div class="flex items-center justify-between border-b border-[#3f416d] pb-1.5">
          <span class="text-[9px] font-['Press_Start_2P'] uppercase text-[#fcd34d] truncate max-w-[140px]">
            {{ card.category }}
          </span>
          <PixelBadge :tag="card.originTag" />
        </div>

        <!-- Center Pixel Art / Icon Area -->
        <div class="my-auto flex flex-col items-center justify-center p-2 bg-[#121324] border border-[#2d2e4d] shadow-inner text-center min-h-[100px]">
          <div class="mb-1 text-[#ffc700]">
            <PixelIcon :name="categoryIconName" size="32" />
          </div>
          <h4 class="font-['Press_Start_2P'] text-xs uppercase text-[#f3f4f6] leading-tight mb-1">
            {{ card.name }}
          </h4>
          <span v-if="card.nameEn" class="text-[8px] text-zinc-500 font-['Silkscreen']">
            {{ card.nameEn }}
          </span>
        </div>

        <!-- Description & Stats -->
        <div class="text-[10px] leading-relaxed text-zinc-300 font-['Silkscreen'] border-t border-[#3f416d] pt-1.5 flex flex-col gap-1">
          <p class="line-clamp-3">{{ card.description }}</p>

          <p v-if="card.flavorText" class="italic text-[9px] text-zinc-400 border-l-2 border-[#ffc700] pl-1 line-clamp-2">
            "{{ card.flavorText }}"
          </p>

          <div v-if="card.metadata?.ability" class="bg-[#1e1b4b] p-1 border border-[#6366f1] text-[9px] flex items-center gap-1">
            <PixelIcon name="power" size="10" class="text-[#a5b4fc]" />
            <span class="text-[#a5b4fc] font-bold">{{ card.metadata.ability.name }}</span>
            <span class="text-zinc-400 ml-1">({{ card.metadata.ability.apCost }} AP, КД: {{ card.metadata.ability.cooldown }})</span>
          </div>
        </div>

        <!-- Footer Stamp -->
        <div class="flex justify-between items-center text-[8px] text-zinc-500 pt-1 border-t border-[#2d2e4d]">
          <span>BUNKER-DISCO</span>
          <span>#{{ card.cardId?.slice(-4) || '0000' }}</span>
        </div>
      </div>

      <!-- Back Face (Locked Armored Vault Plate) -->
      <div class="card-face card-back">
        <CardLockedBack :category-title="card.category" />
      </div>

      <!-- Lock Breaker FX -->
      <CardLockBreaker ref="lockBreakerRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { IPlayerCard, CardOriginTag } from '@/stores/playerStore';
import { useCardGyroscope } from '@/composables/useCardGyroscope';
import { useTactileAudio } from '@/composables/useTactileAudio';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';
import CardLockedBack from './CardLockedBack.vue';
import CardLockBreaker from './CardLockBreaker.vue';

const props = withDefaults(
  defineProps<{
    card: IPlayerCard;
    interactive?: boolean;
  }>(),
  {
    interactive: true
  }
);

const emit = defineEmits<{
  (e: 'flip', isRevealed: boolean): void;
  (e: 'reveal-requested', card: IPlayerCard): void;
}>();

const cardWrapperRef = ref<HTMLElement | null>(null);
const lockBreakerRef = ref<InstanceType<typeof CardLockBreaker> | null>(null);

const { onMouseMove, onMouseLeave } = useCardGyroscope(cardWrapperRef);
const { playCardFlip } = useTactileAudio();

const isFlipped = ref(props.card.isRevealed);

watch(
  () => props.card.isRevealed,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      // Trigger shattering effect then flip
      lockBreakerRef.value?.trigger(() => {
        isFlipped.value = true;
        playCardFlip();
      });
    } else {
      isFlipped.value = newVal;
    }
  }
);

const handleClick = () => {
  if (!props.interactive) return;

  if (!props.card.isRevealed) {
    emit('reveal-requested', props.card);
  } else {
    isFlipped.value = !isFlipped.value;
    playCardFlip();
    emit('flip', isFlipped.value);
  }
};

const borderClass = computed(() => {
  const tag = (props.card.originTag || 'BASE').toUpperCase() as CardOriginTag;
  switch (tag) {
    case 'ALPHA':
      return 'border-origin-alpha';
    case 'EXPANSION':
      return 'border-origin-expansion';
    case 'NEW':
      return 'border-origin-new';
    case 'BASE':
    default:
      return 'border-origin-base';
  }
});

const categoryIconName = computed(() => {
  const cat = props.card.category?.toLowerCase() || '';
  if (cat.includes('profession')) return 'briefcase';
  if (cat.includes('biology') || cat.includes('age') || cat.includes('gender')) return 'dna';
  if (cat.includes('health')) return 'meds';
  if (cat.includes('hobby')) return 'art';
  if (cat.includes('item') || cat.includes('baggage')) return 'backpack';
  if (cat.includes('fact')) return 'scroll';
  if (cat.includes('superpower')) return 'power';
  if (cat.includes('phobia')) return 'mask';
  if (cat.includes('character')) return 'user';
  if (cat.includes('special')) return 'target';
  return 'shield';
});
</script>
